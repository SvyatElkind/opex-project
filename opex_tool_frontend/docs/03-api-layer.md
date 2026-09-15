# 3. API Layer & Networking

> Files: [src/services/apiClient.js](../src/services/apiClient.js),
> [src/services/errorService.js](../src/services/errorService.js),
> [src/API/](../src/API/)

The frontend talks to a local Django REST backend. There are **two parallel HTTP
stacks** in the codebase, and knowing which is which is the single most important
fact in this chapter:

| Stack | Location | Return shape | Errors | Status |
|---|---|---|---|---|
| **`apiClient`** (modern) | `src/services/apiClient.js` | `{ data, status }`, throws on failure | typed `ApiError` | **Use this.** All React Query hooks go through it. |
| **`*_API.js` factories** (legacy) | `src/API/*.js` | `[ok, payloadOrMessage]` tuple | none — errors become the 2nd tuple slot | Legacy. Still imported in a few places; do not extend. |

`Constants_API.js` is the one file in `src/API/` that already uses `apiClient`.

---

## 3.1 `services/apiClient.js`

Centralised `fetch` wrapper. Every hook should call it rather than `fetch`
directly.

### Configuration constants

| Constant | Value | Meaning |
|---|---|---|
| `API_BASE_URL` | `process.env.REACT_APP_API_URL \|\| '/api/v1'` | Prefixed to every endpoint. During `npm start` CRA proxies `/api/v1` to `http://localhost:8000` (see `package.json` `"proxy"`). |
| `DEFAULT_TIMEOUT` | `30000` (30 s) | Normal JSON requests. |
| `UPLOAD_TIMEOUT` | `300000` (5 min) | Applied automatically when the body is `FormData` or `ArrayBuffer`. |
| `DOWNLOAD_TIMEOUT` | `300000` (5 min) | Used by `downloadFile`. |
| `RETRY_CONFIG` | `{ maxRetries: 2, baseDelayMs: 500, maxDelayMs: 5000, retryableStatuses: [502, 503, 504] }` | Exponential backoff policy. |

`API_BASE_URL` is re-exported for callers that need to build a raw URL
(e.g. `useOpexProgress` builds its own `fetch` for the OPEX kick-off).

### `class ApiError extends Error`

```js
new ApiError(status, data)
```

| Property | Type | Description |
|---|---|---|
| `name` | `'ApiError'` | Constant discriminator. |
| `status` | `number` | HTTP status. **`0` means network failure / timeout / abort** — not a real HTTP code. |
| `data` | `any` | Raw parsed response body. |
| `parsed` | `{ general, message, fields }` | Result of `parseApiError(data)`. |
| `fieldErrors` | `Object<string,string>` | Shortcut to `parsed.fields`. Feed straight into `useFormErrors`. |
| `message` | `string` | `parsed.general ?? parsed.message ?? 'API Error'`. |

Because `status === 0` for both timeouts and connection failures, distinguish
them by `message`: the timeout path produces *"Pieprasījums tika pārtraukts vai
iestājās noilgums…"*, the connection path *"Neizdevās izveidot savienojumu ar
serveri…"*.

### `apiRequest(endpoint, options?, requestConfig?)`

The core function; every convenience method delegates to it.

```js
const { data, status } = await apiRequest('/project/16/', { method: 'GET' });
```

**Parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | — | Path appended to `API_BASE_URL`, e.g. `'/project/16/'`. Must include the leading slash and (by Django convention) the trailing slash. |
| `options` | `RequestInit` | `{}` | Standard fetch options — `method`, `headers`, `body`. |
| `requestConfig.timeout` | `number` | auto | Override the timeout in ms. |
| `requestConfig.signal` | `AbortSignal` | — | External cancellation. Linked to the internal timeout controller. |
| `requestConfig.retry` | `boolean` | `method === 'GET'` | Force-enable or force-disable retry. |

**Returns** `Promise<{ data: any, status: number }>`.
**Throws** `ApiError` on any 4xx/5xx, timeout, abort or network failure.

**Behaviour worth knowing**

1. **Header merging.** Defaults to `Content-Type: application/json`. Any header
   you set to `undefined`/`null` is *deleted* from the merged set — that is how
   callers strip `Content-Type`. If `body instanceof FormData` the header is
   removed automatically so the browser can set the multipart boundary.
2. **204 short-circuit.** `isNotFoundStatus(status)` (an alias for
   `isNoContentStatus`, i.e. `status === 204`) returns `{ data: null, status: 204 }`
   *before* the body is read.
3. **Body parsing** is content-type driven: `application/json` → `.json()`,
   `text/*` → `.text()`, anything else → `null`. Binary responses must use
   `downloadFile` instead.
4. **Retry** only fires for `status === 0` (network) or 502/503/504, only when
   retry is enabled, and at most `maxRetries` (2) times. Delay is
   `min(500 · 2^attempt, 5000)` plus 0–25 % jitter.
5. **Mutations do not auto-retry.** Only GET does, unless you pass
   `requestConfig.retry: true`.

### Convenience methods

| Function | Signature | Notes |
|---|---|---|
| `get` | `(endpoint, config?) => Promise<{data,status}>` | Auto-retries. |
| `post` | `(endpoint, data, config?)` | `JSON.stringify(data)` body. |
| `put` | `(endpoint, data, config?)` | |
| `patch` | `(endpoint, data, config?)` | Defined but currently unused by the app. |
| `del` | `(endpoint, config?)` | |
| `postFormData` | `(endpoint, formData, config?)` | Forces `UPLOAD_TIMEOUT`. |
| `putFormData` | `(endpoint, formData, config?)` | Forces `UPLOAD_TIMEOUT`. |
| `postBinary` | `(endpoint, arrayBuffer, contentType?, config?)` | `contentType` defaults to `application/octet-stream`. Used conceptually by the VVAIS report upload. |

### `downloadFile(endpoint, filename?, config?)`

Fetches a binary response and triggers a browser download. Does **not** go
through `apiRequest` — it needs the raw `Response` to call `.blob()`.

- If `filename` is omitted it is parsed from `Content-Disposition`, handling both
  `filename="x"` and RFC 5987 `filename*=UTF-8''x` (URL-decoded).
- Falls back to `download_<epoch-ms>`.
- Creates an object URL, clicks a synthetic `<a download>`, then revokes the URL.
- Throws `ApiError` — status from the response, or `0` for abort/timeout/network.

> **Note.** Most OPEX exports do *not* use this function. The backend writes the
> generated file into the project folder on disk and returns the path; see
> `useExportInventoryList` / `useExportAcceptanceReport` in
> [04-hooks.md](04-hooks.md).

---

## 3.2 `services/errorService.js`

Normalises the nine Django REST Framework error shapes into one object.

### `parseApiError(response, _depth = 0)`

**Returns** `{ general: string|null, message: string, fields: Object<string,string> }`

`_depth` is internal recursion guarding (max 5) against circular nesting.

**Recognised input shapes, in precedence order**

| # | Input | Result |
|---|---|---|
| 1 | `null` / `undefined` | `general = 'Neparedzēta kļūda. Mēģiniet vēlreiz.'` |
| 2 | `"plain string"` | `general = the string` |
| 3 | non-object (number, bool) | `general = String(response)` |
| 4 | `{ detail: "..." }` | `general = detail` — **returns immediately** |
| 5 | `{ detail: [...] }` | `general = detail.join('. ')` — returns immediately |
| 6 | `{ error: "..." }` | `general = error` — returns immediately |
| 7 | `{ non_field_errors: [...] }` | `general = joined`, then *continues* into field scan |
| 8 | `{ field: ["e1","e2"] }` | `fields.field = 'e1. e2'` |
| 9 | `{ field: "msg" }` | `fields.field = 'msg'` |
| 10 | `{ field: { nested: [...] } }` | recursion; nested keys are flattened to `field.nested` |

If no `general` was produced but `fields` is non-empty, `general` becomes
`'Lūdzu izlabojiet kļūdas formas laukos.'`. If neither, `'Neparedzēta kļūda.'`.

`message` is always a copy of `general` — it exists for call sites that read one
or the other.

> **Gotcha.** Because `detail` and `error` return early, a response that mixes
> `{ detail: ..., some_field: [...] }` silently drops the field errors.

### Status helpers

| Function | Description |
|---|---|
| `isErrorStatus(status)` | `status >= 400`. |
| `isNoContentStatus(status)` | `status === 204`. |
| `isNotFoundStatus` | **Misleading alias** for `isNoContentStatus`, kept for backward compatibility. It does *not* test 404. |
| `getStatusMessage(status)` | Latvian message for ~20 common codes; falls back to `HTTP kļūda <status>`. |
| `formatErrorMessage(template, ...args)` | Replaces successive `{}` placeholders positionally. |

---

## 3.3 Backend endpoint map

All paths below are relative to `/api/v1`. Query parameters that select a parent
or a subtype are part of the contract — the backend routes on them.

### Project

| Method | Path | Used by |
|---|---|---|
| `GET` | `/project/` | `useProjects` |
| `POST` | `/project/` | `useCreateProject` |
| `GET` | `/project/<pid>/` | `useProject`, `bulkApi.getProject` |
| `PUT` | `/project/<pid>/` | `useRenameProject` |
| `DELETE` | `/project/<pid>/` | `useDeleteProject` |
| `POST` | `/project/<pid>/add_report/` | `useUploadReport` — body is a raw `ArrayBuffer`, `Content-Type: application/octet-stream`, filename passed via `Content-Disposition` |
| `GET` | `/project/<pid>/export/inventories/` | `useExportInventoryList` |
| `GET` | `/project/<pid>/export/acceptance_report/?electronic=<bool>` | `useExportAcceptanceReport` |
| `GET` | `/project/<pid>/export/opex_package/?long=<bool>` | `useExportOpex`, `useOpexProgress.startExport` |
| `GET` | `/values/` | `Constants_API.fetchConstants` |

### Institution / Inventory / Item

| Method | Path | Used by |
|---|---|---|
| `PUT` | `/project/<pid>/institution/<iid>/` | `useAddInstitutionSigners`, `useUpdateInstitutionSignerField` |
| `POST` | `/project/<pid>/inventory/?fond_id=<fid>` | `useCreateInventory` |
| `PUT` | `/project/<pid>/inventory/<invid>/` | `useUpdateInventory` |
| `DELETE` | `/project/<pid>/inventory/<invid>/` | `useDeleteInventory` |
| `POST` | `/project/<pid>/item/?inventory_id=<invid>` | `useCreateItem`, `bulkApi.createItem` |
| `PUT` | `/project/<pid>/item/<itid>/` | `useUpdateItem`, `bulkApi.updateItem` |
| `DELETE` | `/project/<pid>/item/<itid>/` | `useDeleteItem` |

### Record, media record, files, metadata

| Method | Path | Used by |
|---|---|---|
| `POST` | `/project/<pid>/record/?item_id=<itid>` | `useCreateRecord`, `bulkApi.createRecord` |
| `GET` | `/project/<pid>/record/<rid>/` | `useRecord` |
| `PUT` | `/project/<pid>/record/<rid>/` | `useUpdateRecord`, `bulkApi.updateRecord` |
| `DELETE` | `/project/<pid>/record/<rid>/` | `useDeleteRecord`, `useBatchDeleteRecords` |
| `POST` | `/project/<pid>/media_record/?item_id=<itid>` | `useCreateMediaRecord` — multipart, field name `files` |
| `GET` | `/project/<pid>/media_record/<rid>/` | `useMediaRecord` |
| `PUT` | `/project/<pid>/media_record/<rid>/?type=<Foto\|Video\|Audio>` | `useUpdateMediaRecord` |
| `DELETE` | `/project/<pid>/media_record/<rid>/?type=<…>` | `useDeleteMediaRecord` |
| `POST` | `/project/<pid>/record/<rid>/multiple_files/` | `useUploadFiles`, `bulkApi.uploadRecordFiles` — multipart, repeated `files` field |
| `DELETE` | `/project/<pid>/file/<fid>/` | `useDeleteFile` |
| `POST` | `/project/<pid>/record/<rid>/additional_metadata/?class=<cls>` | `useCreateMetadata` |
| `PUT` | `/project/<pid>/record/<rid>/additional_metadata/methods/?class=<cls>&id=<mid>` | `useUpdateMetadata` |
| `DELETE` | `…/additional_metadata/methods/?class=<cls>&id=<mid>` | `useDeleteMetadata` |

`<cls>` is one of `action`, `addressee`, `visa`, `read_status` — **singular**.
The UI uses plural keys and `mapMetadataTypeToClass` converts (see
[04-hooks.md](04-hooks.md#usemetadatajs)).

### WebSocket

| URL | Used by |
|---|---|
| `ws://<hostname>:8000/ws/opex_progress/` | `useOpexProgress` |

Hard-coded port 8000; only the hostname is taken from `window.location`. It
requires the backend to be served by **uvicorn** (ASGI) — under plain WSGI the
socket never opens and the hook reports *"WebSocket kļūda — pārliecinieties ka
backend darbojas ar uvicorn"*.

---

## 3.4 Legacy `src/API/*_API.js` modules

Each file exports a **factory** — you call it to get an object of methods:

```js
import Project_API from '../API/Project_API';
const { create_project } = Project_API();
```

Every method returns a **tuple** `[ok, payload]`:

- `[true, json]` on success,
- `[false, message]` on failure, where `message` is a Latvian string from
  `ERROR_MESSAGES` or the caught `error.message`.

They call `fetch` directly with `API_ENDPOINT.API_BASE_URL` (`'/api/v1/project/'`)
and therefore bypass the timeout, retry and `ApiError` machinery entirely.

### `Project_API()`

| Method | Signature | Endpoint |
|---|---|---|
| `connect_api` | `() => [ok, projects[]]` | `GET /project/`. Treats a non-OK 204 and an empty body as `[true, []]`. |
| `create_project` | `(projectData) => [ok, json]` | `POST /project/` |
| `delete_project` | `(id) => [ok, json]` | `DELETE /project/<id>/` — note it parses a JSON body, which breaks on a real 204. |
| `rename_project` | `(id, projectData) => [ok, json]` | `PUT /project/<id>/` |
| `get_project` | `(id) => [ok, json]` | `GET /project/<id>/`; on failure returns the parsed error JSON as the message slot. |
| `uploadFileAsAttachment` | `(projectId, file) => Promise<[true, result]>` | Reads the `File` via `FileReader.readAsArrayBuffer`, posts to `/project/<id>/add_report/`. **Rejects** (does not return a tuple) on failure. |

### `Inventory_API()`

`createInventory(projectId, fondId, data)`, `updateInventory(projectId, inventoryId, data)`,
`deleteInventory(projectId, inventoryId)`. `deleteInventory` correctly handles
204 by returning `[true, null]`.

### `Item_API()`

`createItem(itemData, projectId, inventoryId)` — note the argument order differs
from the inventory module — plus `updateItem(itemData, projectId, itemId)` and
`deleteItem(projectId, itemId)`.

### `Institution_API()`

`addSigners(projectId, institutionId, signersData)` and
`updateSignerField(projectId, institutionId, updatedInstitutionData)`. The latter
whitelists exactly four keys: `creator`, `creator_position`, `signer`,
`signer_position`.

### `Record_API()`

The largest legacy module, and the only one with its own retry logic.

- **`buildAPIURL`** — sub-object of URL builders: `record`, `mediaRecord`,
  `file`, `multipleFiles`, `additionalMetadata`, `metadataMethods`. These emit
  **absolute** `/api/v1/...` paths (unlike the hook-side builders in
  `useRecords.js`, which are relative because `apiClient` adds the prefix).
- **`createRetryableRequest(requestFn, maxRetries = 3)`** — retries with
  `2^attempt` seconds of backoff; breaks immediately on 4xx.
- **`handleAPIResponse(response)`** — converts a `Response` into the tuple,
  probing `error`, `ERROR`, `errors` (object → flattened join) and raw strings.
- **`validateMediaRecordData(recordData, recordType)`** — client-side media
  guardrails, duplicated verbatim in `useRecords.js`:
  - `Foto` — `color ∈ {color, grayscale}`; resolutions must be integers.
  - `Video` — same as Foto plus `duration` matching `/^\d{2}:\d{2}:\d{2}$/`.
  - `Audio` — `duration` format only.
  - anything else → `Unknown record type: <type>`.
- CRUD methods: `createRecord`, `getRecord`, `updateRecord`, `deleteRecord`,
  `createMediaRecord`, `updateMediaRecord`, `deleteMediaRecord`,
  `uploadMultipleFiles`, `deleteFile`, `addMetadata`, `updateMetadata`,
  `deleteMetadata`.

### `Constants_API.js` — the modern one

Not a factory; plain named exports, backed by `apiClient.get`.

| Export | Signature | Description |
|---|---|---|
| `fetchConstants()` | `=> Promise<Object>` | `GET /values/`. Memoised in a module-level cache for **5 minutes**. On any error returns `FALLBACK_CONSTANTS` instead of throwing. |
| `getConstants()` | `=> Object` | Synchronous — cache or fallback. |
| `getConstantByPath(path)` | `(string) => Array` | Dot-path lookup, e.g. `'inventory.type'`. Returns `[]` if the path is missing. |
| `clearConstantsCache()` | `=> void` | Forces the next `fetchConstants` to hit the network. |
| `isConstantsLoaded()` | `=> boolean` | True once a successful API fetch has populated the cache. |
| `getCacheAge()` | `=> number\|null` | Milliseconds since the cache was filled. |
| `getInventoryTypes()` | | `inventory.type` |
| `getStorageTerms()` | | `inventory.storage_term` |
| `getDateIndicators()` | | `item.date_indicator` |
| `getUnitsOfMeasure()` | | `item.unit_of_measure` |
| `getRestrictions()` | | `item.restriction` |
| `getSecurityLevels()` | | `item.security_level` |
| `getAccessRestrictions()` | | `record.access_restriction` |

Because the module-level cache is separate from React Query's cache, calling
`clearConstantsCache()` alone will not re-render consumers — `ConstantsProvider`
only fetches once on mount.

---

## 3.5 Adding a new endpoint — checklist

1. Add the call to `src/hooks/<domain>.js` using `apiClient`'s `get/post/put/del`.
   Do **not** add it to `src/API/*_API.js`.
2. Add a key factory entry to `QUERY_KEYS` in
   [Constants/Constants.js](../src/Constants/Constants.js) if it is cacheable.
3. Wrap it in `useQuery` (reads) or `useMutation` (writes). Mutations invalidate
   `QUERY_KEYS.project(projectId)` — see [04-hooks.md](04-hooks.md#cache-invalidation-strategy).
4. In the consuming form, catch the `ApiError` and pass `error.data` (or the
   error itself) to `setApiErrors` from `useFormErrors`.

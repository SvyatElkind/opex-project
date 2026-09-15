# 19. Known Issues & Maintenance Backlog

Everything the documentation audit surfaced, in one place, ranked. **A4 and A6 are
fixed** (see below); the rest are open — this is a catalogue, so each item can be fixed as its own
reviewable change with its own test.

Each entry gives the evidence, the user-visible consequence, and a suggested fix.
Where a chapter discusses it in context, it is linked.

| Severity | Meaning |
|---|---|
| **A** | Wrong behaviour a user can hit |
| **B** | Latent — works today, breaks on a plausible change |
| **C** | Correctness of internals, no current user impact |
| **D** | Consistency / hygiene |

---

## A — user-visible

### A1. QuickJump cannot find media records

**Where** [`NavigationContext.getAllRecordsFromProject`](../src/Navigation/context/NavigationContext.js)

```js
inventory.items.forEach(item => {
  if (item.records && Array.isArray(item.records)) { … }   // only `records`
});
```

Media records live in `photo_records` / `video_records` / `audio_records`.

**Consequence** In a Foto, Skaņas or Video inventory, QuickJump's search returns
nothing for records — the user concludes the feature is broken.

**Fix** Gather all four arrays, the way `Record.js` and
`useOpexProgress.buildFileLookupMap` already do:

```js
const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
const records = inheritanceInfo.isTextual
  ? (item.records || [])
  : [...(item.photo_records||[]), ...(item.video_records||[]), ...(item.audio_records||[])];
```

→ [05](05-state-management.md#lookup-helpers)

### A2. Inventory statistics are always zero

**Where** [`NavigationContext.getInventoryById`](../src/Navigation/context/NavigationContext.js)

```js
const statistics = InheritanceUtils.getRecordStatistics(inventory);
```

The signature is `getRecordStatistics(item, inventory)`. Called with one
argument, `inventory` is `undefined`, the guard clause fires, and the all-zero
default is returned.

**Consequence** Any UI reading `getInventoryById(id).statistics` shows zeros.

**Fix** Use `getInventoryStatistics(inventory)`, which is the function that
actually aggregates an inventory. Then consider renaming `getRecordStatistics`
to `getItemRecordStatistics` so the argument order reads correctly at call sites.

→ [02](02-domain-model.md#getrecordstatisticsitem-inventory--stats)

### A3. The help-popup-blocked warning never reaches the user

**Where** [`Utils/HelpWindow.js`](../src/Utils/HelpWindow.js)

```js
window.dispatchEvent(new CustomEvent('showToast', {
  detail: { message: 'Palīdzības logs tika bloķēts…', type: 'warning' }
}));
```

A repo-wide search finds **no `addEventListener('showToast', …)`**.

**Consequence** With a popup blocker on, clicking Help does nothing and says
nothing.

**Fix** `HelpWindow.js` is a plain module, not a component, so it cannot call
`useNotification()`. Either return a status the caller surfaces, or add a small
listener inside `NotificationProvider` that maps `showToast` onto `notify[type]`.

→ [06](06-utilities.md#612-helpwindowjs)

### ~~A4. Create forms send `null` for fields the model rejects as null~~ — FIXED

**Where** [`CreateDocumentRecord.js`](../src/Record/CreateDocumentRecord.js) `handleSubmit`

```js
annotation: formData.annotation || null,
reg_nr:     formData.reg_nr     || null,
group:      formData.group      || null,
```

`getRecordCreatePayload`'s own doc comment states the opposite:

> Every `Record` model CharField is `blank=True, null=False`, so DRF rejects an
> explicit null with *"This field may not be null."* Empty optional fields must
> go out as `''`.

`access_restriction_notes` and `user_restriction_notes` are already special-cased
to `""` in the same object — evidence this was hit and patched field by field.

**Consequence** Creating a record with a blank optional field can 400 with an
error the form cannot map to an input.

**Fixed 2026-08-18.** `CreateDocumentRecord.js` now calls
`getRecordCreatePayload()`. Reproduced against the live backend first (same POST:
`null` payload → 400 on six fields, `''` payload → 201), then re-verified.

A second defect surfaced while fixing it: `access_restriction` was initialised to
`''`, and the model declares it `blank=False`, so a preset whose value
`normalizePreset()` had dropped produced *"This field may not be blank."* It now
defaults to `RECORD_ACCESS_RESTRICTION_DEFAULT`.

**Still open:** `CreateItemNavigable.js` also builds its payload inline. It was
not touched in this pass.

→ [16 §16.6](16-forms-deep-dive.md#166-payload-builder-coverage--read-this-before-editing-a-save-path)

### A5. The access-restriction warning checks the wrong values

**Where** [`CreateDocumentRecord.js`](../src/Record/CreateDocumentRecord.js)

```js
const parentIsRestricted =
  parentRestriction === 'ierobežota' || parentRestriction === 'strikti ierobežota';
```

`ITEM_RESTRICTION_LIST` is `['Vispārēja', 'Ierobežota', 'Sensitīvi dati']`.
`'strikti ierobežota'` does not exist; `'Sensitīvi dati'` — which *is*
restrictive — is treated as unrestricted.

**Consequence** No warning when a public record is created under a
*Sensitīvi dati* item, which is exactly the case the warning exists for.

**Fix** Compare against `ITEM_RESTRICTION_LIST` and define the restrictive set
explicitly (`Ierobežota`, `Sensitīvi dati`), ideally as an exported constant in
`itemConstants.js` so the rule has one home.

→ [16 §16.4](16-forms-deep-dive.md#access-restriction-inheritance-warning-soft)

### ~~A6. Project-list errors are indistinguishable from an empty list~~ — FIXED

**Where** [`useProjects`](../src/hooks/useProjects.js)

```js
try { const { data } = await get(API_BASE_URL); return data || []; }
catch { return []; }
```

The comment explains the cause: uvicorn's h11 layer crashes on Django's `204`
for an empty list, surfacing as a network error.

**Consequence** A backend that is down, misconfigured or returning 500 renders
the same "no projects yet" empty state as a genuinely empty install. The user is
invited to create a project that will then fail.

**Fixed 2026-08-18.** Root cause was **not** uvicorn. `ProjectAPIView.get()`
returned `204` *with a JSON body*; HTTP forbids a body on 204, so h11 declared
zero content length and Django's 16-byte write raised
`LocalProtocolError: Too much data for declared Content-Length` — the response
aborted after headers.

`project/views.py` now returns `200 []`, and the blanket `catch` in
`useProjects` is gone so a real outage surfaces instead of masquerading as an
empty install. Verified: `200 OK`, `Content-Length: 2`, `[]`, no h11 error.

**Still open:** seven other `204`-with-body branches remain in the same file.
They are not on this path but will fail the same way if reached.

→ [04](04-hooks.md#useprojects)

---

## B — latent

### B1. `useExportOpex`'s in-flight guard never fires

**Where** [`useProjects.js`](../src/hooks/useProjects.js)

```js
export function useExportOpex() {
  const pendingRef = { current: false };   // ← a fresh object every render
```

**Consequence** None today, because the real OPEX path goes through
`useOpexProgress` and the UI disables the button. But the guard reads as
protection that does not exist.

**Fix** `useRef(false)`, or delete the guard and rely on `isPending`.

### B2. `clearErrors(name)` is called with an argument it ignores

**Where** the create/edit forms call `clearErrors(name)`; `useFormErrors.clearErrors`
takes no parameters and clears **everything**.

**Consequence** Typing in one field clears every other field's error too. Cosmetic
today; actively misleading if someone later relies on per-field clearing.

**Fix** Call the existing `clearFieldError(name)`, which does what the call sites
intend.

### B3. `parseApiError` drops field errors when `detail` or `error` is present

**Where** [`errorService.js`](../src/services/errorService.js) — both branches
`return result` immediately.

**Consequence** A response like `{ detail: "...", title: ["..."] }` shows only the
general message; the field error never reaches the input.

**Fix** Set `result.general` and fall through to the field scan, as the
`non_field_errors` branch already does.

### B4. Optimistic update aliases the previous cache object

**Where** [`useInventories.useUpdateInventory`](../src/hooks/useInventories.js)

```js
const updatedProject = { ...old };
updatedProject.institution.fond.inventories = …   // mutates the shared nested object
```

The shallow copy shares `institution`, so the assignment writes through to the
snapshot's object graph.

**Consequence** Rollback still works because `previousProject` is captured before
the write and re-set wholesale. But any future code holding a reference to the
old tree sees mutated data.

**Fix** Copy each level being modified, as `useItems` does more carefully, or use
an immutable helper.

### B5. `useCachedRecord` does not subscribe

**Where** [`useRecords.js`](../src/hooks/useRecords.js) — calls
`queryClient.getQueryData(...)` directly.

**Consequence** Returns a value at first render and never updates. Safe as a
one-shot read; wrong if used as a data source.

**Fix** Rename to `readCachedRecord` and export it as a plain function, or make it
a real `useQuery` with `enabled: false`.

### B6. `navigationHistory` grows without bound

**Where** [`NavigationContext.navigateTo`](../src/Navigation/context/NavigationContext.js)
pushes on every call and nothing ever trims.

**Consequence** A long session accumulates thousands of entries; each push
re-renders every consumer.

**Fix** Cap it, e.g. `.slice(-50)`, the way `useOpexProgress` caps `messages` at 500.

### B7. `ConstantsContext`'s value object is rebuilt every render

**Where** [`context/ConstantsContext.js`](../src/context/ConstantsContext.js) — the
`value` object and its eight predicate closures are constructed inline.

**Consequence** Every consumer re-renders on any provider render, and the object
is unsafe as a `useEffect` dependency.

**Fix** `useMemo` the value on `[constants, loading, error, isFromApi]`, as
`GuidanceContext` already does.

---

## C — internal correctness

### C1. The one-record cap is not enforced by the function that claims to

**Where** [`InheritanceUtils.validateRecordCreation`](../src/Utils/InheritanceUtils.js)
counts `item.records.length` against `maxRecords`.

For `ELECTRONIC_MEDIA` / `MEDIA` (`maxRecords: 1`), records are in the media
arrays, so the count is always 0 and the cap never triggers. The UI enforces it
separately.

**Fix** Branch on the category and count the right array — the same helper
`getRecordStatistics` already contains.

### C2. `validateMediaRecordData` exists twice, verbatim

**Where** [`API/Record_API.js`](../src/API/Record_API.js) and
[`hooks/useRecords.js`](../src/hooks/useRecords.js).

**Fix** Move it to `Constants/recordConstants.js` and import from both — or delete
the `Record_API.js` copy along with the module (see D3).

### C3. `validateRecordForm` duplicates `validateRecordData`'s per-type checks

**Where** [`Utils/RecordValidation.js`](../src/Utils/RecordValidation.js) — the
media branch re-checks colour, resolution and duration that
`validateRecordData` has already checked.

**Consequence** A missing colour on a photo produces the same message twice.

**Fix** Delete the duplicated block; keep the file-presence check that is unique
to `validateRecordForm`.

### C4. `logStats()` does not log

**Where** [`Utils/PerformanceMonitor.js`](../src/Utils/PerformanceMonitor.js) —
returns `getAllStats()`.

**Fix** Rename to `getAllStatsIfEnabled`, or make it log. `usePerformance` exposes
it as `logAllStats`, so both names mislead.

### C5. `usePerformance`'s mount measurement records the component's lifetime

**Where** [`hooks/usePerformance.js`](../src/hooks/usePerformance.js) — starts on
mount, ends in the cleanup.

**Consequence** `"Items - Mount"` reports how long the component stayed mounted,
not how long it took to mount. Any conclusion drawn from that number is wrong.

**Fix** End the measurement at the bottom of the same effect, and use a separate
label if lifetime is genuinely wanted.

### C6. `hasErrors` is not a boolean

**Where** [`hooks/useFormErrors.js`](../src/hooks/useFormErrors.js)

```js
const hasErrors = generalError || Object.keys(fieldErrors).length > 0;
```

Returns the error **string** when one is set.

**Fix** `Boolean(generalError) || Object.keys(fieldErrors).length > 0`.

### C7. `FILE_LARGE_SIZE` is catalogued but not implemented

**Where** [`Constants/validationRules.js`](../src/Constants/validationRules.js)
documents a >500 MB warning that `InheritanceUtils.validateFile` never produces.

**Fix** Either implement it or remove the entry. The catalogue is read as a
specification, so a rule that is documented but absent is worse than neither.

### C8. `MediaRecordForm` carries a field the model does not have

**Where** [`Record/MediaRecordForm.js`](../src/Record/MediaRecordForm.js) has
`description` in `formData`, and `validateRecordData` length-checks it — but
neither payload builder includes it, so it is never sent.

**Fix** Confirm against the backend serializer, then remove it (the record model
has `annotation` and `notes`).

---

## D — consistency & hygiene

### D1. `isNotFoundStatus` tests 204

```js
export const isNoContentStatus = (status) => status === 204;
export const isNotFoundStatus = isNoContentStatus;   // backward-compatible alias
```

A future reader will use it for 404 and get silent wrong behaviour.

**Fix** Delete the alias; update the one call site in `apiClient`.

### D2. `formatFileSize` exists four times with different output

| Location | Units | `0` renders as |
|---|---|---|
| `InheritanceUtils.js` | `B KB MB GB` | `'0 B'` |
| `RecordValidation.js` | `Bytes KB MB GB` | `'0 Bytes'` |
| `Record/RecordFiles.js` (local) | `B KB MB GB` | `'0 B'` |
| `Verification/VerificationModal.jsx` (local) | `B KB MB GB TB` | `'0 B'` |

**Fix** One implementation in `Utils/`, imported everywhere. Pick the TB variant.

### D3. Two HTTP stacks

`src/API/*_API.js` bypasses `apiClient`'s timeout, retry and `ApiError`. Still
used by `QuickActions.jsx` and `TestDataGenerator.jsx` (both DevAdmin).

**Fix** Migrate those two to `apiClient`, then delete `Inventory_API.js`,
`Item_API.js`, `Record_API.js`, `Project_API.js` and `Institution_API.js`.
`Constants_API.js` already uses `apiClient` and stays.

→ [03](03-api-layer.md#34-legacy-srcapi_apijs-modules)

### D4. Four vocabularies for the metadata classes

Plural UI keys, singular API `class`, capitalised singular in
`validateMetadata`, mixed in the backend response.

**Fix** One exported enum plus explicit mapping functions, all in
`recordConstants.js`.

→ [15 §15.3](15-glossary.md#metadata-classes--four-vocabularies)

### D5. The missing-report gate matches a localised message

```js
const isMissingReport = projectError?.message?.includes("Nav importēta VVAIS atskaite");
```

Two call sites: `Project.js` and `useProject`'s retry predicate.

**Fix** Have the backend return a stable code (`{ code: "MISSING_REPORT" }`) and
match on that.

→ [10](10-domain-components.md#missing-report-gate)

### D6. The Smart Guide button is disabled with dead code

```jsx
{false && ( <button className="details-toggle-btn smart-guide-btn" …/> )}
```

**Fix** Decide: finish the feature or delete the block. A feature flag in
`settings.experimental` would be consistent with `spreadsheetImport`.

### D7. `index.html` still says "React App"

**Where** [`public/index.html`](../public/index.html) — `<title>React App</title>`,
plus CRA's default meta description. `help.html` is properly titled.

**Fix** Set the Latvian product title and description.

### D8. `help.html` loads a remote font

```html
<link href="https://fonts.googleapis.com/css2?family=Libertinus+Serif+Display…">
```

The only external network dependency in an otherwise fully local application.
Fails silently offline.

**Fix** Self-host the font in `public/`, or drop it for a system serif stack.

### D9. Unused dependencies

`@tanstack/react-query-persist-client` and `react-datetime-picker` are in
`package.json` and imported nowhere.

**Fix** Remove them.

### D10. `API_BASE_URL_RECORD` is dead

```js
API_BASE_URL_RECORD: "http://127.0.0.1:8000/api/records/project/"
```

An absolute URL to a path that no longer exists.

**Fix** Delete it from `Constants.js`.

---

## Suggested order

1. ~~**A4**, **A6**~~ — **done 2026-08-18**, both verified against a running backend.
2. **A1, A2** — one-line fixes, immediately visible to users.
3. **A3, A5** — small, self-contained.
4. **CreateItemNavigable** — the remaining inline payload builder (was A4's twin).
5. **The seven other 204-with-body branches** in `project/views.py`.
5. **D2, D3, D4** — consolidation passes; each is mechanical but touches many
   files, so do them one at a time with the puppet run as the check.
6. **B1–B7, C1–C8** — as you touch the surrounding code.
7. **D5–D10** — hygiene, any time.

Every one of these should get a `CHANGELOG.md` entry under *Nepublicēts*,
per [`CLAUDE.md`](../../CLAUDE.md).

---

## How these were found

Every item comes from reading the source while writing chapters 01–18, not from
running the app. That means:

- **Each is evidenced by the code quoted above** — no speculation.
- **None has been reproduced against a running backend.** The severity ratings
  are reasoning about consequences, not observed failures. A1, A2 and A3 are
  structural and certain; A4, A5 and A6 depend on backend behaviour worth
  confirming before the fix.
- Anything requiring backend knowledge to confirm is flagged as such in the entry.

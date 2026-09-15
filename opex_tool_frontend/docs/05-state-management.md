# 5. State Management & Contexts

The app has **no Redux, no Zustand, no URL router**. State is split three ways:

| Layer | Owner | Persistence |
|---|---|---|
| Server state | React Query (`QueryClientProvider`) | in-memory cache only |
| Cross-cutting client state | six React Contexts | `localStorage` for four of them |
| Local UI state | `useState` inside components | none |

Provider order, from [src/index.js](../src/index.js):

```
QueryClientProvider
└─ NotificationProvider      components/Notification.jsx
   └─ SettingsProvider       Settings/context/SettingsContext.jsx
      └─ RoadmapProvider     Roadmap/RoadmapContext.jsx
         └─ GuidanceProvider Guidance/GuidanceContext.jsx
            └─ ConstantsProvider  context/ConstantsContext.js
               └─ NavigationProvider Navigation/context/NavigationContext.js
                  └─ Workspace
```

The order is not arbitrary: `GuidanceProvider` calls `useSettings()`, so it must
sit inside `SettingsProvider`. Everything else is independent, but keep the order
when adding providers.

### localStorage key map

| Key | Written by | Shape |
|---|---|---|
| `opex_settings` | `SettingsContext` | the whole settings object |
| `opex_project_roadmaps` | `RoadmapContext` | `{ [projectId]: Route[] }` |
| `guidanceVisible` | `GuidanceContext` | `boolean` |
| `guidanceMinimized` | `GuidanceContext` | `boolean` |
| `dismissedGuidanceActions` | `GuidanceContext` | `string[]` |
| `opex_dismissed_warnings` | `Verification/VerificationModal.jsx` | `string[]` |
| `devAdminPanelState`, `devAdminMocks`, … | DevAdmin components | see [12-devadmin.md](12-devadmin.md) |

Every read is wrapped in `try/catch` and falls back to a default — corrupted or
absent storage must never break boot.

---

## 5.1 `NotificationProvider` — [components/Notification.jsx](../src/components/Notification.jsx)

Replaces `alert()` and `window.confirm()`. Nothing persists.

### `useNotification()`

**Returns** `{ notify, confirm, showConfirm }`. `showConfirm` is an alias of
`confirm`; both names appear across the codebase.

```js
const { notify, confirm } = useNotification();

notify.success('Iestatījumi saglabāti!');
notify.error('Kļūda: ' + error.message);
notify.warning('Brīdinājums');
notify.info('Informācija');

const ok = await confirm('Vai tiešām vēlaties dzēst?');
```

**`confirm(config)`** returns a `Promise<boolean>`. `config` is either a plain
string (used as the message) or an object:

| Key | Default | Notes |
|---|---|---|
| `title` | `'Apstiprināt darbību'` | |
| `message` | `'Vai esat pārliecināts?'` | |
| `confirmText` | `'Apstiprināt'` | |
| `cancelText` | `'Atcelt'` | |
| `variant` | `'default'` | `'danger'` and `'warning'` add `notification-confirm-danger` / `-warning` classes and switch the header icon. |

Clicking the overlay backdrop resolves `false`. The confirm button is
`autoFocus`, so Enter accepts.

**Safety valve.** If a component calls `useNotification()` outside the provider
it gets a **no-op stub** — `notify.*` do nothing and `confirm` resolves `false`.
Rendering never crashes, but a missing provider fails silently.

### Toasts

`addToast` keeps at most **5** (`prev.slice(-4)` plus the new one). Each
`ToastItem` auto-dismisses after **3000 ms**, plus a 300 ms exit animation;
clicking dismisses early. The stack and the dialog are both rendered through
`ReactDOM.createPortal(..., document.body)` so no ancestor's `overflow` or
`z-index` can clip them.

Icons: `fa-check-circle` (success), `fa-times-circle` (error),
`fa-exclamation-triangle` (warning), `fa-info-circle` (info).

> `Toast/Toast.js` is a **separate, older** component still used directly by
> `Project.js` for one-off messages. New code should use `notify`.

---

## 5.2 `SettingsProvider` — [Settings/context/SettingsContext.jsx](../src/Settings/context/SettingsContext.jsx)

Owns every user preference and the **form presets**. Persists the whole object to
`localStorage['opex_settings']` on every change.

### `DEFAULT_SETTINGS`

| Group | Key | Default | Used by |
|---|---|---|---|
| General | `itemsPerPage` | `25` | list pagination |
| Form defaults | `defaultRecordLanguage` | `'latviešu'` | record forms |
| | `defaultItemLanguage` | `'latviešu'` | item forms |
| | `defaultAccessRestriction` | `'open'` | record forms |
| | `defaultSecurityLevel` | `'Publisks'` | item forms |
| Display | `theme` | `'auto'` | `useTheme` |
| | `fontSize` | `'medium'` | `useAppSettings` |
| | `compactView` | `false` | `useAppSettings` |
| | `showBreadcrumbs` | `true` | Navigation |
| Presets | `formPresets` | one `default` preset | all create forms |
| | `activePresetId` | `'default'` | |
| `experimental` | `spreadsheetImport` | `false` | CSV/XLSX import — **while off, the feature has no entry point in the UI at all** |
| `guidance` | `enabled` | `true` | `GuidanceContext` |
| | `showMode` | `'auto'` | `'always' \| 'auto' \| 'never'` |
| | `position` | `'bottom-right'` | `'bottom-right' \| 'top-right'` |
| `validation` | `enabled` | `true` | master toggle |
| | `enableFileSizeWarnings` | `true` | |
| | `enableDurationWarnings` | `true` | |
| | `enableImageDimensionWarnings` | `true` | |
| | `enableOrientationWarnings` | `true` | |
| | `maxFileSize` / `minFileSize` | `100` MB / `0.01` MB | `Utils/FileValidation.js` |
| | `maxDuration` / `minDuration` | `3600` s / `1` s | audio + video |
| | `maxImageWidth` / `maxImageHeight` | `4000` / `4000` px | |
| | `minImageWidth` / `minImageHeight` | `800` / `600` px | |
| | `preferredOrientation` | `'any'` | `'any'\|'horizontal'\|'vertical'\|'square'` |

All validation thresholds produce **warnings, not hard blocks**.

### `mergeWithDefaults(stored)`

Shallow-merges stored settings over the defaults, then **merges one level deeper**
for the three nested groups listed in `NESTED_GROUPS`
(`['validation','experimental','guidance']`).

The comment explains why: with a plain spread, a stored `validation` object would
*replace* the default wholesale, so any key added in a later release would stay
`undefined` for every existing user. This is the upgrade path — **add new nested
groups to `NESTED_GROUPS` or they will not reach existing installs.**

### Preset normalisation

Two module-level tables guard against stale preset values:

```js
VALID_PRESET_VALUES = {
  securityLevel:     ITEM_SECURITY_LEVEL_LIST,
  restriction:       ITEM_RESTRICTION_LIST,
  accessRestriction: RECORD_ACCESS_RESTRICTION_VALUES,
}

LEGACY_PRESET_VALUES = {
  securityLevel:     { 'Iekšējam lietojumam': 'Iekšējs' },
  restriction:       { 'Konfidenciāla': 'Sensitīvi dati' },
  accessRestriction: { restricted: 'closed' },
}
```

**`normalizePreset(preset)`** — for each guarded field, if the stored value is
not in the valid list it is replaced by the `LEGACY_PRESET_VALUES` mapping, or
**deleted** (set to `undefined`) if unknown. Deleting matters: a form receiving a
value that matches no `<option>` renders an empty `—` instead of falling back to
its own default. Returns the same object reference when nothing needs fixing, so
memoisation downstream stays stable.

### Context value

| Export | Signature | Notes |
|---|---|---|
| `settings` | object | The merged live settings. |
| `updateSetting(key, value)` | | Top-level key only. To change a nested key, spread the group yourself. |
| `updateMultipleSettings(updates)` | | Shallow merge. |
| `resetSettings()` | | Back to defaults. |
| `exportSettings()` | | Downloads `opex-settings-YYYY-MM-DD.json`. |
| `importSettings(file)` | `=> Promise<void>` | Reads a JSON `File`, runs it through `mergeWithDefaults`. Rejects on parse error. |
| `DEFAULT_SETTINGS` | object | Exposed so the Settings UI can show "reset to default" per field. |
| `createPreset(presetData)` | `=> newId` | `id = 'preset_<epochMs>'`, `isDefault: false`. |
| `updatePreset(presetId, updates)` | | |
| `deletePreset(presetId)` | | **Throws** `'Nevar dzēst noklusējuma priekšiestatījumu'` for `isDefault` presets. Resets `activePresetId` to `'default'` if the active one was deleted. |
| `duplicatePreset(presetId)` | `=> newId\|null` | Name gets ` (kopija)` appended. |
| `setActivePreset(presetId)` | | |
| `getActivePreset()` | `=> preset` | `useCallback`-stable wrapper over a `useMemo`'d, normalised preset. Falls back to `formPresets[0]` if the active id is missing. |

> **Reference stability matters here.** `activePreset` is memoised specifically
> because consumers list it as a `useEffect`/`useMemo` dependency; returning a
> fresh object each render would re-initialise form state on every keystroke.

### Preset shape

```js
{
  id: 'default',
  name: 'Noklusējums',
  isDefault: true,
  itemLanguage: 'latviešu',
  recordLanguage: 'latviešu',
  accessRestriction: 'open',
  securityLevel: 'Publisks',
  restriction: 'Vispārēja',
  keyWords: '',
  notes: ''
}
```

---

## 5.3 `RoadmapProvider` — [Roadmap/RoadmapContext.jsx](../src/Roadmap/RoadmapContext.jsx)

Per-project **routes** (*maršruti*) — user-declared goals for how much material a
project should end up containing. Stored in
`localStorage['opex_project_roadmaps']` as `{ [projectId]: Route[] }`.

### `ROUTE_STATUS`

```js
{ IN_PROGRESS: 'in_progress', COMPLETED: 'completed', ARCHIVED: 'archived' }
```

Exported both as a named export and on the context value.

### Route shape

```js
{
  id: 'route_<epochMs>_<random>',
  status: 'in_progress',
  createdAt: ISOString,
  updatedAt: ISOString,
  completedAt?: ISOString,
  inventoryNumber?: number,   // scope the route to one inventory
  inventoryName?: string,
  mode?: string,              // set by the wizard
  goals: { totalItems, totalRecords, totalFiles }
}
```

### `migrateData(stored)`

Runs once on mount. The format used to be **one roadmap object per project**; it
is now an array. For each project id:

- already an array → kept as-is;
- an object with a `mode` key → wrapped in a one-element array, given an `id`, and
  its legacy `completed` boolean translated into `status`;
- anything else → `[]`.

### API

| Function | Signature | Notes |
|---|---|---|
| `getRoadmaps(projectId)` | `=> Route[]` | `[]` when absent. |
| `getRoadmap(projectId, routeId?)` | `=> Route\|null` | Without `routeId` returns the **first** route (backwards compatibility). |
| `addRoute(projectId, routeData)` | `=> newId` | Stamps `id`, `status: IN_PROGRESS`, `createdAt`, `updatedAt`. |
| `updateRoute(projectId, routeId, data)` | | Bumps `updatedAt`. |
| `deleteRoute(projectId, routeId)` | | |
| `updateRouteStatus(projectId, routeId, status)` | | Adds `completedAt` when moving to `COMPLETED`. |
| `hasRoadmap(projectId)` | `=> boolean` | |
| `calculateProgress(projectData, route)` | `=> ProgressReport` | See below. |
| `setRoadmap(projectId, data)` | | Legacy: updates route 0, or adds one. |
| `completeRoadmap(projectId)` | | Legacy: completes route 0. |
| `deleteRoadmap(projectId)` | | Legacy: drops **all** routes for the project. |

### `calculateProgress(projectData, route)`

Walks the project tree, filtered to `route.inventoryNumber` when set.

Counting rules — note the asymmetry:

- A **textual** record counts as 1 record; each of its `files` counts as 1 file.
- A **media** record (`photo_records`, `video_records`, `audio_records`) counts as
  **both** 1 record and 1 file, because in the media model one record always owns
  exactly one file.

**Returns**

```js
{
  items:   { current, target, percentage },
  records: { current, target, percentage },
  files:   { current, target, percentage },
  overall: number
}
```

Each `percentage` is `min(100, round(current/target·100))`, or `0` when the
target is `0`. `overall` is the mean of **only those metrics that have a
non-zero target** — a route that only sets an item goal is not dragged to 33 %
by two absent goals.

---

## 5.4 `GuidanceProvider` — [Guidance/GuidanceContext.jsx](../src/Guidance/GuidanceContext.jsx)

Owns only the **throwaway session state** of the Smart Guide card. The durable
preferences (`enabled`, `showMode`, `position`) live in `SettingsContext` under
`settings.guidance`, so they are editable from the Settings modal and travel with
settings export/import.

### `useGuidance()`

| Export | Type | Persisted as |
|---|---|---|
| `isVisible` / `setIsVisible` | `boolean` | `guidanceVisible` |
| `isMinimized` / `setIsMinimized` | `boolean` | `guidanceMinimized` |
| `dismissedActions` | `string[]` | `dismissedGuidanceActions` |
| `dismissAction(actionId)` | fn | idempotent — no duplicates |
| `undismissAction(actionId)` | fn | |
| `resetDismissed()` | fn | clears the list |
| `settings` | object | mirror of `appSettings.guidance` |
| `shouldShowGuide(hasIssues)` | `=> boolean` | decision table below |

### `shouldShowGuide(hasIssues)`

| `settings.enabled` | `settings.showMode` | Result |
|---|---|---|
| `false` | any | `false` |
| `true` | `'never'` | `false` |
| `true` | `'always'` | `true` |
| `true` | `'auto'` | `Boolean(hasIssues)` |

The whole context value is `useMemo`'d — the guide card re-renders on every
project change, so a stable identity is worth it.

---

## 5.5 `ConstantsProvider` — [context/ConstantsContext.js](../src/context/ConstantsContext.js)

Fetches the backend's enum vocabulary once on mount via
`Constants_API.fetchConstants()` and exposes it plus a set of predicates. Because
`fetchConstants` swallows its own errors and returns `FALLBACK_CONSTANTS`, the
provider's `catch` branch is effectively unreachable and `isFromApi` is `true`
even when the fallback was served.

### `useConstants()`

**Throws** `'useConstants must be used within a ConstantsProvider'` if used
outside.

| Export | Type | Source path |
|---|---|---|
| `constants` | object | raw `/values/` payload |
| `loading`, `error`, `isFromApi` | | fetch status |
| `inventoryTypes` | `string[]` | `inventory.type` |
| `storageTerms` | `string[]` | `inventory.storage_term` |
| `dateIndicators` | `string[]` | `item.date_indicator` |
| `unitsOfMeasure` | `string[]` | `item.unit_of_measure` |
| `restrictions` | `string[]` | `item.restriction` |
| `securityLevels` | `string[]` | `item.security_level` |
| `accessRestrictions` | `string[]` | `record.access_restriction` |
| `defaults` | object | `DEFAULT_VALUES` |
| `mediaTypes`, `textualTypes` | `string[]` | static |
| `requireAnnotationTypes`, `requireDurationTypes`, `requireColorTypes`, `requireResolutionTypes`, `notRequireLanguageType` | | static |

### Predicates

| Function | Rule |
|---|---|
| `isMediaType(type)` | `type ∈ ['Foto','Skaņas','Video']` |
| `isTextualType(type)` | `type === 'Tekstuāls'` |
| `requiresAnnotation(type)` | `type ∈ ['Foto','Skaņas','Video']` |
| `requiresLanguage(type)` | `type !== 'Foto'` |
| `requiresDuration(type)` | `type ∈ ['Skaņas','Video']` |
| `requiresColor(type)` | `type ∈ ['Foto','Video']` |
| `requiresResolution(type)` | `type ∈ ['Foto','Video']` |
| `requiresRestrictionNote(restriction)` | `restriction !== 'Vispārēja'` |

> **The context value object is rebuilt on every render** — it is not memoised.
> Do not put it directly in a `useEffect` dependency array; destructure the
> fields you need instead.

### `FallbackConstants.js`

The offline mirror of `GET /api/v1/values/`. Every list has a comment naming the
Python constant it must match — **these are a contract with the backend, not a
convenience**.

```js
FALLBACK_INVENTORY_TYPE  = ['Foto','Skaņas','Tekstuāls','Video']
FALLBACK_STORAGE_TERM    = ['Pastāvīgi glabājamās lietas','Ilgstoši glabājamās lietas']
FALLBACK_DATE_INDICATOR  = ['year','month','day']
FALLBACK_UNIT_OF_MEASURE = ['Lapas','Dokumenti','Glabājamās vienības']
FALLBACK_RESTRICTION     = ['Vispārēja','Ierobežota','Sensitīvi dati']
FALLBACK_SECURITY_LEVEL  = ['Publisks','Iekšējs','Konfidenciāls','Slepens','Sevišķi slepens']
FALLBACK_ACCESS_RESTRICTION = ['open','closed']
```

`DEFAULT_VALUES` — applied when creating new entities:

```js
{ date_indicator: 'day', unit_of_measure: 'Lapas', restriction: 'Vispārēja',
  security_level: 'Publisks', access_restriction: 'open',
  electronic: true, subfond: 0 }
```

---

## 5.6 `NavigationProvider` — [Navigation/context/NavigationContext.js](../src/Navigation/context/NavigationContext.js)

**This is the router.** There is no `react-router`; the current screen is a
function of three ids plus `activeTab`.

### State

| Field | Type | Meaning |
|---|---|---|
| `currentInventory` | `id\|null` | Selected inventory. |
| `currentItem` | `id\|null` | Selected item. |
| `currentRecord` | `id\|null` | Selected record. |
| `activeTab` | `string\|null` | Which tab of a detail view is open. |
| `navigationHistory` | `Array<{inventory,item,record,timestamp}>` | Push-only stack. |
| `projectData` | object | Mirror of the React Query project tree, pushed in by `Project.js`. |
| `currentProjectId` | `id` | |

Each of the three ids is mirrored into a ref (`currentInventoryRef` etc.),
assigned on every render, so `navigateTo` can stay `useCallback([])` while still
reading fresh values.

The effective level is derived, not stored: `record → item → inventory → project`,
first non-null wins.

### `navigateTo(type, id, parentId?, itemId?, options?)`

`type` ∈ `'project' | 'inventory' | 'item' | 'record'`.

**Overload:** if `id` is an object, it is treated as a params bag and re-dispatched:

```js
navigateTo('record', { id, parentId, itemId })
// actualId       = params.id ?? params.recordId ?? params.itemId ?? params.inventoryId
// actualParentId = params.parentId ?? params.inventoryId
// actualItemId   = params.itemId
```

**Tab handling:** `options.tab` sets `activeTab`. Otherwise `activeTab` is
cleared — *except* when navigating to `'item'` while a record is open, which is
read as "going back up from a record" and preserves the tab.

**History:** every call pushes the *previous* triple onto `navigationHistory`.
Nothing ever trims it; a long session grows it without bound.

**Per-type effects**

| `type` | Effect |
|---|---|
| `project` | clears all three ids |
| `inventory` | sets inventory, clears item + record |
| `item` | sets item (and inventory from `parentId` if given), clears record |
| `record` | `parseInt`s the id and **returns silently if `NaN`**; sets inventory/item from args, then the record |

### `navigateBack()` / `navigateBackSmart()`

`navigateBack` pops the history stack and restores the triple; returns `false`
when the stack is empty.

`navigateBackSmart` prefers structural ascent over history:

1. Record open inside a textual **or** media item → clear only the record.
2. Item open, no record → clear the item.
3. Inventory open, no item → clear the inventory.
4. Otherwise fall through to `navigateBack()`.

### Lookup helpers

All of these walk `projectData.institution.fond.inventories` and **decorate** the
raw entity with computed fields from `InheritanceUtils`.

| Function | Returns |
|---|---|
| `getInventoryById(id)` | inventory + `inheritanceInfo` + `statistics` |
| `getItemById(id)` | item + `inventoryId/Number/Type` + `inheritanceInfo` + `navigationBehavior` + `attentionStatus` + `recordCount` |
| `getRecordById(id)` | record + inventory & item context + `inheritanceInfo` + `navigationBehavior` + `isMediaRecord` + `isTextualRecord` |
| `getAllItemsFromProject()` | flat array of decorated items, plus `constraintCompliant` |
| `getAllRecordsFromProject()` | flat array of decorated records, plus a human `navigationPath` string |
| `getInventoryNumber(id)` / `getItemNumber(id)` | the `number` field or `null` |
| `getRecordIdentifier(id)` | `record.title` → `record.reg_nr` → `'Record <id>'` |
| `getCurrentBreadcrumbPath()` | `[{type,id,label}]` for the current triple |
| `getNavigationStats()` | `{ totalItems, totalRecords, currentLevel, historyDepth }` |

> **Performance note.** `getAllItemsFromProject` and `getAllRecordsFromProject`
> re-walk the entire tree and call three `InheritanceUtils` helpers per entity on
> every invocation. They are `useCallback`'d on `projectData`, so the *function*
> identity is stable, but each call is O(items). Do not call them inside a render
> loop; hoist into a `useMemo`.
>
> `getAllRecordsFromProject` only reads `item.records` — **media records are not
> included**. `QuickJump` and other consumers of it will not find photo/audio/video
> records.

### `validateNavigationState()`

Self-check returning `{ valid, issues, autoFix }`. Detects:

- record selected without an item → fix: clear record;
- item selected without an inventory → fix: clear item;
- record whose `itemId` does not match the current item → fix: clear record.

`autoFix()` runs every issue's `fix`. Used by the DevAdmin State tab.

### `updateProjectData(data, projectId)`

Pushes the React Query result into the context. Called from `Project.js` in an
effect whenever the project query resolves. This duplication is why some
components read `projectData` from context and others from `useProject` — both
are the same object, but the context copy lags by one render.

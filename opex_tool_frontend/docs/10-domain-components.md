# 10. Domain Components

Components organised by hierarchy level: Project → Inventory → Item → Record →
File, plus Institution/Fond and Navigation.

**Screen state is a function of `NavigationContext`**, not the URL:
`currentRecord` → record view, else `currentItem` → item view, else
`currentInventory` → inventory view, else project view.

---

## 10.1 Component tree

```
index.js
└─ Workspace                        Workspace/Workspace.js
   └─ Project                       Project/Project.js          ← the app shell
      ├─ ProjectPopup / RenameProjectPopup / WarningPopup / UploadPopup
      ├─ Settings, DevAdminPanel, RoadmapWizard, HelpPicker
      └─ NavigationProvider         (a SECOND, nested one — see 10.2)
         ├─ ProjectNavigation       Navigation/components/
         │  ├─ Breadcrumbs
         │  └─ QuickJump
         ├─ ActiveProject           Project/ActiveProject.js
         │  └─ Inventories          Inventory/Inventories.js
         │     ├─ inventory list rail (+ ValidationIndicator per row)
         │     └─ InventoryItem     Inventory/InventoryItem.js
         │        └─ Items          Item/Items.js
         │           ├─ Item        Item/Item.js
         │           │  ├─ 7 × Item/sections/*SectionPopup
         │           │  ├─ RecordsList   Record/RecordsList.js
         │           │  └─ Record        Record/Record.js
         │           │     ├─ 4 × Record/sections/*SectionPopup
         │           │     ├─ RecordMetadata
         │           │     └─ RecordFiles
         │           ├─ BulkEditItemsPopup / MultiCreateItemsPopup / ImportItemsPopup
         │           └─ CreateItemNavigable / EditItemNavigable
         ├─ VerificationModal       Verification/
         └─ SmartGuideCard          Guidance/
```

---

## 10.2 `Project/Project.js` — the app shell

852 lines. Owns the project list, the selected project, and **every top-level
modal**.

### State it owns

Project selection (`selectedProjectId`), popup flags (create, rename, delete,
upload, verification, signers, settings, DevAdmin, roadmap wizard, help picker),
legacy toast state, and two "has interacted" flags.

### Auto-open behaviour

| Condition | Effect |
|---|---|
| No projects exist, not loading, user has not dismissed | Opens `ProjectPopup` |
| Selected project has a missing report, not loading, user has not dismissed | Opens `UploadPopup` |
| Project has a report but no roadmap | Opens `RoadmapWizard` after a **1 s** delay, once per project — **skipped entirely in dev mode**, so it cannot interfere with DevAdmin/puppet runs |
| Projects exist and none selected | Selects `projectsListData[0]` |

`hasInteractedWithCreatePopup` / `hasInteractedWithUploadPopup` make the
auto-open fire once and respect a manual close. They reset when the underlying
condition changes.

### Keyboard shortcuts (dev mode only)

The `keydown` listener is attached **only when `isDevMode()`**.

| Shortcut | Action |
|---|---|
| **Ctrl+Shift+D** | Toggle DevAdmin panel |
| **Ctrl+Shift+F** | Run `fullProjectRecipe` headlessly at 400 ms/step, logging every step to the console with colour-coded status. Guarded by `headlessPuppetRunningRef` against re-entry. Both the recipe and the engine are **dynamically imported**, so they stay out of the main bundle. |
| **Ctrl+Shift+X** | Delete **all** projects, after a `window.confirm` listing them |

The panel also opens via a `window` `openDevAdminPanel` event.

### Window-event API

`Project.js` listens for four custom events so that deeply nested components
(and the Smart Guide) can open top-level modals without prop drilling:

| Event | Opens |
|---|---|
| `openValidationModal` | `VerificationModal` |
| `openSignersModal` | `InstitutionSignersPopup` |
| `openRoadmapWizard` | `RoadmapWizard` (reads `e.detail.editingRouteId`) |
| `openUploadReportModal` | `UploadPopup` |

Other events used elsewhere in the app: `openInventoryCreate`
(→ `Inventories.js`), `guidanceOpenCreateItem` / `guidanceOpenCreateRecord`
(→ `Items.js`), `showSmartGuide`, `showToast` (→ `Toast/Toast.js`).

> This is the app's informal event bus. It is untyped and undiscoverable by
> search-for-usages — grep for `dispatchEvent` before adding another one.

### Two architectural quirks

1. **`NavigationProvider` is mounted twice.** `index.js` wraps everything in one,
   and `Project.js` mounts a **second** one inside `.project_details`. The inner
   one is what all the domain components actually consume, so navigation state
   is **reset whenever the selected project changes** — which is the intended
   behaviour, achieved by remounting. The outer provider is effectively unused.
2. **The Smart Guide button is hard-disabled** with `{false && (…)}` and a
   comment: *"The Guidance system is incomplete; UI hidden until reimplemented."*
   The `SmartGuideCard` itself still renders when `settings.guidance.enabled`.

### Missing-report gate

`isMissingReport` is derived from the *error message text*:

```js
const isMissingReport = projectError?.message?.includes("Nav importēta VVAIS atskaite");
```

When true, `.project_details` is not rendered at all — no navigation, no
inventories, nothing but the upload prompt. `useProject` also disables retry for
this specific message.

> This is string matching on a localised backend message. If the backend wording
> changes, the gate silently breaks.

---

## 10.3 Project-level popups

| Component | Props | Purpose |
|---|---|---|
| `ProjectPopup.js` | `{ onChange }` | Create a project. Validates with `projectConstants.validateProjectName` — Latin letters, digits, `_`, `-`, max 20. |
| `RenameProjectPopup.js` | `{ value, onChange, onRename, project }` | Same name rules. |
| `WarningPopup.js` | `{ isOpen, onClose, onConfirm, project, projectdata }` | Delete confirmation; shows what will be lost. |
| `UploadPopup.js` | `{ onClose, onDone, projectId }` | VVAIS report upload. `.xlsx` only, non-empty, **no size limit**. |
| `ActiveProject.js` | `{ projectId }` | Thin container: re-reads the project, pushes it into `NavigationContext` via `updateProjectData`, renders `Inventories`. |

`ActiveProject` is the **single place** where React Query data enters
`NavigationContext`. Its effect depends on `[activeProjectData, projectId,
updateProjectData]`, so context lags the query by one render.

---

## 10.4 Inventory

### `Inventories.js` — `{ projectId, fondId, inventories }`

Two-pane layout: a left rail of inventory numbers, a right detail pane.

- **Favourites** persist to `localStorage['inventory-favorites-<projectId>']`.
  Sorting is favourites first, then numeric by `number`.
- **Default selection** (`findDefaultInventory`): first favourite → first with
  items → first overall. Guarded by `hasInitializedSelection` so it runs once,
  and re-runs when the inventory count changes and the selection went stale.
- **Arrow Up/Down** navigate between sibling inventories. Suppressed while an
  input/textarea/select or contenteditable has focus, while the create popup is
  open, and while an item or record is open.
- The left rail hides entirely when an item or record is open
  (`shouldHideInventoryList`).
- Each row shows a `ValidationIndicator` from
  `InheritanceUtils.validateInventory(inventory)` — but **only** when the
  inventory has items or was user-created, so a freshly imported empty inventory
  is not flagged.
- Row label: `US <number><postfix>`.
- Listens for the `openInventoryCreate` event, which pre-fills number, type and
  `electronic`.

### Other inventory components

| Component | Props | Notes |
|---|---|---|
| `InventoryItem.js` | `{ inventory, projectId, onDelete, isFavorite, onToggleFavorite }` | Detail header + statistics; renders `Items`. |
| `InventoryCreate.js` | `{ onClose, projectId, fondId, initialData }` | `react-select` for type/storage term, `YearPicker` for the period. Form selector `.inventory-create-form`. |
| `InventoryEdit.js` (`EditInventory`) | `{ onClose, projectId, inventory }` | Only storage term and dates are editable — number and type are immutable. |
| `InventoryDelete.js` | `{ onConfirm, onCancel, inventoryNumber, itemCount, inventory }` | Blocked for `from_report` inventories (`canDeleteInventory`). |
| `InventoryPeriodPopup.js` | — | Shown when an item is created in an inventory that has no period set. |

---

## 10.5 Item

### `Items.js` — `{ items, projectId, inventoryId, inventory, onRequestEditInventory }`

The item list. 1178 lines.

| Concern | Implementation |
|---|---|
| Pagination | `settings.itemsPerPage` (default 25). Current page persists to `sessionStorage['items_page_<inventoryId>']`, read lazily in the `useState` initialiser to avoid a first-render race. Clamped when the item count shrinks. |
| Virtualisation | `react-window` `FixedSizeList` + `react-virtualized-auto-sizer` for large lists. |
| Selection | `selectedItems` holds ids, but **`selectedItemObjects` is always re-derived from the current `items`** — ids can go stale after a delete, and a bulk edit must never act on a stale id. Selection is cleared on `inventoryId` change. |
| Columns | Nine toggleable columns: `gvNumurs, seriesCode, title, dates, recordCount, secrecy, language, notes, validation`. |
| Create menu | Single / multi-create / import, closed on outside `mousedown`. |
| Bulk | `SelectionToolbar` → `BulkEditItemsPopup`, `ItemDeletePopup`. |
| Events | `guidanceOpenCreateItem`, `guidanceOpenCreateRecord` (the latter picks the media vs document form from `inheritanceInfo.isAnyMedia`). |

`useCreateItem(false)` is used deliberately — see
[04-hooks.md](04-hooks.md#usecreateitemshouldinvalidate--true): invalidation is
deferred so a run of creates does not refetch the whole tree N times.

### `Item.js` — `{ item, inventory, projectId, onBack, onDelete, onEdit }`

The item detail screen. 1520 lines. Its layout is chosen by the category:

| Category | Layout |
|---|---|
| `SEGMENTED` (Dokumenti, Elektroniskie dokumenti) | Two tabs: **Pārskats** (`viewMode === 'overview'`) and **Dokumenti** (`'records'`, rendering `RecordsList`). |
| `COMBINED` (Medijs, Elektroniskais medijs) | Item and its single record merged into one screen; no records list. |

Other behaviour:

- **Sections grid** on the overview tab. Clicking a section header opens the
  matching popup; `editingSection` is one of
  `'basic' | 'dates' | 'technical' | 'content' | 'notes' | 'access' | 'related' | null`.
- **Jump-to-number** input (`jumpToNumber`) with `ItemNotFoundPopup` when no
  match exists.
- **Scroll restoration** via `scrollPositionRef` after file operations.
- `reopenEditRef` reopens the full edit form after a nested action closes.
- `userHasManuallySetView` stops the automatic view choice from overriding a
  deliberate tab click.
- Navigating to a record passes the current tab:
  `navigateTo('record', record.id, inventory.id, item.id, { tab: viewMode })`,
  which is what lets `navigateBackSmart` return to the right tab.

### The `*Navigable` form pattern

`CreateItemNavigable.js` (983 lines) is **the canonical multi-section form**.
Copy it when adding a new one.

```jsx
const CreateItemNavigable = ({ onClose, onCreate, relativeInventory }) => { … }
```

Anatomy:

1. **One ref per section** in a `sectionRefs` object; `activeSection` state; a
   `navItems` array of `{ id, label, icon }` driving the sticky left nav.
   `scrollToSection(id)` does `scrollIntoView({ behavior:'smooth', block:'start' })`.
2. **One flat `formData` object** built by `getInitialFormData()`, seeded from
   `relativeInventory` and the active preset:
   - `number: relativeInventory.last_gv + 1`
   - `notes`, `language`, `restriction`, `security_level` from `getActivePreset()`
   - `unit_of_measure` defaults to `Lapas`
3. **`useFormErrors()`** for `generalError`, `getFieldError`, `setApiErrors`.
4. **Rendered through `ReactDOM.createPortal`** — the root is
   `<form class="create-item-nav-container">`.
5. **Modal hygiene:** body scroll locked (original value restored), Escape
   closes, outside-click closes the language and related-item dropdowns.
6. **Validation on submit only**, via `validateItemCreate(data, inventory)` —
   not per field, not per section.
7. **`handleSubmit(e, shouldContinue)`** — `shouldContinue: true` is the
   "save and add another" path: it keeps the popup open, increments
   `itemsCreated`, and resets the form.
8. Dates go through `CalendarComponent`, with an extra inline check against
   `relativeInventory.end_date`.

`EditItemNavigable.js` (992 lines) mirrors it, seeded from the existing item and
saving through `getItemUpdatePayload`.

CSS convention: `create-item-nav-*` / `edit-item-navigable-nav-*`. Reuse the
existing class names rather than inventing new ones.

### Item section popups

Seven, all `{ item, inventory, onUpdate, onClose, onOpenFullEdit }`, all built on
`SectionEditPopup`:

| File | Section | Fields |
|---|---|---|
| `ItemBasicSectionPopup` | Pamata informācija | `series_code`, `title`, `language` |
| `ItemDatesSectionPopup` | Datējums | `start_date`, `end_date`, `date_indicator`, `date_note` |
| `ItemTechnicalSectionPopup` | Tehniskā informācija | `size`, `unit_of_measure`, `copy`, `archival_history`, `sistematisation` |
| `ItemContentSectionPopup` | Saturs | `annotation` |
| `ItemNotesSectionPopup` | Piezīmes | `notes` |
| `ItemAccessSectionPopup` | Pieejamība un slepenība | `restriction`, `restriction_note`, `security_level`, `security_level_note` |
| `ItemRelatedSectionPopup` | Saistītās GV | `related_item_list` |

Each builds a **full** payload with `getItemUpdatePayload(item, inventory, overrides)`,
validates the whole object, then routes errors with
`splitItemValidationErrors(errors, ownFields)`. A cross-section error surfaces as
one banner plus the `onOpenFullEdit` escape hatch. See
[07-constants-validation.md](07-constants-validation.md#getitemupdatepayloaditem-inventory-overrides--).

### Bulk / import wrappers

| Component | Props | Wraps |
|---|---|---|
| `BulkEditItemsPopup.jsx` | `{ items, inventory, projectId, onClose }` | `BulkEditPopup` + `getItemBulkFields` |
| `MultiCreateItemsPopup.jsx` | `{ inventory, projectId, inventoryId, onClose }` | `MultiCreatePopup` + `getItemSharedCreateFields` |
| `ImportItemsPopup.jsx` | `{ inventory, items, projectId, inventoryId, onClose }` | `ImportPopup` |

`MultiCreateItemsPopup.test.js` is one of only three Jest test files in the tree.

---

## 10.6 Record

### `Record.js` — `{ recordId, projectId, itemId, inventory, onBack }`

Record detail. Derives `currentItem` and `allRecords` from `projectData` by
walking the tree — media records are gathered from all three media arrays and
sorted by `id`, textual ones from `records`.

Preserves scroll position across file operations via `isFileOperationRef` +
`scrollPositionRef` (100 ms after the project data settles).

### `RecordsList.js`

| Prop | Purpose |
|---|---|
| `records` | Optional. **When absent it derives the list from `item`** based on the inventory type — a compatibility path used by the Item Documents tab. |
| `item`, `inventory`, `projectId` | |
| `onRecordClick`, `onCreateRecord`, `onEditRecord`, `onDeleteRecord` | |
| `showCreateButton` | default `true` |
| `viewMode` | initial `'table'` |
| `externalViewMode`, `externalSearch`, `externalColumnVisibility` | Let `Item.js` hoist the controls into its own toolbar. |
| `onViewModeChange`, `onSearchChange`, `onColumnVisibilityChange` | Callbacks for the hoisted controls. |

Supports search, sort, column toggles, pagination and batch delete
(`useBatchDeleteRecords`).

### Create / edit forms

| Component | Props | Notes |
|---|---|---|
| `CreateDocumentRecord.js` (1140 lines) | `{ onClose, onCreate, item, inventory, projectId }` | The largest form. Same `*Navigable` pattern; container `.create-record-nav-container`. |
| `EditDocumentRecord.js` (1183 lines) | | Saves via `getRecordUpdatePayload`. |
| `CreateMediaRecord.js` (667 lines) | `{ onClose, onCreate, item, inventory, projectId }` | **File first**: the record does not exist until a file is uploaded. Falls back to manual metadata entry with `skipFileValidation` when extraction fails. |
| `EditMediaRecordMetadata.js` | `{ onClose, onUpdate, record, inventory, projectId }` | |
| `MediaRecordForm.js` | `{ onSubmit, isSubmitting, inventory, existingRecord }` | Shared subtype-aware field set for the two media forms. |

CSS classes are shared between Create and Edit (`create-record-nav-input` is used
by both) — that is intentional, not a copy-paste leftover.

### `RecordMetadata.js` — `{ recordId, projectId, recordData, activeSection, onSectionChange }`

Four tabs, declared as a `sections` config array and rendered generically by one
`renderField` helper switching on `field.type` (`text | textarea | date`).

| `key` | Label | Icon | Fields (★ = required) |
|---|---|---|---|
| `actions` | Darbības | `fa-tasks` | author★, responsible_person★, task★, due_date★, created_date★, notes |
| `addressees` | Adresāti | `fa-user` | addressee★ |
| `visas` | Vīzas | `fa-stamp` | person★, date★, notes |
| `read_status` | Lasīšanas statuss | `fa-eye` | person★, date★, notes |

Validation is local (`field.required && !formData[field.name]?.trim()`), not from
`Constants/recordConstants.js`. `activeSection` doubles as the `metadataType`
passed to `useCreateMetadata` / `useUpdateMetadata`, which maps it to the
singular API `class`.

> `read_status` is read from `recordData.read_status` (singular) while the other
> three are plural. That asymmetry is the backend's, and
> `mapMetadataTypeToClass` accounts for it.

### `RecordFiles.js`

| Prop | Default | Purpose |
|---|---|---|
| `recordId`, `projectId` | — | |
| `files` | `[]` | |
| `canUpload` | `true` | |
| `viewMode` | `'table'` | |
| `onFileOperationStart` / `onFileOperationComplete` | `null` | Let `Record.js` save and restore scroll. |
| `category` | `'ELECTRONIC_DOCUMENTS'` | Drives accept rules. |
| `inventoryType` | `'Tekstuāls'` | |

Drag-and-drop upload, multi-select (`selectedFileIds` as a `Set`), single and
batch delete, a details side panel. Uses `useUploadFiles` / `useDeleteFile`.

It defines its own local `formatFileSize` — the **third** copy in the codebase
(`InheritanceUtils` and `RecordValidation` have the others).

### Record section popups & bulk wrappers

Four section popups — `RecordBasicSectionPopup`, `RecordDocumentSectionPopup`,
`RecordDescriptionSectionPopup`, `RecordAccessSectionPopup` — all
`{ record, item, projectId, onUpdate, onClose, onOpenFullEdit }`, using
`getRecordUpdatePayload` + `splitRecordValidationErrors`.

Bulk wrappers: `BulkEditRecordsPopup.jsx`, `MultiCreateRecordsPopup.jsx`,
`ImportRecordsPopup.jsx`.

Delete popups: `RecordDeletePopup.js`, `FileDeletePopup.js`.

---

## 10.7 Navigation

| Component | Props | Purpose |
|---|---|---|
| `ProjectNavigation.js` | `{ projectData, selectedProject }` | Sticky top bar; uses `useScrollDirection` to hide on scroll-down. Hosts `Breadcrumbs` and `QuickJump`. |
| `Breadcrumbs.js` | `{ projectData }` | Renders `getCurrentBreadcrumbPath()`; each crumb calls `navigateTo`. Visibility honours `settings.showBreadcrumbs`. |
| `QuickJump.js` | `{ projectData }` | Search-and-jump across the active project, backed by `getAllItemsFromProject()` and `getAllRecordsFromProject()`. |

> Because `getAllRecordsFromProject()` only reads `item.records`, **QuickJump
> cannot find media records**. See [05-state-management.md](05-state-management.md#lookup-helpers).

---

## 10.8 Institution & Fond

| Component | Props | Purpose |
|---|---|---|
| `Institution.js` | `{ institution, projectId }` | Read-only institution details. |
| `InstitutionSignersPopup.jsx` | `{ institutionId, projectId, onClose }` | Edits the four signer fields. Validates with `validateInstitutionUpdate`, saves via `useAddInstitutionSigners`. Root class `.inst-signers-modal`. |
| `Fond.js` | `{ fond }` | Read-only fond details. |

Filling all four signer fields is a hard prerequisite for OPEX generation
(`MISSING_SIGNERS`). `Project.js` surfaces this as a `missing-data` class and a
warning badge on the Parakstītāji button, derived from `useWorkflowState`.

---

## 10.9 Toast (legacy)

`Toast/Toast.js` — `{ header, paragraph }`. Thirteen lines: a `<div class="toast">`
with an `<h4>` and a `<p>`. All the behaviour lives in `Project.js`, which owns
`toastVisible` / `toastHeader` / `toastParagraph` and a `TOAST_CONFIG.TIMER`
timeout in `handleToast(h, p)`.

It predates `NotificationProvider` and coexists with it. `VerificationModal`
receives `handleToast` as its `onToast` prop, so export results still go through
this path. **New code should use `useNotification().notify`.**

> `Utils/HelpWindow.js` dispatches a `showToast` window event when the help popup
> is blocked, but **nothing listens for it** — that warning never reaches the user.

---

## 10.10 Patterns every component here follows

**Modal hygiene** — every popup does all four:

```jsx
// 1. lock the page, restoring the ORIGINAL value, not ''
useEffect(() => {
  const original = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = original; };
}, []);

// 2. Escape closes — but never mid-batch
useEffect(() => {
  const onKey = (e) => { if (e.key === 'Escape' && !isBusy) onClose(); };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, [onClose, isBusy]);

// 3. render through a portal to escape ancestor overflow / z-index
return ReactDOM.createPortal(…, document.body);

// 4. close dropdowns on outside mousedown
```

**Callback naming** — `onClose` (dismiss), `onCreate` / `onUpdate` (persist,
returns `[ok, result]` in the older forms), `onDelete`, `onBack`,
`onOpenFullEdit` (escape hatch from a section popup).

**Full-object payloads** — the backend has no partial updates. Always build with
`getItemUpdatePayload` / `getRecordUpdatePayload`; a field missing from a PUT is
a field being erased.

**Selection is re-derived, never trusted** — keep ids in state, but resolve them
against the current list before acting.

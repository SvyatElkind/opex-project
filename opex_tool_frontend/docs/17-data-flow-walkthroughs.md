# 17. Data-Flow Walkthroughs

Seven complete traces through the app, from the user's click to the byte on the
wire and back. Read one of these when you need to know *where* to make a change,
not *what* a function does.

Each trace names the file and the function at every hop.

---

## 17.1 Boot → project list on screen

```
index.js
  ├─ read ?help=true         → help path (no providers), or:
  ├─ new QueryClient({ staleTime 5min, gcTime 10min, retry 3 })
  └─ render provider stack → <Workspace />

Workspace.js
  ├─ useTheme()          → writes data-theme="dark" on <html> (or nothing)
  ├─ useAppSettings()    → writes font-size-* / compact-view classes on <html>
  └─ useProjects()       → GET /api/v1/project/
       ├─ isLoading  → <p class="loading">
       ├─ error      → <GeneralError> + retry button
       └─ success    → <Project />

Project.js
  ├─ useProjects()          (same cache entry, no second request)
  ├─ auto-select projectsListData[0] if none selected
  └─ useProject(selectedProjectId) → GET /api/v1/project/<id>/
```

Three branches follow from that second request:

| Outcome | Result |
|---|---|
| Error message contains `"Nav importēta VVAIS atskaite"` | `isMissingReport = true` → the missing-report panel, `UploadPopup` auto-opens, **`.project_details` is never rendered** |
| Other error | `GeneralError` |
| Success | `.project_details` renders: a **second** `NavigationProvider`, `ProjectNavigation`, `ActiveProject`, `VerificationModal`, `SmartGuideCard` |

```
ActiveProject.js
  ├─ useProject(projectId)          (cache hit)
  ├─ useEffect → updateProjectData(data, projectId)   ← the ONLY writer of
  │                                                     NavigationContext.projectData
  └─ <Inventories projectId fondId inventories={…fond.inventories} />

Inventories.js
  ├─ load favourites from localStorage['inventory-favorites-<pid>']
  ├─ sort: favourites first, then numeric by `number`
  ├─ findDefaultInventory(): first favourite → first with items → first
  ├─ navigateTo('inventory', defaultId)      (once, guarded by a ref)
  └─ <InventoryItem inventory={selected} …>
       └─ <Items items={inventory.items} … />
```

**Two requests total on a cold boot.** Everything below the project — every
inventory, item, record, file and metadata row — arrives inside that single
`GET /project/<id>/` payload.

---

## 17.2 Navigating down the hierarchy

There is no router. Every level is a conditional render keyed off three
`NavigationContext` fields.

```
Inventories.js       hides its left rail when (currentItem || currentRecord)
   └─ InventoryItem  hides its header  when currentItem      (isViewingItem)
        └─ Items.js  currentRecord ? <Record …>
                   : viewMode === 'list' ? <table of items>
                   : <Item item={selectedItemForDetail} …>
```

`Items.js` keeps a **local mirror** of the context selection:

```js
const selectedItem = items?.find(i => i.id === currentItem);

useEffect(() => {
  if (selectedItem) { setSelectedItemForDetail(selectedItem); setViewMode('detail'); }
  else              { setViewMode('list'); setSelectedItemForDetail(null); }
}, [currentItem, selectedItem, viewMode]);
```

So a row click is:

```
row onClick → navigateTo('item', item.id, inventoryId)
            → NavigationContext sets currentItem, clears currentRecord,
              pushes the previous triple onto navigationHistory
            → Items re-renders, the effect flips viewMode to 'detail'
            → <Item> mounts
```

And a record click from inside `Item.js`:

```js
navigateTo('record', record.id, inventory.id, item.id, { tab: viewMode })
```

The `{ tab }` option is why coming back lands on the same tab — see
[05](05-state-management.md#navigatetotype-id-parentid-itemid-options).

**Going back** uses `navigateBackSmart()`, which prefers structural ascent
(record → item → inventory) over replaying `navigationHistory`.

> `selectedItem` is re-derived from `items` on every render rather than stored.
> That is deliberate: after a delete or an inventory switch the id in context can
> point at something that is no longer in the list, and a stale object would be
> rendered as if it still existed.

---

## 17.3 Creating an item

```
Items.js  "Jauna GV" → setNewItemVisibility(true)
   └─ <CreateItemNavigable onCreate={handleCreateItem} relativeInventory={…} />
```

**In the form** ([16 §16.2](16-forms-deep-dive.md#162-createitemnavigablejs)):

```
getInitialFormData()
  ├─ number         = relativeInventory.last_gv + 1        (a hint; server overwrites)
  ├─ language       = [activePreset.itemLanguage]           (array in state)
  ├─ restriction    = activePreset.restriction   ?? 'Vispārēja'
  ├─ security_level = activePreset.securityLevel ?? 'Publisks'
  └─ inventory      = relativeInventory.number

submit → validateItemCreate(data, inventory)
   ├─ invalid → setFieldErrors + scrollToFirstError + return
   └─ valid   → onCreate(submitData, shouldClosePopup) → [ok, result]
```

**In `Items.handleCreateItem`:**

```
performance.startMeasure('CreateItem')
  useCreateItem(false).mutateAsync({ itemData, projectId, inventoryId })
    │
    ├─ onMutate   cancel in-flight ['project','detail',pid] queries
    │             snapshot the project
    │             insert a placeholder item id 'temp_<ms>_<rand>', isOptimistic:true
    │             items_per_period += 1;  last_gv = max(last_gv, itemData.number)
    │
    ├─ POST /api/v1/project/<pid>/item/?inventory_id=<invid>
    │       └─ server assigns the real number from inventory.last_gv + 1
    │
    ├─ onError    restore the snapshot
    └─ onSuccess  replace the placeholder (matched on isOptimistic && number)
                  with the server payload;  shouldInvalidate === false → no refetch

invalidateProject(projectId)      ← Items does it explicitly instead
performance.endMeasure('CreateItem')
```

> `useCreateItem(false)` disables the hook's own invalidation and `Items.js`
> invalidates once afterwards. With `true`, creating ten items in a row would
> refetch the entire project tree ten times.
>
> The optimistic placeholder is matched by **`number`**, which the server is free
> to overwrite. If the server picks a different number the placeholder is not
> replaced — the follow-up invalidation is what actually repairs the cache.

The refetched tree flows back down: `ActiveProject` → `updateProjectData` →
`Inventories` → `Items`, and the new row appears.

---

## 17.4 Creating a record — the two shapes

`Item.js` picks the form from the category:

```js
inheritanceInfo.isAnyMedia ? <CreateMediaRecord …> : <CreateDocumentRecord …>
```

### Textual (`DOCUMENTS` / `ELECTRONIC_DOCUMENTS`)

```
CreateDocumentRecord            4 sections, IntersectionObserver scroll-spy
  ├─ checkDateInRange(date)     compares against item.start_date/end_date
  │    └─ out of range → isDateOutOfRange = true → submit is BLOCKED
  ├─ checkAccessRestrictionMismatch(value)   → advisory warning only
  ├─ selecting access_restriction 'open'
  │    → clears access_restriction_date / _notes / user_restriction_notes
  └─ submit
       ├─ validateTextRecordCreate(7 fields, item)
       └─ useCreateRecord().mutateAsync({ recordData, projectId, itemId })
            POST /project/<pid>/record/?item_id=<itid>
            onSettled → invalidate project + record + records list + metadata
```

Files are added **afterwards**, through `RecordFiles` (§17.5). The record exists
first.

### Media (`MEDIA` / `ELECTRONIC_MEDIA`)

The order inverts — **the file creates the record**:

```
CreateMediaRecord   currentStep = 'file-upload'
  └─ user picks one file
       └─ useCreateMediaRecord().mutateAsync({ file, projectId, itemId })
            FormData { files: <File> }
            POST /project/<pid>/media_record/?item_id=<itid>
            retry: false                       ← uploads are never retried
              │
              └─ backend creates record + file, attempts metadata extraction
                   │
       ┌───────────┴────────────┐
checkAutoExtractionComplete(mediaRecord, inventory.type)
       │                        │
  complete → done          incomplete/failed → currentStep = 'metadata'
                                 └─ <MediaRecordForm> collects the missing fields
                                      └─ PUT /media_record/<rid>/?type=<Foto|Video|Audio>
```

Expected auto-fields: `Foto` → resolutions + colour; `Video` → those + duration;
`Skaņas` → duration.

When the file type itself is unrecognised the form re-submits with
`skipFileValidation: true` and a manual `metadata` object appended to the
`FormData`.

> Note the `?type=` value: `Skaņas` becomes **`Audio`** on the wire
> (`getAPITypeFromInventory`). Three of the four media vocabularies differ — see
> [15 §15.3](15-glossary.md#media-types).

---

## 17.5 Uploading files to a record

```
RecordFiles  drop or pick files
  └─ (optionally) Utils/FileValidation.validateFile(file, settings.validation)
       ├─ size vs maxFileSize / minFileSize
       ├─ images  → getImageDimensions → validateImageDimensions
       ├─ a/v     → getMediaDuration   → validateDuration
       └─ warnings only — never blocks
  └─ useUploadFiles().mutateAsync({ projectId, recordId, files })
       FormData: files appended under the REPEATED key 'files'
       POST /project/<pid>/record/<rid>/multiple_files/
       postFormData → UPLOAD_TIMEOUT (5 min), Content-Type removed
                      so the browser sets the multipart boundary
       onSettled → invalidate project + record + files keys
```

`Record.js` wraps this in scroll preservation:

```
onFileOperationStart    → isFileOperationRef = true; save .record-content scrollTop
   … invalidation → project refetch → whole subtree re-renders …
useEffect on projectData → if the flag is set, restore scrollTop after 100 ms
```

**There is no file-size limit anywhere in the frontend.** A comment in
`RecordValidation.validateFileUploads` marks where one used to be. Archival
sources are large; the cap was removed on purpose.

Deleting is `useDeleteFile({ projectId, fileId, recordId })` →
`DELETE /project/<pid>/file/<fid>/`.

---

## 17.6 Editing one section of an item

The shortest write path, and the one to copy.

```
Item.js  click a section header → setEditingSection('access')
  └─ <ItemAccessSectionPopup item inventory onUpdate onClose onOpenFullEdit />
       └─ <SectionEditPopup>   portal + overlay + header + footer

submit
  ├─ payload = getItemUpdatePayload(item, inventory, {
  │              restriction, restriction_note, security_level, security_level_note })
  │            ← FULL object: every field, plus related_item_list read from
  │              item.related_item ?? item.related_items ?? []
  │
  ├─ validation = validateItemUpdate(payload, inventory)      ← whole object
  │
  ├─ { ownErrors, crossSectionMessage } = splitItemValidationErrors(errors, ownFields)
  │     ├─ ownErrors           → attached to inputs in this popup
  │     └─ crossSectionMessage → one banner:
  │        "Nevar saglabāt: laukā "X" (sadaļa "Y") ir kļūda — …"
  │        plus the onOpenFullEdit escape hatch
  │
  └─ useUpdateItem().mutateAsync({ itemData: payload, projectId, itemId })
       PUT /project/<pid>/item/<itid>/
       optimistic merge → server data → invalidate
```

Two rules make this work, and breaking either causes silent data loss:

1. **Validate the whole object, not the visible fields.** The backend does, so a
   popup that only validates its own four fields will hit a 400 it cannot
   explain.
2. **Send the whole object.** `update_related_items()` clears every relation when
   `related_item_list` is absent from the payload.

The record section popups are identical with `getRecordUpdatePayload` and
`splitRecordValidationErrors`.

---

## 17.7 Verification → OPEX package

```
Project.js  "Status" button → setVerificationModalOpen(true)
   (or any component dispatching window 'openValidationModal')

VerificationModal
  ├─ validateProjectForOPEX(projectData)
  │    └─ per inventory: validateInventory
  │         └─ per item: validateItem
  │              └─ per record: validateRecord
  │                   └─ per file: validateFile
  │    → { valid, status, errors, warnings, inventoryValidations, summary }
  │
  ├─ stats      re-walks the tree for counts and byte totals
  ├─ guideData  per-inventory breakdown
  └─ VerificationTreeView  re-runs the validators per node so each level
                           carries its own status icon
```

Errors block; warnings never do. Dismissed warnings are keyed
`` `${issue.label}::${issue.message}` `` in
`localStorage['opex_dismissed_warnings'][projectId]`.

**Then the export:**

```
"Ģenerēt OPEX pakotni" → <OpexPopup>
    ├─ "Ilgstoši glabājamās lietas"  → includeLongTerm = false
    └─ "Pastāvīgi glabājamās lietas" → includeLongTerm = true
         └─ handleGenerateOpex: record the flag, open <OpexProgressModal>

OpexProgressModal → useOpexProgress.startExport(projectData, includeLongTerm)
  1. buildFileLookupMap  walk the tree, skipping non-electronic inventories and
                         (when includeLongTerm is false) long-term ones
                         → { fileId: {fileName, recordTitle, itemNumber, …} }
  2. phase = 'connecting';  open ws://<host>:8000/ws/opex_progress/
  3. IN ws.onopen  → GET /api/v1/project/<pid>/export/opex_package/?long=<bool>
                     (raw fetch, not apiClient — the socket must be listening first)
  4. onmessage → handleWsMessage
```

| `msg_level` / `status` | Effect |
|---|---|
| `file` | look up the id, set `currentFile`, `processedFiles++`, push to `recentFiles`, bump that inventory's counter, record a timestamp for the ETA |
| `file` + `copy_error` | also push to `failedFiles` |
| `opex_zipping_progress` | `zippingPercent = round(status)` |
| `project` / `opex_export_started` | `phase='exporting'`, stamp `startTime` |
| `project` / `opex_export_finished` | `phase='exported'` |
| `project` / `opex_zipping_started` | `phase='zipping'` |
| `project` / `opex_zipping_finished` | `phase='done'`, capture `file_name` |
| `project` / `opex_zipping_failed` | `phase='error'` |

`totalFiles` is computed **client-side** from the lookup map; the backend never
sends a total. If the two disagree the bar is wrong even though the export is
fine.

ETA is a rolling mean of the last ≤15 file-event intervals, `null` until three
samples exist.

The other two exports are simpler — the backend writes the file to disk and
returns `{ success: [message, path] }`, which the modal shows in a toast. Nothing
is downloaded through the browser.

---

## 17.8 Importing a spreadsheet

Gated behind `settings.experimental.spreadsheetImport`; with the flag off there
is no button at all.

```
ImportItemsPopup / ImportRecordsPopup → <ImportPopup runImport=… />

1. FILE
   .csv  → csvParser.parseCsvFile
            decodeBytes    BOM → strict UTF-8 → windows-1257 fallback (guessed:true)
            sniffDelimiter counts ; , tab | outside quotes on the first line
            parseCsv       RFC 4180 state machine
   .xlsx → xlsxReader.parseXlsxFile
            ZIP central directory → DecompressionStream('deflate-raw') → DOMParser
            prefers a sheet named DATI / DATA / IMPORTS
            date-styled numerics → ISO via serialToIsoDate
   → string[][]

2. MAP   importMapper.mapImportRows({ rows, inventory, existingItems, item, recordsAllowed })
   ├─ findHeaderRow      first row (of 20) with ≥2 known columns
   ├─ buildHeaderMap     → { columns, unknown, present };  unknown → manual assignment UI
   └─ per row:
        parseRow → TIPS decides item|record, SAITE resolves the parent
        item rows   → buildItemPayload   → validateItemCreate
        record rows → buildRecordPayload → validateTextRecordCreate
                                         + missingRecordFieldMessage
        FAILING ROWS ARE KEPT with a reason, never dropped

3. PREVIEW   every row with status; onlyErrors filter; capped at 200 rows

4. RUN   useBulkRunner, sequential, never throws
     phase 'items'    POST /item/?inventory_id=…      one at a time
     phase 'sync'     bulkApi.getProject(projectId)   ← the item POST response has
                                                        `number` but no `id`, and a
                                                        record needs its parent's id
     phase 'records'  POST /record/?item_id=…
     phase 'finished'
   run(tasks, { append: true, expectedTotal }) → ONE progress bar across all phases

5. useInvalidateAfterBulk(projectId)    ← cache touched exactly once
```

Sequential throughout because `Item.add_item()` derives the GV number from
`inventory.last_gv` server-side; parallel POSTs would race for the same number.

Full column dictionary in [09B](09-verification-export.md#9b-spreadsheet-import-csv--xlsx).

---

## 17.9 An error, end to end

```
fetch rejects / responds 4xx-5xx
  └─ apiClient.apiRequest
       ├─ 502/503/504 or status 0, retry enabled (GET only by default)
       │    → sleep min(500·2^n, 5000) + 0-25% jitter, up to 2 retries
       └─ new ApiError(status, data)
            └─ parseApiError(data) → { general, message, fields }
                 detail / error / non_field_errors / per-field / nested
            ApiError.fieldErrors = parsed.fields
            ApiError.status = 0 for network AND timeout AND abort
                              (tell them apart by .message)

form catch
  └─ setApiErrors(error.data)     → useFormErrors
       ├─ generalError            → <GeneralAlert>
       └─ fieldErrors             → getFieldError(name) → <FieldError>

bulk runner catch
  └─ extractMessage(error)  prefers the FIRST fieldErrors entry over .message
     ("Šis lauks nedrīkst būt tukšs" beats "API Error")
     recorded as { label, ok:false, message } — the run continues
```

Three deliberate exceptions to normal error handling:

| Where | Behaviour | Why |
|---|---|---|
| `useProjects` | swallows everything, returns `[]` | uvicorn's h11 layer crashes on Django's 204 for an empty list, surfacing as a network error |
| `useProject` | no retry when the message contains `"Nav importēta VVAIS atskaite"` | that is an expected state, not a failure |
| `Constants_API.fetchConstants` | returns `FALLBACK_CONSTANTS` instead of throwing | the app must boot offline |

---

## 17.10 Where a change usually has to land

| You want to change… | Touch |
|---|---|
| What a screen looks like at one hierarchy level | `Items.js` / `Item.js` / `Record.js` render branch |
| Which layout a category gets | `CATEGORY_CONSTRAINTS.viewMode` in `InheritanceUtils.js` |
| A field's rules | `Constants/<domain>Constants.js` **and** the payload builder |
| What blocks OPEX | `validateItem` / `validateRecord` / `validateFile` in `InheritanceUtils.js` |
| What the export sends | the backend — the frontend only triggers it |
| When the cache refreshes | the `onSettled` / `onSuccess` of the relevant hook |
| Where a click navigates | `navigateTo(...)` at the call site, not the context |
| A default value on a new entity | `getInitialFormData()` in the create form, or the preset in Settings |

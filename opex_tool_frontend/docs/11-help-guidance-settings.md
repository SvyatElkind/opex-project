# 11. Help, Guidance, Roadmap & Settings

Four opt-in support systems that sit alongside the domain UI.

| System | Directory | Persists to | Purpose |
|---|---|---|---|
| Help | `src/Help/`, `Constants/helpConstants.js` | — | Full documentation in a separate window |
| Guidance | `src/Guidance/` | `localStorage` (3 keys) | "What next?" card |
| Roadmap | `src/Roadmap/` | `opex_project_roadmaps` | Per-project goals and progress |
| Settings | `src/Settings/` | `opex_settings` | Preferences and form presets |

---

## 11.1 The Help system

### Three tiers of help

| Tier | Component | Source | Scope |
|---|---|---|---|
| Field | `components/FieldHelp.jsx` | `Constants/fieldHelp.js` `.short` | One input |
| Form | `Help/HelpButton.js` | `helpConstants` chapter/section | One form or modal |
| Zone | `Help/HelpPicker.jsx` | `Constants/helpZones.js` | A screen region, picked by clicking |

All three land in the same window: `<origin>/?help=true#<chapter>[/<section>]`.

### `Help/Help.js` — the documentation window

575 lines. Rendered standalone with **no providers** (see
[01-architecture.md](01-architecture.md)), from either entry point:

- `index.js` — dynamic `import('./Help/Help')` when `?help=true`;
- `help.js` — a separate bundle mounting into `#help-root`.

Features: chapter sidebar, full-text search, deep linking via the URL hash,
back-to-top, and DOCX export.

### Content model — `Constants/helpConstants.js`

4279 lines. One array:

```js
HELP_CHAPTERS = [
  { id, title, icon, sections: [ { id, title, content: Block[] } ] }
]
```

Ten chapters, ids matching `HELP_CHAPTER_IDS` in
[Utils/HelpWindow.js](../src/Utils/HelpWindow.js): `getting-started`,
`projects`, `inventories`, `items`, `records`, `verification`, `navigation`,
`settings`, `roadmap`, `keyboard-shortcuts`.

**Block types** — each has a `case` in `Help.js`'s renderer:

| `type` | Count | Shape |
|---|---|---|
| `paragraph` | 283 | `{ text }` |
| `heading` | 122 | `{ text, level? }` |
| `list` | 115 | `{ items[] }` |
| `note` | 98 | `{ text, variant }` — tinted callout |
| `ui-example` | 14 | `{ label, elements: [{ html, caption? }], description? }` — **live HTML** using the app's own CSS classes, so examples restyle with the theme |
| `steps` | 11 | numbered procedure |
| `table` | 9 | `{ headers, rows }` |
| `annotated-screen` | 9 | form mockup with callouts pulled from `FIELD_HELP[...].detail` |
| `accordion` | 2 | collapsible |
| `color-palette` | 1 | swatches from CSS custom properties |

> `ui-example` and `annotated-screen` blocks contain raw HTML strings rendered
> into the page. The content is authored in-repo, not user input, but treat these
> as code, not data.

**Helpers**

| Function | Returns |
|---|---|
| `getChapterById(chapterId)` | chapter or `undefined` |
| `getSectionById(chapterId, sectionId)` | section or `null` |
| `getAllSectionIds()` | `[{ chapterId, sectionId, chapterTitle, sectionTitle }]` — the search index |

`HELP_UI` holds the window's own strings.

### `Constants/fieldHelp.js`

Single source of truth for per-field explanations, keyed `entity.field`:

```js
FIELD_HELP.project.name = { short: '…', detail: '…' }
getFieldHelp(entity, field)   // → { short, detail } | null
```

`short` feeds `<FieldHelp>`; `detail` feeds the `annotated-screen` callouts in
the help chapters. Keeping both here is deliberate — the header comment notes
that conditional field-requirement rules **already** live independently in
backend validators and frontend `*Constants.js`, and a third and fourth copy of
the same knowledge is a real risk in this codebase.

**Naming:** entity keys use the frontend **camelCase state-variable name**, not
the backend snake_case name, because that is what call sites have in scope.

`bulkConstants.js` descriptors reference these through `helpEntity` / `helpField`.

### `Constants/helpZones.js` — the picker targets

```js
HELP_ZONES = [{ selector, label, chapterId, sectionId? }]
ALL_ZONES_SELECTOR   // every selector joined with ', '
findHelpZone(element) // → zone | null
```

**Resolution rule:** the element under the cursor is walked up the DOM with
`closest` against every entry, and the **deepest match wins** — a file card sits
inside a record, which sits inside the project page, and the file card should
answer. List order breaks ties only when two entries match the very same
element, so the list is kept most-specific-first.

Zones are **deliberately coarse** — structural regions at the domain-hierarchy
level (uzskaites saraksts / glabājamā vienība / dokuments / datnes), not
individual fields. Per-field help is `<FieldHelp>`'s job and per-form help is
`<HelpButton>`'s; neither is affected by the picker.

> **Adding a zone:** append an entry with a stable container class, a short
> Latvian label and the chapter/section it documents. An area with no entry
> simply is not pickable — a dead click that dumps the user on page 1 of the docs
> is worse than no target at all.

### `Help/HelpPicker.jsx`

Armed by the top-bar help button (`helpPickerActive` in `Project.js`). While
armed it highlights the zone under the cursor with its Latvian label; clicking
opens that chapter/section. Exits on pick, Escape, or a second button press.

Every **other** help button in the app still opens its own chapter directly —
the picker is only wired to the top-bar one.

### `Help/HelpButton.js`

| Prop | Description |
|---|---|
| `iconOnly` | Icon without a caption. |
| `buttonText` | Caption / tooltip. |
| `chapterId`, `sectionId` | Deep-link target. |
| `onActivate`, `isActive` | Used by the top-bar instance to arm the picker instead of opening the docs. |

### `Help/helpDocxExport.js`

Renders the entire `HELP_CHAPTERS` array to a `.docx` using
[`Utils/docxWriter.js`](06-utilities.md#68-docxwriterjs) — headings, lists,
tables, callout boxes (tinted toward white so they stay legible even when the app
runs in dark theme), an internal-link table of contents, and page numbers.

Covered by `helpDocxExport.test.js`. Triggered by the *Lejupielādēt Word* button
(`HELP_UI.EXPORT_DOCX`).

Design notes for the help system live in `Help/README.md`,
`Help/BUILD_NOTES.md` and `Help/INTEGRATION_EXAMPLE.md`.

---

## 11.2 Guidance (Smart Guide / *Vadlīnijas*)

> **Currently half-disabled.** The top-bar Smart Guide button in `Project.js` is
> wrapped in `{false && (…)}` with the comment *"The Guidance system is
> incomplete; UI hidden until reimplemented."* The `SmartGuideCard` itself still
> renders when `settings.guidance.enabled` is true.

| File | Role |
|---|---|
| `GuidanceContext.jsx` | Session state → [05](05-state-management.md#54-guidanceprovider--guidanceguidancecontextjsx) |
| `useWorkflowState.js` | Where the project is in the workflow |
| `useGuidanceEngine.js` | What to do next |
| `SmartGuideCard.jsx` | The floating card |

### `useWorkflowState(projectData, validationResult, roadmap?)`

**Returns** `{ state, progress, nextState, canExport, stateLabel, missingSteps }`.

`WORKFLOW_STATES`: `NO_PROJECT`, `PROJECT_CREATED`, `REPORT_UPLOADED`,
`SIGNERS_COMPLETE`, `INVENTORIES_CREATED`, `ITEMS_CREATED`, `RECORDS_CREATED`,
`FILES_UPLOADED`, `HAS_ERRORS`, `HAS_WARNINGS`, `READY_FOR_EXPORT`.

**Progress scoring** (cumulative, 100 total):

| Step | Points | `missingSteps` key | Condition |
|---|---|---|---|
| Project created | 10 | — | always |
| VVAIS report | 15 | `report` | `projectData.vvais_report_uploaded` |
| Signers | 10 | `signers` | all four institution signer fields |
| Inventories | 15 | `inventories` | at least one tracked inventory |
| Items | 15 | `items` | at least one item |
| Records | 15 | `records` | at least one record |
| Files | 10 | `files` | electronic records have files |
| No errors | 10 | — | `validationResult` has no errors |
| Ready | 5–10 | — | `canExport: true` |

`stateLabel` is set from the **first** unmet step, so the card always names one
concrete next action.

**Roadmap filtering.** When a roadmap route is passed:

- `roadmap.inventoryNumber` narrows tracking to that single inventory;
- `roadmap.projectType` narrows it by inventory type via
  `getTrackedInventoryTypes`:

| `projectType` | Tracked inventory types |
|---|---|
| `text` | `Tekstuāls` |
| `video` | `Video` |
| `photos` | `Foto` |
| `audio` | `Skaņas` |
| `mixed` / absent | all |

`Project.js` uses `missingSteps.includes('signers')` to put a warning badge on
the Parakstītāji button.

### `useGuidanceEngine`

Generates a **category-aware work queue**. The header comment lays out the four
workflows:

| Category | Chain | Actions |
|---|---|---|
| `ELECTRONIC_DOCUMENTS` | Item → many Records → each needs Files | Create GV → Create Dok. → Upload Datne (per record) |
| `ELECTRONIC_MEDIA` | Item → exactly 1 media record (the upload *is* the record) | Create GV → Upload media file |
| `DOCUMENTS` | Item → many Records, no files | Create GV → Create Dok. |
| `MEDIA` | Item → 1 record, no files, manual metadata | Create GV → Enter metadata |

```js
ACTION_TYPES = { UPLOAD_REPORT, ADD_SIGNERS, CREATE_ITEM, CREATE_RECORD,
                 UPLOAD_MEDIA, UPLOAD_FILE, VERIFY, EXPORT }
```

**`ACTION_HELP`** maps each action type to a help chapter/section, so the card
answers not just *"what next?"* but *"how?"*:

| Action | Chapter / section |
|---|---|
| `UPLOAD_REPORT` | `projects` / `upload-vvais-report` |
| `ADD_SIGNERS` | `projects` / `institution-signers` |
| `CREATE_ITEM` | `items` / `create-item` |
| `CREATE_RECORD` | `records` / `create-record` |
| `UPLOAD_MEDIA` | `records` / `document-vs-media` |
| `UPLOAD_FILE` | `records` / `record-files` |
| `VERIFY` | `verification` / `verification-view` |
| `EXPORT` | `verification` / `exporting-opex` |

`getActionHelp(action)` returns `null` for an undocumented type, so a new action
renders **no** help link rather than a broken one.

Internal helpers: `MEDIA_RECORD_KEYS`, `itemHasRecord(item, category, type)`,
`getRecordsNeedingFiles(item)`, `countInventoryEntities(inventory)` — the last of
which counts an `ELECTRONIC_MEDIA` record as **both** a record and a file,
matching `RoadmapContext.calculateProgress`.

### `SmartGuideCard.jsx`

771 lines. Floating card positioned by `settings.guidance.position`. Shows the
workflow state, progress, the action queue, roadmap progress, and per-action help
links. Dismissed actions go to `GuidanceContext.dismissedActions`. Minimise and
hide are session state.

Actions dispatch the window events `Project.js` and `Items.js` listen for —
`openUploadReportModal`, `openSignersModal`, `openValidationModal`,
`guidanceOpenCreateItem`, `guidanceOpenCreateRecord`.

---

## 11.3 Roadmap (*Maršruti*)

State lives in `RoadmapContext` → [05](05-state-management.md#53-roadmapprovider--roadmaproadmapcontextjsx).

### `RoadmapWizard.jsx` — `{ projectId, projectData, editingRouteId, onClose, onComplete }`

Auto-opens 1 s after a project has its report but no roadmap — **once per
project, and never in dev mode**.

Steps:

1. **Mode** — `expert` ("Es zinu, ko daru", minimal help) or `guided`
   ("Palīdziet man izveidot plānu"). **Expert finishes at step 2.**
2. **Project type** — text / video / photos / audio / mixed. Feeds
   `useWorkflowState`'s type filter.
3. **Goals** (guided only) — total items, average records per item, average
   files per record. Multiplied into `goals: { totalItems, totalRecords, totalFiles }`.
4. **Summary** — review, then save via `addRoute` (or `updateRoute` when
   `editingRouteId` is set).

All copy is in `Constants/roadmapConstants.js` (`ROADMAP_UI`).

Routes are shown with live progress in the Verification modal's *Ceļvedis* tab,
via `calculateProgress(projectData, route)`.

---

## 11.4 Settings

State lives in `SettingsContext` → [05](05-state-management.md#52-settingsprovider--settingscontextsettingscontextjsx).

### `Settings/Settings.jsx` — `{ onClose }`

Modal shell, root class `.settings-container` (a help zone). Tabs:

| Tab | Component | Contents |
|---|---|---|
| Display | `DisplaySettings.jsx` | theme (light/dark/auto), font size, compact view, breadcrumbs, items per page |
| Forms | `FormDefaults.jsx` | form presets: create, duplicate, edit, delete, activate; JSON export/import |
| Validation | `ValidationSettings.jsx` | master toggle plus the four warning toggles and every threshold |
| Guidance | `GuidanceSettings.jsx` | `enabled`, `showMode` (`always`/`auto`/`never`), `position` |
| Experimental | `ExperimentalSettings.jsx` | feature flags — currently only `spreadsheetImport` |

### `FormDefaults.jsx` (369 lines)

The preset editor. A preset bundles defaults for `itemLanguage`,
`recordLanguage`, `accessRestriction`, `securityLevel`, `restriction`,
`keyWords`, `notes`; create forms read it through `getActivePreset()`.

- The `default` preset cannot be deleted — `deletePreset` throws
  `'Nevar dzēst noklusējuma priekšiestatījumu'`.
- Deleting the active preset resets `activePresetId` to `'default'`.
- Duplicating appends ` (kopija)`.
- Values are run through `normalizePreset` on read, which repairs three legacy
  values and **drops** anything unrecognised so the form falls back to its own
  default instead of rendering an empty `—`. See
  [05](05-state-management.md#preset-normalisation).

### `ValidationSettings.jsx` (353 lines)

Every control writes into `settings.validation`. Consumed by
[`Utils/FileValidation.js`](06-utilities.md#63-filevalidationjs--soft-warnings).
All of it produces **warnings, not blocks** — the master `enabled: false` short-
circuits the whole validator.

### `ExperimentalSettings.jsx`

Feature flags default to off, and **while a flag is off the feature has no entry
point in the UI at all** — not a disabled button, no button.

---

## 11.5 Icons — `Constants/iconConstants.js`

FontAwesome class names by semantic name, so icon choices are not scattered
through JSX.

| Export | Contents |
|---|---|
| `FORMAT_ICONS` | electronic vs physical |
| `CONTENT_TYPE_ICONS` | per inventory type |
| `ENTITY_ICONS` | project / inventory / item / record / file |
| `HIERARCHY_ICONS` | tree chrome |
| `UPLOAD_ICONS` | per media type |
| `STATS_ICONS` | statistics tiles |
| `PROGRESS_ICONS` | OPEX progress phases |

| Function | Returns |
|---|---|
| `getEntityIcon(inventoryType, isElectronic)` | The icon for a `(type, electronic)` pair — the same key the category system uses. |
| `getUploadIcon(inventoryType)` | Upload icon for that media type. |

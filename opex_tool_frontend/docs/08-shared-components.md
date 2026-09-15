# 8. Shared Components

> Directory: [src/components/](../src/components/)

Reusable UI that is not tied to one domain. Four of them —
`BulkEditPopup`, `MultiCreatePopup`, `ImportPopup`, `SectionEditPopup` — are
**shells**: they own the whole interaction, and the domain wrappers supply only
data and callbacks. That is why `Item/BulkEditItemsPopup.jsx` is 56 lines while
`components/BulkEditPopup.jsx` is 446.

| Component | Kind | Purpose |
|---|---|---|
| `ErrorDisplay.js` | primitives | Alert banners + inline field errors |
| `Notification.jsx` | provider | Toasts + confirm dialog → [05](05-state-management.md#51-notificationprovider--componentsnotificationjsx) |
| `FieldHelp.jsx` | primitive | The `?` tooltip next to a field label |
| `ValidationIndicator.jsx` | primitive | VALID/WARNING/ERROR badge with details |
| `ValidationWarning.jsx` | primitive | Soft-warning panel, inline variant, badge |
| `SelectionToolbar.jsx` | primitive | Floating "N selected" bar |
| `SectionEditPopup.jsx` | shell | "Edit just this section" modal |
| `BulkEditPopup.jsx` | shell | Multi-entity edit |
| `BulkFieldRow.jsx` | shell part | One descriptor row inside the bulk popups |
| `MultiCreatePopup.jsx` | shell | Multi-entity create |
| `ImportPopup.jsx` | shell | CSV/XLSX import |
| `OpexProgressModal.jsx` | feature | OPEX generation progress |

---

## 8.1 `ErrorDisplay.js`

Stateless presentational primitives. Every form uses them.

| Export | Props | Renders |
|---|---|---|
| `GeneralAlert` | `{ message, type = 'error', onClose? }` | A banner. `type` ∈ `error \| warning \| success` picks the class triple (`error-alert` / `error-message` / `error-close`, etc.). Returns `null` for a falsy `message`. The `×` button only appears when `onClose` is given. |
| `GeneralError` | `{ message, onClose? }` | `GeneralAlert type="error"` |
| `GeneralWarning` | `{ message, onClose? }` | `GeneralAlert type="warning"` |
| `GeneralSuccess` | `{ message, onClose? }` | `GeneralAlert type="success"` |
| `FieldError` | `{ error }` | `<span class="field-error">`, or `null` |
| `FieldErrors` | `{ errors }` | `<ul class="field-errors-list">` of `field: message`. Shows **raw field names**, so it is a debugging aid rather than production UI. |

Canonical form usage:

```jsx
const { generalError, getFieldError, setApiErrors, clearErrors } = useFormErrors();

<GeneralError message={generalError} onClose={clearErrors} />
…
<input name="title" … />
<FieldError error={getFieldError('title')} />
```

---

## 8.2 `FieldHelp.jsx`

The small `?` icon beside a form-field label.

```jsx
<FieldHelp entity="item" field="language" />       // FIELD_HELP.item.language.short
<FieldHelp text="One-off explanation" />           // bypasses fieldHelp.js
<FieldHelp entity="item" field="language" position="bottom" />
```

| Prop | Default | Description |
|---|---|---|
| `entity` | `null` | Lookup key in `Constants/fieldHelp.js`. |
| `field` | `null` | |
| `text` | `null` | Direct text; takes precedence over the lookup. |
| `position` | `'top'` | `top \| bottom \| left \| right`. |

**Renders nothing when no text resolves**, so it is safe to add to a label before
the copy for that field has been written.

Opens on hover *and* on click — pure `:hover` would exclude keyboard and touch
users. Wired for a11y via `useId` + `aria-describedby`.

> **Why the tooltip is positioned in JS.** It uses `getBoundingClientRect()` plus
> `position: fixed`, clamped to the viewport, rather than CSS `position:
> absolute`. A CSS-positioned tooltip is silently clipped by any scrollable
> ancestor — such as the section-edit popups' `overflow-y: auto` body — and cut
> off at the screen edge for triggers near a narrow container's boundary. Both
> are common here because this component is used inside popups of very different
> widths. `VIEWPORT_MARGIN = 8`, `TRIGGER_GAP = 8`.

---

## 8.3 `ValidationIndicator.jsx`

Renders the status of an `InheritanceUtils` validation envelope.

| Prop | Default | Description |
|---|---|---|
| `validation` | — | `{ status, errors, warnings }`. `null` renders nothing. |
| `size` | `'medium'` | |
| `showTooltip` | `true` | |
| `clickable` | `true` | Click toggles an inline details panel. |
| `position` | `'top'` | Tooltip side. |
| `showCount` | `false` | Badge with `errors.length + warnings.length`. |

The details panel closes on outside `mousedown` (listener attached only while
open). Messages are rendered through a `renderMessage` helper because
validation messages may contain `<strong>` markup — see
[02-domain-model.md](02-domain-model.md#25-the-validation-cascade-pre-opex-gate).

---

## 8.4 `ValidationWarning.jsx`

For the **soft** warnings from `Utils/FileValidation.js` (a different shape from
the verification envelope).

| Export | Props | Purpose |
|---|---|---|
| `ValidationWarning` (default) | `{ warnings, onDismiss, onProceed, className }` | Full panel with "continue anyway" / "cancel" actions. |
| `InlineValidationWarning` | `{ warnings, className }` | Compact list, no actions. |
| `ValidationBadge` | `{ warningCount, onClick, className }` | Count pill. |

---

## 8.5 `SelectionToolbar.jsx`

Floating bar shown when rows are selected in a list.

| Prop | Description |
|---|---|
| `selectedCount` / `totalCount` | Rendered through `BULK_UI.SELECTION_COUNT` (or `…_RECORDS`). |
| `labels` | Chips naming the selected entities; capped at `MAX_CHIPS = 5`. |
| `onEdit` / `onDelete` / `onColumns` / `onClear` | Action callbacks; a button is omitted when its callback is absent. |
| `entityKind` | `'items' \| 'records'` — picks the plural wording. |

Returns `null` when `selectedCount === 0`. Carries `role="status"` so screen
readers announce the count.

> **Why it exists** (from the source comment): selection can reach beyond the
> visible page. With 25 of 148 rows shown, *"12 selected"* is otherwise invisible
> information immediately before an irreversible bulk action.

---

## 8.6 `SectionEditPopup.jsx`

Shell for the small "edit just this section" popups on Item and Record detail
pages. Handles the portal, overlay, header, error banner and footer; the
concrete popup supplies fields as `children`.

| Prop | Description |
|---|---|
| `title` | Header text. |
| `helpChapterId` / `helpSectionId` | Wires the header `HelpButton`. |
| `onClose` / `onSubmit` | |
| `isSubmitting` | Disables the footer and blocks Escape. |
| `generalError` | Banner message. |
| `isCrossSectionError` | Marks the banner as a cross-section failure (see `splitItemValidationErrors` in [07](07-constants-validation.md)). |
| `onOpenFullEdit` | Optional "open the full form" escape hatch — shown when a cross-section error means the user cannot fix it here. |
| `successMessage` | Success banner. |
| `children` | The fields. |

**Portal mechanics.** It creates its own `<div data-section-edit-portal="true">`,
appends it to `document.body` on mount and removes it on unmount, and sets
`document.body.style.overflow = 'hidden'` for the duration (restoring the
original value, not hard-coding `''`). Escape closes unless submitting.

Concrete popups: `Item/sections/*.jsx` (7) and `Record/sections/*.jsx` (4) — see
[10-domain-components.md](10-domain-components.md).

---

## 8.7 `BulkEditPopup.jsx`

Edit a field across many entities at once. Driven entirely by the descriptors in
[bulkConstants.js](07-constants-validation.md#78-bulkconstantsjs--descriptor-driven-bulk-editing).

| Prop | Description |
|---|---|
| `title`, `intro` | Header copy. |
| `entities` | The selected entities. |
| `entityLabel` | `(entity) => string` for chips and the result list. |
| `fields` | Descriptor array (`getItemBulkFields(inventory)` / `getRecordBulkFields()`). |
| `buildPayload` | `(entity, overrides) => payload` — a **full-object** payload builder. |
| `validate` | `(payload, entity) => errorString \| null`, run for every entity before anything is sent. |
| `execute` | `(payload, entity) => Promise` — one request. |
| `onClose`, `onFinished` | |
| `helpChapterId`, `helpSectionId` | |
| `entityKind` | `'items' \| 'records'` — plural wording. |

### Flow

Three steps: **edit → review → run**.

Because there is **no batch endpoint and no transaction**, the flow is: validate
everything first → send one request per entity → report exactly what happened,
including partial failure. Execution goes through `useBulkRunner`, so it is
sequential and stoppable.

### Prefill and `MIXED`

On open, every control is prefilled with `commonValue(entities, key)`. Keys where
the entities disagree are collected into `mixedKeys` so the UI can *say so*
rather than quietly presenting the first entity's value as if it were shared.

Unticked fields are genuinely left alone: `buildPayload` starts from the entity's
current values and applies only the ticked overrides. This is essential given
that the backend has no partial updates.

### Sub-exports

| Export | Props | Purpose |
|---|---|---|
| `EntityChips` | `{ entities, entityLabel }` | Chip list, capped at `MAX_CHIPS = 10`. |
| `BulkProgress` | `{ state, labelTemplate, successTemplate }` | Progress bar + result list, driven by `useBulkRunner` state. Reused by `MultiCreatePopup` and `ImportPopup`. |

`describeChange(field, values, modes)` (private) renders the human summary shown
on the review step.

---

## 8.8 `BulkFieldRow.jsx`

One descriptor row inside the bulk popups: checkbox, label, `FieldHelp`, control,
mode selector.

| Export | Props |
|---|---|
| `BulkFieldControl` | `{ descriptor, values, onChange, disabled }` — renders the control for a descriptor `type`. |
| `BulkFieldRow` (default) | `{ descriptor, values, modes, enabled, onToggle, onChange, onModeChange, mixedKeys }` |

Private: `LanguageTagsControl` (tag input backed by `languageToTags`),
`ModeSelector` with `MODE_LABELS` for `replace` / `append` / `clear`.

A `group` descriptor renders its children under one checkbox.

---

## 8.9 `MultiCreatePopup.jsx`

Create many entities in one pass: a **shared-field** panel plus a row grid where
each row holds the unique values.

| Prop | Description |
|---|---|
| `title` | |
| `entityKind` | `'items' \| 'records'`. |
| `sharedFields` | Descriptors (`getItemSharedCreateFields(inventory)` / `getRecordSharedCreateFields()`). |
| `columns` | `[{ key, label, required, placeholder, width }]` for the grid. |
| `buildRow` | `(values) => row` |
| `validateRow` | `(row, sharedValues) => errorString \| null` |
| `execute` | `(row, sharedValues, index) => Promise` |
| `rowLabel` | `(row, index) => string` for the result list |
| `supportsFiles` | Enables the file-per-row column. |
| `numberHint` | Text explaining GV numbering. |
| `initialSharedValues` | |
| `onClose`, `onFinished`, `helpChapterId`, `helpSectionId` | |

**Creation is strictly sequential** — `Item.add_item()` derives the GV number from
`inventory.last_gv` server-side, so parallel POSTs would race for the same
number. Rows are validated before anything is sent, and the result list reports
partial failure honestly instead of claiming success.

### Row helpers

| Helper | Purpose |
|---|---|
| `PasteHelper` | Paste tab-separated spreadsheet content → rows, via `parsePastedRows`. |
| `PatternHelper` | Expand a `{n}` pattern (`Lieta {n}`, start, count) → rows, via `expandPattern`; capped at 500. |
| `SharedField` | Renders one shared descriptor. |

### Modal hygiene (shared with `ImportPopup`)

- `document.body.style.overflow = 'hidden'` on mount, original restored on unmount.
- Escape closes — **but never mid-batch**, where closing would hide what was
  already created.

---

## 8.10 `ImportPopup.jsx`

CSV/XLSX import shell. Everything up to "run" happens in the browser — reading,
decoding, mapping and validating. The concrete popups supply only `runImport`,
which turns approved rows into the same POSTs the manual forms make.

| Prop | Description |
|---|---|
| `title`, `subtitle` | |
| `inventory` | Target inventory. |
| `existingItems` | For `GV:n` parent references. |
| `item` | Single-item mode: every row becomes a record for this item. |
| `recordsAllowed` | `false` for non-electronic / media inventories. |
| `runImport` | `({ entries, onPhase }) => Promise<{ interrupted? }>` |
| `runState`, `stopRun` | From the caller's `useBulkRunner`. |
| `phase` | `null \| 'items' \| 'sync' \| 'records' \| 'finished'` |
| `interrupted` | Reason string. |
| `onClose`, `helpChapterId`, `helpSectionId` | |

### Steps

1. **Pick a file** — click or drag-and-drop; `.csv` goes to `parseCsvFile`,
   `.xlsx` to `parseXlsxFile`.
2. **Confirm the columns** — `mapImportRows` reports `unknownColumns`; the user
   can assign each to a canonical name (`manualColumns`).
3. **Check the preview** — every row with its status. `onlyErrors` filters to
   failures. Capped at `PREVIEW_ROW_LIMIT = 200`.
4. **Run** — `runImport`, with `BulkProgress` showing the phase.

`describeParent(entry)` (private) renders which item a record row will attach to.

The `phase` prop exists because the item→record import has an intermediate
`'sync'` step: the item POST response carries `number` but not `id`, so the
project must be re-read before records can reference their parents.

See [09-verification-export.md](09-verification-export.md) for the file format.

---

## 8.11 `OpexProgressModal.jsx`

Live progress for OPEX package generation, driven by
[`useOpexProgress`](04-hooks.md#49-useopexprogressjs).

| Prop | Default | Description |
|---|---|---|
| `projectData` | — | The full project tree — needed to build the file-id lookup map. |
| `includeLongTerm` | `true` | Whether *Ilgstoši glabājamās lietas* inventories are included. |
| `onClose` | — | |

All copy comes from `OPEX_PROGRESS_UI`. The modal renders the phase, the overall
percentage, the current file with its item/record context, per-inventory
progress, the last five processed files, elapsed time, ETA, the zipping
percentage, and the failed-file list.

Root class `.opex-progress-overlay` — the selector DevAdmin's puppet recipes wait
on.

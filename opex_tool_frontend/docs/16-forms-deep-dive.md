# 16. Forms — Deep Dive

The four largest files in the codebase are forms:

| File | Lines |
|---|---|
| `Record/EditDocumentRecord.js` | 1183 |
| `Record/CreateDocumentRecord.js` | 1140 |
| `Item/EditItemNavigable.js` | 992 |
| `Item/CreateItemNavigable.js` | 983 |

They all follow one pattern. This chapter documents that pattern precisely, then
each form's own specifics, so you can change one without reading all four.

---

## 16.1 The `*Navigable` anatomy

A multi-section form is nine parts, always in this order.

### 1. Portal container

```js
const [portalContainer] = useState(() => {
  const div = document.createElement('div');
  div.setAttribute('data-create-record-portal', 'true');
  return div;
});

useEffect(() => {
  document.body.appendChild(portalContainer);
  return () => document.body.removeChild(portalContainer);
}, [portalContainer]);

return ReactDOM.createPortal(<form className="create-record-nav-container">…</form>, portalContainer);
```

The container is created **in a `useState` initialiser**, not in the effect, so
its identity is stable across renders and the append/remove pair cannot mismatch.

`CreateItemNavigable` portals straight into `document.body` instead of its own
div; both work, the dedicated div is easier to find in DevTools.

### 2. Section refs + nav items

```js
const sectionRefs = { basic: useRef(null), document: useRef(null), … };
const [activeSection, setActiveSection] = useState('basic');
const navItems = [{ id: 'basic', label: …SECTION_BASIC, icon: 'fa-info-circle' }, …];
```

`navItems` drives the sticky left nav. Labels always come from
`ITEM_CREATE_FORM_UI` / `RECORD_CREATE_FORM_UI`, never from literals.

### 3. Scroll-spy

The **record** forms track the active section with an `IntersectionObserver`:

```js
{ root: null, rootMargin: '-100px 0px -60% 0px', threshold: 0 }
```

That `rootMargin` creates a narrow band roughly a third of the way down the
viewport; whichever section header crosses it becomes active. The observer is
created once with `[]` deps and reads `sectionRefs` at setup time — so **adding
a section without adding its ref to `sectionRefs` before mount silently disables
scroll-spy for it**.

The **item** forms have no observer: `activeSection` only changes when the user
clicks a nav entry.

```js
const scrollToSection = (id) => {
  sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setActiveSection(id);
};
```

### 4. One flat `formData`

A single object, no nesting, keys matching the API field names. Seeded from the
parent entity and the **active preset**:

```js
const { getActivePreset } = useSettings();
const activePreset = getActivePreset();
```

Never destructure a preset value without a fallback — `normalizePreset` deletes
values it does not recognise precisely so the form's own default takes over. See
[05](05-state-management.md#preset-normalisation).

### 5. `handleInputChange` with inline real-time validation

```js
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  clearErrors(name);
  if (name === 'date') { /* … */ }
  if (name === 'access_restriction') { /* … */ }
};
```

Branching on `name` is the convention. It is also why the date-picker shim
exists (next section) — everything funnels through one handler.

> `clearErrors(name)` passes an argument to a function that
> [takes none](04-hooks.md#useformerrorsjs). It clears **all** errors, not just
> that field's. Harmless in practice, but do not read it as per-field clearing.

### 6. The DatePicker shim

`react-datepicker` hands back a `Date`, not an event. Rather than special-casing
it everywhere, the forms fake an event:

```js
const handleDateFieldChange = (name) => (date) => {
  const value = formatDate(date, 'YYYY-MM-DD');
  if (value === formData[name]) return;      // guard against no-op reparses
  handleInputChange({ target: { name, value } });
};
```

The equality guard matters: react-datepicker fires `onChange` on **every
keystroke** while parsing partial text, and without it the field-specific
validation below would run against half-typed dates. (`CalendarComponent` solves
the same problem differently — see [06](06-utilities.md#610-calendarcomponentjs).)

**Give every `<DatePicker>` a `name` prop.** react-datepicker does not derive
one, and DevAdmin's puppet recipes locate inputs by `[name="…"]`.

### 7. Validate on submit

```js
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;               // re-entry guard
  clearErrors();

  const validation = validate<Domain>Create(validationData, parent);
  if (!validation.isValid) {
    setFieldErrors(validation.errors);
    scrollToFirstError(validation.errors);
    setGeneralError(…FORM_HAS_ERRORS);
    return;
  }
  setIsSubmitting(true);
  try { … } finally { setIsSubmitting(false); }
};
```

Whole-form validation, never per-section. `scrollToFirstError(errors)` maps the
first failing field to its section and scrolls there — without it a user can be
staring at section 4 while the error is in section 1.

### 8. Error rendering

```jsx
<GeneralAlert message={generalError} type="error" />
…
<input name="title" value={formData.title} onChange={handleInputChange} />
<FieldError error={getFieldError('title')} />
```

Plus `<FieldHelp entity="…" field="…" />` next to the label and a
`getRemainingChars(value, MAX)` counter on length-limited fields.

### 9. Modal hygiene

Body scroll lock restoring the original value, Escape to close, outside-click to
close each dropdown. See [10 §10.10](10-domain-components.md#1010-patterns-every-component-here-follows).

---

## 16.2 `CreateItemNavigable.js`

`{ onClose, onCreate, relativeInventory }`

**Six sections:** `basic`, `dates`, `technical`, `description`, `access`,
`related`.

### Initial state

| Field | Seed |
|---|---|
| `number` | `relativeInventory.last_gv + 1` |
| `unit_of_measure` | `OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS` |
| `date_indicator` | `'day'` |
| `size` | `0` |
| `language` | `[activePreset.itemLanguage]` or `[LANGUAGES[0]]` — an **array** |
| `notes` | `activePreset.notes` |
| `restriction` | `activePreset.restriction` or `VISPĀRĒJA` |
| `security_level` | `activePreset.securityLevel` or `PUBLISKS` |
| `inventory` | `relativeInventory.number` |
| `related_item_list` | `[]` |

> `number` is computed client-side but the **server overwrites it** with
> `inventory.last_gv + 1` at insert time. It is a display hint, not a contract —
> which is why bulk creates must be sequential.

### Two multi-selects

Both `language` and `related_item_list` are searchable tag pickers with their own
`*DropdownRef` / `*SearchRef` pair and a shared outside-`mousedown` handler.
Related items come from `useNavigation().getAllItemsFromProject()`.

`language` is held as an **array** in state and joined to `', '` at submit.

### Dates

`CalendarComponent` supplies start/end plus the precision. `handleDateChange`
also runs an inline check against `relativeInventory.end_date` and sets a
`generalError` when the item would extend past its inventory — the same rule
`validateItemDateRange` enforces at submit, surfaced earlier.

### Save-and-continue

`handleSubmit(e, shouldContinue)`:

- `shouldContinue === false` — submit, close.
- `shouldContinue === true` — submit, **keep the popup open**, increment
  `itemsCreated`, reset the form for the next item.

The secondary button calls `handleSubmit(e, true)`. A source comment marks this
as the intended path, so do not "simplify" it into a plain submit.

`onCreate(submitData, shouldClosePopup)` returns `[success, result]` — the older
tuple convention, not a thrown error.

> This form builds its payload **inline**, not through a shared builder. See
> §16.6.

---

## 16.3 `EditItemNavigable.js`

Same six sections, seeded from the existing item.

The important difference is the save path:

```js
const payload = getItemUpdatePayload(item, inventory, formData);
```

**Always the full object.** `getItemUpdatePayload` handles the
`related_item` / `related_items` response-shape mismatch that would otherwise
wipe an item's relations on a second consecutive edit. See
[07](07-constants-validation.md#getitemupdatepayloaditem-inventory-overrides--).

---

## 16.4 `CreateDocumentRecord.js` / `EditDocumentRecord.js`

`{ onClose, onCreate, item, inventory, projectId }`

**Four sections:** `basic`, `document`, `description`, `access`.

| Section | Fields |
|---|---|
| `basic` | `title`, `date`, `reg_nr`, `group` |
| `document` | `created_date`, `sent_date`, `language`, `sent_reg_nr`, `nomenclature_nr`, `key_words` |
| `description` | `annotation`, `notes`, `tech_info` |
| `access` | `access_restriction`, `access_restriction_notes`, `access_restriction_date`, `user_restriction_notes` |

That mapping is mirrored in `RECORD_FIELD_SECTION_LABELS`, which the section
popups use to phrase cross-section errors. **Change one, change both.**

### Keywords are a separate state

`key_words` is not in `formData`. It lives in a `keywords` array with a
`keywordInput` string:

- `addKeyword()` trims, rejects duplicates, clears the input;
- Enter adds (with `preventDefault`, so it does not submit the form);
- `removeKeyword(kw)` filters;
- `getKeywordsString()` joins with `','` — **no space**, unlike `language`, which
  joins with `', '`.

### Date-range warning (soft)

`checkDateInRange(selectedDate)` compares the record date against the parent
item's range, with times zeroed via `setHours(0,0,0,0)`. It handles a
start-only and an end-only range, not just both.

Out of range sets `dateWarning` **and** `isDateOutOfRange`, and `handleSubmit`
**refuses to submit** while that flag is set, scrolling back to `basic` with
`DATE_OUT_OF_RANGE_ERROR`. So despite being presented as a warning, it is a hard
block — the same condition `validateRecordDate` reports as an error.

`getItemDateDisplay()` renders the parent's range in the sub-header, honouring
the item's `date_indicator`.

### Access-restriction inheritance warning (soft)

`checkAccessRestrictionMismatch(selectedValue)` warns when the record's access
setting disagrees with its parent item's:

| Parent `item.restriction` | Record choice | Warning |
|---|---|---|
| `Ierobežota` / `Strikti ierobežota` | `open` | yes |
| anything else (non-empty) | `closed` | yes |
| otherwise | | no |

This one is **advisory only** — it never blocks the submit.

> The parent values are matched by lowercased **Latvian string literals**
> (`'ierobežota'`, `'strikti ierobežota'`) rather than against
> `ITEM_RESTRICTION_LIST`, which contains `Vispārēja | Ierobežota | Sensitīvi
> dati`. `'strikti ierobežota'` is not a current value, and `'Sensitīvi dati'`
> — which *is* restrictive — is treated as unrestricted. The check is looser than
> it looks.

### Cascading clear on `open`

Selecting `access_restriction: 'open'` clears `access_restriction_date`,
`access_restriction_notes` and `user_restriction_notes` in the same
`setFormData` call. This is required, not cosmetic: the backend rejects a date
on an open record (`validateAccessRestrictionDate`).

### Validation payload is narrower than the form

`handleSubmit` builds a **seven-field** object for validation —
`title, language, reg_nr, nomenclature_nr, date, access_restriction,
access_restriction_date` — matching `RECORD_VALIDATED_FIELDS`. Everything else
is unvalidated client-side and relies on the backend.

### Edit differs in exactly one way

`EditDocumentRecord.js` saves through the shared builder:

```js
const payload = getRecordUpdatePayload(record, { ...formData, key_words: getKeywordsString() || '' });
```

---

## 16.5 `CreateMediaRecord.js` — the two-step form

`{ onClose, onCreate, item, inventory, projectId }`

Media is the one category where **the file comes first**. `currentStep` is
`'file-upload'` or `'metadata'`, shown as a numbered progress header
(`MEDIA_RECORD_UI.STEP_FILE_UPLOAD` / `STEP_METADATA`).

```
Step 1  pick a file
          ↓
        POST /media_record/?item_id=…   (creates record + file together)
          ↓
        backend attempts metadata extraction
          ↓
        checkAutoExtractionComplete(mediaRecord, type)
          ├── complete  → skip step 2 entirely, done
          └── incomplete/failed → Step 2: manual entry, then PUT
```

`checkAutoExtractionComplete` returns `{ complete, populated, missing, failed }`
per [02](02-domain-model.md#auto-extraction-helpers). Expected fields by subtype:

| Subtype | Auto-extractable |
|---|---|
| `Foto` | `horizontal_resolution`, `vertical_resolution`, `color` |
| `Video` | `duration`, `horizontal_resolution`, `vertical_resolution`, `color` |
| `Skaņas` | `duration` |

When the browser cannot even determine the file type, the form re-submits with
`skipFileValidation: true` plus a manual `metadata` object — see
[04](04-hooks.md#mutations-1). That is the escape hatch for unusual archival
formats the backend does not recognise.

There is also a recovery path: if the POST response is ambiguous, the form
re-reads the item and looks for a newly created media record before deciding
which step to show.

### `MediaRecordForm.js` — the step-2 field set

`{ onSubmit, isSubmitting, inventory, existingRecord }`

Renders exactly the fields the subtype needs, from `getRequiredFields()`:

| `inventory.type` | Required |
|---|---|
| `Foto` | `color`, `horizontal_resolution`, `vertical_resolution` |
| `Video` | `color`, `duration`, `horizontal_resolution`, `vertical_resolution` |
| `Skaņas` | `duration` |

Duration input is coerced through `formatDuration` and checked with
`validateDurationFormat`, which offers a `durationHint` such as
*"Formatēts uz: 00:23:45"* when it had to reshape the input. Validation runs
through `validateRecordForm` from `Utils/RecordValidation.js` — **not** the
`Constants/recordConstants.js` validators the textual forms use.

`existingRecord` prefills the form, which is how `EditMediaRecordMetadata.js`
reuses it.

> `MediaRecordForm` carries a `description` field that no other layer knows
> about — the record model has `annotation` and `notes`, not `description`.
> `validateRecordData` also length-checks `description`. It appears to be dead.

---

## 16.6 Payload-builder coverage — read this before editing a save path

`getItemUpdatePayload` / `getRecordUpdatePayload` / `getRecordCreatePayload` are
described in their own source comments as the single source of truth for a full
payload. **They are not used everywhere.**

| Call site | Builder used |
|---|---|
| `EditItemNavigable` | `getItemUpdatePayload` ✔ |
| All 7 `Item/sections/*` popups | `getItemUpdatePayload` ✔ |
| `BulkEditItemsPopup` | `getItemUpdatePayload` ✔ |
| `EditDocumentRecord` | `getRecordUpdatePayload` ✔ |
| All 4 `Record/sections/*` popups | `getRecordUpdatePayload` ✔ |
| `BulkEditRecordsPopup` | `getRecordUpdatePayload` ✔ |
| `MultiCreateRecordsPopup` | `getRecordCreatePayload` ✔ |
| `Utils/importMapper` | `getRecordCreatePayload` ✔ |
| **`CreateItemNavigable`** | **inline** ✘ |
| **`CreateDocumentRecord`** | **inline** ✘ |

The two create forms build their payloads by hand. `CreateDocumentRecord` in
particular emits `|| null` for most optional fields:

```js
annotation: formData.annotation || null,
reg_nr:     formData.reg_nr     || null,
group:      formData.group      || null,
```

while `getRecordCreatePayload`'s doc comment states the opposite rule:

> Every `Record` model CharField is `blank=True, null=False`, so DRF rejects an
> explicit null with *"This field may not be null."* Empty optional fields must
> go out as `''` — `access_restriction_date` is the only field on the model that
> accepts null.

The two are inconsistent, and `access_restriction_notes` / `user_restriction_notes`
are already special-cased to `""` in the inline version, which suggests this was
hit and patched field-by-field rather than fixed at the source.

**When you touch a create path, migrate it to the shared builder** rather than
adding another `|| null`. Both forms are covered by puppet recipes
(`item_create`, `record_create_doc`), so the change is testable end-to-end with
Ctrl+Shift+F.

---

## 16.7 Adding a section to an existing form

1. Add a ref to `sectionRefs` **before mount** — the record forms'
   `IntersectionObserver` reads the object once.
2. Add an entry to `navItems` with a `SECTION_*` label from the UI strings file.
3. Render `<div id="<sectionId>" ref={sectionRefs.<sectionId>}>` — the observer
   reads `entry.target.id`, so the DOM id **must equal** the ref key.
4. Add the new fields' `<FIELD>_SECTION_LABELS` entries so cross-section errors
   name the right section.
5. Add a matching section popup under `Item/sections/` or `Record/sections/` if
   the detail page should offer a focused edit.
6. Extend the puppet recipe so `full_project` still passes.

## 16.8 Form checklist

Before you consider a form change finished:

- [ ] Every `<DatePicker>` has a `name` prop.
- [ ] Every user-visible string comes from `Constants/uiStrings/`.
- [ ] The save path uses a shared payload builder.
- [ ] `getFieldError(...)` is rendered next to every validated input.
- [ ] `isSubmitting` guards re-entry and disables the submit button.
- [ ] Body scroll is restored to its **original** value on unmount, not `''`.
- [ ] Escape closes, except while submitting.
- [ ] The relevant puppet recipe still passes (Ctrl+Shift+F).
- [ ] `CHANGELOG.md` records what changed and why.

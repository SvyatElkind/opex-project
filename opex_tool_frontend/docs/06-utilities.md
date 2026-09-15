# 6. Utilities Reference

> Directory: [src/Utils/](../src/Utils/)

Fourteen modules. `InheritanceUtils.js` is documented separately in
[02-domain-model.md](02-domain-model.md) — it is business logic, not a utility.

| File | Purpose |
|---|---|
| `DateFormatter.js` | The single source of truth for date display. |
| `Utils.js` | Two tiny date helpers (legacy). |
| `FileValidation.js` | Settings-driven soft file warnings. |
| `RecordValidation.js` | Record/file/metadata validation against backend constraints. |
| `PerformanceMonitor.js` | Dev-only timing singleton. |
| `csvParser.js` | Dependency-free CSV reader with encoding sniffing. |
| `xlsxReader.js` | Dependency-free `.xlsx` reader. |
| `docxWriter.js` | Dependency-free `.docx` writer. |
| `importMapper.js` | Grid → validated import rows. |
| `CalendarComponent.js` | Date-range picker with precision modes. |
| `YearPicker.js` | Year-only combobox. |
| `HelpWindow.js` | Opens the standalone help window. |
| `InheritanceUtils.js` | See [02-domain-model.md](02-domain-model.md). |

---

## 6.1 `DateFormatter.js` — dates

**The rule: wire format is `YYYY-MM-DD`, display format is `DD.MM.YYYY`.**
Convert at the form boundary, never in between, and never roll your own.

### Constants

| Export | Value | Use |
|---|---|---|
| `DATEPICKER_FORMAT` | `'dd.MM.yyyy'` | react-datepicker `dateFormat` prop (its tokens are lowercase). |
| `DATE_PLACEHOLDER` | `'DD.MM.YYYY'` | Human-facing placeholder text. |

### `parseDate(value) → Date | null`

Accepts a `Date`, an ISO string, or anything `new Date()` understands. Returns
`null` for falsy input **and** for `Invalid Date`.

### `formatDate(dateStr, format = 'YYYY-MM-DD', dateIndicator = 'day') → string`

Returns `''` for falsy or invalid input — never throws, never renders
`"Invalid Date"`.

**Precision takes priority over format:**

| `dateIndicator` | Output | Note |
|---|---|---|
| `'year'` | `2024` | `format` ignored |
| `'month'` | `01.2024` | `format` ignored — always `MM.YYYY` |
| `'day'` (default) | per `format` | |

| `format` | Output |
|---|---|
| `'DD.MM.YYYY'` | `15.01.2024` |
| `'DD/MM/YYYY'` | `15/01/2024` |
| `'YYYY-MM-DD'` (default) | `2024-01-15` |

Uses **local** date parts (`getFullYear`, `getMonth`, `getDate`), so a UTC
timestamp near midnight can render as the neighbouring day in a non-UTC zone.

### `formatDateRange(startDate, endDate, format?, dateIndicator?) → string`

`'A - B'` when both are present, the single value when only one is, `'-'` when
neither.

### `formatTime(timeStr, format = '24h') → string`

`'14:05'` for `'24h'`, `'2:05 PM'` for `'12h'`. Midnight/noon are handled by
`hours % 12 || 12`.

### `formatDateTime(dateTimeStr, dateFormat?, timeFormat?) → string`

`` `${formatDate(...)} ${formatTime(...)}` ``.

---

## 6.2 `Utils.js` — legacy date helpers

```js
formatDate(date)  // Date → 'YYYY-MM-DD'   (local parts)
formatYear(date)  // Date → number
```

Also exported as a factory (`Utils()`) for old call sites. **Note the name
collision**: this `formatDate` takes a `Date` and always yields wire format,
while `DateFormatter.formatDate` takes anything and is display-oriented. Check
the import path when reading a call site.

---

## 6.3 `FileValidation.js` — soft warnings

Every function returns an **array of warnings**; nothing here blocks an upload.
Warning shape:

```js
{ type: 'warning', field: string, message: string /* Latvian */, value, threshold }
```

Thresholds come from `settings.validation` (see
[05-state-management.md](05-state-management.md#52-settingsprovider--settingscontextsettingscontextjsx)).

### `validateFileSize(file, maxSizeMB = 100, minSizeMB = 0.01)`

Warns above the max (*"…var radīt veiktspējas problēmas"*) and below the min
(*"…var būt bojāts vai nepilnīgs"*). Field: `fileSize`.

### `validateDuration(duration, maxDuration = 3600, minDuration = 1)`

`duration` is in **seconds**. Returns `[]` for `0`/falsy. Messages format the
duration humanely (`1h 5m 3s` / `5m 3s` / `3s`). Field: `duration`.

### `validateImageDimensions(width, height, settings = {}, checkOrientation = true)`

Four independent dimension warnings (`imageWidth`, `imageHeight` — max and min),
plus an orientation warning when `preferredOrientation !== 'any'`.

Orientation classification from `aspectRatio = width / height`:

| Class | Condition |
|---|---|
| square | `|ratio − 1| < 0.1` |
| horizontal | `ratio > 1.1` |
| vertical | `ratio < 0.9` |

Ratios in the gaps (0.9–1.1 outside the square band, or 1.0–1.1) satisfy *no*
class, so a "must be horizontal" preference will warn on a 1.05 ratio image.

### `getImageDimensions(file) → Promise<{width, height}>`

Loads the file into an `Image` via `URL.createObjectURL`, resolves with
`naturalWidth/naturalHeight`. **Rejects** if the file's MIME type does not start
with `image/`. Revokes the object URL on both paths.

### `getMediaDuration(file) → Promise<number>`

Same pattern with a `<video>` or `<audio>` element and `onloadedmetadata`.
Rejects for non-audio/video MIME types.

### `validateFile(file, validationSettings = {}) → Promise<Warning[]>`

The orchestrator used by the upload UI.

1. Returns `[]` immediately if `validationSettings.enabled === false`.
2. Size check unless `enableFileSizeWarnings === false`.
3. For `image/*`: probes dimensions, then runs `validateImageDimensions` unless
   `enableImageDimensionWarnings === false`. Orientation is gated separately by
   `enableOrientationWarnings`.
4. For `audio/*` / `video/*`: probes duration, then `validateDuration` unless
   `enableDurationWarnings === false`.
5. Probe failures are **swallowed** — a file whose metadata cannot be read
   produces no warnings rather than an error.

Note the `!== false` comparisons: an *absent* toggle counts as enabled.

### `formatWarnings(warnings) → string`

One warning → its message. Several → `Atrasti N brīdinājumi:` followed by a
numbered list.

---

## 6.4 `RecordValidation.js` — hard constraints

Mirrors backend rules. Distinct from `FileValidation.js`: these are errors.

### `RECORD_VALIDATION`

```js
ALLOWED_FILE_TYPES: {
  'Foto':      image/jpeg, jpg, png, gif, bmp
  'Video':     video/mp4, avi, mov, wmv, mkv
  'Skaņas':    audio/mpeg, mp3, wav, aac, ogg, m4a
  'Tekstuāls': the image list + application/pdf, text/plain,
               application/msword, …wordprocessingml.document
}
SINGLE_FILE_TYPES:   ['Foto','Video','Skaņas']
MULTIPLE_FILE_TYPES: ['Tekstuāls']
```

`RECORD_ERROR_MESSAGES` holds the seven Latvian strings used below.

### `validateFileUploads(files, inventoryType) → { validFiles, errors }`

- No files → one general error `NO_FILES_PROVIDED`.
- No `inventoryType` → `RECORD_TYPE_REQUIRED`.
- Media type with more than one file → `SINGLE_FILE_ONLY` (rejects the whole
  batch, not just the extras).
- Per file: MIME must be in the allowed list; the message appends the full list.

**There is no size limit.** A comment marks the spot where one used to be —
users must be able to upload archival files of any size.

`errors` is `[{ file: name, errors: string[] }]`, with `file: 'general'` for
batch-level failures.

### `validateMetadata(metadata, metadataType) → { isValid, errors }`

⚠️ `metadataType` here is **capitalised singular** — `'Action'`, `'Addressee'`,
`'Visa'`, `'ReadStatus'` — unlike the API's lowercase `class` parameter and the
UI's plural keys. Three different vocabularies for the same four concepts.

Each type requires one field: `action`, `addressee`, `visa`, or a defined
`is_read`.

### `validateRecordData(recordData, recordType = 'standard', inventoryType = null)`

Common: `description` ≤ 1000 chars.

For `recordType === 'media'`:

| `inventoryType` | Required |
|---|---|
| `Foto` | `color`, positive `horizontal_resolution`, positive `vertical_resolution` |
| `Video` | the above plus `duration` matching `/^\d{2}:\d{2}:\d{2}$/` |
| `Skaņas` | `duration` in `HH:MM:SS` |

### `validateRecordForm(formData, files, inventoryType, recordType = 'standard')`

Composes the two above and adds media-specific re-checks. Returns
`{ isValid, errors: { files?, record? }, hasErrors }`.

> The per-type field checks here **duplicate** `validateRecordData`, so a missing
> `color` on a photo produces the same message twice. Harmless, but do not read
> the error count as a defect count.

### Formatting & helper functions

| Function | Description |
|---|---|
| `isSingleFileType(inventoryType)` | Media types only. |
| `getAllowedFileTypes(inventoryType)` | MIME array, `[]` if unknown. |
| `formatFileSize(bytes)` | `'1.5 MB'` — base 1024, units `Bytes/KB/MB/GB`. **Different unit label from `InheritanceUtils.formatFileSize`** (`'Bytes'` vs `'B'`). |
| `formatDuration(duration)` | Coerces `HH:MM:SS`, `MM:SS` or plain seconds into `HH:MM:SS`. Unrecognised input yields `00:00:00`, not an error. |
| `validateDurationFormat(duration)` | `{ isValid, formatted?, error?, suggestion? }`. Suggests the reformatted value when it differs. |
| `getAPITypeFromInventory(inventoryType)` | **`'Skaņas' → 'Audio'`**; `Foto` and `Video` pass through. Required because the media-record endpoints take `?type=Audio`, not `?type=Skaņas`. |
| `hasValidationErrors(result)` | Works across all three result shapes used in the codebase. |
| `getValidationErrorMessages(result)` | Flattens `errors.files`, `errors.record`, `errors.metadata` into a `string[]`. |

---

## 6.5 `PerformanceMonitor.js`

A singleton class instance, default-exported.

**`isEnabled = process.env.NODE_ENV === 'development'`.** In a production build
every method is a no-op — measurements are never collected, so DevAdmin's
Performance tab is empty in `npm run build` output even if the panel is included.

| Method | Description |
|---|---|
| `startMeasure(label)` | Stores `performance.now()` under `markers[label]`. |
| `endMeasure(label)` | Computes the delta, appends it to `measures[label]`, deletes the marker. Silently ignores an unknown label. |
| `getStats(label)` | `{ count, avg, min, max, stdDev }`, or `null`. Population standard deviation. |
| `getAllStats()` | Same, keyed by label. |
| `logStats()` | **Returns** `getAllStats()` — despite the name it does not log. |
| `clearMeasurements()` | Empties `measures` (leaves `markers`). |
| `startMemoryMonitor()` | 30-second interval reading `performance.memory`, stored in `lastMemoryStats` as `{ used, total, limit, usagePercent }` in MB. Chromium-only. Started automatically in dev when the API exists. |
| `stopMemoryMonitor()` / `dispose()` | Clear the interval / clear everything. |

Labels collide silently: two concurrent `startMeasure('X')` calls leave one
dangling. `usePerformance` avoids this by prefixing with the component name.

---

## 6.6 `csvParser.js`

Dependency-free by choice — the header comment argues an ~80-line parser does not
justify a library. **The hard part is encoding, not grammar.**

### `decodeBytes(buffer) → { text, encoding, guessed }`

| Detection order | Result `encoding` | `guessed` |
|---|---|---|
| BOM `EF BB BF` | `'UTF-8 (BOM)'` | `false` |
| BOM `FF FE` | `'UTF-16LE'` | `false` |
| BOM `FE FF` | `'UTF-16BE'` | `false` |
| strict UTF-8 decode succeeds | `'UTF-8'` | `false` |
| otherwise | `'windows-1257'` | **`true`** |

The strict decode uses `new TextDecoder('utf-8', { fatal: true })` — the whole
point of `fatal` is to **throw** on invalid sequences instead of inserting
U+FFFD, which is what makes legacy-encoding detection possible. Excel on Latvian
Windows writes plain "CSV" as **windows-1257 (ANSI)**, and every
ā/č/ē/ī/ķ/ļ/ņ/š/ū/ž would otherwise import as mojibake. When `guessed` is true
the UI warns the user.

### `sniffDelimiter(text) → string`

Counts `;`, `,`, `\t`, `|` **outside quotes** on the first non-empty line and
returns the most frequent. Default and tie-breaker is `';'` — Latvian Excel
writes semicolons even for "CSV UTF-8".

### `parseCsv(text, delimiter) → string[][]`

RFC 4180 hand-written state machine: quoted fields, `""` as an escaped quote,
newlines inside quotes, CRLF / LF / lone CR. Handles a trailing field with no
final newline. Filters out rows where every cell is blank.

### `parseCsvFile(file) → Promise<{ rows, encoding, guessed, delimiter }>`

`arrayBuffer()` → `decodeBytes` → `sniffDelimiter` → `parseCsv`.

---

## 6.7 `xlsxReader.js`

Read-only `.xlsx`, no dependencies. The header comment explains the choice:
SheetJS is pinned at 0.18.5 on npm with an unpatched prototype-pollution CVE
(the fix ships only from the vendor CDN), and `exceljs` is a megabyte for a
"read one sheet" job. An `.xlsx` is a ZIP of XML, and the browser already has
`DecompressionStream`, `DOMParser` and `DataView`.

**Explicitly unsupported, and loud about it:** encrypted workbooks, ZIP64,
compression methods other than store (0) and deflate (8). Formulas are read as
their cached values.

### Internal pipeline

| Step | Function | Notes |
|---|---|---|
| Find EOCD | `findEocd(view)` | Scans backwards up to 64 KB + 22 for `0x06054b50`. |
| Read directory | `readZipDirectory(buffer)` | `Map<name, {method, compressedSize, localOffset}>`. Throws *"Fails nav derīgs .xlsx (nav atrasta ZIP struktūra)"*. |
| Inflate | `inflateRaw(bytes)` | `ReadableStream` + `DecompressionStream('deflate-raw')` — no `Blob`, no `Response`, so it behaves identically in browser, Electron and tests. Throws a Latvian "save as CSV" message when unavailable. |
| Read entry | `readEntryText(buffer, entries, name)` | Verifies the local header signature; method 0 = store, 8 = deflate, anything else throws. |
| Parse XML | `parseXml(text, what)` | `DOMParser` + `parsererror` check. |

Namespace handling avoids the XML namespace API entirely — `childrenByName` and
`firstByName` compare `child.localName`.

### Value conversion

- **`columnIndexFromRef('BC12') → 28`** — base-26 letter arithmetic, 0-based.
- **`DATE_FORMAT_IDS`** — built-in `numFmtId`s that mean "date":
  `14–22, 27, 30, 36, 45, 46, 47, 50, 57`.
- **`readDateStyles(stylesXml)`** — array indexed by style index. Custom formats
  count as dates when their `formatCode`, with `[...]` and `"..."` stripped,
  contains `y`, `m` or `d`.
- **`serialToIsoDate(serial, date1904)`** — Excel's day count → `YYYY-MM-DD`.
  Handles the 1904 system and Excel's mythical 29 Feb 1900: serials below 60 use
  epoch `1899-12-31`, at or above 60 use `1899-12-30`.
- **`readSharedStrings(xml)`** — flattens `<si>`, joining `<r>` runs.

### Cell type handling in `readSheetRows`

| `t` attribute | Handling |
|---|---|
| `inlineStr` | `<is><t>` text |
| `s` | shared-string index |
| `b` | `'true'` / `'false'` |
| `str`, `e` | raw `<v>` text (`e` = error, kept as-is, e.g. `#REF!`) |
| absent (numeric) | if the style is a date format → ISO date, else the raw number as text |

Gaps are filled with `''` so column positions line up with the header row; all
values are `String(...).trim()`ed; all-blank rows are dropped.

### `parseXlsxFile(file) → Promise<{ rows, sheetName, sheetNames }>`

Prefers a sheet named `DATI`, `DATA` or `IMPORTS` (case-insensitive, trimmed);
otherwise the first sheet. Throws Latvian errors for a missing
`xl/workbook.xml`, an empty workbook, or an unreadable sheet.

Covered by [xlsxReader.test.js](../src/Utils/xlsxReader.test.js).

---

## 6.8 `docxWriter.js`

Write-only OOXML WordprocessingML, no dependencies. Used by the Help chapter
export ([Help/helpDocxExport.js](../src/Help/helpDocxExport.js)). Deliberately
narrow: no images, one section, no revision tracking, no comments.

### ZIP writer

| Function | Description |
|---|---|
| `crc32(bytes)` | Table built lazily on first use. |
| `deflateRaw(bytes)` | `CompressionStream('deflate-raw')`. **Returns `null`** when unavailable — the caller then stores the entry uncompressed, which every ZIP reader accepts. |
| `toDosDateTime(date)` | MS-DOS packed date/time, floored at 1980. |
| `createZip(files, { mimeType, now })` | `files` is `[{name, data}]` where `data` is a string or `Uint8Array`. Deflate is used only when it actually shrinks the entry. Returns a `Blob`. |

### XML helpers

| Function | Description |
|---|---|
| `escapeXml(value)` | Strips control characters (only `\t`, `\n`, `\r` survive below 0x20 — one stray control char makes Word reject the file), then escapes `& < > " '`. |
| `cssColorToHex(value, fallback = '000000')` | Accepts `#rgb`, `#rrggbb`, `rgb()`, `rgba()`; returns bare uppercase `RRGGBB`. |
| `tintTowardWhite(hex, amount = 0.88)` | Blends toward white. This is what keeps exported callout boxes light even when the app is running in dark theme. |

### Content builders

| Function | Description |
|---|---|
| `run(text, opts)` | Text run. `opts`: `bold, italic, color, font, size, style, underline`. Newlines become `<w:br/>`, tabs become `<w:tab/>`. |
| `paragraph(text, opts)` | Paragraph. Run-level options go in `opts.run`. |
| `paragraphXml(runsXml, opts)` | Paragraph from pre-rendered runs (hyperlinks, fields). |
| `pageBreak()` | |
| `bookmark(id, name, innerXml)` | |
| `internalLink(anchor, text)` | Hyperlink to a bookmark, styled `Hyperlink`. |
| `table(rows, { widths, headerRow, borders, borderColor, cellFills })` | `rows` is cell-XML arrays. `widths` in twips. `headerRow` adds `<w:tblHeader/>` so the row repeats across page breaks. |
| `calloutBox(contentXml, { fill, accent, width })` | Single-cell tinted box with a coloured left edge. |

Paragraph options: `style, numId, level, indent, hanging, spacingBefore,
spacingAfter, align, fill, keepNext, borderLeft, contextualSpacing`.

> **Two invariants Word enforces, both noted in the source:**
> 1. `<w:pPr>` children must appear in schema order or Word reports the document
>    as corrupt. `paragraphProperties` emits them in the correct sequence — do not
>    reorder.
> 2. A `<w:tc>` with no paragraph is invalid; `tableCell` inserts an empty one.
>    A paragraph is also emitted after every table, or two adjacent tables merge.

### Document assembly

`PAGE = { WIDTH: 11906, HEIGHT: 16838, MARGIN_LEFT: 1418, MARGIN_RIGHT: 1134, TEXT_WIDTH: 9354 }`
— A4 portrait in twips.

**`buildDocx({ bodyXml, numberedListCount, title, creator, accent, bodyFont, monoFont, now }) → Promise<Blob>`**

Emits eight parts, `[Content_Types].xml` first as the OPC spec requires:

```
[Content_Types].xml
_rels/.rels
docProps/core.xml
word/document.xml
word/_rels/document.xml.rels
word/styles.xml
word/numbering.xml
word/footer1.xml
```

Styles defined: `Normal`, `Title`, `Subtitle`, `Heading1–3`, `ListParagraph`,
`Caption`, `Mono`, `TocEntry`, `Hyperlink` (character), `CodeChar` (character).
Defaults: `lv-LV`, 11 pt (`sz 22`), 1.15 line spacing.

**Numbering:** bullets always live on `numId 1`; each numbered list gets its own
`numId` (2, 3, …) so lists restart at 1 instead of continuing the previous one.
Pass the count as `numberedListCount`.

**`downloadBlob(blob, filename)`** — synthetic `<a download>` click. The object
URL is revoked after a **1 s timeout**, because Firefox cancels an in-flight
download if the URL disappears synchronously.

---

## 6.9 `importMapper.js`

Pure functions — no React, no network — which is what makes the whole import
testable without a UI. Turns a raw cell grid into rows ready to POST.

**Design principle from the header comment:** failing rows are *kept with a
reason*, never dropped, so the preview can show the user exactly what the file
got wrong.

### `findHeaderRow(rows) → number`

Scans the first 20 rows for the first one where **at least two** cells resolve
through `findColumn`. Returns `-1` if none. This tolerates files with a title or
a note above the table.

### `buildHeaderMap(headerRow, manual = {}) → { columns, unknown, present }`

- `columns[i]` — column definition or `null`.
- `unknown` — `[{ index, name }]` for non-empty headers that matched nothing;
  the UI offers manual assignment for these.
- `present` — `Set` of canonical names found.

`manual` is `{ columnIndex: canonicalName }` from the user's assignments and
takes precedence over the header text.

### `missingRequiredColumns(present, rowType) → string[]`

### `parseImportDate(raw, snap = 'start') → { value, precision } | null`

| Input | Precision | `snap='start'` | `snap='end'` |
|---|---|---|---|
| `2020-01-15`, `2020-1-5` | `day` | as given | as given |
| `15.01.2020`, `15/01/2020`, `15-01-2020` | `day` | as given | as given |
| `2020-01`, `01.2020`, `01/2020` | `month` | `2020-01-01` | `2020-01-31` |
| `2020` | `year` | `2020-01-01` | `2020-12-31` |

Returns `null` for anything else, and for out-of-range months/days in the
`DD.MM.YYYY` branch. The snapping mirrors what `CalendarComponent` does in the
manual forms; the backend's `DateField` only accepts full dates.

### Payload builders

- **`buildItemPayload(values, inventory)`** — the full field set the create form
  sends, with defaults: `date_indicator: 'day'`, `size: 0`,
  `unit_of_measure: 'Lapas'`, `restriction: 'Vispārēja'`,
  `security_level: 'Publisks'`, `related_item_list: []`,
  `inventory: inventory?.number`.
- **`buildRecordPayload(values)`** — delegates to
  `getRecordCreatePayload` from `recordConstants.js`, defaulting
  `access_restriction` to `'open'`.

### `mapImportRows(options) → ImportPlan`

| Option | Description |
|---|---|
| `rows` | Raw grid. |
| `inventory` | Target inventory (used for item validation). |
| `existingItems` | Items already in that inventory, for `GV:n` references. |
| `item` | **Single-item mode**: when set, every row is forced to `RECORD` and `TIPS` is ignored. |
| `recordsAllowed` | `false` for non-electronic / media lists — record rows are rejected with a message. |
| `manualColumns` | `{ columnIndex: canonicalName }`. |

**Returns**

```js
{
  headerRowIndex, unknownColumns, present,
  missingForItems, missingForRecords,
  entries, itemCount, recordCount, validCount
}
```

`missingForItems` / `missingForRecords` are only populated when the file actually
contains rows of that type.

**Entry shape**

```js
{
  rowNumber,          // 1-based as shown in Excel
  type,               // 'item' | 'record' | null
  label,              // title, or first non-empty cell
  ok, message,        // first error only — the preview shows one reason per row
  key?,               // item rows: the SAITE value
  payload?, dates?,   // item rows
  parent?,            // record rows
}
```

### Parent resolution — `resolveParent`

| Situation | Parent |
|---|---|
| single-item mode | `{ kind: 'current', item }` |
| `SAITE` starts with `GV:` | `{ kind: 'existing', item }` looked up by item **number**; error `ROW_ERROR_PARENT_NOT_FOUND` if absent |
| `SAITE` is any other key | `{ kind: 'new', entryIndex, rowNumber }` — the item row that declared the same key; error `ROW_ERROR_PARENT_KEY_NOT_FOUND` |
| `SAITE` empty | the **nearest item row above** |
| no item row above | error `ROW_ERROR_NO_PARENT` |

Duplicate `SAITE` keys on item rows fail the second occurrence with
`ROW_ERROR_DUPLICATE_KEY`.

Record dates are validated against the parent's range — which works for a
not-yet-created parent too, because its dates were already parsed into
`entry.dates`.

### `missingRecordFieldMessage(payload)` (private)

Catches three fields the record model requires but `validateTextRecordCreate`
does not check: `created_date`, `sent_date`, `nomenclature_nr`. Without this the
failure would only surface as a backend 400 halfway through the import.

### Date-precision inference

While parsing an item row, `start_date` / `end_date` precision is tracked and the
**loosest** value wins (`day < month < year`), writing `values.date_indicator`.
An explicit `DATUMA_PRECIZITĀTE` column sets `precisionGiven` and wins outright.

See [09-verification-export.md](09-verification-export.md) for the file format itself.

---

## 6.10 `CalendarComponent.js`

The date-range picker used by every form that has a start/end pair. Wraps two
`react-datepicker` inputs plus an optional `react-select` precision chooser.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onDateChange` | `(start: Date\|null, end: Date\|null, view: string) => void` | — | Fires on every change, including intermediate keystroke parses. |
| `startDate` / `endDate` | `string` (`YYYY-MM-DD`) | — | Initial values. |
| `dateIndicator` | `'day'\|'month'\|'year'` | — | Controlled precision; overrides `preset`. |
| `preset` | same | `'day'` | Fallback precision. |
| `hideLabels` | `bool` | `false` | |
| `compactPlaceholders` | `bool` | `false` | Uses `no` / `līdz` instead of full placeholders. |
| `hideIndicatorSelector` | `bool` | `false` | |
| `usePortal` | `bool` | `false` | Renders the popup into a body-level portal so a small `overflow:auto` ancestor (the section-edit popups) cannot clip it. |

### Precision snapping

| View | Start becomes | End becomes | Input format |
|---|---|---|---|
| `year` | Jan 1 | Dec 31 | `yyyy` |
| `month` | 1st | last day | `MM.yyyy` |
| `day` | as picked | as picked | `dd.MM.yyyy` |

### Two behaviours that look odd but are deliberate

**1. The precision selector visibility is frozen at first mount.**
`showIndicatorSelectorRef` captures `initialView !== 'year'` once. A component
that starts at `'year'` (an inventory-level preset) never shows the selector,
even if the value later changes; one that starts at `'day'`/`'month'` keeps it
visible even after the user switches to `'year'`.

**2. Cross-field validation runs on blur, not on change.** A long comment
explains: react-datepicker fires `onChange` on **every keystroke** as it parses
partial text — typing `2025` yields `2 → 2001`, `20 → 2020`, `202 → 2020`,
`2025 → 2025`. Validating on each of those would clear the sibling date
spuriously. So `handleStartDateChange` / `handleEndDateChange` only update local
state and notify the parent, while `commitStartDate` / `commitEndDate` (bound to
`onBlur` and `onCalendarClose`) do the comparison.

On an invalid range the component **clears** the offending field(s) and shows a
`notify.warning`:

- start > end → end is cleared;
- end < start → **both** are cleared.

Comparisons go through `dateOnly()`, which strips the time component.

State is mirrored into refs (`startDateRef`, `endDateRef`, `viewRef`) and the
setters write both synchronously, so a handler never sees a stale sibling value.

---

## 6.11 `YearPicker.js`

A year-only combobox used for inventory period boundaries.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | `YYYY-MM-DD`; only the year part is read. |
| `onChange` | `(dateString) => void` | — | Emits a full date, or `''` when cleared. |
| `placeholder` | `string` | `'Select Year'` | |
| `className`, `disabled`, `label` | | | |
| `isStartDate` | `bool` | `true` | `true` → emits `YYYY-01-01`; `false` → `YYYY-12-31`. |

### Behaviour

- Range is **current year ± 100** (201 options).
- Opening the dropdown scrolls the selected (or current) year into view and
  focuses the type-ahead input.
- The type-ahead accepts up to 4 digits; a valid 4-digit year smooth-scrolls to
  that option and Enter selects it. Escape closes and reverts the text.
- A `×` button clears and emits `''`.
- Closes on outside `mousedown`.
- `role="combobox"` with `aria-expanded` / `aria-haspopup`; options are
  `role="option"` with `aria-selected`.

> All 201 options are rendered whenever the dropdown is open — no virtualisation.

---

## 6.12 `HelpWindow.js`

Opens the standalone help bundle in a popup window.

### `openHelpWindow(chapterId = null, sectionId = null, windowOptions = {}) → Window | null`

Builds `<origin>/?help=true` plus a hash:

- `#<chapterId>` — chapter,
- `#<chapterId>/<sectionId>` — exact section.

Default window features: `1200×800`, no menubar/toolbar/location, status,
scrollbars and resizable on. The window name is `'OpexHelpWindow'`, so repeated
calls **reuse the same window**.

If the popup is blocked, it dispatches a `showToast` `CustomEvent` on `window`
with a Latvian warning and returns `null`.

> **No component listens for `showToast`.** `dispatchEvent` here is the only
> reference in `src/` — the blocked-popup warning is therefore silently dropped,
> and the user gets no feedback at all. Wiring it to `useNotification().notify.warning`
> would fix it.

### Other exports

- `openHelpChapter(chapterId, sectionId?)` — thin alias.
- `openHelp` — alias of `openHelpWindow`.
- `HELP_CHAPTER_IDS` — `GETTING_STARTED, PROJECTS, INVENTORIES, ITEMS, RECORDS,
  VERIFICATION, NAVIGATION, SETTINGS, ROADMAP, KEYBOARD_SHORTCUTS`.

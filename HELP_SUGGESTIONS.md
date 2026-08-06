# Help Section — Suggestions Based on Current Implementation

> Investigation of the actual code (Help.js, Help.css, helpConstants.js — 3,571 lines of content).
> Goal: make the help clearer and easier to understand without overcomplicating.
>
> **Last updated: 2026-06-12** — Reconciled against June 10 Help refactor. Suggestions 1 and 6 are now marked IMPLEMENTED. Section 4 corrected (accordion is used in 2 places). A runtime bug in the search indexer is documented in section 1.

---

## What's Already There (and Good)

The system is solid. 10 block types, all rendering correctly with theme CSS variables:

| Type | What it does | Currently used? |
|---|---|---|
| `paragraph` | Body text | Yes — heavily |
| `list` | Bullet list | Yes — heavily |
| `note` | Callout box (info/warning/error) | Yes — well used |
| `heading` | Sub-heading within a section | Yes — often overused |
| `steps` | Numbered step list with circles | Yes — but underused |
| `table` | Data table with headers | Yes — but underused |
| `accordion` | Collapsible section | Yes — used in 2 places (see section 4) |
| `ui-example` | Renders real HTML with app CSS | Yes — good for forms/buttons |
| `code` | Inline code | Barely used |
| `color-palette` | CSS variable swatches | Used in intro only |

4 chapters are already written with substantial content. The structure works. The navigation works. Search works.

---

## The Core Problem

**The content ignores the blocks that make things visual.**

The single clearest example is the "Pilna Darba Plūsma" section (full workflow). It's a 10-step process documented as:

```
paragraph: "1. Izveidot projektu"
list: [step 1a, step 1b, step 1c, step 1d, step 1e]
paragraph: "2. Augšupielādēt VVAIS Atskaiti"
list: [step 2a, step 2b, ...]
... repeated 10 times
```

The `steps` block with numbered circles already exists and renders beautifully. That entire section should be one `steps` block. Same issue appears throughout — workflows written as paragraph+list when `steps` is available.

Similarly: the 4 inventory types (Foto, Video, Skaņas, Tekstuāls) are documented as 4× heading+paragraph+list. A single `table` would let the user compare them in one glance.

---

## Suggestions

### 1. ~~ONE SMALL CODE CHANGE~~ — Enhance `steps` to support detail text — IMPLEMENTED

> **STATUS: ALREADY IMPLEMENTED** (June 10 refactor). Help.js lines 220-238 implement the `{text, detail}` object step exactly as described below. Help.css line 549 defines `.help-step-detail`. The `workflow` section of helpConstants.js already uses `{text, detail}` objects. No action needed for the code change itself.

The `steps` block currently accepts only plain strings. Adding optional detail text per step allows a full workflow to be written compactly:

```js
// Current (strings only):
{ type: 'steps', steps: ['Noklikšķiniet Izveidot', 'Aizpildiet formu', 'Saglabājiet'] }

// Enhanced (strings OR objects — fully backward compatible):
{
    type: 'steps',
    steps: [
        { text: 'Augšupielādējiet VVAIS atskaiti', detail: 'Velciet .xlsx failu vai noklikšķiniet' },
        { text: 'Pārbaudiet importētos inventārus', detail: 'Veidi un datumi jāpārbauda manuāli' },
        { text: 'Pievienojiet parakstītājus', detail: 'Nepieciešami eksportam — skatiet nodaļu Parakstītāji' },
    ]
}
```

The implementation in Help.js and Help.css matches the code snippets shown below.

> **SEARCH INDEXER BUG (runtime):** Help.js line 88 search logic calls `s.toLowerCase()` directly on each step item. Because the `workflow` section already uses `{text, detail}` objects, calling `.toLowerCase()` on an object throws `TypeError: s.toLowerCase is not a function`, causing search to crash for any query that matches the workflow section. Fix: replace `item.steps.some(s => s.toLowerCase().includes(q))` with `item.steps.some(s => { const text = typeof s === 'object' ? ((s.text || '') + ' ' + (s.detail || '')) : (s || ''); return text.toLowerCase().includes(q); })`. This is a production bug — it silently breaks search.

**Change in Help.js** — inside the `steps` case, check if step is a string or object:
```js
case 'steps':
    return (
        <ol key={index} className="help-steps">
            {contentItem.steps.map((step, idx) => {
                const isObj = typeof step === 'object';
                return (
                    <li key={idx} className="help-step">
                        <span className="help-step-number">{idx + 1}</span>
                        <span className="help-step-content">
                            <span className="help-step-text">{isObj ? step.text : step}</span>
                            {isObj && step.detail && (
                                <span className="help-step-detail">{step.detail}</span>
                            )}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
```

**Change in Help.css** — 3 new lines:
```css
.help-step-content { display: flex; flex-direction: column; gap: 2px; }
.help-step-detail  { font-size: var(--font-size-xs); color: var(--text-muted); line-height: 1.4; }
```

That's the only code change needed. Everything else is content.

---

### 2. USE `ui-example` FOR A HIERARCHY DIAGRAM

Instead of describing the Project → Inventory → Item → Record → Files relationship in words, write it once as an HTML tree in a `ui-example` block and put it in the introduction section. The renderer already supports arbitrary HTML with app CSS.

Example HTML to use in a `ui-example` element:
```html
<div style="font-family:var(--font-family-mono);font-size:var(--font-size-sm);
            line-height:2;padding:12px;background:var(--color-background-light);
            border-radius:var(--border-radius-base);border:1px solid var(--border-color-light)">
  <div style="color:var(--color-primary);font-weight:600">
    📁 Projekts
  </div>
  <div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px">
    <div style="color:var(--text-primary)">📋 Uzskaites saraksts  <span style="color:var(--text-muted);font-size:11px">(grupē pēc veida)</span></div>
    <div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px">
      <div style="color:var(--text-primary)">📦 Glabājamā vienība  <span style="color:var(--text-muted);font-size:11px">(mape, lieta, sējums...)</span></div>
      <div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px">
        <div style="color:var(--text-primary)">📄 Dokuments  <span style="color:var(--text-muted);font-size:11px">(apraksta vienu dokumentu)</span></div>
        <div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px">
          <div style="color:var(--text-secondary)">📎 Faili  <span style="color:var(--text-muted);font-size:11px">(digitālie faili)</span></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

This goes in the introduction section before any paragraph text. No new component, no new CSS class.

---

### 3. REPLACE INVENTORY TYPES WALL-OF-TEXT WITH A TABLE

Currently: 4× heading + paragraph + list = hard to compare.

Replace with a single `table` block:

```js
{
    type: 'table',
    headers: ['Veids', 'Paredzēts', 'Failu formāti', 'Dokumenti uz GV'],
    rows: [
        ['Tekstuāls', 'Dokumenti, vēstules, atskaites', 'PDF, DOC, DOCX, JPG, PNG, GIF, BMP', 'Vairāki'],
        ['Foto',      'Fotoattēli',                     'JPG, PNG, GIF, BMP',             'Viens'],
        ['Video',     'Video materiāli',                 'MP4, AVI, MOV, WMV, MKV',        'Viens'],
        ['Skaņas',   'Audio dokumenti',                  'MP3, WAV, AAC, OGG, M4A',        'Viens'],
    ]
}
```

One table vs. 60+ lines of repeated structure. The existing table CSS already handles this perfectly.

---

### 4. USE `accordion` FOR EDGE CASES IN EVERY SECTION

> **CORRECTION (June 2026):** The original claim that accordion was "never used" is no longer accurate. As of the June 10 refactor, `accordion` is used in 2 places in helpConstants.js: one inside the `create-project-form` section ("Bieži sastopamās problēmas ar projekta direktoriju", line 447) and one inside the `upload-vvais-report` section (line 627). The suggestion to use it more widely remains valid.

The `accordion` block type exists and is CSS-styled. Every major section currently squeezes everything into the main flow. Edge cases and "what if" content should go into accordions so the main flow stays readable.

Pattern — add at the end of relevant sections:
```js
{
    type: 'accordion',
    title: 'Bieži sastopamās problēmas',
    content: [
        { type: 'paragraph', text: 'Ja direktorija nav pieejama...' },
        { type: 'note', style: 'info', content: [{ type: 'paragraph', text: '...' }] }
    ]
},
{
    type: 'accordion',
    title: 'Ko darīt, ja VVAIS fails netiek pieņemts?',
    content: [
        { type: 'list', items: ['Pārbaudiet faila formātu (.xlsx)', 'Pārliecinieties ka fails nav atvērts Excel'] }
    ]
}
```

Good candidates for accordions: VVAIS upload errors, project deletion edge cases, date validation rules, file format questions, Verification error explanations.

---

### 5. SPLIT THE LONG SECTIONS

Three sections are too long to be useful as single pages:

**"Pilna Darba Plūsma"** — currently 1 giant section with 10 steps × 5 list items each. Should be:
- 1 overview section with a `steps` block (all 10 steps, each with a 1-line detail)
- Users who need more detail on step X go to the relevant chapter

**"Institūcijas Parakstītāji"** — currently 12 `heading` blocks inside one section. Should be 2 sections:
- "Kā pievienot parakstītājus" (the form and save flow)
- "Kāpēc parakstītāji ir nepieciešami" (why + editing later)

**"Uzskaites Saraksta Izveide"** — the form fields section with 5× heading+paragraph+list. Should use the table block for field reference, then `steps` for the submission sequence.

---

### 6. ~~FIX THE NOTE ICON GAP~~ — IMPLEMENTED

> **STATUS: ALREADY IMPLEMENTED** (June 10 refactor). Help.js lines 165-176 already implement note icons. The `noteIcons` map `{error: 'fa-exclamation-circle', info: 'fa-info-circle', '': 'fa-exclamation-triangle'}` and `<i className={`fas ${noteIcon} help-note-icon`}>` render are present. Help.css lines 422-430 define `.help-note-icon` and `.help-note-box.error`/`.info` overrides. The code snippets shown below match what was actually built.

The `note` blocks previously differentiated visually via border-left color only. An icon was added to each style to make the type immediately obvious at a glance without reading. The implementation matches the suggestion below.

In `Help.js`, the `note` case render now uses:
```jsx
case 'note':
    const noteIcons = { error: 'fa-exclamation-circle', info: 'fa-info-circle', '': 'fa-exclamation-triangle' };
    const icon = noteIcons[contentItem.style || ''];
    return (
        <div key={index} className={`help-note-box ${contentItem.style || ''}`}>
            <i className={`fas ${icon} help-note-icon`}></i>
            <div className="help-note-content">
                {contentItem.content.map((item, idx) => renderContent(item, `${index}-${idx}`))}
            </div>
        </div>
    );
```

In `Help.css`:
```css
.help-note-box        { display: flex; gap: var(--spacing-3); align-items: flex-start; }
.help-note-icon       { margin-top: 2px; flex-shrink: 0; color: var(--color-warning); }
.help-note-box.error  .help-note-icon { color: var(--color-error); }
.help-note-box.info   .help-note-icon { color: var(--color-info); }
.help-note-content    { flex: 1; }
```

---

## Summary: What to Tell OPUS

**Both code changes are already done. Four content rules remain.**

**Code changes — both IMPLEMENTED as of June 10 refactor:**
1. ~~Enhance `steps` to accept `{ text, detail }` objects~~ — DONE (Help.js lines 220-238)
2. ~~Add icons to `note` boxes~~ — DONE (Help.js lines 165-176, Help.css lines 422-430)

**Outstanding bug to fix before expanding search coverage:**
- Help.js line 88 search indexer calls `s.toLowerCase()` on step items that are now objects in the `workflow` section — this throws a `TypeError` at runtime. Fix the indexer before adding any more `{text, detail}` steps to content (see section 1 above for the fix).

**Content rules for all writing:**
1. **Any workflow = `steps` block**, never `paragraph` + numbered `list`. Use the `detail` field for one-line context per step.
2. **Any comparison of types/options = `table` block**, never repeated `heading` + `list` patterns.
3. **Edge cases and "what if" = `accordion`**. Main section flow stays under ~8 blocks. Accordion for the rest. (Already used in 2 places — extend the pattern.)
4. **Hierarchy shown once** in the introduction via a `ui-example` HTML tree, then referenced with text only.

**Everything else already works.** No new React components. No new CSS classes beyond the above. The `ui-example` block handles any visual that can be expressed in HTML — and that covers everything actually needed.

# Help Section — Suggestions Based on Current Implementation

> Investigation of the actual code (Help.js, Help.css, helpConstants.js — 3,571 lines of content).
> Goal: make the help clearer and easier to understand without overcomplicating.

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
| `accordion` | Collapsible section | Exists but **never used** |
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

### 1. ONE SMALL CODE CHANGE — Enhance `steps` to support detail text

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
        <div style="color:var(--text-primary)">📄 Ieraksts  <span style="color:var(--text-muted);font-size:11px">(apraksta vienu dokumentu)</span></div>
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
    headers: ['Veids', 'Paredzēts', 'Failu formāti', 'Ieraksti uz GV'],
    rows: [
        ['Tekstuāls', 'Dokumenti, vēstules, atskaites', 'PDF, DOC, DOCX, JPG, PNG, TIF', 'Vairāki'],
        ['Foto',      'Fotoattēli',                     'JPG, PNG, GIF, BMP, TIFF',       'Viens'],
        ['Video',     'Video materiāli',                 'MP4, AVI, MOV, WMV, MKV',        'Viens'],
        ['Skaņas',   'Audio ieraksti',                  'MP3, WAV, AAC, OGG, FLAC',       'Viens'],
    ]
}
```

One table vs. 60+ lines of repeated structure. The existing table CSS already handles this perfectly.

---

### 4. USE `accordion` FOR EDGE CASES IN EVERY SECTION

The `accordion` block type exists, is CSS-styled, and has never been used in content. Every major section currently squeezes everything into the main flow. Edge cases and "what if" content should go into accordions so the main flow stays readable.

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

### 6. FIX THE NOTE ICON GAP (OPTIONAL — VISUAL QUALITY)

The `note` blocks differentiate visually via border-left color only. Adding an icon to each style makes the type immediately obvious at a glance without reading.

In `Help.js`, replace the `note` case render:
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

In `Help.css`, add:
```css
.help-note-box        { display: flex; gap: var(--spacing-3); align-items: flex-start; }
.help-note-icon       { margin-top: 2px; flex-shrink: 0; color: var(--color-warning); }
.help-note-box.error  .help-note-icon { color: var(--color-error); }
.help-note-box.info   .help-note-icon { color: var(--color-info); }
.help-note-content    { flex: 1; }
```

---

## Summary: What to Tell OPUS

**Two code changes, four content rules.**

**Code changes (both small):**
1. Enhance `steps` to accept `{ text, detail }` objects — ~10 lines in Help.js + 2 in Help.css
2. Add icons to `note` boxes — ~8 lines in Help.js + 5 in Help.css

**Content rules for all writing:**
1. **Any workflow = `steps` block**, never `paragraph` + numbered `list`. Use the `detail` field for one-line context per step.
2. **Any comparison of types/options = `table` block**, never repeated `heading` + `list` patterns.
3. **Edge cases and "what if" = `accordion`**. Main section flow stays under ~8 blocks. Accordion for the rest.
4. **Hierarchy shown once** in the introduction via a `ui-example` HTML tree, then referenced with text only.

**Everything else already works.** No new React components. No new CSS classes beyond the above. The `ui-example` block handles any visual that can be expressed in HTML — and that covers everything actually needed.

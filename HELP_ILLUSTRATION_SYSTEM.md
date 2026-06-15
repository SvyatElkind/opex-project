# OPEX Help — Illustration System Design

> **For OPUS.** This document defines a complete visual content system for the Help section. It specifies new block types, their data schemas (how to write them in `helpConstants.js`), what they render to (ASCII mockups), the CSS classes needed, and a chapter-by-chapter plan for what goes where. Read this alongside `HELP_CONTENT_SPEC.md`.
>
> **Last updated: 2026-06-12** — Reconciled against June 10 Help refactor. **None of the 8 new block types in this document were implemented by that refactor.** All 8 are pending future work. The CSS variable names in the code snippets below have been corrected against the actual `theme.css` — the original `*-faint` variable names do not exist in the codebase (see CSS section for details).

---

## THE PROBLEM WITH THE CURRENT HELP SECTION

The existing block types — `paragraph`, `list`, `note`, `steps`, `table`, `accordion`, `ui-example`, `color-palette` — are all **text containers**. They make content readable but not *navigable* or *visual*. An archivist who opens Help to answer "what order do I do things in?" or "what does this error mean?" gets paragraphs. They need pictures.

Three specific failures:

1. **No spatial orientation.** The user cannot see where a topic fits in the overall workflow. Is "creating a record" step 3 or step 7? Help doesn't show them.

2. **No relationship diagrams.** "An item belongs to an inventory which belongs to a fond" is hard to hold in memory as text. A picture takes two seconds.

3. **No error→fix connection.** Errors appear in Verification with a short message. The help must connect that exact message to a cause and a fix — formatted so the user can scan it in 10 seconds, not read for 2 minutes.

---

## DESIGN PRINCIPLES

These principles govern every illustration decision:

**1. Orient before detail.**
Every chapter and every major workflow section must begin by showing where it sits in the big picture. A workflow bar or hierarchy diagram comes first — content comes second.

**2. One concept = one visual unit.**
Don't describe a form field in prose. Don't describe a relationship in a list. Don't describe a workflow in a paragraph. Each has a dedicated block type that makes it instantly readable.

**3. The user's question is "what do I do next?" — answer it visually.**
The primary use of Help is troubleshooting and orientation, not reference reading. The design must support scanning, not just reading.

**4. Match the app's visual language.**
Use the same icons, colors, and terminology as the application. If Verification shows `❌`, Help shows `❌`. If the app uses the term "Glabājamā vienība", Help uses it too (with translation in parentheses on first use only).

**5. No walls of text before the first visual.**
If a section's first content block is a paragraph, it is wrong. Every section must open with orientation (a workflow bar, a hierarchy snippet, a prerequisite block, or a comparison) before any paragraph text.

---

## NEW BLOCK TYPES — NOT YET IMPLEMENTED

> **Implementation status (verified 2026-06-12):** None of the 8 block types below exist in `Help.js`'s `renderContent` switch. The switch currently handles only: `paragraph`, `list`, `note`, `code`, `heading`, `table`, `steps`, `accordion`, `ui-example`, `color-palette`. None of these 8 types are used anywhere in `helpConstants.js`. The June 10 refactor did not implement them. All 8 are pending future implementation.

The following 8 new block types must be added to `Help.js` (new cases in `renderContent`) and `Help.css` (new CSS classes). Each entry below specifies:

- **What it is** — the concept
- **When to use it** — the rule for authors
- **Data schema** — the exact JSON structure in `helpConstants.js`
- **Renders as** — an ASCII mockup of the output
- **CSS class** — the root CSS class to implement

---

### BLOCK TYPE 1 — `workflow-bar` — NOT IMPLEMENTED (pending)

**What it is:** A horizontal strip showing all major steps of the main workflow (or any multi-step process), with one step highlighted as "current" and earlier steps marked as completed.

**When to use it:** At the start of every chapter that covers a step in the main workflow (Projects, Inventories, Items, Records, Files, Verification, Export). Not for sub-concepts.

**Data schema:**
```js
{
    type: 'workflow-bar',
    steps: [
        { label: 'Projekts', icon: 'fa-folder-open' },
        { label: 'VVAIS', icon: 'fa-file-excel' },
        { label: 'Inventāri', icon: 'fa-list-ul' },
        { label: 'Vienības', icon: 'fa-box-archive' },
        { label: 'Ieraksti', icon: 'fa-file-lines' },
        { label: 'Faili', icon: 'fa-paperclip' },
        { label: 'Pārbaude', icon: 'fa-circle-check' },
        { label: 'Eksports', icon: 'fa-download' },
    ],
    currentStep: 3,   // 0-indexed; this step is highlighted
    // Steps before currentStep are rendered as "done"; after as "upcoming"
}
```

**Renders as:**
```
  ✅         ✅         ✅        ▶ NOW          ○          ○          ○          ○
┌──────┐  ┌──────┐  ┌──────┐  ╔══════╗  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  📁  │──│  📊  │──│  📋  │──║  📦  ║──│  📄  │──│  📎  │──│  ✓   │──│  ⬇  │
└──────┘  └──────┘  └──────┘  ╚══════╝  └──────┘  └──────┘  └──────┘  └──────┘
Projekts   VVAIS   Inventāri  Vienības  Ieraksti   Faili    Pārbaude  Eksports
```

**CSS class:** `.help-workflow-bar`

Implementation notes:
- Done steps: muted color with checkmark overlay
- Current step: primary color, slightly larger, bold label, small "Jūs esat šeit" label above
- Upcoming steps: light gray, dashed border
- Responsive: on narrow screens, collapse to "Step 3 of 8: Vienības ▸"

---

### BLOCK TYPE 2 — `hierarchy` — NOT IMPLEMENTED (pending)

**What it is:** A visual tree diagram showing the data hierarchy (Project → Institution/Fond → Inventory → Item → Record → Files), with each level showing its icon, its Latvian name, its English name, and a one-line description. The current level (the one the section is about) is visually emphasized.

**When to use it:** In the introduction of each chapter covering a hierarchy level (Inventories, Items, Records, Files), and once in the Introduction chapter as the full overview.

**Data schema:**
```js
{
    type: 'hierarchy',
    highlightLevel: 'item',   // which node to emphasize: 'project'|'inventory'|'item'|'record'|'file'
    // The tree structure is hardcoded in the renderer — authors only set which to highlight.
    // Optionally, show a count hint:
    caption: 'Vienā inventārā var būt vairākas glabājamās vienības'
}
```

**Renders as:**
```
  📁 PROJEKTS (Project)
  │   Darba konteksts — visi inventāri un faili
  │
  ├── 🏛 IESTĀDE           🗂 FONDS
  │   Izveidotājs/Parakst.  Arhīva fonds
  │
  └── 📋 INVENTĀRS (Inventory)
       │   Dokumentu grupas pēc veida
       │
       └── ▶▶ 📦 GLABĀJAMĀ VIENĪBA (Item)  ◀◀  ← highlighted
                │   Viena arhīva vienība (mape, sējums...)
                │
                └── 📄 IERAKSTS (Record)
                     │   Metadatu apraksts
                     │
                     └── 📎 FAILI (Files)
                              Digitālie faili
```

**CSS class:** `.help-hierarchy`

Implementation notes:
- The tree is rendered as nested divs with CSS border-left lines (not an SVG)
- The highlighted node has a primary-color left border and background tint
- All other nodes render in subdued color
- Caption appears below the tree in italic

---

### BLOCK TYPE 3 — `field-card` — NOT IMPLEMENTED (pending)

**What it is:** A compact card documenting one form field. More information than a table row, more scannable than a paragraph. Groups all relevant information about a field into one visual unit.

**When to use it:** In chapters covering form-heavy workflows (Items, Records). Use a sequence of `field-card` blocks to document each field in a form section. Do NOT use tables for field documentation — use field-cards.

**Data schema:**
```js
{
    type: 'field-card',
    field: 'Nosaukums',          // label as it appears in the app (LV)
    fieldEn: 'Title',            // English translation
    required: true,              // shows a required badge if true
    dataType: 'Teksts',          // Teksts | Datums | Skaitlis | Izvēle | Daudzvalodu | Birka
    maxLength: 255,              // null if no limit
    defaultValue: null,          // null | 'From preset' | a specific value
    description: 'Dokumenta nosaukums, kā tas parādīsies arhīva ierakstā.',
    validation: [
        'Nedrīkst būt tukšs',
        'Maksimums 255 simboli',
    ],
    example: 'Rīgas pilsētas domes 1923. gada budžeta atskaite',
    warning: null,               // or a string with a specific caution
}
```

**Renders as:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📋  Nosaukums  (Title)                          [OBLIGĀTS]  │
├─────────────────────────────────────────────────────────────┤
│ Veids: Teksts    Maks: 255 simboli    Noklusējums: —        │
│                                                             │
│ Dokumenta nosaukums, kā tas parādīsies arhīva ierakstā.    │
│                                                             │
│ Piemērs: "Rīgas pilsētas domes 1923. gada budžeta atskaite"│
│                                                             │
│ ✓ Nedrīkst būt tukšs                                       │
│ ✓ Maksimums 255 simboli                                     │
└─────────────────────────────────────────────────────────────┘
```

If `required: false`:
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷  Atslēgvārdi  (Keywords)                  [NEOBLIGĀTS]  │
│  ...                                                        │
```

If `warning` is present, an amber callout appears at the bottom of the card.

**CSS class:** `.help-field-card`

Implementation notes:
- Required badge: red/orange background, white text, small caps
- Optional badge: gray background
- Example value renders in monospace inside quotes
- Validation items render with a small ✓ prefix in green

---

### BLOCK TYPE 4 — `comparison` — NOT IMPLEMENTED (pending)

**What it is:** A two-column side-by-side block comparing two approaches, options, or states. Each column has a title, a list of pros/cons or characteristics, and an optional recommendation badge.

**When to use it:** When the user must choose between two options (VVAIS import vs. manual; long-term vs. permanent storage; textual vs. media inventory type; Table view vs. Card view). Never use prose to explain a binary choice.

**Data schema:**
```js
{
    type: 'comparison',
    title: 'Kā pievienot inventāru?',   // optional heading above the comparison
    left: {
        label: 'VVAIS pārskata imports',
        icon: 'fa-file-excel',
        badge: 'Ieteicamais',            // null | string — shown as a colored badge on this column
        badgeStyle: 'success',           // 'success' | 'info' | 'warning'
        points: [
            { positive: true,  text: 'Ātrāk — automātiski izveido inventārus un vienības' },
            { positive: true,  text: 'Numuri un nosaukumi tiek importēti no VVAIS' },
            { positive: false, text: 'Nepieciešams .xlsx fails no VVAIS sistēmas' },
            { positive: false, text: 'Darbojas tikai ar tekstuāliem inventāriem' },
        ]
    },
    right: {
        label: 'Manuāla izveide',
        icon: 'fa-pencil',
        badge: null,
        points: [
            { positive: true,  text: 'Pilnīga kontrole pār visiem laukiem' },
            { positive: true,  text: 'Darbojas ar visiem inventāra veidiem (foto, video, audio)' },
            { positive: false, text: 'Lēnāk — katrs lauks jāaizpilda manuāli' },
            { positive: false, text: 'Numurēšana jāveic pašam' },
        ]
    }
}
```

**Renders as:**
```
  Kā pievienot inventāru?
  ┌───────────────────────────────┐  ┌───────────────────────────────┐
  │  📊  VVAIS pārskata imports   │  │  ✏  Manuāla izveide           │
  │         ✅ IETEICAMAIS        │  │                               │
  ├───────────────────────────────┤  ├───────────────────────────────┤
  │ ✓  Ātrāk — automātiski...    │  │ ✓  Pilnīga kontrole...        │
  │ ✓  Numuri importēti no VVAIS │  │ ✓  Visi inventāra veidi       │
  │ ✗  Nepieciešams .xlsx fails  │  │ ✗  Lēnāk                      │
  │ ✗  Tikai tekstuāliem inv.    │  │ ✗  Numurēšana manuāla         │
  └───────────────────────────────┘  └───────────────────────────────┘
```

**CSS class:** `.help-comparison`

Implementation notes:
- ✓ points: green text, green checkmark icon
- ✗ points: red text, red X icon
- Recommended badge: success-green background, prominent
- Both columns equal width, flex layout

---

### BLOCK TYPE 5 — `annotated-screen` — NOT IMPLEMENTED (pending)

**What it is:** A wireframe representation of a UI area (drawn with HTML/CSS, not a screenshot) with numbered callout circles (①②③...) placed over key areas, and a numbered explanation list below. Teaches the user to recognize parts of the interface.

**When to use it:** For any UI area the user must navigate to perform a task — the main toolbar, the Verification modal, the record form, the project list. One annotated screen per major UI area (not one per section).

**Data schema:**
```js
{
    type: 'annotated-screen',
    title: 'Projektu saraksta panelis',
    // mockup: raw HTML string rendered into a container div
    // Use inline styles + app CSS classes; use the marker spans (see below)
    mockup: `
        <div class="help-mock-panel">
          <div class="help-mock-topbar">
            <span class="help-mock-title">Mani projekti</span>
            <span class="help-callout-marker">①</span>
          </div>
          <div class="help-mock-row selected">
            Projekts "Rīgas arhīvs 2024"
            <span class="help-callout-marker">②</span>
          </div>
          <div class="help-mock-row">Projekts "Jūrmalas pašvaldība"</div>
          <div class="help-mock-add-btn">
            + Jauns projekts <span class="help-callout-marker">③</span>
          </div>
        </div>
    `,
    callouts: [
        { marker: '①', text: 'Projektu saraksta virsraksts — rāda kopējo projektu skaitu' },
        { marker: '②', text: 'Aktīvais projekts — izcelta rinda; klikšķis to atlasa' },
        { marker: '③', text: '"Jauns projekts" poga — atver izveides dialogu' },
    ]
}
```

**Renders as:**
```
  Projektu saraksta panelis

  ┌─────────────────────────────────┐
  │  Mani projekti               ①  │
  │─────────────────────────────────│
  │ ▶ Projekts "Rīgas arhīvs"    ②  │   ← selected row (highlighted)
  │   Projekts "Jūrmalas pašv."     │
  │─────────────────────────────────│
  │  + Jauns projekts            ③  │
  └─────────────────────────────────┘

  ①  Projektu saraksta virsraksts — rāda kopējo projektu skaitu
  ②  Aktīvais projekts — izcelta rinda; klikšķis to atlasa
  ③  "Jauns projekts" poga — atver izveides dialogu
```

**CSS class:** `.help-annotated-screen`

Helper CSS classes for mockup elements (pre-built, so authors don't write much CSS):
- `.help-mock-panel` — a bordered panel container
- `.help-mock-topbar` — a gray header bar
- `.help-mock-row` — a list row with left padding
- `.help-mock-row.selected` — a row with primary-color left border and light background
- `.help-mock-btn` — a button mockup (non-interactive)
- `.help-mock-btn.primary` — primary-colored button
- `.help-mock-badge` — a small badge/pill
- `.help-mock-icon` — an icon placeholder circle
- `.help-callout-marker` — the ① ② ③ circle; positioned with the marker

---

### BLOCK TYPE 6 — `prerequisite` — NOT IMPLEMENTED (pending)

**What it is:** A "Before you begin" checklist shown at the start of any workflow section that requires prior work to be done. Each item either checks something the user must have completed, or states something the system must be in.

**When to use it:** At the start of any section describing a workflow that depends on earlier steps. E.g., creating a record requires an item to exist; generating OPEX requires Verification to pass.

**Data schema:**
```js
{
    type: 'prerequisite',
    title: 'Pirms sākat',           // optional; defaults to 'Pirms sākat'
    items: [
        { text: 'Projekts ir izveidots',        done: true  },
        { text: 'VVAIS pārskats ir augšupielādēts', done: true  },
        { text: 'Inventārs ir izveidots',       done: true  },
        { text: 'Glabājamā vienība ir izveidota', done: false },  // this is what the current section creates
    ],
    note: 'Ja vienība vēl nav izveidota, vispirms skatiet nodaļu "Vienības izveide".'
}
```

**Renders as:**
```
  ╔═══════════════════════════════════════════════════╗
  ║  📋  Pirms sākat                                  ║
  ╠═══════════════════════════════════════════════════╣
  ║  ✅  Projekts ir izveidots                        ║
  ║  ✅  VVAIS pārskats ir augšupielādēts             ║
  ║  ✅  Inventārs ir izveidots                       ║
  ║  ○   Glabājamā vienība ir izveidota   ← šī sadaļa ║
  ╠═══════════════════════════════════════════════════╣
  ║  ℹ  Ja vienība vēl nav izveidota...              ║
  ╚═══════════════════════════════════════════════════╝
```

**CSS class:** `.help-prerequisite`

Implementation notes:
- Done items: green checkmark icon, muted text
- Current item (done: false, last in list): primary-colored circle icon, bold text, labeled "← šī sadaļa" (this section)
- The note at the bottom links to the relevant section if possible
- The whole block has a left border in info-blue

---

### BLOCK TYPE 7 — `error-fix` — NOT IMPLEMENTED (pending)

**What it is:** A two-part card: the top shows the exact error message as it appears in the Verification panel (styled to match), and the bottom shows the cause and a numbered fix. Bridges the gap between "I see this error" and "I know what to do."

**When to use it:** In Chapter 8 (Verification) for every common error and warning. Also usable inline in other chapters when a specific action might produce a known error.

**Data schema:**
```js
{
    type: 'error-fix',
    errorMessage: 'Ierakstam nav pievienotu failu',  // exact text from the app
    severity: 'error',        // 'error' | 'warning'
    cause: 'Ieraksts ir atzīmēts kā elektronisks, bet tam nav pievienots neviens fails.',
    fix: [
        'Atveriet vienību, kurā atrodas šis ieraksts',
        'Noklikšķiniet uz ieraksta, lai atvērtu tā detaļas',
        'Pārejiet uz cilni "Faili"',
        'Pievienojiet vismaz vienu digitālo failu',
    ],
    canDismiss: false,   // if true, add note "Šo brīdinājumu var noliegt, ja..."
    dismissWhen: null,   // string: when dismissing is acceptable
}
```

**Renders as:**
```
  ┌─────────────────────────────────────────────────────────────┐
  │ ❌  KĻŪDA                                                   │
  │────────────────────────────────────────────────────────────│
  │     Ierakstam nav pievienotu failu                          │
  │     (tieši šāds teksts parādās pārbaudes logā)             │
  ├─────────────────────────────────────────────────────────────┤
  │ Iemesls                                                     │
  │ Ieraksts ir atzīmēts kā elektronisks, bet tam nav           │
  │ pievienots neviens fails.                                   │
  │                                                             │
  │ Labojums                                                    │
  │  1.  Atveriet vienību, kurā atrodas šis ieraksts            │
  │  2.  Noklikšķiniet uz ieraksta                              │
  │  3.  Pārejiet uz cilni "Faili"                              │
  │  4.  Pievienojiet vismaz vienu digitālo failu               │
  └─────────────────────────────────────────────────────────────┘
```

For warnings (`severity: 'warning'`), the top bar is amber instead of red, and shows "⚠ BRĪDINĀJUMS" with a note about dismissal if `canDismiss: true`.

**CSS class:** `.help-error-fix`

---

### BLOCK TYPE 8 — `decision-tree` — NOT IMPLEMENTED (pending)

**What it is:** A simple branching guide for choosing between paths. "If condition A → do this. If condition B → do that." Visually distinct from a comparison (which weighs pros/cons) — this is about decision routing.

**When to use it:** When users face a genuine fork: "Do I have a VVAIS report?", "Is my inventory textual or media?", "Is the item electronic or physical?". At most 3 levels deep.

**Data schema:**
```js
{
    type: 'decision-tree',
    question: 'Vai jums ir VVAIS pārskata fails (.xlsx)?',
    branches: [
        {
            condition: 'Jā — man ir .xlsx fails',
            icon: 'fa-check',
            style: 'yes',     // 'yes' | 'no' | 'maybe'
            outcome: 'Izmantojiet VVAIS pārskata importu — ātrāk un automātiski.',
            action: 'Skatiet sadaļu: "VVAIS pārskata augšupielāde"',
            // Optionally, nest a sub-decision:
            subTree: null
        },
        {
            condition: 'Nē — man nav šāda faila',
            icon: 'fa-times',
            style: 'no',
            outcome: 'Izveidojiet inventārus manuāli — tas aizņem vairāk laika.',
            action: 'Skatiet sadaļu: "Inventāra izveide manuāli"',
            subTree: null
        }
    ]
}
```

**Renders as:**
```
  ❓  Vai jums ir VVAIS pārskata fails (.xlsx)?
        │
        ├── ✅  JĀ — man ir .xlsx fails
        │       → Izmantojiet VVAIS pārskata importu — ātrāk un automātiski.
        │       📖 Skatiet sadaļu: "VVAIS pārskata augšupielāde"
        │
        └── ❌  NĒ — man nav šāda faila
                → Izveidojiet inventārus manuāli — tas aizņem vairāk laika.
                📖 Skatiet sadaļu: "Inventāra izveide manuāli"
```

**CSS class:** `.help-decision-tree`

---

## SECTION TEMPLATE

Every section in `helpConstants.js` must follow this order of blocks. Skip inapplicable types; do not add new types in different positions.

```
1. workflow-bar          (if this section is part of the 8-step main workflow)
2. hierarchy             (if this section is about a hierarchy level)
3. prerequisite          (if this workflow requires prior steps)
4. paragraph             (1–2 sentences of plain-language intro — the ONLY prose before visuals)
5. annotated-screen      (if there's a relevant UI area to show)
6. comparison OR         (if the user faces a binary/ternary choice)
   decision-tree
7. steps                 (the numbered how-to sequence)
8. field-card × N        (one per form field, if the section involves a form)
9. note [style: warning] (for irreversible actions — dzēšana, etc.)
10. error-fix × N        (for known errors from this workflow)
11. accordion            (for advanced details, edge cases, FAQ)
```

Do not put a `paragraph` block before the `workflow-bar` or `hierarchy`. The visual orientation must come first.

---

## CHAPTER-BY-CHAPTER ILLUSTRATION PLAN

For each chapter: which new blocks to use, where, and the specific content they should carry.

---

### Chapter 1 — Ievads (Introduction)

**Section 1.1 — Kas ir OPEX rīks?**
- `hierarchy` (full tree, no highlight) — show the entire hierarchy at once, first thing
- `workflow-bar` (all 8 steps, currentStep: -1 = none highlighted = overview mode)
- 2× `paragraph` — what the tool does, who it's for

**Section 1.2 — Augstā līmeņa darba plūsma**
- `workflow-bar` (overview — each step labeled with what it produces)
- `steps` — the 8 steps written out
- For each step: one `field-card`-style mini-summary (or just bold + 1-line description in the steps)

**Section 1.3 — Pirmā palaišana**
- `prerequisite` — just the system requirement (Windows, disk space, nothing else)
- `annotated-screen` — the project creation dialog with ① name field ② directory field ③ create button
- `steps` — the first-launch sequence

**Section 1.4 — Navigācija**
- `annotated-screen` — the main application layout showing ① top menu ② left sidebar ③ main panel ④ breadcrumb
- `table` — keyboard shortcuts

---

### Chapter 2 — Projekti

**Section 2.1 — Kas ir projekts?**
- `hierarchy` (highlight: 'project')
- `paragraph` — 2 sentences max

**Section 2.2 — Projekta izveide**
- `workflow-bar` (currentStep: 0 — Projekts)
- `prerequisite` — nothing (this is step 1); just note "Šis ir pirmais solis"
- `annotated-screen` — the ProjectPopup with ① name field ② directory field ③ create button
- `steps` — creation sequence
- `field-card` — Projekta nosaukums (required, text, max 255)
- `field-card` — Direktorija (required, path, warning: must be valid Windows path)
- `note [style: info]` — "Direktorija glabās visus failus. Izvēlieties vietu ar pietiekamu brīvo vietu."

**Section 2.3 — Parakstnieki**
- `prerequisite` — Project must exist
- `annotated-screen` — signers popup with ① creator name ② creator position ③ signer name ④ signer position
- `field-card` × 4 — all signer fields
- `error-fix` — "Nav norādīti parakstnieki" (from Verification) — required for PN akts export

**Section 2.4 — Projekta dzēšana**
- `note [style: warning]` — THIS IS IRREVERSIBLE. All data will be deleted.
- `steps` — delete sequence
- `decision-tree` — "Vai tiešām vēlaties dzēst projektu? → Jā: steps / Nē: close"

---

### Chapter 3 — Inventāri

**Section 3.1 — Kas ir inventārs?**
- `hierarchy` (highlight: 'inventory')
- `paragraph` — 2 sentences

**Section 3.2 — Inventāra veidi**
- `table` — the 5 types with icon, LV name, EN name, what content it holds, whether it uses media record workflow
- `note [style: info]` — "Inventāra veidu nevar mainīt pēc izveides"

**Section 3.3 — VVAIS augšupielāde vs. manuāla izveide**
- `comparison` (left: VVAIS import [recommended]; right: manual creation) — this is the decision every user faces at the start

**Section 3.4 — VVAIS pārskata augšupielāde**
- `workflow-bar` (currentStep: 1 — VVAIS)
- `prerequisite` — Project exists, .xlsx file available
- `annotated-screen` — the UploadPopup with ① dropzone ② file type badge ③ upload button
- `steps` — upload sequence
- `error-fix` — "Faila formāts nav atbalstīts" (wrong file type)
- `error-fix` — "VVAIS fails ir bojāts vai nepareizā formātā"

**Section 3.5 — Manuāla inventāra izveide**
- `workflow-bar` (currentStep: 2 — Inventāri)
- `prerequisite` — Project exists
- `steps` — creation sequence
- `field-card` — Numurs (required)
- `field-card` — Nosaukums (required, 255)
- `field-card` — Veids (required, select from 5 options)
- `field-card` — Elektronisks (optional, toggle)
- `field-card` — Glabāšanas termiņš (required, select)
- `decision-tree` — "Kādu veidu izvēlēties?" with 5 branches mapping document type to inventory type

**Section 3.6 — Inventāra dzēšana**
- `note [style: warning]` — IRREVERSIBLE
- `steps`

---

### Chapter 4 — Vienības (Items)

**Section 4.1 — Kas ir glabājamā vienība?**
- `hierarchy` (highlight: 'item')
- `paragraph`

**Section 4.2 — Vienības izveide**
- `workflow-bar` (currentStep: 3 — Vienības)
- `prerequisite` — Project ✅, VVAIS or inventory ✅, Inventory selected ✅
- `annotated-screen` — the 6-tab form with tabs labeled and ① ② ③ on the first tab's key fields
- `steps` — "Click Create Item → Fill Section 1 → Next → ..."

Then one sub-section per form section (use `heading` blocks to separate):

**Sub-section: 1. pamata informācija**
- `field-card` — Numurs
- `field-card` — Nosaukums
- `field-card` — Sērijas kods

**Sub-section: 2. datumi**
- `field-card` — Sākuma datums
- `field-card` — Beigu datums
- `field-card` — Datuma precizitāte
- `note [style: warning]` — "Ierakstu datumi tiek pārbaudīti pret šo diapazonu"

**Sub-section: 3. tehniskā informācija**
- `field-card` — Lapu skaits (conditionally required for textual)
- `field-card` — Vienības mērs

**Sub-section: 4–6** — same pattern

**Section 4.3 — Vienības dzēšana**
- `note [style: warning]` — IRREVERSIBLE
- `steps`

---

### Chapter 5 — Ieraksti (Records)

**Section 5.1 — Kas ir ieraksts?**
- `hierarchy` (highlight: 'record')
- `comparison` — Tekstuālais ieraksts vs. Multivides ieraksts (left: textual 4-section form; right: media 2-step upload)

**Section 5.2 — Tekstuāla ieraksta izveide**
- `workflow-bar` (currentStep: 4 — Ieraksti)
- `prerequisite` — Inventory ✅, Item ✅, Inventory type is Tekstuāls ✅
- `annotated-screen` — the CreateDocumentRecord form with section tabs labeled

Then field-cards per section:

**1. pamata informācija:**
- `field-card` — Nosaukums (required)
- `field-card` — Datums (optional, with date-range warning note)
- `field-card` — Reģ. Nr. (optional)
- `field-card` — Valoda (optional, multi-select, from preset)
- `error-fix` — "Ieraksta datums ir ārpus vienības diapazona" (warning, dismissible)

**2. dokumenta informācija:**
- `field-card` × 5

**3. apraksts:**
- `field-card` × 3

**4. piekļuve:**
- `field-card` — Piekļuves ierobežojums
- `field-card` — Ierobežojuma beigu datums (conditional on restriction)
- `decision-tree` — "Kādu ierobežojuma veidu izvēlēties?" (3 branches: none/limited/classified with explanation of each)

**Section 5.3 — Multivides ierakstu izveide**
- `workflow-bar` (currentStep: 4 — Ieraksti)
- `prerequisite` — Inventory type is Foto/Video/Skaņas ✅, Files prepared ✅
- `steps` — 2-step process: upload first → then metadata
- `annotated-screen` — the upload step with ① dropzone ② accepted formats badge ③ upload button
- `comparison` — "Pieļaujamie failu formāti" table by inventory type (use table block instead)

---

### Chapter 6 — Faili (Files)

**Section 6.1 — Failu pievienošana**
- `workflow-bar` (currentStep: 5 — Faili)
- `prerequisite` — Record exists ✅
- `annotated-screen` — the Files tab showing ① add files button ② dropzone ③ table/card toggle ④ file row
- `steps` — upload sequence
- `note [style: info]` — "Nav failu izmēra ierobežojumu. Visi failu tipi ir pieļaujami."

**Section 6.2 — Failu dzēšana**
- `note [style: warning]` — "Dzēšot faila ierakstu, fiziskais fails uz diska NETIEK dzēsts. Tas paliek savā mapē."
- `steps` — single delete and batch delete

**Section 6.3 — Failu glabāšana uz diska**
- `hierarchy` variant showing the folder structure on disk (use `code` block for the tree)
- `note [style: warning]` — "Nepārvietojiet un nepārdēvējiet failus ārpus lietotnes. Tas izraisīs kļūdas pārbaudes laikā."

---

### Chapter 7 — Iestatījumi (Settings)

**Section 7.1 — Veidlapu noklusējumi (Presets)**
- `annotated-screen` — the presets panel with ① preset list ② active preset marker ③ default field values ④ save button
- `steps` — creating and activating a preset
- `note [style: info]` — "Noklusējumi tiek piemēroti automātiski, bet katra lauka vērtību var mainīt veidlapas aizpildīšanas laikā"

**Section 7.2 — Validācijas iestatījumi**
- `comparison` (3-way if possible, or two 2-way comparisons) — Mīksts vs. Normāls vs. Stingrs
- `table` — which rules each level enforces

---

### Chapter 8 — Pārbaude (Verification)

**Section 8.1 — Kāpēc un kad veikt pārbaudi?**
- `workflow-bar` (currentStep: 6 — Pārbaude)
- `note [style: info]` — "Pārbaudi var veikt jebkurā brīdī, ne tikai beigās. Ieteicams veikt to regulāri."

**Section 8.2 — Pārskata cilne (Overview tab)**
- `annotated-screen` — the Overview tab with ① readiness status ② statistics panel ③ quick action buttons
- `paragraph` — explain readiness status (Gatavs / Nav gatavs)

**Section 8.3 — Koku skats (Tree view)**
- `annotated-screen` — the tree view with ① filter buttons ② expand/collapse ③ error badge ④ node click to navigate ⑤ "Show errors" button

**Section 8.4 — Statusa ikonu leģenda (Status icons)**
New utility: use a `table` with icon column, name column, meaning column:

```
| Ikona | Nosaukums   | Nozīme                                    |
|-------|-------------|-------------------------------------------|
|  ✅   | Kārtībā    | Visi obligātie lauki ir aizpildīti        |
|  ⚠️   | Brīdinājums | Neobligāti lauki trūkst vai datums ārpus  |
|  ❌   | Kļūda       | Bloķējoša problēma — eksports nav iespēj  |
```

**Section 8.5 — Brīdinājumu atcelšana**
- `decision-tree` — "Vai drīkst noliegt šo brīdinājumu?" with branches based on whether the warning is about missing optional data vs. something truly absent

**Section 8.6 — Biežākās kļūdas**
One `error-fix` block per error. Minimum 8 errors documented:
1. "Ierakstam nav pievienotu failu"
2. "Ieraksta datums ir ārpus vienības diapazona"
3. "Nosaukums tukšs"
4. "Nav parakstnieku"
5. "Fails nav atrodams"
6. "Nav ierakstu šajā vienībā"
7. "Vienībai nav norādīts lapu skaits"
8. "Elektroniska vienība bez failiem"

---

### Chapter 9 — Eksports (Export)

**Section 9.1 — Pirms eksporta (Before exporting)**
- `workflow-bar` (currentStep: 7 — Eksports)
- `prerequisite` — full checklist: Signers ✅, Verification passed ✅, At least one inventory ✅

**Section 9.2 — PN akts eksports**
- `comparison` — Elektroniskais akts vs. Fiziskais akts
- `steps`
- `annotated-screen` — the export popup with ① type selector ② generate button

**Section 9.3 — OPEX pakotnes ģenerēšana**
- `comparison` — Ilgstoši glabājamās vs. Pastāvīgi glabājamās (what's different in the output)
- `steps`
- `annotated-screen` — the progress modal with ① progress bar ② current step label ③ counts ④ minimize button
- `error-fix` — generation failure error (generic, pointing to Verification)

---

### Chapter 10 — Ceļvedis (Roadmap / SmartGuide)

**Section 10.1 — Kas ir ceļvedis?**
- `annotated-screen` — the SmartGuide card sidebar with ① route name ② progress bars ③ missing count ④ action suggestion

**Section 10.2 — Maršruta izveide**
- `comparison` — Vadīts režīms (Guided, 5 steps) vs. Eksperta režīms (Expert, 2 steps)
- `steps` — guided mode sequence
- `steps` — expert mode sequence

---

### Chapter 11 — Problēmu risināšana (Troubleshooting)

All entries use `error-fix` blocks.

Additionally:
- `decision-tree` — "Kāda veida problēma?" with 4 branches: import fails / verification errors / export fails / application behavior
- Each branch of the tree lists 2–3 `error-fix` entries

---

### Chapter 12 — Glosārijs (Glossary)

- `table` — Term (LV) | Term (EN) | Definition (one row per term, A–Z order)
- No other block types needed here

---

## CSS IMPLEMENTATION GUIDE

All new CSS goes into `Help.css`. Use the existing CSS variable system (`--color-primary`, `--color-error`, `--color-warning`, `--color-success`, `--text-primary`, `--border-radius-base`, etc.). Do not hardcode colors.

> **CSS VARIABLE CORRECTION (verified 2026-06-12 against theme.css):** The original code snippets in this section referenced `*-faint` CSS variables (`--color-success-faint`, `--color-primary-faint`, `--color-background-alt`, `--color-info-faint`, `--color-error-faint`, `--color-warning-faint`). **None of these exist in `theme.css`.** Using them produces transparent/invisible output. The corrected variable names have been applied to all snippets below. Rules for replacement:
> - Where `--color-*-faint` was used for a tinted background: use `rgba(var(--color-*-rgb), 0.10)` (as Help.css itself does, e.g. `rgba(var(--color-warning-rgb), 0.12)`)
> - Where `--color-background-alt` was used: use `--color-background-light` or `--color-background-medium` (both defined in theme.css)
> - `--color-primary-faint` in highlighted nodes: use `rgba(var(--color-primary-rgb), 0.10)`
> - `--font-size-xs`, `--font-size-sm`, `--font-size-base` are defined in theme.css and may be used as-is

### `.help-workflow-bar`
```css
.help-workflow-bar {
    display: flex;
    align-items: flex-start;
    gap: 0;
    margin: 20px 0;
    overflow-x: auto;
}
.help-workflow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    min-width: 70px;
}
.help-workflow-step-icon {
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    border: 2px solid transparent;
}
.help-workflow-step.done .help-workflow-step-icon {
    background: rgba(var(--color-success-rgb), 0.10);
    border-color: var(--color-success);
    color: var(--color-success);
}
.help-workflow-step.current .help-workflow-step-icon {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
    transform: scale(1.15);
}
.help-workflow-step.upcoming .help-workflow-step-icon {
    background: var(--color-background-light);
    border-color: var(--border-color-light);
    color: var(--text-muted);
}
/* Connector line between steps */
.help-workflow-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 20px; left: calc(50% + 20px);
    width: calc(100% - 40px); height: 2px;
    background: var(--border-color-light);
}
.help-workflow-step.done:not(:last-child)::after {
    background: var(--color-success);
}
.help-workflow-step-label {
    font-size: 11px;
    margin-top: 6px;
    text-align: center;
    color: var(--text-secondary);
}
.help-workflow-step.current .help-workflow-step-label {
    color: var(--color-primary);
    font-weight: 600;
}
.help-workflow-current-label {
    font-size: 10px;
    color: var(--color-primary);
    margin-bottom: 2px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}
```

### `.help-hierarchy`
```css
.help-hierarchy {
    font-family: var(--font-family-mono, monospace);
    font-size: var(--font-size-sm);
    padding: 16px;
    background: var(--color-background-light);
    border-radius: var(--border-radius-base);
    border: 1px solid var(--border-color-light);
    margin: 16px 0;
    line-height: 1.8;
}
.help-hierarchy-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: var(--border-radius-sm);
    color: var(--text-secondary);
}
.help-hierarchy-node.highlighted {
    background: rgba(var(--color-primary-rgb), 0.10);
    border-left: 3px solid var(--color-primary);
    color: var(--text-primary);
    font-weight: 600;
}
.help-hierarchy-caption {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    font-style: italic;
    margin-top: 8px;
    font-family: var(--font-family-primary);
}
```

### `.help-field-card`
```css
.help-field-card {
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    margin: 12px 0;
    overflow: hidden;
}
.help-field-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--color-background-light);
    border-bottom: 1px solid var(--border-color-light);
}
.help-field-card-name {
    font-weight: 600;
    font-size: var(--font-size-base);
    color: var(--text-primary);
}
.help-field-card-en {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin-left: 6px;
}
.help-field-card-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.help-field-card-badge.required {
    background: rgba(var(--color-error-rgb), 0.10);
    color: var(--color-error);
    border: 1px solid var(--color-error);
}
.help-field-card-badge.optional {
    background: var(--color-background-light);
    color: var(--text-muted);
    border: 1px solid var(--border-color-light);
}
.help-field-card-body {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.help-field-card-meta {
    display: flex;
    gap: 16px;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}
.help-field-card-description {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    line-height: 1.5;
}
.help-field-card-example {
    font-family: var(--font-family-mono, monospace);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    padding: 4px 8px;
    background: var(--color-background);
    border-radius: var(--border-radius-sm);
    border-left: 3px solid var(--color-primary);
}
.help-field-card-validations {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.help-field-card-validation {
    font-size: var(--font-size-sm);
    color: var(--color-success);
    display: flex;
    align-items: center;
    gap: 6px;
}
```

### `.help-comparison`
```css
.help-comparison {
    margin: 16px 0;
}
.help-comparison-title {
    font-weight: 600;
    font-size: var(--font-size-base);
    color: var(--text-primary);
    margin-bottom: 10px;
}
.help-comparison-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.help-comparison-column {
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    overflow: hidden;
}
.help-comparison-column-header {
    padding: 12px;
    background: var(--color-background-light);
    border-bottom: 1px solid var(--border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.help-comparison-column-label {
    font-weight: 600;
    font-size: var(--font-size-sm);
}
.help-comparison-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 700;
    text-transform: uppercase;
}
.help-comparison-badge.success {
    background: rgba(var(--color-success-rgb), 0.10);
    color: var(--color-success);
}
.help-comparison-points {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.help-comparison-point {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: var(--font-size-sm);
    line-height: 1.4;
}
.help-comparison-point.positive { color: var(--text-primary); }
.help-comparison-point.negative { color: var(--text-secondary); }
.help-comparison-point-icon.positive { color: var(--color-success); }
.help-comparison-point-icon.negative { color: var(--color-error); }
```

### `.help-annotated-screen`
```css
.help-annotated-screen {
    margin: 16px 0;
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    overflow: hidden;
}
.help-annotated-screen-title {
    padding: 8px 14px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--color-background-light);
    border-bottom: 1px solid var(--border-color-light);
}
.help-annotated-screen-mockup {
    padding: 16px;
    background: var(--color-background);
}
.help-annotated-screen-callouts {
    padding: 10px 14px;
    border-top: 1px solid var(--border-color-light);
    background: var(--color-background-light);
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.help-annotated-screen-callout {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
}
.help-callout-marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}
/* Mockup helper classes for authors */
.help-mock-panel {
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    overflow: hidden;
    font-size: var(--font-size-sm);
    max-width: 400px;
}
.help-mock-topbar {
    padding: 8px 12px;
    background: var(--color-background-light);
    border-bottom: 1px solid var(--border-color-light);
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.help-mock-row {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-primary);
}
.help-mock-row.selected {
    border-left: 3px solid var(--color-primary);
    background: rgba(var(--color-primary-rgb), 0.10);
    font-weight: 500;
}
.help-mock-btn {
    padding: 6px 14px;
    border-radius: var(--border-radius-base);
    border: 1px solid var(--border-color-light);
    font-size: var(--font-size-sm);
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.help-mock-btn.primary {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
}
```

### `.help-prerequisite`
```css
.help-prerequisite {
    border-left: 4px solid var(--color-info, var(--color-primary));
    border-radius: var(--border-radius-base);
    background: rgba(var(--color-primary-rgb), 0.06);
    margin: 16px 0;
    overflow: hidden;
}
.help-prerequisite-header {
    padding: 10px 14px;
    font-weight: 700;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color-light);
    display: flex;
    align-items: center;
    gap: 8px;
}
.help-prerequisite-items {
    padding: 8px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.help-prerequisite-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-size-sm);
}
.help-prerequisite-item.done { color: var(--text-secondary); }
.help-prerequisite-item.current {
    color: var(--text-primary);
    font-weight: 600;
}
.help-prerequisite-note {
    padding: 8px 14px;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    border-top: 1px solid var(--border-color-light);
    font-style: italic;
}
```

### `.help-error-fix`
```css
.help-error-fix {
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    margin: 12px 0;
    overflow: hidden;
}
.help-error-fix-header {
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--border-color-light);
}
.help-error-fix-header.error {
    background: rgba(var(--color-error-rgb), 0.10);
    border-left: 4px solid var(--color-error);
}
.help-error-fix-header.warning {
    background: rgba(var(--color-warning-rgb), 0.10);
    border-left: 4px solid var(--color-warning);
}
.help-error-fix-severity {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}
.help-error-fix-header.error .help-error-fix-severity { color: var(--color-error); }
.help-error-fix-header.warning .help-error-fix-severity { color: var(--color-warning); }
.help-error-fix-message {
    font-family: var(--font-family-mono, monospace);
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: 500;
}
.help-error-fix-body {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.help-error-fix-section-title {
    font-size: var(--font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: 2px;
}
.help-error-fix-cause {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.5;
}
.help-error-fix-steps {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.help-error-fix-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    line-height: 1.4;
}
.help-error-fix-step-num {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
}
```

### `.help-decision-tree`
```css
.help-decision-tree {
    margin: 16px 0;
    padding: 16px;
    background: var(--color-background-light);
    border-radius: var(--border-radius-base);
    border: 1px solid var(--border-color-light);
}
.help-decision-question {
    font-weight: 600;
    font-size: var(--font-size-base);
    color: var(--text-primary);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.help-decision-branches {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 16px;
    border-left: 2px solid var(--border-color-light);
}
.help-decision-branch {
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-base);
    padding: 10px 14px;
    background: var(--color-background);
}
.help-decision-branch-condition {
    font-weight: 600;
    font-size: var(--font-size-sm);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.help-decision-branch.yes .help-decision-branch-condition { color: var(--color-success); }
.help-decision-branch.no .help-decision-branch-condition { color: var(--color-error); }
.help-decision-branch.maybe .help-decision-branch-condition { color: var(--color-warning); }
.help-decision-outcome {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: 4px;
    line-height: 1.4;
}
.help-decision-action {
    font-size: var(--font-size-sm);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 6px;
}
```

---

## IMPLEMENTATION CHECKLIST FOR OPUS

> **Status (2026-06-12):** Steps 1-4 below are all pending — none were completed in the June 10 refactor. Steps 5-7 (content authoring) can proceed with existing block types in the meantime; the new visual blocks should be implemented before final content review.

When implementing, do these in order:

1. **Add all 8 CSS class groups** to `Help.css` (use the corrected variables from the CSS section above — not the original `*-faint` names)
2. **Add all 8 case blocks** to the `renderContent` switch in `Help.js`
3. **Write one section** using the new blocks as a reference implementation — suggest Chapter 2 Section 2.2 (Projekta izveide) as it uses `workflow-bar`, `prerequisite`, `annotated-screen`, `steps`, `field-card`
4. **Fix the existing search indexer bug first, then add search extraction for new types** — Help.js line 88 calls `s.toLowerCase()` directly on step items that are now objects in the `workflow` section (steps are `{text, detail}`), which throws a `TypeError` at runtime. Fix this before expanding search. Then add extraction for:
   - `field-card`: index `field`, `fieldEn`, `description`, `example`, `validation` items
   - `error-fix`: index `errorMessage`, `cause`, `fix` steps
   - `comparison`: index all `points[].text`, both column labels
   - `decision-tree`: index `question`, all `branches[].condition`, `branches[].outcome`
   - `hierarchy`: no text to index (purely visual)
   - `workflow-bar`: index step labels
   - `prerequisite`: index all item texts
   - `annotated-screen`: index title and all callout texts
5. **Fill Chapter 8 (Verification) first** — this is where users get stuck most often
6. **Fill Chapter 9 (Export) second** — second most common stuck point
7. **Fill remaining chapters** per the chapter plan above

---

## WHAT NOT TO DO

- **Do not** use `paragraph` to describe a form field — use `field-card`
- **Do not** use `paragraph` to describe a workflow — use `steps`
- **Do not** use `list` to document pros/cons — use `comparison`
- **Do not** use `note` for error documentation — use `error-fix`
- **Do not** start a section with a `paragraph` if it is about a workflow step — start with `workflow-bar`
- **Do not** write more than 2 consecutive `paragraph` blocks — break them up with a visual element
- **Do not** use `ui-example` (raw HTML render) for layout illustrations — use `annotated-screen` which has proper structure and callout support
- **Do not** hardcode colors or sizes in CSS — use CSS variables throughout

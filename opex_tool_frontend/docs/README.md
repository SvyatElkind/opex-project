# OPEX Frontend — Technical Documentation

Reference documentation for the React frontend under `opex_tool_frontend/`.
Written for developers who will build on and maintain this code, and who know
React and React Query but nothing about this codebase.

**Last generated against:** branch `frontend-dev`, ~66 600 lines of JS/JSX across
~250 files in `src/`.

---

## Start here

| If you are… | Read |
|---|---|
| New to the codebase | [01 — Architecture](01-architecture.md), then [02 — Domain Model](02-domain-model.md) |
| Touching `Item/`, `Record/` or `Verification/` | [02 — Domain Model](02-domain-model.md) **first** — the category rule shapes all of it |
| Adding an endpoint or a hook | [03 — API Layer](03-api-layer.md), [04 — Hooks](04-hooks.md) |
| Adding a field | [07 §7.11 checklist](07-constants-validation.md#711-adding-a-new-validated-field--checklist) |
| Changing a create/edit form | [16 — Forms Deep Dive](16-forms-deep-dive.md) |
| Building UI | [08 — Shared Components](08-shared-components.md), [13 — Styling](13-styling.md) |
| Looking for *where* a change belongs | [17 — Data-Flow Walkthroughs](17-data-flow-walkthroughs.md) |
| Debugging | [18 §18.16 which tab](18-devadmin-components.md#1816-which-tab-for-which-problem), [14 §14.8 Gotchas](14-build-and-workflows.md#148-gotchas-that-cost-time) |
| Looking for something to fix | [19 — Known Issues](19-known-issues.md) |
| Just trying to run it | [14 — Build & Run](14-build-and-workflows.md) |

---

## Contents

### Foundations

**[01 — Architecture](01-architecture.md)**
What the app is, the stack, entry points, the provider stack, the one-query data
model, directory layout, cross-cutting patterns, and a list of known surprises.

**[02 — Domain Model & the Inheritance Engine](02-domain-model.md)**
The Project → Inventory → Item → Record → File hierarchy, every entity's fields,
the Latvian↔English glossary, the `(type, electronic) → category` rule, the full
`InheritanceUtils` function reference, and the pre-OPEX validation cascade.

### Data layer

**[03 — API Layer & Networking](03-api-layer.md)**
`apiClient` (timeouts, retry, `ApiError`), `errorService` (nine DRF error
shapes), the complete backend endpoint map, and the legacy `*_API.js` modules.

**[04 — Hooks Reference](04-hooks.md)**
All 15 hook modules: React Query wrappers, optimistic-update mechanics, the bulk
runner, the OPEX WebSocket hook, form errors, theme and settings hooks.

**[05 — State Management & Contexts](05-state-management.md)**
The six contexts, what each owns, every `localStorage` key, and
`NavigationContext` as the app's router.

### Logic layer

**[06 — Utilities Reference](06-utilities.md)**
Dates, file validation, record validation, the performance monitor, the
dependency-free CSV/XLSX/DOCX implementations, the import mapper, and the date
and year pickers.

**[07 — Constants & Validation](07-constants-validation.md)**
The validator contract, every field limit and allowed-value list per domain, the
payload builders, the verification rule catalogue, the bulk-edit descriptor
system, and the UI string files.

### UI layer

**[08 — Shared Components](08-shared-components.md)**
The four popup shells (`SectionEditPopup`, `BulkEditPopup`, `MultiCreatePopup`,
`ImportPopup`) and the presentational primitives.

**[09 — Verification & Export](09-verification-export.md)**
The pre-OPEX gate, the verification tree, the three exports, and the full CSV/XLSX
import file format.

**[10 — Domain Components](10-domain-components.md)**
The component tree, the app shell, and every Project/Inventory/Item/Record
component with its props — including the canonical `*Navigable` form pattern.

**[11 — Help, Guidance, Roadmap & Settings](11-help-guidance-settings.md)**
The three-tier help system, the Smart Guide workflow engine, roadmap routes, and
the settings UI.

**[16 — Forms Deep Dive](16-forms-deep-dive.md)**
The four largest files in the codebase are forms. The nine-part `*Navigable`
anatomy, each form's specifics, the two-step media flow, and which save paths
still bypass the shared payload builders.

### Tooling

**[12 — DevAdmin](12-devadmin.md)**
The 14-tab developer panel, the form-puppet engine and recipes, the test-data
factories, and the in-browser test runner.

**[13 — Styling & Theming](13-styling.md)**
Every CSS custom property, dark mode, font-size and compact-view scaling, class
naming conventions, and third-party theming.

**[14 — Build, Run & Common Workflows](14-build-and-workflows.md)**
npm scripts, the two builds, environment variables, testing, step-by-step
how-tos, and a table of gotchas that cost time.

**[15 — Glossary](15-glossary.md)**
Latvian↔English domain terms, code identifiers, and abbreviations.

**[17 — Data-Flow Walkthroughs](17-data-flow-walkthroughs.md)**
Nine complete traces from click to wire and back — boot, navigation, create item,
create record (both shapes), upload, section edit, verification → OPEX, import,
and error handling. Read one of these to find *where* a change belongs.

**[18 — DevAdmin Component Reference](18-devadmin-components.md)**
Each of the 14 tabs in detail, plus a "which tab for which problem" table.

**[19 — Known Issues & Maintenance Backlog](19-known-issues.md)**
Every bug and inconsistency the audit surfaced, ranked A–D with evidence,
consequence and a suggested fix. Nothing fixed — a catalogue to work through.

---

## The five things to know before you touch anything

1. **`(inventory.type, inventory.electronic)` decides everything** — the layout,
   how many records an item may have, the create workflow, the required fields
   and the validation rules. [02](02-domain-model.md#23-the-category-system--the-core-rule)

2. **There is no partial update.** The backend replaces the whole object, and a
   missing `related_item_list` silently wipes an item's relations. Always build
   payloads with `getItemUpdatePayload` / `getRecordUpdatePayload` /
   `getRecordCreatePayload`. [07](07-constants-validation.md#getitemupdatepayloaditem-inventory-overrides--)

3. **There is no router.** Navigation is `NavigationContext` state. Don't reach
   for `react-router` — it isn't installed. [05](05-state-management.md#56-navigationprovider--navigationcontextnavigationcontextjs)

4. **One query holds the whole tree.** `['project','detail',id]` is the cache.
   Mutations invalidate it; bulk operations deliberately don't.
   [04](04-hooks.md#40-the-cache-model-in-one-paragraph)

5. **CSS class names are load-bearing.** DevAdmin's puppet recipes and the help
   picker select on container classes. Renaming one breaks them *silently*.
   [13](13-styling.md#136-css-class-conventions)

---

## Conventions used in these docs

- **Code, comments and this documentation are in English.** All user-visible
  strings are Latvian and live in `Constants/uiStrings/`.
- File links are relative to `opex_tool_frontend/`, so they resolve both on disk
  and on the repo host.
- `>` blockquotes mark **gotchas, bugs and design decisions you should not
  reverse without reading why**. Where a decision is explained by a comment in
  the source, the reasoning is quoted rather than paraphrased.
- Bugs are stated plainly with their consequence. They are documented, not fixed
  — fixing them is a separate, reviewable change.

## Related documents

- [`../README.md`](../README.md) — script reference
- [`../FRONTEND.md`](../FRONTEND.md) — the earlier single-file developer guide
- [`../../START.md`](../../START.md) — how to run backend + frontend
- [`../../CLAUDE.md`](../../CLAUDE.md) — **changelog is mandatory for every change**

A fuller map of repo documentation is in
[14 §14.9](14-build-and-workflows.md#149-repo-documentation-map).

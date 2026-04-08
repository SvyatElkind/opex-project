# OPEX Tool Frontend — QA Overview

> **For:** Project owner | **Updated:** 2026-04-07 | **Branch:** `frontend-dev`

---

## What Is This App?

A web tool for Latvian archivists to build **OPEX digital preservation packages**. Users import a VVAIS report, organize archival materials into a strict 7-level hierarchy, attach metadata, validate completeness, and export OPEX packages for the National Archives.

**Hierarchy:** Project → Institution → Fond → Inventory → Item → Record → File

**4 Category System** (drives all behavior):

| Inventory Type | Electronic | Category | Records per Item | Files |
|---------------|-----------|----------|-----------------|-------|
| Tekstuāls | Yes | Electronic Documents | Many | Multiple per record |
| Tekstuāls | No | Documents | Many | None |
| Foto/Video/Skaņas | Yes | Electronic Media | One | One (uploaded = record) |
| Foto/Video/Skaņas | No | Media | One | None |

---

## QA History at a Glance

| Round | Date | Found | Fixed | Notes |
|-------|------|-------|-------|-------|
| V1 | Mar 16 | 93 | — | Initial full scan. 22 critical, 41 warning, 30 info |
| V2 | Mar 16 | 48 | 80 | All V1 criticals fixed. 5 new criticals found |
| V3 | Mar 17 | 7 | — | 116 per-file audit reports produced |
| V4 | Mar 19 | 3 | — | Validation rules deep-dive |
| V5 | Mar 24 | 0 | 97 total | Clean regression pass. 3 known limitations left |
| V6 | Mar 26 | 2 | — | Record.js inline edit broken, InventoryEdit init |
| **V7** | **Apr 2** | **14** | — | **Fresh full re-audit.** 4 confirmed bugs + 10 new issues |
| **V8** | **Apr 7** | **0** | **all V7** | **All V7 issues fixed. Clean pass.** |

**Total issues found across all rounds: ~120**
**Total issues fixed: ~120**
**Remaining: 0 bugs, 3 known low-severity limitations**

---

## Current State: What's Fixed

### Critical Bugs Fixed (V7→V8)

| Bug | What Was Wrong | Fix Applied |
|-----|---------------|-------------|
| Record.js inline edit | `handleSaveEdit` sent `data:` but mutation expects `recordData:` — saving silently failed | Changed to `recordData:`, added `recordType` for media |
| Record.js isMedia check | Used `isMedia` (physical only) instead of `isAnyMedia` (all media) | Changed to `isAnyMedia` everywhere + fixed dependency array |
| InheritanceUtils mutation | `getInheritanceInfo()` mutated the shared `CATEGORY_CONSTRAINTS` object — wrong file types on subsequent calls | Shallow copy: `{ ...CATEGORY_CONSTRAINTS[category] }` |
| Item.js crash | `currentIndex === -1` crashed when item not found in inventory | Added guard: `currentIndex >= 0 ? ... : '?'` |
| Item.js parseInt | `parseInt(jumpToNumber)` without radix | Added radix: `parseInt(jumpToNumber, 10)` |
| RoadmapWizard re-render | `updateField` not in `useCallback` — caused infinite loop risk | Wrapped in `useCallback` |
| VerificationTreeView | Media records (photo/video/audio) never rendered in verification tree | Now checks `photo_records`, `video_records`, `audio_records` arrays |
| SmartGuideCard precedence | `warn.id && warn.id.startsWith('ITEM_') \|\| warn.id === '...'` — wrong grouping | Added explicit parentheses + null guard |
| RecordsList batch delete | Errors silently swallowed on batch delete | Added toast notification via `notify.error()` |

### DevAdmin Improvements (V8)

| Feature | Before | After |
|---------|--------|-------|
| Panel sizing | Fixed 90% width | **Resizable** from all edges/corners + S/M/L/Max presets |
| Scaling | Static layout | **3 size classes** — compact (icons only), medium, large |
| Tab navigation | Mouse only | **Keyboard:** `Ctrl+[/]` to switch tabs, `Esc` to close |
| Tab overflow | Hidden | **Scrollable** tab bar with thin scrollbar |
| Form Inspector | Useless (opening DevAdmin closes forms) | **Two modes:** Catalog (lists all 14 forms with availability) + Mini Inspector (floating widget while form is open) |
| State Inspector | Basic | **Expand/collapse all**, rich stats bar (items/records/files/data size), copy feedback |
| QuickCreate | Date format bug, stale counts, missing fields | Fixed inventory dates, item language, record dates, action metadata |
| Footer | Single line | **Keyboard shortcuts** + live size display |

---

## What's Left To Do (Not Bugs — Improvements)

### High Priority (should do soon)

| # | What | Why | Effort |
|---|------|-----|--------|
| 1 | Add `onError` to 21 mutations | Failed API calls are silent — user gets no feedback | Medium |
| 2 | Replace ~15 `alert()`/`confirm()` with toast/modal | Inconsistent UX, blocks main thread | Medium |
| 3 | Wire guidance engine to navigation | "Izveidot GV" button doesn't actually navigate | Low |
| 4 | Remove dead `useNextActions.js` | Never imported, superseded by `useGuidanceEngine` | Low |

### Medium Priority (maintainability)

| # | What | Why | Effort |
|---|------|-----|--------|
| 5 | Consolidate Create/Edit form pairs | 80-95% code duplication (~3500 lines saveable) | High |
| 6 | Split `InheritanceUtils.js` (1665 lines) | Too many concerns in one file | Medium |
| 7 | Finish `Constants.js` migration (1250 lines) | Partially done — domain files exist but main file still large | Low |
| 8 | Standardize query keys through `QUERY_KEYS` | Mix of hardcoded arrays and local factories | Medium |
| 9 | Migrate `useMetadata.js` + `useFiles.js` to `apiClient` | Still using raw `fetch()` | Medium |

### Low Priority (polish)

| # | What | Why | Effort |
|---|------|-----|--------|
| 10 | Memoize expensive operations | QuickJump, NavigationContext tree traversals | Low |
| 11 | Upload progress bar | Currently spinner only, no percentage | Medium |
| 12 | Add PropTypes or TypeScript | Refactoring is error-prone without types | High |
| 13 | Accessibility (focus traps, keyboard) | Modals lack proper focus management | Medium |
| 14 | Per-inventory progress display in guidance | Currently shows overall only | Medium |

---

## Architecture Quick Reference

### Tech Stack
React 18 + TanStack React Query v5 + Custom `apiClient.js` (fetch with retry/timeout/abort) + CSS Custom Properties theming

### Key Patterns
- **No React Router** — `NavigationContext` manages all navigation via state
- **Portal-based modals** — all forms render via `ReactDOM.createPortal` to `document.body`
- **Category system** — `InheritanceUtils.js` determines ALL behavior from inventory type + electronic flag
- **37 validation rules** — 18 errors (blocking) + 10 warnings + 6 file rules + 3 aggregated. 100% tested
- **Latvian localization** — UI strings in `Constants/uiStrings/`, error messages in Latvian

### Provider Stack (outermost → innermost)
```
QueryClientProvider → NotificationProvider → SettingsProvider →
  RoadmapProvider → GuidanceProvider → ConstantsProvider →
    NavigationProvider → Workspace
```

### File Counts
- 132 JS/JSX source files
- 54 CSS files
- 11 test suites
- 116 QA audit reports
- 37 validation rules

---

## Known Limitations (Won't Fix)

1. **Upload progress bar** — shows spinner, not percentage (UX only, uploads work)
2. **FallbackConstants staleness** — hardcoded fallbacks must be manually synced with backend
3. **Calendar date edge case** — switching indicator type preserves day/month in internal state

---

## QA Document Index

| Document | What It Contains |
|----------|-----------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full system architecture — tech stack, data hierarchy, component tree, state management, API layer, category system |
| [DOMAIN_GUIDE.md](DOMAIN_GUIDE.md) | Why the system works this way — OPEX format, VVAIS, archival standards, glossary |
| [WORKFLOWS.md](WORKFLOWS.md) | Step-by-step description of every user workflow (14 workflows) |
| [USER_GUIDE.md](USER_GUIDE.md) | Complete user manual in Latvian |
| [QA_REPORT.md](QA_REPORT.md) | V1 initial audit — 93 issues with full details |
| [OPUS_QA_REPORT.md](OPUS_QA_REPORT.md) | V1 verification — 80 confirmed, 13 false positives |
| [OPUS_QA_REPORT_V2.md](OPUS_QA_REPORT_V2.md) | V2 post-fix audit — 48 remaining issues |
| [QA_STATUS.md](QA_STATUS.md) | V1–V5 executive summary — 97/100 issues fixed |
| [QA_REPORT_V6.md](QA_REPORT_V6.md) | V6 re-audit — 2 bugs found (Record.js + InventoryEdit) |
| [QA_REPORT_V7_COMPREHENSIVE.md](QA_REPORT_V7_COMPREHENSIVE.md) | V7 full re-audit — 14 new issues, component goals, architecture improvements |
| [COMPONENT_GOALS.md](COMPONENT_GOALS.md) | Per-component production readiness checklist (13 areas, ~60 action items) |
| [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md) | Prioritized backlog — 8 phases, ~60 items from critical bugs to polish |
| [GUIDANCE_ANALYSIS.md](GUIDANCE_ANALYSIS.md) | Guidance system gaps — what's missing for a real step-by-step workflow |
| [GUIDANCE_INVESTIGATION.md](GUIDANCE_INVESTIGATION.md) | Deep-dive into guidance redesign with proposed architecture |

---

## Bottom Line

**The app works.** All critical bugs are fixed. The core workflow (create project → import VVAIS → manage hierarchy → validate → export OPEX) is functional for all 4 category types.

**What would make it better:** Error feedback on mutations (silent failures), replacing native `alert()` calls, consolidating duplicated form code, and wiring the guidance engine to actual navigation.

**What's impressive:** 37 validation rules with 100% test coverage, comprehensive DevAdmin toolkit with 12 tabs, category-aware guidance engine, full Latvian localization, and thorough architecture documentation.

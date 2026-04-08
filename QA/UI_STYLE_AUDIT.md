# OPEX Frontend — UI & Style Audit

> **Date:** 2026-04-07 | **Scope:** All 51 CSS files + inline styles in 27 JSX files

---

## 1. Theme System Overview

**Root file:** `src/styles/theme.css` (18 KB)

The design system defines **123 CSS custom properties** covering:

| Category | Count | Examples |
|----------|-------|---------|
| Colors | 54 | `--color-primary: #596D69`, `--color-error: #744245`, `--color-warning: #E1B781` |
| Typography | 23 | `--font-family-primary: "Open Sans"`, `--font-size-sm: 0.8125rem` |
| Spacing | 11 | `--spacing-1: 0.25rem` through `--spacing-12: 5rem` |
| Borders | 9 | `--border-radius-md: 6px`, `--border-color-light` |
| Shadows | 8 | `--shadow-sm` through `--shadow-2xl` |
| Z-index | 10 | `--z-index-dropdown: 1000` through `--z-index-popup-content: 20001` |
| Transitions | 4 | `--transition-fast: 0.15s`, `--transition-base: 0.2s` |

**Dark mode:** Full `[data-theme="dark"]` variant with all color overrides.
**Font scaling:** 3 presets (small/medium/large) + compact view mode.

---

## 2. CSS File Inventory (51 files, ~866 KB)

### Largest Files (potential split candidates)

| File | Size | Component |
|------|------|-----------|
| VerificationModal.css | 47 KB | Verification modal + export popups |
| ItemsTable.css | 37 KB | Items table with column controls |
| RecordFiles.css | 33 KB | File management UI |
| Item.css | 33 KB | Single item view |
| Record.css | 32 KB | Record display |
| RecordsList.css | 27 KB | Record list view |
| DevAdminPanel.css | 27 KB | Dev panel (dev-only) |
| ProjectPopup.css | 25 KB | Project creation popup |
| RoadmapWizard.css | 24 KB | Roadmap wizard |
| CreateDocumentRecord.css | 23 KB | Document record creation |
| InventoryItem.css | 23 KB | Inventory item card |
| TreeNode.css | 23 KB | Verification tree node |
| Navigation.css | 23 KB | Navigation bar/sidebar |
| CreateItemNavigable.css | 21 KB | Item creation form |
| EditItemNavigable.css | 20 KB | Item edit form |
| SmartGuideCard.css | 20 KB | Guidance card |

### Small/Clean Files

| File | Size |
|------|------|
| Toast.css | 1.8 KB |
| HelpButton.css | 2.5 KB |
| ErrorDisplay.css | 3.5 KB |
| VerificationTreeView.css | 4.1 KB |
| Workspace.css | 4.3 KB |

---

## 3. BROKEN: CSS Variables Referenced But Not Defined

These variables are used in CSS files but **do not exist** in `theme.css`. They silently fail (fall back to initial/inherited values or inline fallbacks).

| Variable | Used In | Should Be |
|----------|---------|-----------|
| `--color-success` | Multiple files | Add to theme.css (suggest: `#10b981`) |
| `--color-success-dark` | Multiple files | Add to theme.css |
| `--color-success-light` | Multiple files | Add to theme.css |
| `--color-success-rgb` | Multiple files | Add to theme.css |
| `--color-surface` | Some components | Add or alias to `--color-background` |
| `--color-white` | Some components | Use `--text-white` instead |
| `--color-border` | Several files | Use `--border-color-medium` |
| `--border-color` | Several files | Use `--border-color-medium` |
| `--bg-disabled` | Notification.css | Add to theme.css |
| `--bg-primary` | Workspace.css | Use `--color-primary` |
| `--bg-secondary` | Notification.css | Add or use `--color-background-secondary` |
| `--bg-tertiary` | Notification.css | Add to theme.css |
| `--background-card` | Workspace.css | Use `--card-bg` |
| `--color-background-secondary` | Some files | Add to theme.css |
| `--font-size-md` | Some files | Use `--font-size-base` |
| `--spacing-7` | Some files | Add to theme.css (between spacing-6 and spacing-8) |
| `--text-muted-rgb` | Components | Add to theme.css |
| `--text-secondary-rgb` | Components | Add to theme.css |

**Impact:** Where fallback values exist (e.g., `var(--bg-disabled, #ccc)`) the UI works but ignores theme. Where no fallback exists, the property is silently ignored.

---

## 4. Hardcoded Colors (Should Use Theme Variables)

### Critical — Production Components

| File | Line(s) | Hardcoded Color | Should Use |
|------|---------|----------------|-----------|
| Help.css | 11-92 | `#F1EDE1`, `#596D69`, `#2C3E37`, `#D4C8B8`, `#E1B781` | `--color-background`, `--color-primary`, `--color-text-primary`, `--border-color-light`, `--color-warning` |
| Navigation.css | 95 | `#6B7280` | `--text-muted` |
| Inventories.css | 157-167 | `#f59e0b` (2x) | `--color-warning` |
| Items.js (inline) | 701 | `#007bff` | `--color-info` or `--color-primary` |
| Notification.css | 72 | `rgba(0,0,0,0.5)` | Consider `--overlay-bg` variable |
| CalendarComponent.css | Various | Mixed hardcoded values | Theme variables |

**Help.css is the worst offender** — the entire file uses hardcoded colors and a different font family (`Libertinus Serif Display` instead of `--font-family-primary`).

---

## 5. Z-Index Chaos

The z-index system is **not controlled**. Theme.css defines values up to 20001, but files use arbitrary higher values:

| Layer | Theme Variable | Actual Values Used |
|-------|---------------|--------------------|
| Layout | — | 0, 1, 10 |
| Dropdowns | `--z-index-dropdown: 1000` | 100, 200 (lower!) |
| Navigation | `--z-index-fixed: 1050` | 1050 |
| Modals | `--z-index-modal: 10000` | 9999, 10000, 10001 |
| Roadmap | — | 11000 |
| Popups | `--z-index-popup: 20000` | 20000, 20001 |
| DevAdmin | — | 99999 |
| Notifications | — | 100000, 100001 |

**Problems:**
- Modals at 9999 can appear **behind** navigation (10000+)
- No clear hierarchy between 100 (dropdowns in code) and 1000 (theme definition)
- Notifications at 100000 is arbitrary — should be `--z-index-notification`

---

## 6. Inline Styles in JSX (Production Code)

### Critical: 40+ Identical Inline Styles in Item.js

```jsx
// This exact pattern repeats 40+ times in Item.js (lines 500-1136):
<div className="item-segment-content"
     style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
```

**Fix:** Create one CSS class:
```css
.item-segment-flex { display: flex; flex-direction: row; gap: 8px; align-items: center; }
```

### Multi-Property Inline Styles (Should Be CSS Classes)

| File | Lines | Properties | Description |
|------|-------|-----------|-------------|
| InventoryEdit.js | 194-201 | 7 | Info box with border-left accent |
| InventoryEdit.js | 289-295 | 6 | Read-only display box |
| DisplaySettings.jsx | 167-171 | 4 | Reset button styling |
| Help.js | 98-103 | 5 | Section heading styling |
| InventoryItem.js | 84 | 5 | Favorite button styling |

### Acceptable Inline Styles (Dynamic/Computed)

| Pattern | Files | Why It's OK |
|---------|-------|------------|
| `style={{ width: \`${progress}%\` }}` | VerificationModal, UploadPopup | Computed progress bar |
| `style={{ strokeDashoffset: ... }}` | WarningPopup, InventoryDelete | SVG animation |
| `style={{ color: getIconColor() }}` | RecordFiles | Dynamic icon coloring |
| `style={{ display: 'none' }}` | CreateMediaRecord, Help | Hidden file inputs |
| `style={{ opacity: ... }}` | Items | Conditional visibility |

---

## 7. Inconsistent Patterns

### Variable Usage — 3 Different Approaches for Same Thing

```css
/* Approach 1: Variable only (breaks if missing) */
color: var(--color-error);

/* Approach 2: Variable with fallback (defensive) */
color: var(--color-error, #744245);

/* Approach 3: Hardcoded (ignores theme) */
color: #744245;
```

All three appear across the codebase for the same colors. **No standard enforced.**

### Focus Styles — 3 Different Patterns

```css
/* Pattern A: Box-shadow (HelpButton.css) */
:focus { outline: none; box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.3); }

/* Pattern B: Outline (Inventories.css) */
:focus { outline: 2px solid var(--color-primary); }

/* Pattern C: None (some modals) */
/* No focus styling at all */
```

### Button Styles — No Shared Base Class

Every component defines its own button styles from scratch. There's no `.btn`, `.btn-primary`, `.btn-secondary` base class system. Each file has 20-40 lines of button CSS that could be shared.

---

## 8. Missing States

### Components Without Proper `:disabled` Styling
- Some export buttons in VerificationModal
- Some form buttons in Settings

### Components Without `:focus-visible`
- Most modal buttons
- Navigation links
- Inventory cards

### Components Without Dark Mode Coverage
- Help.css (entirely hardcoded light theme)
- CalendarComponent.css (partial)
- YearPicker.css (partial)

---

## 9. Responsive Design

**87 media queries** across 51 files. Main breakpoints:

| Breakpoint | Usage | Count |
|-----------|-------|-------|
| 1200px | Large screens | 4 |
| 1024px | Tablet landscape | 13 |
| **768px** | **Primary mobile** | **52** |
| 640px | Small mobile | 2 |
| 480px | Extra small | 13 |

**Good:** Consistent `768px` as primary breakpoint.
**Missing:** Breakpoints not defined as CSS variables (hardcoded in every `@media` query).

Accessibility queries present:
- `prefers-reduced-motion: reduce` — 11 files
- `prefers-contrast: high` — 5 files

---

## 10. Recommendations (Priority Order)

### P1: Fix Broken Variables (High Impact, Low Effort)

Add these to `theme.css`:
```css
--color-success: #10b981;
--color-success-dark: #059669;
--color-success-light: #34d399;
--color-success-rgb: 16, 185, 129;
--spacing-7: 2rem;
--z-index-notification: 100000;
```

### P2: Extract Item.js Inline Styles (High Impact, Low Effort)

Add to `Item.css`:
```css
.item-segment-flex {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
```
Replace 40+ inline style objects with `className="item-segment-flex"`.

### P3: Create Base Button Classes (High Impact, Medium Effort)

Add to `theme.css` or a new `buttons.css`:
```css
.btn { /* base styles */ }
.btn-primary { background: var(--color-primary); color: var(--text-white); }
.btn-secondary { background: var(--color-secondary); color: var(--text-white); }
.btn-danger { background: var(--color-error); color: var(--text-white); }
.btn-sm { padding: var(--spacing-2) var(--spacing-3); font-size: var(--font-size-xs); }
```

### P4: Fix Help.css Theming (Medium Impact, Medium Effort)

Replace all hardcoded values with theme variables. Replace font family.

### P5: Consolidate Z-Index (Medium Impact, Low Effort)

Add to `theme.css`:
```css
--z-index-base: 0;
--z-index-dropdown-menu: 100;
--z-index-sticky: 500;
--z-index-modal-backdrop: 9999;
--z-index-modal-content: 10000;
--z-index-notification: 100000;
--z-index-devtools: 99999;
```

### P6: Standardize Focus Styles (Accessibility)

Add global focus-visible to `theme.css`:
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total CSS files | 51 |
| Total CSS size | ~866 KB |
| Theme variables defined | 123 |
| **Broken variable references** | **19** |
| Hardcoded color files | 20 |
| Inline style files (production) | 12 |
| Inline styles in Item.js alone | 40+ |
| Z-index values used | 16 different values |
| Z-index in theme.css | 10 (6 missing) |
| Media queries | 87 |
| Dark mode support | Full (except Help.css) |

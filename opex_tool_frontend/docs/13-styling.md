# 13. Styling & Theming

> Single source of truth: [src/styles/theme.css](../src/styles/theme.css) (525 lines)

**No Tailwind, no CSS-in-JS, no CSS modules.** Plain `.css` files, one per
component, all referencing CSS custom properties defined in `theme.css`.

Rule: **never hard-code a colour, spacing value, font size, radius, shadow or
z-index in a component stylesheet.** Use `var(--…)`. If the token you need does
not exist, add it to `theme.css`.

---

## 13.1 How the cascade is set up

`index.js` imports **every** stylesheet in a fixed order:

```
1. styles/theme.css                    ← MUST BE FIRST — defines all tokens
2. Workspace/Workspace.css             ← global popup overrides, base layout
3. domain CSS (Project, Navigation, Fond, Institution, Inventory, Item, Record)
4. components/ErrorDisplay.css
5. Help/, Settings/, DevAdmin/, Guidance/, Roadmap/, components/Notification.css
6. @fortawesome/fontawesome-free/css/all.min.css   ← LAST, for icon overrides
```

CRA concatenates them in import order, so **later files win ties**. That is why
FontAwesome is last and `theme.css` is first.

A handful of component CSS files are imported by their own component instead
(`ItemsTable.css`, `CalendarComponent.css`, `SectionEditPopup.css`,
`FieldHelp.css`, `YearPicker.css`, …). `CalendarComponent.css` explicitly notes
it must come **after** `react-datepicker/dist/react-datepicker.css` to override
the library defaults.

---

## 13.2 The token set

### Brand colours

Every colour comes as a quadruple: base, `-dark` (hover), `-light` (disabled),
and `-rgb` (for `rgba()` composition).

| Token | Light value | Role |
|---|---|---|
| `--color-primary` | `#596D69` (sage green) | Action buttons, active states |
| `--color-secondary` | `#6B7FA0` (dusty blue) | Secondary accents |
| `--color-tertiary` | `#B5A88E` (sandstone) | Tertiary accents |
| `--color-error` | `#744245` | Errors |
| `--color-warning` | `#E1B781` | Warnings |
| `--color-info` | `#6ba3b8` | Info |
| `--color-success` | `#10b981` | Success |

`--color-danger` is a semantic alias of `--color-error`.

### Backgrounds and text

| Token | Light |
|---|---|
| `--color-background` | `#ffffff` |
| `--color-background-light` | `#f8f9fa` (sidebars) |
| `--color-background-medium` | `#e9ecef` (hover) |
| `--color-background-dark` | `#dee2e6` (borders, dividers) |
| `--text-primary` | `#59636e` |
| `--text-secondary` | `#4D4D4D` |
| `--text-muted` | `#8a9096` |
| `--text-light` | `#a8b0b7` (placeholders) |
| `--text-white` | `#ffffff` |

### Typography

```
--font-family-primary   "Open Sans"
--font-family-secondary "Open Sans"
--font-family-sans      Arial, Helvetica Neue, Helvetica, sans-serif
--font-family-mono      Monaco, Menlo, Ubuntu Mono, monospace
```

| Size token | rem | px |
|---|---|---|
| `--font-size-xs` | 0.75 | 12 |
| `--font-size-sm` | 0.875 | 14 |
| `--font-size-base` | 1 | 16 |
| `--font-size-lg` | 1.125 | 18 |
| `--font-size-xl` | 1.25 | 20 |
| `--font-size-2xl` … `4xl` | | up to 36 |

Weights `light 300` → `bold 700`; line heights `tight 1.25`, `normal 1.5`,
`relaxed 1.625`, `loose 2`.

### Spacing

A 4 px scale: `--spacing-1` (4 px) through `--spacing-20` (80 px), with
`1 2 3 4 5 6 7 8 10 12 16 20` defined.

### Borders and radii

Widths `thin 1px`, `medium 2px`, `thick 4px`. Colours `--border-color-light
#d6d1c4`, `-medium #c7c0b0`, `-dark #b8af9c`. Radii `sm 2px`, `base 4px`,
`md 6px`, `lg 8px`, `xl 12px`, `full 9999px`.

### Shadows

`--shadow-sm` → `--shadow-2xl` plus `--shadow-inner`, tinted with the primary
colour in light mode (`rgba(89,109,105,…)`) and pure black in dark mode.

### Z-index — the layering contract

| Token | Value | Layer |
|---|---|---|
| `--z-index-dropdown` | 1000 | |
| `--z-index-sticky` | 1020 | |
| `--z-index-fixed` | 1030 | |
| `--z-index-modal-backdrop` | 1040 | |
| `--z-index-modal` | 1050 | |
| `--z-index-popover` | 1060 | |
| `--z-index-tooltip` | 1070 | |
| `--z-index-toast` | 1080 | |
| `--z-index-popup` | **20000** | Portal-rendered form popups |
| `--z-index-popup-content` | 20001 | |
| `--z-index-devtools` | 99999 | DevAdmin panel |
| `--z-index-notification` | 100000 | Toasts + confirm dialog — always on top |

**Never write a raw `z-index` number.** The 20000 / 99999 / 100000 jumps exist so
form popups sit above ordinary modals, DevAdmin above everything, and
notifications above DevAdmin.

`--overlay-bg: rgba(0, 0, 0, 0.5)`.

### Transitions

`--transition-fast .15s`, `--transition-base .2s`, `--transition-slow .3s`,
`--transition-slower .5s`, plus `--ease-in`, `--ease-out`, `--ease-in-out`
cubic-beziers.

### Component tokens

Derived tokens so a component never reaches for a primitive directly:

- **Buttons** — `--btn-padding-x/y`, `--btn-font-size`, `--btn-font-weight`,
  `--btn-border-radius`, `--btn-border-width`, `--btn-primary-bg`,
  `--btn-primary-hover`, `--btn-error-bg`, `--btn-warning-bg`.
- **Inputs** — `--input-padding-x/y`, `--input-font-size`, `--input-bg`,
  `--input-color`, `--input-focus-border-color`, `--input-focus-shadow`.
  Note `--input-border-radius`, `--input-border-width` and `--input-border-color`
  are set to `none` in light mode with the real values commented out — inputs are
  deliberately borderless there and get their border back in dark mode.
- **Cards** — `--card-bg`, `--card-border-radius`, `--card-border-color`,
  `--card-shadow`, `--card-padding`.
- **Navigation** — `--nav-bg`, `--nav-border-color`, `--nav-link-color`,
  `--nav-link-active-color`, `--nav-height: 60px`.
- **Tables** — `--table-border-color`, `--table-stripe-bg`, `--table-hover-bg`,
  `--table-header-bg`.
- **Breadcrumbs** — `--breadcrumb-separator-color`, `--breadcrumb-active-color`,
  `--breadcrumb-bg`.

---

## 13.3 Dark mode

Driven entirely by `[data-theme="dark"]` on `<html>`, set by
[`useTheme()`](04-hooks.md#usetheme). **Light mode sets no attribute** — the
`:root` palette is the light palette.

The dark block redefines only tokens; **no component rule is duplicated**. Adding
a dark-mode variant means adding a token override there, not a
`[data-theme="dark"] .my-component` selector.

| Token | Light | Dark |
|---|---|---|
| `--color-primary` | `#596D69` | `#6b847f` (lightened for contrast) |
| `--color-error` | `#744245` | `#e57373` |
| `--color-warning` | `#E1B781` | `#f4cf8a` |
| `--color-background` | `#ffffff` | `#1a1a1a` |
| `--color-background-light` | `#f8f9fa` | `#2d2d2d` |
| `--color-background-medium` | `#e9ecef` | `#242424` |
| `--color-background-dark` | `#dee2e6` | `#121212` |
| `--text-primary` | `#59636e` | `#e4e4e7` |
| `--text-secondary` | `#4D4D4D` | `#a1a1aa` |
| `--text-muted` | `#8a9096` | `#71717a` |
| `--border-color-light` | `#d6d1c4` | `#3f3f46` |
| `--input-bg` | (light) | `#27272a` |
| `--card-bg` | `#ffffff` | `#27272a` |
| `--nav-bg` | `#ffffff` | `#1f1f1f` |
| shadows | primary-tinted | pure black, higher alpha |

Note the inversion of `-light` and `-dark` background semantics: in dark mode
`--color-background-light` (`#2d2d2d`) is *lighter than* `--color-background`
(`#1a1a1a`), preserving the meaning ("raised surface") rather than the literal
lightness.

A 0.3 s `background-color` / `color` transition is applied to `:root` and
`[data-theme="dark"]` so the switch animates.

> **DOCX export note.** `Utils/docxWriter.js` uses `tintTowardWhite()` on callout
> colours precisely so the exported help document stays light even when the app
> is in dark theme.

---

## 13.4 Font size and compact view

Both are `<html>` classes applied by
[`useAppSettings()`](04-hooks.md#useappsettings), and both work by **overriding
tokens**, not by restyling components.

### Font size

| Class | Effect |
|---|---|
| `html.font-size-small` | Every `--font-size-*` reduced ~12.5 % (`base` → 14 px) |
| `html.font-size-medium` | Empty rule — uses the `:root` defaults |
| `html.font-size-large` | Every `--font-size-*` increased ~12.5 % (`base` → 18 px) |

### Compact view

`html.compact-view` cuts the spacing scale by ~33 % (`--spacing-4` 16 px →
10.67 px), tightens line heights (`normal` 1.5 → 1.4), and shrinks button, input
and card padding.

It also carries a handful of `!important` element rules for
`.settings-field`, `.form-field`, `.settings-group`, `.settings-content` and
`.wizard-content` — the only `!important`s in the theme, needed because those
components set margins directly rather than through tokens. **Prefer tokens so
new components need no entry here.**

---

## 13.5 Utility classes

A small set defined at the end of `theme.css`:

```
.text-primary .text-secondary .text-muted .text-white
.text-action .text-error .text-warning
.bg-primary .bg-secondary .bg-muted .bg-background
```

Button classes referenced by the help chapters' `ui-example` blocks:
`.btn-action`, `.btn-error`, `.btn-warning`, `.btn-secondary`.

> `.bg-primary` resolves to `#ffffff`, not `--color-primary`. Read it as
> "primary surface", not "primary brand colour".

---

## 13.6 CSS class conventions

| Area | Prefix | Example |
|---|---|---|
| Multi-section create form | `create-<entity>-nav-*` | `create-item-nav-container`, `create-record-nav-input` |
| Multi-section edit form | `edit-<entity>-navigable-nav-*` | `edit-item-navigable-nav-section` |
| Section popups | `section-popup-*` | `section-popup-datepicker-popper` |
| Bulk popups | `bulk-*` | `bulk-field-row` |
| Verification | `verification-*` | `verification-modal`, `verification-tree-empty` |
| Notifications | `notification-*` | `notification-toast-success` |
| DevAdmin | `dev-*` | `dev-admin-header`, `dev-size-compact` |
| Selection toolbar | `selection-toolbar-*` | |

**Create and Edit forms share their class names on purpose** — the two forms are
visually identical and a single stylesheet covers both.

> **These class names are load-bearing beyond CSS.** The DevAdmin puppet recipes
> and the help-picker zones both select on them. Renaming
> `.create-item-nav-container`, `.verification-modal`, `.export-popup`,
> `.metadata-card-form` or `.inst-signers-modal` breaks recipes and help zones
> **silently** — they will time out or stop matching rather than error. Grep
> `formPuppetRecipes.js` and `helpZones.js` before renaming a container class.

---

## 13.7 Third-party styling

| Library | How it is themed |
|---|---|
| `react-select` | A JS `selectStyles` object in `Utils/CalendarComponent.js` maps every part (`control`, `menu`, `option`, `indicators`…) onto CSS custom properties via `var(--…)`. Copy that object when adding a new `react-select`. |
| `react-datepicker` | `CalendarComponent.css`, imported **after** the library's own CSS. |
| FontAwesome 6 Free | Imported last in `index.js`. Icon class names are centralised in `Constants/iconConstants.js`. |
| `react-window` / `react-virtualized-auto-sizer` | Unstyled; the row renderer supplies classes. |

---

## 13.8 Adding a component stylesheet

1. Create `MyComponent.css` next to the component.
2. Import it **from the component** (`import './MyComponent.css'`) unless it needs
   to participate in the global override order, in which case add it to
   `index.js` in the right position.
3. Use only `var(--…)` tokens. Add missing tokens to `theme.css` — in both the
   `:root` block **and** the `[data-theme="dark"]` block if the value is colour-like.
4. Prefix classes with the component/domain name.
5. Never write a raw `z-index`.
6. Check the result at all three font sizes and with compact view on.

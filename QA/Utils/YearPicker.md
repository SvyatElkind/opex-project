# QA Report: YearPicker
> Path: `src/Utils/YearPicker.js` | Last audit: 2026-03-24

## Purpose
Custom year selection dropdown component used in inventory create/edit forms. Provides a scrollable list of 201 years (current year +/- 100), a search/type input for quick navigation, keyboard support, and clear functionality. Outputs formatted date strings (`YYYY-01-01` for start dates, `YYYY-12-31` for end dates).

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | No | - | Current value in `YYYY-MM-DD` format (year extracted from first `-` segment) |
| `onChange` | `function` | Yes | - | Callback with formatted date string (`YYYY-01-01` or `YYYY-12-31`) or empty string on clear |
| `placeholder` | `string` | No | `"Select Year"` | Placeholder text when no year selected |
| `className` | `string` | No | `""` | Additional CSS class for wrapper |
| `disabled` | `boolean` | No | `false` | Disable the component |
| `label` | `string` | No | - | Optional label text above the picker |
| `isStartDate` | `boolean` | No | `true` | If true, outputs `YYYY-01-01`; if false, outputs `YYYY-12-31` |

## User Interaction Flow
1. **Collapsed state**: Shows selected year or placeholder. Clear button (x) visible when year is selected and not disabled.
2. **Click to open**: Dropdown appears with search input and scrollable year list (201 items).
3. **Auto-scroll**: On open, list scrolls to selected year (or current year if none) via `scrollIntoView({ block: 'center', behavior: 'instant' })`. Search input auto-focuses.
4. **Type to search**: User types up to 4 digits in search input.
   - Input restricted to digits only via `/^\d{0,4}$/` regex.
   - At 4 digits, if valid year in range, list scrolls smoothly to that year.
   - Enter key selects the typed year if valid 4-digit year in range.
   - Escape key closes dropdown and reverts input to selected year.
5. **Click to select**: Clicking a year calls `handleYearSelect(year)` which formats date and calls `onChange`.
6. **Clear**: Click x button calls `onChange('')` and resets internal state.
7. **Click outside**: Closes dropdown via `mousedown` document event listener.
8. **Keyboard on trigger**: Enter/Space toggles dropdown. Escape closes and blurs.
9. **ARIA attributes**: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `role="option"`, `aria-selected` on each year option.

## Validation
- Input restricted to digits only, max 4 characters.
- Year must be within the 201-year range to be selectable.
- No explicit error messages -- invalid years cannot be selected.

## API Integration
- No API calls. Pure UI component.

## Known Limitations
- Year range hardcoded to currentYear +/- 100. For archival data spanning further back, this is insufficient.
- `years` array (201 elements) regenerated on every render -- should be memoized or defined outside component.
- All 201 year options rendered in DOM simultaneously (no virtualization).
- Does not handle years < 1000 (4-digit input restriction).
- Click-outside handler uses `mousedown` on `document`, potential conflicts.
- Highlighted year requires exactly 4 digits -- partial matches do not highlight.
- No up/down arrow key navigation within the year list.
- Inconsistent scroll behavior: `instant` on open vs. `smooth` when typing.

## Quality Score: 7/10

# QA Report: CalendarComponent
> Path: `src/Utils/CalendarComponent.js` | Last audit: 2026-03-24

## Purpose
Reusable date range picker component that supports three date precision modes: day, month, and year. Wraps `react-datepicker` with a `react-select` dropdown for switching the date indicator mode. Used in item creation/editing forms for selecting start and end dates.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onDateChange` | `function` | Yes | - | Callback `(startDate, endDate, view)` called when dates change. Receives Date objects. |
| `preset` | `string` | No | - | Legacy fallback for initial view mode |
| `dateIndicator` | `string` | No | - | Primary initial view mode: `'day'`, `'month'`, or `'year'` |
| `startDate` | `string` | No | - | Initial start date in `YYYY-MM-DD` string format |
| `endDate` | `string` | No | - | Initial end date in `YYYY-MM-DD` string format |
| `hideLabels` | `boolean` | No | `false` | Hide "Sākuma datums" / "Beigu datums" labels |
| `compactPlaceholders` | `boolean` | No | `false` | Use compact placeholders |
| `hideIndicatorSelector` | `boolean` | No | `false` | Hide the date indicator dropdown |

## User Interaction Flow
1. **Indicator selector**: `react-select` dropdown with view options from `VIEW_OPTIONS.viewOptions`. Hidden when `hideIndicatorSelector=true` or `initialView === 'year'`.
2. **Start date picker**: `react-datepicker` configured per view mode:
   - Day: full date picker, format `YYYY-MM-d`
   - Month: `showMonthYearPicker`, format `YYYY-MM`
   - Year: `showYearPicker`, format `YYYY`
3. **End date picker**: Same configuration as start picker.
4. **Date adjustment**: Selected dates adjusted via helper functions:
   - `adjustToStartDate(date, indicator)`: year -> Jan 1, month -> 1st of month, day -> unchanged.
   - `adjustToEndDate(date, indicator)`: year -> Dec 31, month -> last day of month, day -> unchanged.
5. **Validation**:
   - Start date must be <= end date. If violated, end date is cleared and warning via `notify.warning(CALENDAR_ERROR.START_DATE_LARGER_THEN_END_DATE)`.
   - End date must be >= start date. If violated, both dates cleared and warning shown.
6. **Auto-clear cascade**: `endDateWasSetRef` tracks whether end date was explicitly set. When end date is cleared after being set (validation error), start date is also cleared via useEffect.
7. Both pickers: `isClearable=true`, `calendarStartDay={1}` (Monday start).
8. `onDateChange(startDate, endDate, view)` called on every date change with Date objects and current view string.
9. Props `startDate`/`endDate` updates sync to internal state via useEffect. `dateIndicator` changes update view via useEffect.

## Validation
- Start date <= end date enforced in change handlers.
- Warnings via `useNotification()` -> `notify.warning()` using `CALENDAR_ERROR` constants.
- No min/max date bounds enforced.

## API Integration
- No direct API calls.
- **Constants**: `CALENDAR_UI`, `VIEW_OPTIONS`, `CALENDAR_ERROR` from `Constants/Constants`
- **Notifications**: `useNotification()` for date validation warnings

## Known Limitations
- Day format uses `YYYY-MM-d` (single digit day) instead of `YYYY-MM-DD`.
- The `endDateWasSetRef` auto-clear logic may surprise users: clearing end date also clears start date.
- Indicator selector hidden when `initialView === 'year'` -- cannot switch to day/month mode.
- `react-select` styles defined at module level reference CSS variables.
- `calendarStartDay={1}` hardcodes Monday as week start.
- `parseInitialDate` returns `null` silently for invalid date strings.
- The component renders two separate `DatePicker` instances per view mode via conditional branches -- six total DatePicker instances in the JSX, though only two are rendered at a time.

## Quality Score: 6/10

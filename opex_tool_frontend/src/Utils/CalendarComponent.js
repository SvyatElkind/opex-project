import React, { useEffect, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarComponent.css"; // Must come after react-datepicker.css to override defaults
import { CALENDAR_UI, VIEW_OPTIONS, CALENDAR_ERROR } from '../Constants/Constants';
import { useNotification } from '../components/Notification';
import { DATEPICKER_FORMAT } from './DateFormatter';

// Custom styles for react-select using CSS variables from theme.css
const selectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: 'var(--input-bg)',
        borderColor: state.isFocused ? 'var(--input-focus-border-color)' : 'var(--border-color-medium)',
        borderWidth: 'var(--border-width-thin)',
        borderRadius: 'var(--border-radius-base)',
        boxShadow: state.isFocused ? 'var(--input-focus-shadow)' : 'none',
        fontFamily: 'var(--font-family-primary)',
        fontSize: 'var(--input-font-size)',
        minHeight: '38px',
        transition: 'var(--transition-base)',
        '&:hover': {
            borderColor: 'var(--color-primary-light)'
        }
    }),
    valueContainer: (base) => ({
        ...base,
        padding: 'var(--spacing-1) var(--spacing-3)'
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--input-color)',
        fontFamily: 'var(--font-family-primary)'
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--text-light)'
    }),
    input: (base) => ({
        ...base,
        color: 'var(--input-color)'
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'var(--card-bg)',
        border: 'var(--border-width-thin) solid var(--border-color-medium)',
        borderRadius: 'var(--border-radius-base)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 'var(--z-index-dropdown)',
        marginTop: 'var(--spacing-1)'
    }),
    menuList: (base) => ({
        ...base,
        padding: 'var(--spacing-1)'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? 'var(--color-primary)'
            : state.isFocused
                ? 'var(--color-background-medium)'
                : 'transparent',
        color: state.isSelected ? 'var(--text-white)' : 'var(--text-primary)',
        fontFamily: 'var(--font-family-primary)',
        fontSize: 'var(--font-size-sm)',
        padding: 'var(--spacing-2) var(--spacing-3)',
        borderRadius: 'var(--border-radius-sm)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        '&:active': {
            backgroundColor: 'var(--color-primary-dark)'
        }
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: 'var(--border-color-light)'
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? 'var(--color-primary)' : 'var(--text-muted)',
        padding: 'var(--spacing-2)',
        transition: 'var(--transition-base)',
        '&:hover': {
            color: 'var(--color-primary)'
        }
    }),
    clearIndicator: (base) => ({
        ...base,
        color: 'var(--text-muted)',
        padding: 'var(--spacing-2)',
        cursor: 'pointer',
        transition: 'var(--transition-base)',
        '&:hover': {
            color: 'var(--color-error)'
        }
    })
};

// Normalize date to midnight for safe comparison (ignores time component)
const dateOnly = (d) => d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;

// Helper functions for date adjustment based on indicator
const adjustToStartDate = (date, indicator) => {
    if (!date) return null;
    switch (indicator) {
        case 'year':
            return new Date(date.getFullYear(), 0, 1); // Jan 1
        case 'month':
            return new Date(date.getFullYear(), date.getMonth(), 1); // 1st of month
        default:
            return date;
    }
};

const adjustToEndDate = (date, indicator) => {
    if (!date) return null;
    switch (indicator) {
        case 'year':
            return new Date(date.getFullYear(), 11, 31); // Dec 31
        case 'month':
            return new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of month
        default:
            return date;
    }
};

const CalendarComponent = ({
    onDateChange,
    preset,
    dateIndicator,
    startDate: initialStartDate,  // Initial start date from parent (string format YYYY-MM-DD)
    endDate: initialEndDate,      // Initial end date from parent (string format YYYY-MM-DD)
    // New props for UI customization
    hideLabels = false,           // Hide field labels
    compactPlaceholders = false,  // Use "no" / "līdz" placeholders
    hideIndicatorSelector = false // Hide the date indicator selector
}) => {
    const { notify } = useNotification();

    // Use dateIndicator if provided, otherwise fall back to preset
    const initialView = dateIndicator || preset || 'day';

    // Capture whether the indicator selector should be shown (based on FIRST mount value only)
    // If the component started with 'year' (e.g., inventory-level preset), hide the selector.
    // If it started with 'day' or 'month', keep the selector visible even when user changes to 'year'.
    const showIndicatorSelectorRef = useRef(initialView !== 'year');

    // Parse initial dates from string format to Date objects
    const parseInitialDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    const [startDate, _setStartDate] = useState(() => parseInitialDate(initialStartDate));
    const [endDate, _setEndDate] = useState(() => parseInitialDate(initialEndDate));
    const [view, _setView] = useState(initialView);

    // Refs that always hold the latest values — updated synchronously
    // so handlers never see stale sibling state.
    const startDateRef = useRef(startDate);
    const endDateRef = useRef(endDate);
    const viewRef = useRef(view);

    // Wrapped setters that update both state and ref synchronously
    const setStartDate = (val) => { startDateRef.current = val; _setStartDate(val); };
    const setEndDate = (val) => { endDateRef.current = val; _setEndDate(val); };
    const setView = (val) => { viewRef.current = val; _setView(val); };

    // Update internal state when initial props change (for edit mode)
    useEffect(() => {
        const parsedStart = parseInitialDate(initialStartDate);
        const parsedEnd = parseInitialDate(initialEndDate);
        if (parsedStart) setStartDate(parsedStart);
        if (parsedEnd) setEndDate(parsedEnd);
    }, [initialStartDate, initialEndDate]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update view when dateIndicator prop changes
    useEffect(() => {
        if (dateIndicator) {
            setView(dateIndicator);
        }
    }, [dateIndicator]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStartClear = () => {
        setStartDate(null);
        onDateChange(null, endDateRef.current, viewRef.current);
    };

    const handleEndClear = () => {
        setEndDate(null);
        onDateChange(startDateRef.current, null, viewRef.current);
    };

    // react-datepicker fires onChange on EVERY keystroke as it parses partial
    // text. Typing "2025" char by char produces: "2"→2001, "20"→2020,
    // "202"→2020, "2025"→2025. These intermediate parses can trigger
    // cross-field validation that incorrectly clears the sibling date.
    //
    // Fix: only accept dates in a reasonable range (year >= 1900).
    // Partial parses like "2"→2001 still pass this, so we also require
    // the year to be >= 1900 AND the date to have been entered as a
    // 4-digit year (the full string, not a 1-2 digit partial).
    // The simplest reliable approach: skip validation for dates with
    // year < 1900, and delay cross-field validation until the input
    // loses focus (onCalendarClose / onBlur).
    //
    // We use onSelect (fires only on calendar click or Enter on a valid
    // date) for immediate validation, and treat onChange as "just update
    // the local state without cross-field validation".

    const handleStartDateChange = (date) => {
        if (!date) return;
        const newStartDate = adjustToStartDate(date, viewRef.current);
        setStartDate(newStartDate);
        // Always notify parent so formData stays in sync.
        // Skip cross-field validation here (keystroke parses produce
        // partial dates). Validation runs on blur/close via commit*.
        onDateChange(newStartDate, endDateRef.current, viewRef.current);
    };

    const handleEndDateChange = (date) => {
        if (!date) return;
        const newEndDate = adjustToEndDate(date, viewRef.current);
        setEndDate(newEndDate);
        onDateChange(startDateRef.current, newEndDate, viewRef.current);
    };

    // Cross-field validation on blur/close — only warns, doesn't block
    // the parent from having the values.
    const commitStartDate = () => {
        const current = startDateRef.current;
        if (!current) return;
        if (endDateRef.current && dateOnly(current) > dateOnly(endDateRef.current)) {
            setEndDate(null);
            onDateChange(current, null, viewRef.current);
            notify.warning(CALENDAR_ERROR.START_DATE_LARGER_THEN_END_DATE);
        }
    };

    const commitEndDate = () => {
        const current = endDateRef.current;
        if (!current) return;
        if (startDateRef.current && dateOnly(current) < dateOnly(startDateRef.current)) {
            setStartDate(null);
            setEndDate(null);
            onDateChange(null, null, viewRef.current);
            notify.warning(CALENDAR_ERROR.END_DATE_SMALLER_THEN_START_DATE);
        }
    };



    // Get the default option object for the Select dropdown based on initialView
    const getDefaultViewOption = () => {
        return VIEW_OPTIONS.viewOptions.find(option => option.value === initialView) || VIEW_OPTIONS.viewOptions[0];
    };

    // Get placeholder text based on mode
    const getStartPlaceholder = () => {
        if (compactPlaceholders) return CALENDAR_UI.START_DATE_COMPACT;
        if (view === 'month') return CALENDAR_UI.START_DATE_MONTH_PLACE_HOLDER;
        if (view === 'year') return CALENDAR_UI.START_DATE_YEAR_PLACE_HOLDER;
        return CALENDAR_UI.START_DATE_PLACE_HOLDER;
    };

    const getEndPlaceholder = () => {
        if (compactPlaceholders) return CALENDAR_UI.END_DATE_COMPACT;
        if (view === 'month') return CALENDAR_UI.END_DATE_MONTH_PLACE_HOLDER;
        if (view === 'year') return CALENDAR_UI.END_DATE_YEAR_PLACE_HOLDER;
        return CALENDAR_UI.END_DATE_PLACE_HOLDER;
    };

    return (
        <div>
        {showIndicatorSelectorRef.current && !hideIndicatorSelector &&
            <Select
                options={VIEW_OPTIONS.viewOptions}
                value={VIEW_OPTIONS.viewOptions.find(option => option.value === view)}
                defaultValue={getDefaultViewOption()}
                onChange={(selectedOption) => setView(selectedOption.value)}
                styles={selectStyles}
                classNamePrefix="calendar-select"
            />
        }

        <div className="calendar-container">
            <div className="calendar">
                {!hideLabels && <label>{CALENDAR_UI.START_DATE_LABEL}</label>}
                <div className="calendar-input-wrapper">
                    {view === 'month' ? (
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                onCalendarClose={commitStartDate}
                                onBlur={commitStartDate}
                                showMonthYearPicker
                                dateFormat="MM.yyyy"
                                placeholderText={getStartPlaceholder()}
                                calendarStartDay={1}
                            />
                        ) : view === 'year' ? (
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                onCalendarClose={commitStartDate}
                                onBlur={commitStartDate}
                                showYearPicker
                                dateFormat="yyyy"
                                placeholderText={getStartPlaceholder()}
                                calendarStartDay={1}
                            />
                        ) : (
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                onCalendarClose={commitStartDate}
                                onBlur={commitStartDate}
                                dateFormat={DATEPICKER_FORMAT}
                                placeholderText={getStartPlaceholder()}
                                calendarStartDay={1}
                            />
                        )}
                    {startDate && (
                        <button type="button" className="calendar-clear-btn" onClick={handleStartClear} aria-label="Clear start date">
                            &times;
                        </button>
                    )}
                </div>
            </div>
            <div className="calendar">
                {!hideLabels && <label>{CALENDAR_UI.END_DATE_LABEL}</label>}
                <div className="calendar-input-wrapper">
                    {view === 'month' ? (
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                onCalendarClose={commitEndDate}
                                onBlur={commitEndDate}
                                showMonthYearPicker
                                dateFormat="MM.yyyy"
                                placeholderText={getEndPlaceholder()}
                                calendarStartDay={1}
                            />
                        ) : view === 'year' ? (
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                onCalendarClose={commitEndDate}
                                onBlur={commitEndDate}
                                showYearPicker
                                dateFormat="yyyy"
                                placeholderText={getEndPlaceholder()}
                                calendarStartDay={1}
                            />
                        ) : (
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                onCalendarClose={commitEndDate}
                                onBlur={commitEndDate}
                                dateFormat={DATEPICKER_FORMAT}
                                placeholderText={getEndPlaceholder()}
                                calendarStartDay={1}
                            />
                        )}
                    {endDate && (
                        <button type="button" className="calendar-clear-btn" onClick={handleEndClear} aria-label="Clear end date">
                            &times;
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default CalendarComponent;
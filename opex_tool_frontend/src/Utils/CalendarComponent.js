import React, { useEffect, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarComponent.css"; // Must come after react-datepicker.css to override defaults
import { CALENDAR_UI, VIEW_OPTIONS, CALENDAR_ERROR } from '../Constants/Constants';
import { useNotification } from '../components/Notification';

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

    const [startDate, setStartDate] = useState(() => parseInitialDate(initialStartDate));
    const [endDate, setEndDate] = useState(() => parseInitialDate(initialEndDate));
    const [view, setView] = useState(initialView); // Initialize view state based on dateIndicator or preset prop

    // Update internal state when initial props change (for edit mode)
    useEffect(() => {
        const parsedStart = parseInitialDate(initialStartDate);
        const parsedEnd = parseInitialDate(initialEndDate);
        if (parsedStart) setStartDate(parsedStart);
        if (parsedEnd) setEndDate(parsedEnd);
    }, [initialStartDate, initialEndDate]);

    // Update view when dateIndicator prop changes
    useEffect(() => {
        if (dateIndicator) {
            setView(dateIndicator);
        }
    }, [dateIndicator]);

    const handleStartDateChange = (date) => {
        const newStartDate = adjustToStartDate(date, view);
        // Compare date-only (ignore time) to allow same-day selection
        if (!endDate || dateOnly(newStartDate) <= dateOnly(endDate)) {
            setStartDate(newStartDate);
            onDateChange(newStartDate, endDate, view);
        }
        else {
            setEndDate(null);
            notify.warning(CALENDAR_ERROR.START_DATE_LARGER_THEN_END_DATE);
        }
    };

    const handleEndDateChange = (date) => {
        const newEndDate = adjustToEndDate(date, view);
        // Compare date-only (ignore time) to allow same-day selection
        if (!startDate || dateOnly(newEndDate) >= dateOnly(startDate)) {
            setEndDate(newEndDate);
            onDateChange(startDate, newEndDate, view);
        }
        else {
            setStartDate(null);
            setEndDate(null);
            notify.warning(CALENDAR_ERROR.END_DATE_SMALLER_THEN_START_DATE);
        }
    };

    // Track if endDate was explicitly cleared (validation error) vs never set
    const endDateWasSetRef = useRef(false);
    useEffect(() => {
        if (endDate !== null) {
            endDateWasSetRef.current = true;
        } else if (endDateWasSetRef.current) {
            // Only clear startDate when endDate was cleared after being set (validation error)
            setStartDate(null);
            endDateWasSetRef.current = false;
        }
    }, [endDate]);



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
                {view === 'month' ? (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showMonthYearPicker // Show month and year picker
                            dateFormat="yyyy-MM" // Format will be month/year
                            placeholderText={getStartPlaceholder()}
                            isClearable
                            calendarStartDay={1}
                        />
                    ) : view === 'year' ? (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showYearPicker // Show year picker
                            dateFormat="yyyy" // Format will be year only
                            placeholderText={getStartPlaceholder()}
                            isClearable
                            calendarStartDay={1}
                        />
                    ) : (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            dateFormat="yyyy-MM-dd" // Show full date
                            isClearable
                            placeholderText={getStartPlaceholder()}
                            calendarStartDay={1}
                        />
                    )}
            </div>
            <div className="calendar">
                {!hideLabels && <label>{CALENDAR_UI.END_DATE_LABEL}</label>}
                {view === 'month' ? (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showMonthYearPicker // Show month and year picker
                            dateFormat="YYYY-MM"
                            placeholderText={getEndPlaceholder()}
                            isClearable
                            calendarStartDay={1}
                        />
                    ) : view === 'year' ? (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showYearPicker // Show year picker
                            dateFormat="yyyy" // Format will be year only
                            placeholderText={getEndPlaceholder()}
                            isClearable
                            calendarStartDay={1}
                        />
                    ) : (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            dateFormat="yyyy-MM-dd" // Show full date
                            isClearable
                            placeholderText={getEndPlaceholder()}
                            calendarStartDay={1}
                        />
                    )}
            </div>
        </div>
    </div>
    );
};

export default CalendarComponent;
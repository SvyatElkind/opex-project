import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "./CalandarComponent.css";
import "react-datepicker/dist/react-datepicker.css";
import { CALENDAR_UI, VIEW_OPTIONS, CALENDAR_ERROR } from '../Constants/Constants';

///Implament Alerts


const CalendarComponent = ({onDateChange, preset, dateIndicator}) => {

    // Use dateIndicator if provided, otherwise fall back to preset
    const initialView = dateIndicator || preset || 'day';

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [view, setView] = useState(initialView); // Initialize view state based on dateIndicator or preset prop

    const handleStartDateChange = (date) => {
        const newStartDate = date; // New start date
        if (!endDate || newStartDate <= endDate) {
            setStartDate(newStartDate); // Set new start date
            onDateChange(newStartDate, endDate, view); // Pass the new dates back to the parent
        }
        else {
            setEndDate(null);
            alert(CALENDAR_ERROR.START_DATE_LARGER_THEN_END_DATE);
        }
    };

    const handleEndDateChange = (date) => {
        const newEndDate = date; // New end date
        if (!startDate || newEndDate >= startDate) {
            setEndDate(newEndDate); // Set new end date
            onDateChange(startDate, newEndDate, view); // Pass the new dates back to the parent
        }
        else {
            setStartDate(null);
            setEndDate(null);
            alert(CALENDAR_ERROR.END_DATE_SMALLER_THEN_START_DATE);
        }
    };

    useEffect(()=>{
    if(endDate === null){
        setStartDate(null);
        }
    },[endDate]);

    

    // Get the default option object for the Select dropdown based on initialView
    const getDefaultViewOption = () => {
        return VIEW_OPTIONS.viewOptions.find(option => option.value === initialView) || VIEW_OPTIONS.viewOptions[0];
    };

    return (
        <div>
        {initialView !== 'year' &&
            <Select
                options={VIEW_OPTIONS.viewOptions}
                value={VIEW_OPTIONS.viewOptions.find(option => option.value === view)}
                defaultValue={getDefaultViewOption()}
                onChange={(selectedOption) => setView(selectedOption.value)}
            />
        }

        <div className="calendar-container">
            <div className="calendar">
                <label>{CALENDAR_UI.START_DATE_LABEL}</label>
                {view === 'month' ? (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showMonthYearPicker // Show month and year picker
                            dateFormat="YYYY-MM" // Format will be month/year
                            placeholderText={CALENDAR_UI.START_DATE_MONTH_PLACE_HOLDER}
                            isClearable
                        />
                    ) : view === 'year' ? (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showYearPicker // Show year picker
                            dateFormat="YYYY" // Format will be year only
                            placeholderText={CALENDAR_UI.START_DATE_YEAR_PLACE_HOLDER}
                            isClearable
                        />
                    ) : (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            dateFormat="YYYY-MM-d" // Show full date
                            isClearable
                            placeholderText={CALENDAR_UI.START_DATE_PLACE_HOLDER}
                        />
                    )}
            </div>
            <div className="calendar">
                <label>{CALENDAR_UI.END_DATE_LABEL}</label>
                {view === 'month' ? (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showMonthYearPicker // Show month and year picker
                            dateFormat="YYYY-MM"
                            placeholderText={CALENDAR_UI.END_DATE_MONTH_PLACE_HOLDER}
                            isClearable
                        />
                    ) : view === 'year' ? (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showYearPicker // Show year picker
                            dateFormat="YYYY" // Format will be year only
                            placeholderText={CALENDAR_UI.END_DATE_YEAR_PLACE_HOLDER}
                            isClearable
                        />
                    ) : (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            dateFormat="YYYY-MM-d" // Show full date
                            isClearable
                            placeholderText={CALENDAR_UI.END_DATE_PLACE_HOLDER}
                        />
                    )}
            </div>
        </div>
    </div>
    );
};

export default CalendarComponent;
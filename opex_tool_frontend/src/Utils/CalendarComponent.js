import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "./CalandarComponent.css";
import "react-datepicker/dist/react-datepicker.css"; // Importing styles for react-datepicker

const viewOptions = [
    { value: 'day', label: 'Diena' },
    { value: 'month', label: 'Mēnesis' },
    { value: 'year', label: 'Gads' },
];

const CalendarComponent = ({onDateChange, preset}) => {

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [view, setView] = useState(preset); // Initialize view state based on preset prop

    const handleStartDateChange = (date) => {
        const newStartDate = date; // New start date
        if (!endDate || newStartDate <= endDate) {
            setStartDate(newStartDate); // Set new start date
            onDateChange(newStartDate, endDate, view); // Pass the new dates back to the parent
        }
        else {
            setEndDate(null);
            alert("Start date cannot be after the end date!");
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
            alert("Check if start date is before the end date");
        }
    };

    useEffect(()=>{
    if(endDate === null){
        setStartDate(null);
        }
    },[endDate]);

    

    return (
        <div>
        {preset !== 'year' &&
            <Select
                options={viewOptions}
                defaultValue={viewOptions[0]}
                onChange={(selectedOption) => setView(selectedOption.value)}
            />
        }

        <div className="calendar-container">
            <div className="calendar">
                <label>Start Date:</label>
                {view === 'month' ? (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showMonthYearPicker // Show month and year picker
                            dateFormat="MM/yyyy" // Format will be month/year
                            placeholderText="Select start month"
                            isClearable
                        />
                    ) : view === 'year' ? (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showYearPicker // Show year picker
                            dateFormat="yyyy" // Format will be year only
                            placeholderText="Select start year"
                            isClearable
                        />
                    ) : (
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            dateFormat="P" // Show full date
                            isClearable
                            placeholderText="Select start date"
                        />
                    )}
            </div>
            <div className="calendar">
                <label>End Date:</label>
                {view === 'month' ? (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showMonthYearPicker // Show month and year picker
                            dateFormat="MM/yyyy"
                            placeholderText="Select end month"
                            isClearable
                        />
                    ) : view === 'year' ? (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showYearPicker // Show year picker
                            dateFormat="yyyy" // Format will be year only
                            placeholderText="Select end year"
                            isClearable
                        />
                    ) : (
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            dateFormat="P" // Show full date
                            isClearable
                            placeholderText="Select end date"
                        />
                    )}
            </div>
        </div>
    </div>
    );
};

export default CalendarComponent;
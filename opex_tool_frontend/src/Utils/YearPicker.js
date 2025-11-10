import React, { useState, useRef, useEffect } from 'react';
import './YearPicker.css';

const YearPicker = ({ 
    value, 
    onChange, 
    placeholder = "Select Year", 
    className = "",
    disabled = false,
    label,
    isStartDate = true // true for start date (01-01), false for end date (12-31)
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Generate years range (current year ± 50 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

    // Parse the incoming value to extract year
    useEffect(() => {
        if (value) {
            const year = parseInt(value.split('-')[0]);
            setSelectedYear(year);
        } else {
            setSelectedYear(null);
        }
    }, [value]);

    // Handle year selection
    const handleYearSelect = (year) => {
        setSelectedYear(year);
        
        // Transform year to proper date format
        const formattedDate = isStartDate 
            ? `${year}-01-01`  // Start of year
            : `${year}-12-31`; // End of year
            
        onChange(formattedDate);
        setIsOpen(false);
    };

    // Handle clear selection
    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedYear(null);
        onChange('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (disabled) return;
        
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className={`year-picker-wrapper ${className}`}>
            {label && (
                <label className="inventory-create-label">
                    {label}
                </label>
            )}
            
            <div className="year-picker-container" ref={dropdownRef}>
                <div 
                    className={`year-picker-input ${isOpen ? 'year-picker-open' : ''} ${disabled ? 'year-picker-disabled' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    ref={inputRef}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                >
                    <span className={`year-picker-display ${!selectedYear ? 'year-picker-placeholder' : ''}`}>
                        {selectedYear || placeholder}
                    </span>
                    
                    <div className="year-picker-controls">
                        {selectedYear && !disabled && (
                            <button
                                type="button"
                                className="year-picker-clear-btn"
                                onClick={handleClear}
                                aria-label="Clear selection"
                            >
                                ×
                            </button>
                        )}
                        <div className={`year-picker-arrow ${isOpen ? 'year-picker-arrow-rotated' : ''}`}>
                            ▼
                        </div>
                    </div>
                </div>

                {isOpen && !disabled && (
                    <div className="year-picker-dropdown">
                        <div className="year-picker-options">
                            {years.map((year) => (
                                <div
                                    key={year}
                                    className={`year-picker-option ${selectedYear === year ? 'year-picker-option-active' : ''}`}
                                    onClick={() => handleYearSelect(year)}
                                    role="option"
                                    aria-selected={selectedYear === year}
                                >
                                    {year}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YearPicker;
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
    const [inputValue, setInputValue] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const textInputRef = useRef(null);
    const optionsRef = useRef(null);

    // Generate years range (current year ± 100 years for more range)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);

    // Parse the incoming value to extract year
    useEffect(() => {
        if (value) {
            const year = parseInt(value.split('-')[0]);
            setSelectedYear(year);
            setInputValue(year.toString());
        } else {
            setSelectedYear(null);
            setInputValue('');
        }
    }, [value]);

    // Scroll to current year when dropdown opens
    useEffect(() => {
        if (isOpen && optionsRef.current) {
            const targetYear = selectedYear || currentYear;
            const optionElements = optionsRef.current.querySelectorAll('.year-picker-option');
            const targetIndex = years.findIndex(y => y === targetYear);

            if (targetIndex >= 0 && optionElements[targetIndex]) {
                optionElements[targetIndex].scrollIntoView({
                    block: 'center',
                    behavior: 'instant'
                });
            }

            // Focus the text input when dropdown opens
            if (textInputRef.current) {
                textInputRef.current.focus();
            }
        }
    }, [isOpen, selectedYear, currentYear, years]);

    // Handle year selection
    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setInputValue(year.toString());

        // Transform year to proper date format
        const formattedDate = isStartDate
            ? `${year}-01-01`  // Start of year
            : `${year}-12-31`; // End of year

        onChange(formattedDate);
        setIsOpen(false);
    };

    // Handle typing in the input
    const handleInputChange = (e) => {
        const val = e.target.value;
        // Only allow numbers
        if (val === '' || /^\d{0,4}$/.test(val)) {
            setInputValue(val);

            // If user typed a valid 4-digit year, scroll to it
            if (val.length === 4) {
                const typedYear = parseInt(val, 10);
                if (typedYear >= years[0] && typedYear <= years[years.length - 1]) {
                    // Scroll to the typed year
                    if (optionsRef.current) {
                        const optionElements = optionsRef.current.querySelectorAll('.year-picker-option');
                        const targetIndex = years.findIndex(y => y === typedYear);
                        if (targetIndex >= 0 && optionElements[targetIndex]) {
                            optionElements[targetIndex].scrollIntoView({
                                block: 'center',
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            }
        }
    };

    // Handle Enter key to confirm typed year
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.length === 4) {
                const typedYear = parseInt(inputValue, 10);
                if (typedYear >= years[0] && typedYear <= years[years.length - 1]) {
                    handleYearSelect(typedYear);
                }
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setInputValue(selectedYear ? selectedYear.toString() : '');
        }
    };

    // Handle clear selection
    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedYear(null);
        setInputValue('');
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
                        <div className="year-picker-search">
                            <input
                                ref={textInputRef}
                                type="text"
                                className="year-picker-search-input"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Ievadīt gadu..."
                                maxLength={4}
                                autoComplete="off"
                            />
                        </div>
                        <div className="year-picker-options" ref={optionsRef}>
                            {years.map((year) => (
                                <div
                                    key={year}
                                    className={`year-picker-option ${selectedYear === year ? 'year-picker-option-active' : ''} ${inputValue.length === 4 && parseInt(inputValue, 10) === year ? 'year-picker-option-highlighted' : ''}`}
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
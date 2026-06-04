/**
 * DateFormatter Utility
 *
 * Formats dates and times according to user settings from SettingsContext.
 * Supports multiple date formats (YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY) and
 * time formats (24h, 12h).
 */

// react-datepicker token (lowercase) for the day-precision input format
export const DATEPICKER_FORMAT = 'dd.MM.yyyy';
// Placeholder shown to users — uppercase for clarity that it's a hint, not literal
export const DATE_PLACEHOLDER = 'DD.MM.YYYY';

/**
 * Parse a wire-format date string (YYYY-MM-DD or ISO timestamp) to a Date.
 * Returns null for falsy/invalid input.
 */
export const parseDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format a date string according to the specified format
 * @param {string|Date} dateStr - Date string or Date object
 * @param {string} format - Date format ('YYYY-MM-DD', 'DD.MM.YYYY', 'DD/MM/YYYY')
 * @param {string} dateIndicator - Optional precision ('day', 'month', 'year')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, format = 'YYYY-MM-DD', dateIndicator = 'day') => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ''; // Invalid date

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Handle date precision (year, month, day)
  if (dateIndicator === 'year') {
    return String(year);
  }

  if (dateIndicator === 'month') {
    // For month precision, format as MM.YYYY regardless of format setting
    return `${month}.${year}`;
  }

  // Full date formatting
  switch (format) {
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Format a date range according to the specified format
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @param {string} format - Date format
 * @param {string} dateIndicator - Optional precision
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate, format = 'YYYY-MM-DD', dateIndicator = 'day') => {
  const start = formatDate(startDate, format, dateIndicator);
  const end = formatDate(endDate, format, dateIndicator);

  if (start && end) {
    return `${start} - ${end}`;
  } else if (start) {
    return start;
  } else if (end) {
    return end;
  }
  return '-';
};

/**
 * Format a time string according to the specified format
 * @param {string|Date} timeStr - Time string or Date object
 * @param {string} format - Time format ('24h' or '12h')
 * @returns {string} Formatted time string
 */
export const formatTime = (timeStr, format = '24h') => {
  if (!timeStr) return '';

  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return '';

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  }

  // 24h format
  const hours24 = String(hours).padStart(2, '0');
  return `${hours24}:${minutes}`;
};

/**
 * Format a datetime string according to the specified formats
 * @param {string|Date} dateTimeStr - DateTime string or Date object
 * @param {string} dateFormat - Date format
 * @param {string} timeFormat - Time format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateTimeStr, dateFormat = 'YYYY-MM-DD', timeFormat = '24h') => {
  if (!dateTimeStr) return '';

  const date = formatDate(dateTimeStr, dateFormat);
  const time = formatTime(dateTimeStr, timeFormat);

  return `${date} ${time}`;
};

export default {
  parseDate,
  formatDate,
  formatDateRange,
  formatTime,
  formatDateTime,
  DATEPICKER_FORMAT,
  DATE_PLACEHOLDER
};

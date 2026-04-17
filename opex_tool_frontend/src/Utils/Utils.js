export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatYear = (date) => {
    return date.getFullYear();
};

// Keep backward-compatible factory export for existing callers
const Utils = () => ({
    formatDate,
    formatYear
});

export default Utils;

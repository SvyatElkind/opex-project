const Utils = () =>{
    const formatDate = (date) => {
        const year = date.getFullYear(); // Get the 4-digit year
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get the month (0-11), add 1 for correct month, pad with zero
        const day = date.getDate().toString().padStart(2, '0'); // Get the day of the month, pad with zero
        
        return `${year}-${month}-${day}`; // Return formatted date string
    };

    return{
        formatDate
    };
}
export default Utils;
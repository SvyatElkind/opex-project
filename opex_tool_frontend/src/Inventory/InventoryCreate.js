import React,{useState} from "react";
import Inventory_API from "../API/Inventory_API";
import CalendarComponent from "../Utils/CalendarComponent";
import Select from 'react-select';
import { INVENTORY_CONSTANTS } from "../Constants/Constnats";
import Utils from "../Utils/Utils";

const typeOptions = [
    {value: INVENTORY_CONSTANTS.TYPE[0] ,label:INVENTORY_CONSTANTS.TYPE[0]},
    {value: INVENTORY_CONSTANTS.TYPE[1] ,label:INVENTORY_CONSTANTS.TYPE[1]},
    {value: INVENTORY_CONSTANTS.TYPE[2] ,label:INVENTORY_CONSTANTS.TYPE[2]},
    {value: INVENTORY_CONSTANTS.TYPE[3] ,label:INVENTORY_CONSTANTS.TYPE[3]},
    {value: INVENTORY_CONSTANTS.TYPE[4] ,label:INVENTORY_CONSTANTS.TYPE[4]},
];

const strogeTermOptions = [
    {value: INVENTORY_CONSTANTS.TERMS[0], label:INVENTORY_CONSTANTS.TERMS[0]},
    {value: INVENTORY_CONSTANTS.TERMS[1], label:INVENTORY_CONSTANTS.TERMS[1]},
];



const InventoryCreate = ({onClose, onInventoryCreated, activeProjectData}) =>{
    const [type, setType] = useState('');
    const [subfond, setSubfond] = useState(0);
    const [electronic, setElectronic] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [storageTerm, setStorageTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); 
    const [subFondEndabled,setSubFondEnabled] = useState(false);

    const inventoryAPI = Inventory_API(); 
    const utils = Utils();

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        const fond = activeProjectData.institution.fond.id;
        const project = activeProjectData.id;
        const number = activeProjectData.institution.fond.inventories.length + 1;
        const start_date = utils.formatDate(startDate);
        const end_date = utils.formatDate(endDate);
        const postfix = '';

        const inventoryData = {
            number,
            subfond,
            postfix,
            type,
            electronic,
            start_date,
            end_date,
            storage_term: storageTerm,
            fond:{
                id:fond,
            }, 
        };

        const [success, response] = await inventoryAPI.createInventory(project, fond ,inventoryData); 

        if (success) {
            onInventoryCreated(); 
            onClose(); 
        } else {
            setErrorMessage(response);
        }
    };

    const handleDateChange = (startDate, endDate, view) => {
        setStartDate(startDate); // Update the start date state
        setEndDate(endDate);     // Update the end date state
        setStorageTerm(view);
        console.log("Selected Start Date:", startDate);
        console.log("Selected End Date:", endDate);
        console.log("Selected View:", view);
    };

    return(
        <div className="popup-background">
        <div className="popup">
            <div className="close-button">
                <button onClick={onClose}>Close</button>
            </div>
            <h2>Create New Inventory</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group"> {/* Flexbox container */}
                    <div className="input-column">
                        <label>
                            Electronic:
                            <input type="checkbox"
                                checked={electronic}
                                onChange={(e) => setElectronic(e.target.checked)} />
                        </label>
                        <label>
                            Type:
                            <Select
                                options={typeOptions}
                                defaultValue={typeOptions[0]}
                                onChange={(selectedOption) => setType(selectedOption.value)}
                            />
                        </label>
                        <label>
                            Subfond:
                            <input type="checkbox"
                                checked={subFondEndabled}
                                onChange={(e) => setSubFondEnabled(e.target.checked)} />
                            
                            {subFondEndabled && <input 
                            type="number" min ='0' max='9'
                            onChange={(e) => setSubfond(e.target.checked)}
                            />}
                        </label>
                    </div>
                    <div className="input-column">
                        <CalendarComponent onDateChange={handleDateChange} preset='year'/>
                        <label>
                            Storage Term:
                            <Select
                                options={strogeTermOptions}
                                defaultValue={strogeTermOptions[0]}
                                onChange={(selectedOption) => setStorageTerm(selectedOption.value)}
                            />
                        </label>
                    </div>
                </div>
                <div className="input-group">

                </div>
                <button type="submit">Create Inventory</button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
                </form>
            </div>
        </div>
    )                   
}

export default InventoryCreate;
import React,{useEffect, useState} from "react";
import { INSTITUTION_CONSTANTS, INVENTORY_CONSTANTS, INVENTORY_UI, UI_TEXT } from "../Constants/Constnats";
import InventoryItem from "./InventoryItem";
import InventoryCreate from "./InventoryCreate";
import Project_API from "../API/Project_API";
import './Inventories.css';
import Inventory_API from "../API/Inventory_API";


const Inventories = ({ activeProjectData}) => {
    const [activeProject, setActiveProject] =useState(activeProjectData)
    const [inventoriesData,setInventoriesData] = useState(activeProjectData.institution.fond.inventories);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [createInvPopup, setCreateInvPopup] = useState(false);
    const [projectId, setProjectID] = useState(activeProjectData.id);
    const [toolTip, setTooltip] = useState(null);
    const [toolTipContent, setToolTipContent] = useState('');
    
    const projectAPI = Project_API();
    const inventoryAPI = Inventory_API();

    const handleActiveProjectUpdate = async () =>{
        try{
            const [sucess,result] = await projectAPI.get_project(projectId);
            if(!sucess){return result;}
            setActiveProject(result);
            setInventoriesData(result.institution.fond.inventories);
            setProjectID(result.id);
        }catch(error){
            console.log(error);
        }
    }

    const handleDelete = async () =>{
        const [success, result] = await inventoryAPI.deleteInventory(projectId,selectedInventory.id)
        if(!success){
            console.error(result)
        }else{
            handleActiveProjectUpdate();
            setSelectedInventory(null);
            console.log(result);
        }
    };

    const handleItemCreated =() =>{

    };

    const handleInventoryClick = (inventory) => {
        setSelectedInventory(inventory);
    };

    const toggleInvPopup = () => {
        setCreateInvPopup(prev => !prev);
    };

    const handleInventoryCreated = () => {
        // Logic to refresh or fetch inventories can go here
        handleActiveProjectUpdate();
        // For now, we'll just log it to simulate refresh
        console.log('New inventory created, refresh the list here.'); // Placeholder for actual implementation
    };

    const handleAddInventoryTooltip = () =>{
        setTooltip(true);
        setToolTipContent(INVENTORY_UI.CREATE_INV_BTN);
    };

    const hideTooltip = () => {
        setTooltip(false);
        setToolTipContent('');
    };



    useEffect(()=>{
        setInventoriesData(activeProjectData.institution.fond.inventories)
        setProjectID(activeProjectData.id)
    },[activeProjectData])

    return (
    <div className="inventories-container">
        {createInvPopup && 
            <InventoryCreate 
                onClose={toggleInvPopup}
                onInventoryCreated ={handleInventoryCreated}
                activeProjectData ={activeProject}
            />
        }

        <div className="inventory-list">
            <input 
                className="add-button"
                type="button" 
                value=" + "
                onClick={toggleInvPopup}
                onMouseEnter={() => {handleAddInventoryTooltip()}}
                onMouseLeave={() => {hideTooltip()}}
            />
            {toolTip && (<div className="add_inv_tooltip">{toolTipContent}</div>)}
            <p className="us-title">Uzskaites Saraksti:</p>
            {Array.isArray(inventoriesData) && inventoriesData.length > 0 ? (
                inventoriesData.map((inventory) => (
                    <div 
                        key={inventory.id} 
                        className="inventory-item" 
                        onClick={() => handleInventoryClick(inventory)}
                    >
                        <p>{inventory.number}</p>
                    </div>
                ))
            ) : (
                <p>No inventories available.</p>
            )}
        </div>
        <div className="inventory-details">
            {selectedInventory ? (
                <InventoryItem inventory={selectedInventory} projectId ={projectId} onDelete={handleDelete} onItemcreated={handleItemCreated}/> 
            ) : (
                <p>Select an inventory to view details.</p>
            )}
        </div>
    </div>
);
}

export default Inventories;
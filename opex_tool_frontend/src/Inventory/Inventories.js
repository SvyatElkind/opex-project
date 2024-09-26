import React,{useState} from "react";
import { UI_TEXT } from "../Constants/Constnats";
import Inventory_Item from "./Inventory_Item";
import InventoryCreate from "./InventoryCreate";
import './Inventories.css';


const Inventories = ({ activeProjectData}) => {
    console.log("Project")
    console.log(activeProjectData)

    const [inventoriesData,setInventoriesData] = useState(activeProjectData.institution.fond.inventories);

    const [selectedInventory, setSelectedInventory] = useState(null);

    const [createInvPopup, setCreateInvPopup] = useState(false);

    const handleInventoryClick = (inventory) => {
        setSelectedInventory(inventory);
    };

    const toggleInvPopup = () => {
        setCreateInvPopup(prev => !prev);
    };

    const handleInventoryCreated = () => {
        // Logic to refresh or fetch inventories can go here
        // For now, we'll just log it to simulate refresh
        console.log('New inventory created, refresh the list here.'); // Placeholder for actual implementation
    };

    return (
    <div className="inventories-container">
        {createInvPopup && 
            <InventoryCreate 
                onClose={toggleInvPopup}
                onInventoryCreated ={handleInventoryCreated}
                activeProjectData ={activeProjectData}
            />
        }
        <div className="inventory-list">
            <input 
                type="button" 
                value="Izveidot Jaunu Uzskaites Sarakstu"
                onClick={toggleInvPopup}
            />
            {Array.isArray(inventoriesData) && inventoriesData.length > 0 ? (
                inventoriesData.map((inventory) => (
                    <div 
                        key={inventory.id} 
                        className="inventory-item" 
                        onClick={() => handleInventoryClick(inventory)}
                    >
                        <p><strong>Invnetory Number</strong>: {inventory.number}</p>
                    </div>
                ))
            ) : (
                <p>No inventories available.</p>
            )}
        </div>
        <div className="inventory-details">
            {selectedInventory ? (
                <Inventory_Item inventory={selectedInventory} /> 
            ) : (
                <p>Select an inventory to view details.</p>
            )}
        </div>
    </div>
);
}

export default Inventories;
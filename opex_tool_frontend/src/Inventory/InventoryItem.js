import React,{useEffect, useState} from "react";
import InventoryDelete from "./InventoryDelete";
import Items from "../Item/Items";

const InventoryItem = ({inventory,projectId, onDelete}) => {

    const [activeInventory, setActiveInventory] = useState(inventory)
    const [deletePopupVisable, setDeletePopupVisable] = useState(false);
    const [fromReport, setFromReport] = useState(inventory.from_report);
    const [invDetails, setInvDetails] = useState(false);

    const toggledelete = () =>{setDeletePopupVisable(!deletePopupVisable);};
    const handleDelete = () =>{onDelete();};
    const toggleInvDetails = () => {setInvDetails(prev => !prev)}

    useEffect(()=>{
        setActiveInventory(inventory);
        setFromReport(inventory.from_report);
    },[inventory])

    return( 
        <div className="inventory-item-details">
        <div>
            {deletePopupVisable && (<InventoryDelete onConfirm={handleDelete} onCancel={toggledelete}/>)}
            {!fromReport ? (<input type="button" value="Dzēst Uzskaites Sarakstu" onClick={toggledelete}/>) : ('')}
            <input type="button" value={invDetails ? "Paslēpt" : "Parādīt" } onClick={toggleInvDetails}/>
        </div>
        {invDetails && <div>
            <h4>Uzaskaits Saraksta Detaļas</h4>
        <p><strong>ID:</strong> {activeInventory.id}</p>
        <p><strong>Numurs:</strong> {activeInventory.number}</p>
        <p><strong>Tips:</strong> {activeInventory.type}</p>
        <p><strong>Atļaut redigēt:</strong> {activeInventory.allow_full_field_update ? "Yes" : "No"}</p>
        <p><strong>Elektronisks:</strong> {activeInventory.electronic ? "Yes" : "No"}</p>
        <p><strong>Pēdējais GV:</strong> {activeInventory.last_gv}</p>
        <p><strong>GV par Periodu:</strong> {activeInventory.items_per_period}</p>
        <p><strong>Kopējais Gv skaits:</strong> {activeInventory.total_items}</p>
        <p><strong>Glabāšanas Termiņš</strong> {activeInventory.storage_term}</p>
        <p><strong>Subfonds:</strong> {activeInventory.postfix}</p>
        <p><strong>Sākuma Datums:</strong> {activeInventory.start_date ? new Date(activeInventory.start_date).toLocaleDateString() : "N/A"}</p>
        <p><strong>Beigu Datums:</strong> {activeInventory.end_date ? new Date(activeInventory.end_date).toLocaleDateString() : "N/A"}</p>
        <p><strong>Glabājamās vienības:</strong> {activeInventory.items.length > 0 ? activeInventory.items.map(item => item.number).join(", ") : "No items"}</p>
        </div>}
        <Items items ={activeInventory.items} projectId = {projectId} inventoryId={activeInventory.id}/>
    </div>
)
}

export default InventoryItem;
import React from "react";
import "./InventoryDelete.css";

const InventoryDelete = ({ onConfirm, onCancel}) =>{


return(
    <div className="popup-overlay">
    <div className="popup-content">
      <h1>DELETING INVENTORY!</h1>
      <p>Deleting inventory is permanent! All changes made within this Inventory will be undone!</p>
      <input type="button" onClick={onCancel} value="Cancel" className="popup-button cancel-button" />
      <input type="button" onClick={onConfirm} value="Delete" className="popup-button delete-button" />
      
    </div>
  </div>
)
}

export default InventoryDelete;
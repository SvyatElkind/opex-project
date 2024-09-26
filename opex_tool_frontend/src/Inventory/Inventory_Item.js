import React from "react";

const Inventory_Item = ({inventory}) => {

    console.log(inventory);
    return( <div className="inventory-item-details">
        <h4>Inventory Details</h4>
        <p><strong>ID:</strong> {inventory.id}</p>
        <p><strong>Number:</strong> {inventory.number}</p>
        <p><strong>Type:</strong> {inventory.type}</p>
        <p><strong>Allow Full Field Update:</strong> {inventory.allow_full_field_update ? "Yes" : "No"}</p>
        <p><strong>Electronic:</strong> {inventory.electronic ? "Yes" : "No"}</p>
        <p><strong>Last GV:</strong> {inventory.last_gv}</p>
        <p><strong>Items Per Period:</strong> {inventory.items_per_period}</p>
        <p><strong>Total Items:</strong> {inventory.total_items}</p>
        <p><strong>Storage Term:</strong> {inventory.storage_term}</p>
        <p><strong>Postfix:</strong> {inventory.postfix}</p>
        <p><strong>Start Date:</strong> {inventory.start_date ? new Date(inventory.start_date).toLocaleDateString() : "N/A"}</p>
        <p><strong>End Date:</strong> {inventory.end_date ? new Date(inventory.end_date).toLocaleDateString() : "N/A"}</p>
        <p><strong>Items:</strong> {inventory.items.length > 0 ? inventory.items.map(item => item.number).join(", ") : "No items"}</p>
    </div>
)
}

export default Inventory_Item;
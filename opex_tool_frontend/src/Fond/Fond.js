import React from "react";

const Fond = ({ fond }) => {
    if (!fond) return null;
    const createdItems = fond.inventories?.reduce((total, inv) => total + (inv.items_per_period || 0), 0) || 0;
    const totalItems = fond.inventories?.reduce((total, inv) => total + (inv.total_items || 0), 0) || 0;
    const inventoryCount = fond.inventories?.length || 0;
    console.log(fond);

    return (
        <div className="simple-fond-container">
            <div className="simple-fond-header">
                <div className="simple-fond-meta">
                    <span className="simple-fond-title" >{fond.arch_title} {fond.fond_number} "{fond.fond_title}"</span>
                    <span className="simple-fond-code">{fond.fond_code}</span>
                </div>
            </div>
            <div className="simple-fond-content">
                <div className="simple-fond-summary">
                    <span className="simple-summary-label">
                        Uzskaites saraksti:
                        <span className="simple-summary-value">
                            {inventoryCount}
                        </span>
                    </span>
                    <span className="simple-summary-label">
                        Iepriekšējās fondā importētās Glabājamās vienības:
                        <span className="simple-summary-value">
                            {totalItems - createdItems}
                            </span>
                    </span>
                    <span className="simple-summary-label">
                        Glabājamās vienības šajā nodevumā:
                        <span className="simple-summary-value">
                            {createdItems}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Fond;
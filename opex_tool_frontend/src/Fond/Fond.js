import React, { useState } from "react";
import "./Fond.css";

const Fond = ({ fond }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!fond) return null;

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="fond-container">
            <div className="fond-header" onClick={toggleExpanded}>
                <div className="fond-title">
                    <div className="fond-main-info">
                        <span className="fond-archive">{fond.arch_title}</span>
                        <span className="fond-number">№{fond.fond_number}</span>
                    </div>
                    <div className="fond-name">"{fond.fond_title}"</div>
                </div>
                <div className="fond-controls">
                    <span className="fond-code">{fond.fond_code}</span>
                    <button className="expand-btn" type="button">
                        <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>
                </div>
            </div>
            
            {isExpanded && (
                <div className="fond-details">
                    <div className="fond-stats">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <div className="stat-value">{fond.inventories?.length || 0}</div>
                                <div className="stat-label">Uzskaites saraksti</div>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <div className="stat-value">
                                    {fond.inventories?.reduce((total, inv) => total + (inv.items_per_period || 0), 0) || 0}
                                </div>
                                <div className="stat-label">Kopējās vienības</div>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon">🏛️</div>
                            <div className="stat-info">
                                <div className="stat-value">{fond.fond_code}</div>
                                <div className="stat-label">Fonda kods</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="fond-description">
                        <h4>Informācija par fondu</h4>
                        <div className="description-grid">
                            <div className="description-item">
                                <span className="desc-label">Arhīva nosaukums:</span>
                                <span className="desc-value">{fond.arch_title}</span>
                            </div>
                            <div className="description-item">
                                <span className="desc-label">Fonda numurs:</span>
                                <span className="desc-value">{fond.fond_number}</span>
                            </div>
                            <div className="description-item">
                                <span className="desc-label">Fonda nosaukums:</span>
                                <span className="desc-value">"{fond.fond_title}"</span>
                            </div>
                            <div className="description-item">
                                <span className="desc-label">Fonda kods:</span>
                                <span className="desc-value">{fond.fond_code}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fond;
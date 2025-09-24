import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';

const QuickJump = ({ projectData }) => {
  const { navigateTo } = useNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickJumpItems, setQuickJumpItems] = useState([]);
  const dropdownRef = useRef(null);
  const toggleRef = useRef(null);
  
  // Prepare quick jump items whenever project data changes - ENHANCED WITH RECORDS
  useEffect(() => {
    if (!projectData || !projectData.institution?.fond?.inventories) {
      setQuickJumpItems([]);
      return;
    }
    
    const items = [];
    
    try {
      const inventories = projectData.institution.fond.inventories;
      const sortedInventories = [...inventories].sort((a, b) => 
        parseInt(a.number) - parseInt(b.number)
      );
      
      sortedInventories.forEach(inv => {
        // Add inventory
        items.push({
          id: inv.id,
          label: `Uzskaites Saraksts ${inv.number} (${inv.items_per_period || 0} vienības)`,
          type: 'inventory',
          extraInfo: `${inv.type || 'Nav norādīts'} - ${inv.storage_term || 'Nav norādīts'}`,
          icon: '📋'
        });
        
        if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
          // Sort items by number
          const sortedItems = [...inv.items].sort((a, b) => 
            parseInt(a.number) - parseInt(b.number)
          );
          
          sortedItems.forEach(item => {
            items.push({
              id: item.id,
              label: `Glabājamā Vienība ${item.number}`,
              type: 'item',
              parentId: inv.id,
              extraInfo: `${item.title || 'Nav nosaukuma'} (${item.start_date ? 
                new Date(item.start_date).toLocaleDateString('lv-LV') : 'Nav datuma'} - ${item.end_date ? 
                new Date(item.end_date).toLocaleDateString('lv-LV') : 'Nav datuma'})`,
              icon: '📦'
            });
            
            // Add records if they exist - NEW FUNCTIONALITY
            if (item.records && Array.isArray(item.records) && item.records.length > 0) {
              item.records.forEach(record => {
                if (record && record.id) {
                  items.push({
                    id: record.id,
                    label: `Ieraksts: ${record.title || record.reg_nr || `Record ${record.id}`}`,
                    type: 'record',
                    parentId: inv.id,
                    itemId: item.id,
                    extraInfo: `${record.author || 'Nav autora'} - ${record.date ? 
                      new Date(record.date).toLocaleDateString('lv-LV') : 'Nav datuma'}`,
                    icon: '📄'
                  });
                }
              });
            }
          });
        }
      });
      
      setQuickJumpItems(items);
    } catch (error) {
      console.error('Error generating quick jump items:', error);
      setQuickJumpItems([]);
    }
  }, [projectData]);
  
  // Filter items based on search term - ENHANCED FOR RECORDS
  const filteredItems = searchTerm.trim() === '' 
    ? quickJumpItems.slice(0, 25) // Show more items since we have records now
    : quickJumpItems.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.extraInfo && item.extraInfo.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 25);
  
  // Handle item selection - ENHANCED FOR RECORDS
  const handleSelectItem = (item) => {
    try {
      switch (item.type) {
        case 'inventory':
          navigateTo('inventory', item.id);
          break;
        case 'item':
          navigateTo('item', item.id, item.parentId);
          break;
        case 'record':
          navigateTo('record', item.id, item.parentId, item.itemId);
          break;
        default:
          break;
      }
      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error navigating to item:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          toggleRef.current &&
          !toggleRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle body class for dropdown state
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('dropdown-open');
    } else {
      document.body.classList.remove('dropdown-open');
    }

    return () => {
      document.body.classList.remove('dropdown-open');
    };
  }, [isOpen]);

  // Handle toggle click
  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search input key events
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Count different types of items
  const getItemCounts = () => {
    const counts = {
      inventories: 0,
      items: 0,
      records: 0
    };
    
    quickJumpItems.forEach(item => {
      switch (item.type) {
        case 'inventory':
          counts.inventories++;
          break;
        case 'item':
          counts.items++;
          break;
        case 'record':
          counts.records++;
          break;
        default:
          break;
      }
    });
    
    return counts;
  };

  const counts = getItemCounts();
  
  return (
    <div className="quick-jump">
      <button 
        ref={toggleRef}
        className="quick-jump-toggle"
        onClick={handleToggleClick}
        type="button"
        title={`Meklēt: ${counts.inventories} saraksti, ${counts.items} vienības, ${counts.records} ieraksti`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Meklēt</span>
        <span className="quick-jump-counts">
          ({counts.inventories + counts.items + counts.records})
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="quick-jump-dropdown"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Quick navigation"
        > 
          <div className="quick-jump-search">
            <input 
              type="text"
              placeholder="Meklēt sarakstus, vienības un ierakstus..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              autoFocus
              aria-label="Search navigation items"
            />
          </div>
          
          <div className="quick-jump-items">
            {filteredItems.length > 0 ? (
              <>
                {filteredItems.map((item, index) => (
                  <div 
                    key={`${item.type}-${item.id}-${index}`}
                    className={`quick-jump-item quick-jump-item-${item.type}`}
                    onClick={() => handleSelectItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectItem(item);
                      }
                    }}
                  >
                    <div className="quick-jump-item-label">
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-text">{item.label}</span>
                    </div>
                    {item.extraInfo && (
                      <div className="quick-jump-item-info">{item.extraInfo}</div>
                    )}
                  </div>
                ))}
                {quickJumpItems.length > 25 && searchTerm.trim() === '' && (
                  <div className="quick-jump-more">
                    Rādīti pirmie 25 no {quickJumpItems.length} ierakstiem. 
                    Meklējiet, lai sašaurinātu rezultātus.
                  </div>
                )}
                {searchTerm.trim() !== '' && quickJumpItems.filter(item => 
                  item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (item.extraInfo && item.extraInfo.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length > 25 && (
                  <div className="quick-jump-more">
                    Rādīti pirmie 25 rezultāti. Turpiniet rakstīt, lai sašaurinātu meklēšanu.
                  </div>
                )}
              </>
            ) : searchTerm.trim() !== '' ? (
              <div className="quick-jump-empty">
                Nav atrasts neviens rezultāts meklēšanai "{searchTerm}"
              </div>
            ) : quickJumpItems.length > 0 ? (
              <div className="quick-jump-empty">
                Ielāde {quickJumpItems.length} ierakstus...
              </div>
            ) : (
              <div className="quick-jump-empty">
                Uzskaites sarakstu, glabājamo vienību un ierakstu nav
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickJump;
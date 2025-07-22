import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';

const QuickJump = ({ projectData }) => {
  const { navigateTo } = useNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickJumpItems, setQuickJumpItems] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);
  const toggleRef = useRef(null);
  
  // Update dropdown position when toggle button position changes
  const updateDropdownPosition = () => {
    if (toggleRef.current && isOpen) {
      const rect = toggleRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate optimal position
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Position dropdown below toggle if there's space, otherwise above
      if (spaceBelow >= 400 || spaceBelow >= spaceAbove) {
        setDropdownPosition({
          top: rect.bottom + scrollY + 8,
          right: window.innerWidth - rect.right
        });
      } else {
        setDropdownPosition({
          top: rect.top + scrollY - 400, // Approximate dropdown height
          right: window.innerWidth - rect.right
        });
      }
    }
  };

  // Update position when opening dropdown or on scroll/resize
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);
  
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
            if (item && item.id) {
              // Add item
              items.push({
                id: item.id,
                parentId: inv.id,
                label: `└ Glabājamā vienība ${item.number} - ${item.title || 'Nav Nosaukuma'}`,
                type: 'item',
                extraInfo: `${item.series_code || 'Nav koda'} | ${item.language || 'Nav valodas'} | ${item.records?.length || 0} ieraksti`,
                icon: '📦'
              });
              
              // Add records for this item - NEW FUNCTIONALITY
              if (item.records && Array.isArray(item.records) && item.records.length > 0) {
                // Sort records by registration number or title
                const sortedRecords = [...item.records].sort((a, b) => {
                  const aSort = a.reg_nr || a.title || '';
                  const bSort = b.reg_nr || b.title || '';
                  return aSort.localeCompare(bSort);
                });
                
                sortedRecords.forEach(record => {
                  if (record && record.id) {
                    items.push({
                      id: record.id,
                      parentId: inv.id,
                      itemId: item.id,
                      label: `  └ Ieraksts: ${record.reg_nr || record.title || 'Nav numura'}`,
                      type: 'record',
                      extraInfo: `${record.title || 'Nav nosaukuma'} | ${record.language || 'Nav valodas'} | ${record.date ? new Date(record.date).toLocaleDateString('lv-LV') : 'Nav datuma'}`,
                      icon: '📄'
                    });
                  }
                });
              }
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
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            zIndex: 10001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="quick-jump-search">
            <input 
              type="text"
              placeholder="Meklēt sarakstus, vienības un ierakstus..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              autoFocus
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
                Ielādē {quickJumpItems.length} ierakstus...
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
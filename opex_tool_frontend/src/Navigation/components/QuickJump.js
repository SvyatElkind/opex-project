import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { HIERARCHY_ICONS } from '../../Constants/iconConstants';

const QuickJump = ({ projectData }) => {
  const { navigateTo } = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickJumpItems, setQuickJumpItems] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Prepare quick jump items whenever project data changes - ENHANCED WITH RECORDS AND FILES
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
        // Add inventory - include postfix if exists (postfix already includes the period)
        const invLabel = inv.postfix
          ? `${inv.number}${inv.postfix} uzskaites saraksts`
          : `${inv.number}. uzskaites saraksts`;
        items.push({
          id: inv.id,
          label: invLabel,
          type: 'inventory',
          extraInfo: `${inv.type || 'Nav norādīts'} - ${inv.storage_term || 'Nav norādīts'}`,
          icon: HIERARCHY_ICONS.INVENTORY,
          searchFields: [
            inv.number?.toString(),
            inv.type,
            inv.storage_term
          ].filter(Boolean)
        });

        if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
          // Sort items by number
          const sortedItems = [...inv.items].sort((a, b) =>
            parseInt(a.number) - parseInt(b.number)
          );

          sortedItems.forEach(item => {
            // Collect file names from item
            const itemFileNames = item.files?.map(f => f.original_name).filter(Boolean) || [];

            items.push({
              id: item.id,
              label: `${item.number}. glabājamā vienība`,
              type: 'item',
              parentId: inv.id,
              extraInfo: `${item.title || 'Nav nosaukuma'} (${item.start_date ?
                new Date(item.start_date).toLocaleDateString('lv-LV') : 'Nav datuma'} - ${item.end_date ?
                new Date(item.end_date).toLocaleDateString('lv-LV') : 'Nav datuma'})`,
              icon: HIERARCHY_ICONS.ITEM,
              // Extended search fields for items
              searchFields: [
                item.number?.toString(),
                item.title,
                item.series_code,
                item.language,
                item.restriction,
                item.security_level,
                item.notes,
                ...itemFileNames
              ].filter(Boolean)
            });

            // Add records if they exist
            if (item.records && Array.isArray(item.records) && item.records.length > 0) {
              item.records.forEach(record => {
                if (record && record.id) {
                  // Collect file names from record
                  const recordFileNames = record.files?.map(f => f.original_name).filter(Boolean) || [];
                  const filesCount = record.files?.length || 0;

                  // Build extraInfo for records: reg_nr, date, datnes:[count]
                  const extraInfoParts = [];
                  if (record.reg_nr) extraInfoParts.push(record.reg_nr);
                  if (record.date) extraInfoParts.push(new Date(record.date).toLocaleDateString('lv-LV'));
                  extraInfoParts.push(`datnes: ${filesCount}`);

                  items.push({
                    id: record.id,
                    label: record.title || record.reg_nr || `Dokuments ${record.id}`,
                    type: 'record',
                    parentId: inv.id,
                    itemId: item.id,
                    extraInfo: extraInfoParts.join(' | '),
                    icon: HIERARCHY_ICONS.RECORD,
                    // Extended search fields for records
                    searchFields: [
                      record.title,
                      record.reg_nr,
                      ...recordFileNames
                    ].filter(Boolean)
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

  // Filter items based on search term - ENHANCED with searchFields
  const filteredItems = searchTerm.trim() === ''
    ? quickJumpItems.slice(0, 25)
    : quickJumpItems.filter(item => {
        const term = searchTerm.toLowerCase();
        // Search in label
        if (item.label.toLowerCase().includes(term)) return true;
        // Search in extraInfo
        if (item.extraInfo && item.extraInfo.toLowerCase().includes(term)) return true;
        // Search in extended searchFields
        if (item.searchFields && item.searchFields.some(field =>
          field.toLowerCase().includes(term)
        )) return true;
        return false;
      }).slice(0, 25);

  // Handle item selection
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
          inputRef.current &&
          !inputRef.current.contains(event.target)) {
        setIsOpen(false);
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

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle search input key events
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
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

  // Generate placeholder with counts
  const placeholder = `Meklēt uzskaites sarakstus [${counts.inventories}], glabājamās vienības [${counts.items}] un dokumentus [${counts.records}]`;

  return (
    <div className="quick-jump">
      
      <div className="quick-jump-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="quick-jump-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onKeyDown={handleSearchKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Meklēt projektā"
        />
      </div>
    
      {isOpen && (
        <div
          ref={dropdownRef}
          className="quick-jump-dropdown"
          onClick={(e) => e.stopPropagation()}
          role="listbox"
          aria-label="Meklēšanas rezultāti"
        >
          <div className="quick-jump-items">
            {filteredItems.length > 0 ? (
              <>
                {filteredItems.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}-${index}`}
                    className={`quick-jump-item quick-jump-item-${item.type}`}
                    onClick={() => handleSelectItem(item)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectItem(item);
                      }
                    }}
                  >
                    <div className="quick-jump-item-label">
                      <i className={`fa-solid ${item.icon} item-icon`}></i>
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
                {searchTerm.trim() !== '' && quickJumpItems.filter(item => {
                  const term = searchTerm.toLowerCase();
                  return item.label.toLowerCase().includes(term) ||
                    (item.extraInfo && item.extraInfo.toLowerCase().includes(term)) ||
                    (item.searchFields && item.searchFields.some(field =>
                      field.toLowerCase().includes(term)
                    ));
                }).length > 25 && (
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

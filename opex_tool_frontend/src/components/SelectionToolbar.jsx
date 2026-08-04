import React from 'react';
import { BULK_UI } from '../Constants/Constants';
import './SelectionToolbar.css';

const MAX_CHIPS = 5;

/**
 * The bar that appears above the items/records table as soon as something is
 * ticked.
 *
 * It exists because selection can reach beyond the visible page: with 25 rows
 * shown out of 148, "12 selected" is otherwise invisible information right
 * before the user triggers an irreversible bulk action.
 */
const SelectionToolbar = ({
    selectedCount,
    totalCount,
    labels = [],
    onEdit,
    onDelete,
    onColumns,
    onClear,
    entityKind = 'items',
}) => {
    if (selectedCount === 0) return null;

    const countText = (entityKind === 'records' ? BULK_UI.SELECTION_COUNT_RECORDS : BULK_UI.SELECTION_COUNT)
        .replace('{count}', selectedCount)
        .replace('{total}', totalCount);

    return (
        <div className="selection-toolbar" role="status">
            <span className="selection-toolbar-count">
                <i className="fas fa-check-square"></i> {countText}
            </span>

            {labels.length > 0 && (
                <span className="selection-toolbar-chips">
                    {labels.slice(0, MAX_CHIPS).join(', ')}
                    {labels.length > MAX_CHIPS && ` ${BULK_UI.SELECTION_MORE.replace('{count}', labels.length - MAX_CHIPS)}`}
                </span>
            )}

            <span className="selection-toolbar-actions">
                {onEdit && (
                    <button type="button" className="selection-toolbar-btn selection-toolbar-btn-primary" onClick={onEdit}>
                        <i className="fas fa-edit"></i> {BULK_UI.SELECTION_EDIT_BTN}
                    </button>
                )}
                {onDelete && (
                    <button type="button" className="selection-toolbar-btn selection-toolbar-btn-danger" onClick={onDelete}>
                        <i className="fas fa-trash"></i> {BULK_UI.SELECTION_DELETE_BTN}
                    </button>
                )}
                {/* The columns button lives here while a selection is active,
                    because its slot in the table header is taken by the bulk
                    edit button (which must line up with the row edit column). */}
                {onColumns && (
                    <button type="button" className="selection-toolbar-btn" onClick={onColumns}>
                        <i className="fas fa-columns"></i> {BULK_UI.SELECTION_COLUMNS_BTN}
                    </button>
                )}
                <button type="button" className="selection-toolbar-btn" onClick={onClear}>
                    <i className="fas fa-times"></i> {BULK_UI.SELECTION_CLEAR_BTN}
                </button>
            </span>
        </div>
    );
};

export default SelectionToolbar;

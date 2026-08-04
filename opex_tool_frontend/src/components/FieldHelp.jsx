import React, { useState, useRef, useEffect, useId } from 'react';
import { getFieldHelp } from '../Constants/fieldHelp';
import './FieldHelp.css';

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 8;

/**
 * FieldHelp — small "?" icon placed next to a form field's label.
 * Hover/focus shows a short tooltip explaining the field; click toggles it
 * open (keyboard/touch fallback, since pure :hover excludes those users).
 *
 * Usage:
 *   <FieldHelp entity="item" field="language" />      // looks up FIELD_HELP.item.language.short
 *   <FieldHelp text="One-off explanation" />           // direct text, bypasses fieldHelp.js
 *   <FieldHelp entity="item" field="language" position="bottom" />
 *
 * Renders nothing if no text resolves, so it's safe to add to a label before
 * that field's copy has been authored yet.
 *
 * The tooltip is positioned via JS (getBoundingClientRect + `position:
 * fixed`), not plain CSS `position: absolute`, and its horizontal position
 * is clamped to the viewport. This is deliberate: a purely CSS-positioned
 * tooltip gets silently clipped by any scrollable ancestor (e.g. the small
 * section-edit popups' `overflow-y: auto` body) or cut off at the screen
 * edge for a trigger near the left/right of a narrow container — both of
 * which are common here, since this component is used inside popups of very
 * different widths.
 */
const FieldHelp = ({ entity = null, field = null, text = null, position = 'top' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [coords, setCoords] = useState(null);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const tooltipId = useId();

    const resolvedText = text || getFieldHelp(entity, field)?.short || null;
    const visible = isOpen || isHovering;

    useEffect(() => {
        if (!visible) return undefined;

        const updatePosition = () => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const anchorX = rect.left + rect.width / 2;
            let top;
            let alignX; // 'center' | 'left' | 'right' — how anchorX relates to the tooltip box
            switch (position) {
                case 'bottom':
                    top = rect.bottom + TRIGGER_GAP;
                    alignX = 'center';
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    alignX = 'right';
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    alignX = 'left';
                    break;
                default: // 'top'
                    top = rect.top - TRIGGER_GAP;
                    alignX = 'center';
            }
            const x = alignX === 'left' ? rect.right + TRIGGER_GAP : alignX === 'right' ? rect.left - TRIGGER_GAP : anchorX;
            setCoords({ top, x, alignX, vertical: position === 'left' || position === 'right' ? 'middle' : position === 'bottom' ? 'below' : 'above' });
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [visible, position]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    if (!resolvedText) return null;

    const handleToggle = (e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    // Fixed-position inline styles, computed from the trigger's actual
    // viewport position, then clamped so the box never runs off-screen.
    const tooltipStyle = (() => {
        if (!coords) return { visibility: 'hidden' };
        const style = { position: 'fixed' };
        if (coords.vertical === 'above') style.bottom = `${window.innerHeight - coords.top}px`;
        else if (coords.vertical === 'below') style.top = `${coords.top}px`;
        else style.top = `${coords.top}px`;

        if (coords.alignX === 'center') {
            // Clamp so a max-width:260px box centered on x doesn't cross the viewport edges.
            const half = 130;
            const clampedX = Math.min(Math.max(coords.x, half + VIEWPORT_MARGIN), window.innerWidth - half - VIEWPORT_MARGIN);
            style.left = `${clampedX}px`;
            style.transform = coords.vertical === 'middle' ? 'translateY(-50%)' : 'translateX(-50%)';
        } else if (coords.alignX === 'left') {
            style.left = `${coords.x}px`;
            style.transform = 'translateY(-50%)';
        } else {
            style.right = `${window.innerWidth - coords.x}px`;
            style.transform = 'translateY(-50%)';
        }
        return style;
    })();

    return (
        <span
            className="field-help-wrapper"
            ref={wrapperRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <button
                ref={triggerRef}
                type="button"
                className="field-help-trigger"
                aria-label="Vairāk informācijas"
                aria-describedby={tooltipId}
                onClick={handleToggle}
                onFocus={() => setIsHovering(true)}
                onBlur={() => setIsHovering(false)}
            >
                <i className="fas fa-question-circle"></i>
            </button>
            <span
                id={tooltipId}
                role="tooltip"
                className={`field-help-tooltip field-help-tooltip-${position} ${visible ? 'field-help-tooltip-open' : ''}`}
                style={tooltipStyle}
            >
                {resolvedText}
            </span>
        </span>
    );
};

export default FieldHelp;

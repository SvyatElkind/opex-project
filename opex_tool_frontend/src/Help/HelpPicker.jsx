import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { findHelpZone } from '../Constants/helpZones';
import { openHelp } from '../Utils/HelpWindow';
import { HELP_PICKER_UI } from '../Constants/Constants';
import './HelpPicker.css';

/**
 * HelpPicker — "point at it and I'll explain it" mode for the top-bar help button.
 *
 * While armed: the cursor turns into a question mark, whole regions (see
 * Constants/helpZones.js) outline as you move over them, and clicking one opens
 * the help window at that region's chapter. Escape or a right-click cancels.
 *
 * Why a full-screen overlay rather than listeners on each zone: the zones are
 * plain existing markup with no picker awareness, and the overlay lets us
 * swallow the click before it reaches the app — otherwise picking the "Datnes"
 * box would also trigger whatever button happened to be under the cursor.
 * `pointer-events` is disabled on the highlight itself so `elementFromPoint`
 * still sees the real UI underneath.
 */
const HelpPicker = ({ onExit }) => {
  const [target, setTarget] = useState(null); // { rect, zone }

  const resolveAt = useCallback((clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const found = findHelpZone(el);
    if (!found) return null;
    const rect = found.element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return { rect, zone: found.zone };
  }, []);

  // Track the pointer and highlight whatever zone is under it.
  useEffect(() => {
    const handleMove = (e) => setTarget(resolveAt(e.clientX, e.clientY));

    // The picker's own chrome (its banner, and the help button that armed it)
    // must keep working normally — otherwise "Cancel" and the toggle-off click
    // get swallowed by the capture handler below and the user is stuck.
    const isPickerChrome = (node) =>
      node && typeof node.closest === 'function' && node.closest('[data-help-picker-ignore]');

    const handleClick = (e) => {
      if (isPickerChrome(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const hit = resolveAt(e.clientX, e.clientY);
      if (hit) {
        openHelp(hit.zone.chapterId, hit.zone.sectionId || null);
        onExit();
      }
      // No zone under the cursor: stay armed so a stray click is not punished.
    };

    // Swallow the press too. Some controls (react-select in particular) act on
    // mousedown, so blocking only `click` would still fire them while picking.
    const handleMouseDown = (e) => {
      if (isPickerChrome(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    // Right-click / context menu also cancels, matching devtools pickers.
    const handleContextMenu = (e) => {
      e.preventDefault();
      onExit();
    };

    // Capture phase so we win before the app's own handlers.
    window.addEventListener('mousemove', handleMove, true);
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    // A scroll or resize invalidates the cached rect.
    window.addEventListener('scroll', () => setTarget(null), true);
    window.addEventListener('resize', () => setTarget(null));

    document.body.classList.add('help-picker-active');

    return () => {
      window.removeEventListener('mousemove', handleMove, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      document.body.classList.remove('help-picker-active');
    };
  }, [resolveAt, onExit]);

  // Label sits above the box, unless the box is near the top of the screen.
  const labelBelow = target ? target.rect.top < 32 : false;

  return ReactDOM.createPortal(
    <>
      <div className="help-picker-banner" role="status" data-help-picker-ignore>
        <i className="fas fa-hand-pointer"></i>
        <span>{HELP_PICKER_UI.BANNER}</span>
        <button
          type="button"
          className="help-picker-banner-cancel"
          onClick={(e) => { e.stopPropagation(); onExit(); }}
        >
          {HELP_PICKER_UI.CANCEL}
        </button>
      </div>

      {target && (
        <div
          className="help-picker-highlight"
          style={{
            top: `${target.rect.top}px`,
            left: `${target.rect.left}px`,
            width: `${target.rect.width}px`,
            height: `${target.rect.height}px`,
          }}
        >
          <span className={`help-picker-label ${labelBelow ? 'below' : 'above'}`}>
            <i className="fas fa-question-circle"></i>
            {target.zone.label}
          </span>
        </div>
      )}
    </>,
    document.body
  );
};

export default HelpPicker;

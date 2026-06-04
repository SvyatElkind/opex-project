/**
 * Form Puppet Recipes — step-by-step fill instructions for each form type.
 *
 * Each recipe is a function that returns an array of { label, action } steps.
 * The engine runs them sequentially with configurable delay.
 */

import {
  sleep, waitForSelector, setReactValue, setSelectValue,
  setDateValue, setCheckbox, selectReactSelectOption,
  addTagValue, highlightElement, scrollIntoView,
  isoToDisplayDate,
} from './formPuppetEngine';
import {
  pick, randInt, pad, randomPerson,
  generateSeriesCode, LANGUAGES, VISA_NOTES, READ_STATUS_NOTES,
  ACTION_TASKS, ADDRESSEE_NAMES,
  buildVisa, buildAddressee, buildAction, buildReadStatus,
} from './testDataUtils';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPING_DELAY = 25;  // ms per character when "typing"

const findByName = (name, container) => {
  const scope = container || document;
  return scope.querySelector(`[name="${name}"]`);
};

/**
 * Fill a react-datepicker input reliably.
 *
 * react-datepicker only fires its onChange callback when:
 *   a) a date is clicked in the popup, or
 *   b) a valid date string is typed and the popup closes (via Tab/Enter/blur)
 *
 * Strategy: focus → clear → type → press Tab (closes popup + triggers onChange).
 * Using Tab instead of Enter because Enter can re-open the popup in some modes.
 *
 * Accepts dateStr in YYYY-MM-DD (the canonical wire format used in test data).
 * Converts to DD.MM.YYYY before typing because that is the display format the
 * pickers now use.
 */
const fillDatepicker = async (input, dateStr) => {
  const typed = isoToDisplayDate(dateStr);

  // Focus the input — this opens the popup
  input.focus();
  await sleep(300);

  // Select all existing text so typing replaces it
  input.select();
  await sleep(50);

  // Type the date
  await setReactValue(input, typed, { charDelay: TYPING_DELAY });
  await sleep(300);

  // Press Tab to close the popup and trigger onChange with parsed date
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, bubbles: true }));
  await sleep(200);

  // Also blur to be safe — some versions of react-datepicker need this
  input.blur();
  input.dispatchEvent(new Event('blur', { bubbles: true }));
  await sleep(200);
};

const randomDate = (startYear = 2020, endYear = 2025) => {
  const y = randInt(startYear, endYear);
  const m = pad(randInt(1, 12));
  const d = pad(randInt(1, 28));
  return `${y}-${m}-${d}`;
};

const TITLES = [
  'Korespondence', 'Rikojumi', 'Protokoli', 'Ligumi', 'Atskaites',
  'Akti', 'Parskati', 'Instrukcijas', 'Nolikumi', 'Lemumi',
  'Pavadvestules', 'Zinojumi', 'Pieprasijumi', 'Atbildes', 'Registri',
];

const TYPES = ['Tekstuāls', 'Foto', 'Video', 'Skaņas'];
const STORAGE_TERMS = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'];

// ─── Inventory Create Recipe ────────────────────────────────────────────────

export const inventoryCreateRecipe = (opts = {}) => {
  const type = opts.type || pick(TYPES);
  const storageTerm = opts.storageTerm || pick(STORAGE_TERMS);
  const electronic = opts.electronic !== undefined ? opts.electronic : true;
  const startYear = opts.startYear || randInt(2018, 2023);
  const endYear = opts.endYear || startYear + randInt(1, 4);

  return [
    {
      label: `Izvelas tipu: ${type}`,
      action: async () => {
        // Scope to the active inventory-create-form (defensive against stale DOM
        // from a previously-closed form that hasn't fully unmounted).
        const form = document.querySelector('.inventory-create-form');
        if (!form) throw new Error('Inventory create form not found');
        const selects = form.querySelectorAll('.inventory-create-select');
        if (!selects[0]) throw new Error(`Type select not found (selects in form: ${selects.length})`);
        scrollIntoView(selects[0]);
        highlightElement(selects[0]);

        // Open the menu via mousedown on the control, then click the option.
        // react-select may render its menu in a portal at document.body, so we look
        // both inside the container AND at document level.
        const findOptions = () => {
          const inContainer = Array.from(selects[0].querySelectorAll('[class*="-option"]'));
          if (inContainer.length) return inContainer;
          // Fallback: portal menu at body level — pick the most-recent open menu.
          const allOptions = Array.from(document.querySelectorAll('[class*="-option"]'));
          // Filter out options inside any OTHER react-select on the page (e.g. storage term).
          const otherSelects = document.querySelectorAll('.inventory-create-select');
          const otherIds = new Set();
          otherSelects.forEach((s, i) => { if (i !== 0) otherIds.add(s); });
          return allOptions.filter(o => {
            for (const sel of otherIds) if (sel.contains(o)) return false;
            return true;
          });
        };

        const openAndPick = async (delayMs) => {
          const control = selects[0].querySelector('[class*="-control"]');
          if (!control) throw new Error('react-select control not found in type select');
          control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          await sleep(delayMs);
          const options = findOptions();
          for (const opt of options) {
            if (opt.textContent.trim() === type) {
              opt.click();
              await sleep(150);
              return true;
            }
          }
          const rendered = options.map(o => o.textContent.trim());
          throw new Error(`Tips "${type}" nav opciju sarakstā (atrastas ${options.length}: [${rendered.join(', ')}])`);
        };

        try {
          await openAndPick(700);
        } catch (firstErr) {
          // Close any half-open menu by clicking outside, then retry with longer wait
          document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          await sleep(400);
          try {
            await openAndPick(1200);
          } catch (secondErr) {
            throw new Error(`${secondErr.message} (1.mēģinājums: ${firstErr.message})`);
          }
        }
      },
    },
    {
      label: `Iestata elektronisks: ${electronic ? 'Ja' : 'Ne'}`,
      action: async () => {
        const cb = document.getElementById('inventory-create-electronic');
        if (!cb) throw new Error('Electronic checkbox not found');
        highlightElement(cb.parentElement);
        setCheckbox(cb, electronic);
      },
    },
    {
      label: `Ievada sakuma gadu: ${startYear}`,
      action: async () => {
        const pickers = document.querySelectorAll('.year-picker-input');
        if (!pickers[0]) throw new Error('Start year picker not found');
        scrollIntoView(pickers[0]);
        highlightElement(pickers[0]);
        // Click the div to open the dropdown
        pickers[0].click();
        await sleep(300);
        // Type into the search input inside the dropdown
        const container = pickers[0].closest('.year-picker-container');
        const searchInput = container?.querySelector('.year-picker-search-input');
        if (!searchInput) throw new Error('Year picker search input not found');
        await setReactValue(searchInput, String(startYear), { charDelay: TYPING_DELAY * 3 });
        await sleep(200);
        // Press Enter to confirm
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        await sleep(100);
      },
    },
    {
      label: `Ievada beigu gadu: ${endYear}`,
      action: async () => {
        const pickers = document.querySelectorAll('.year-picker-input');
        if (!pickers[1]) throw new Error('End year picker not found');
        scrollIntoView(pickers[1]);
        highlightElement(pickers[1]);
        pickers[1].click();
        await sleep(300);
        const container = pickers[1].closest('.year-picker-container');
        const searchInput = container?.querySelector('.year-picker-search-input');
        if (!searchInput) throw new Error('Year picker search input not found');
        await setReactValue(searchInput, String(endYear), { charDelay: TYPING_DELAY * 3 });
        await sleep(200);
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        await sleep(100);
      },
    },
    {
      label: `Izvelas glabas. terminu: ${storageTerm}`,
      action: async () => {
        const selects = document.querySelectorAll('.inventory-create-select');
        // Storage term is the second react-select
        const storageSelect = selects[1] || selects[0];
        if (!storageSelect) throw new Error('Storage term select not found');
        highlightElement(storageSelect);
        // Need to target the second .inventory-create-select specifically
        const allSelects = document.querySelectorAll('.inventory-create-select');
        const targetIdx = allSelects.length > 1 ? 1 : 0;
        const container = allSelects[targetIdx];
        const control = container.querySelector('[class*="-control"]');
        if (control) {
          control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          await sleep(400);
        }
        const options = container.querySelectorAll('[class*="-option"]');
        for (const opt of options) {
          if (opt.textContent.trim() === storageTerm) {
            opt.click();
            await sleep(100);
            return;
          }
        }
      },
    },
  ];
};

// ─── Item Create Recipe ─────────────────────────────────────────────────────

export const itemCreateRecipe = (opts = {}) => {
  const seriesCode = opts.series_code || generateSeriesCode();
  const title = opts.title || `${pick(TITLES)} ${randInt(1, 100)}`;
  const language = opts.language || pick(LANGUAGES);
  const annotation = opts.annotation || `Testesanas apraksts — ${title}`;
  const notes = opts.notes || `Piezimes par: ${title}`;
  // Ensure start < end by generating start first, then end after it
  const startDate = opts.start_date || randomDate(2020, 2022);
  const endDateDefault = (() => {
    const sp = startDate.split('-').map(Number);
    const d = new Date(sp[0], sp[1] - 1, sp[2]);
    d.setMonth(d.getMonth() + randInt(2, 12));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(Math.min(d.getDate(), 28))}`;
  })();
  const endDate = opts.end_date || endDateDefault;
  const dateNote = opts.date_note || `Perioda piezimes ${randInt(1, 50)}`;
  const copyVal = opts.copy || `Kopija ${randInt(1, 5)}`;
  const archHistory = opts.archival_history || `Arhiva vesture — ${randomPerson()}`;
  const sistematisation = opts.sistematisation || `Sistematizacija ${randInt(1, 20)}.${randInt(1, 99)}`;
  const restrictionNote = opts.restriction_note || `Piekluves piezime nr. ${randInt(1, 100)}`;
  const secLevelNote = opts.security_level_note || `Slepenibas piezime`;

  /** Helper: fill a named text/textarea field if it exists (some are conditional). */
  const fillField = (name, value, label) => ({
    label,
    expect: { selector: `[name="${name}"]`, value, name },
    action: async () => {
      const el = findByName(name);
      if (!el) return; // Skip conditional fields
      scrollIntoView(el);
      highlightElement(el);
      await setReactValue(el, value, { charDelay: TYPING_DELAY });
    },
  });

  return [
    // ── Section: Basic ──
    {
      label: `Ievada serijas kodu: ${seriesCode}`,
      expect: { selector: '[name="series_code"]', value: seriesCode, name: 'series_code' },
      action: async () => {
        const container = await waitForSelector('.create-item-nav-container');
        const el = findByName('series_code', container);
        if (!el) throw new Error('series_code field not found');
        scrollIntoView(el);
        highlightElement(el);
        await setReactValue(el, seriesCode, { charDelay: TYPING_DELAY });
      },
    },
    fillField('title', title, `Ievada nosaukumu: ${title}`),
    {
      label: `Pievieno valodu: ${language}`,
      action: async () => {
        const container = document.querySelector('.create-item-nav-container');
        const langSection = container?.querySelector('[class*="language-tags"]')?.parentElement;
        const input = langSection?.querySelector('input[type="text"]');
        if (!input) throw new Error('Language input not found');
        scrollIntoView(input);
        highlightElement(input);
        await addTagValue(input, language, { charDelay: TYPING_DELAY });
      },
    },
    // ── Section: Dates ──
    {
      label: `Ievada sakuma datumu: ${startDate}`,
      action: async () => {
        const container = document.querySelector('.create-item-nav-container');
        const calendars = container?.querySelectorAll('.calendar-container .calendar');
        if (!calendars?.[0]) throw new Error('Start date calendar not found');
        const input = calendars[0].querySelector('.react-datepicker__input-container input');
        if (!input) throw new Error('Start date input not found');
        scrollIntoView(input);
        highlightElement(input);
        await fillDatepicker(input, startDate);
      },
    },
    {
      label: `Ievada beigu datumu: ${endDate}`,
      action: async () => {
        const container = document.querySelector('.create-item-nav-container');
        const calendars = container?.querySelectorAll('.calendar-container .calendar');
        if (!calendars?.[1]) throw new Error('End date calendar not found');
        const input = calendars[1].querySelector('.react-datepicker__input-container input');
        if (!input) throw new Error('End date input not found');
        scrollIntoView(input);
        highlightElement(input);
        await fillDatepicker(input, endDate);
      },
    },
    fillField('date_note', dateNote, `Ievada datuma piezimi: ${dateNote}`),
    // ── Section: Technical ──
    {
      label: `Ievada lielumu (tikai fiziskam)`,
      action: async () => {
        const el = findByName('size');
        if (!el) return;
        scrollIntoView(el);
        highlightElement(el);
        await setReactValue(el, String(randInt(10, 200)));
      },
    },
    fillField('copy', copyVal, `Ievada kopiju: ${copyVal}`),
    fillField('archival_history', archHistory, `Ievada arhiva vesturi`),
    fillField('sistematisation', sistematisation, `Ievada sistematizaciju: ${sistematisation}`),
    // ── Section: Description ──
    fillField('annotation', annotation, `Ievada anotaciju`),
    fillField('notes', notes, `Ievada piezimes`),
    // ── Section: Access ──
    {
      label: `Iestata piekluvi un slepenibas limeni`,
      expect: [
        { selector: '[name="restriction"]', value: 'Vispārēja', name: 'restriction' },
        { selector: '[name="security_level"]', value: 'Publisks', name: 'security_level' },
      ],
      action: async () => {
        const restriction = findByName('restriction');
        const secLevel = findByName('security_level');
        if (restriction) {
          highlightElement(restriction);
          setSelectValue(restriction, 'Vispārēja');
        }
        if (secLevel) {
          highlightElement(secLevel);
          setSelectValue(secLevel, 'Publisks');
        }
      },
    },
    fillField('restriction_note', restrictionNote, `Ievada piekluves piezimi`),
    fillField('security_level_note', secLevelNote, `Ievada slepenibas piezimi`),
    // ── Ensure dates are committed to parent state ──
    // CalendarComponent only notifies the parent via onBlur/onCalendarClose.
    // Focus a non-date field to trigger any pending date commits.
    {
      label: 'Nodrošina datumu saglabāšanu',
      action: async () => {
        const titleField = findByName('title');
        if (titleField) {
          titleField.focus();
          await sleep(300);
          titleField.blur();
          await sleep(200);
        }
      },
    },
  ];
};

// ─── Record (Textual Document) Create Recipe ────────────────────────────────

export const recordCreateRecipe = (opts = {}) => {
  const recDate = opts.date || randomDate();
  const sentDate = opts.sent_date || randomDate();
  const createdDate = opts.created_date || recDate;
  const title = opts.title || `${pick(TITLES)} — ${randomPerson()}`;
  const regNr = opts.reg_nr || `${randInt(1, 999)}-${randInt(1, 99)}/${randInt(2020, 2025)}`;
  const sentRegNr = opts.sent_reg_nr || `NOS-${randInt(1, 999)}/${randInt(2020, 2025)}`;
  const nomenclatureNr = opts.nomenclature_nr || `${randInt(1, 50)}-${randInt(1, 20)}`;
  const group = opts.group || `Grupa-${randInt(1, 30)}`;
  const language = opts.language || pick(LANGUAGES);
  const keywords = opts.key_words || [pick(TITLES).toLowerCase(), 'arhivs', `tema-${randInt(1, 50)}`];
  const annotation = opts.annotation || `Dokumenta apraksts: ${title}`;
  const notes = opts.notes || `Piezimes par dokumentu — ${randomPerson()}`;
  const techInfo = opts.tech_info || `Skenets ${randInt(150, 600)}dpi, ${pick(['A4', 'A3', 'Letter'])}`;
  const userRestrNotes = opts.user_restriction_notes || `Lietotaja piekluves piezime`;

  /** Helper: fill a named field. */
  const fillText = (name, value, label) => ({
    label,
    expect: { selector: `[name="${name}"]`, value, name },
    action: async () => {
      const el = findByName(name);
      if (!el) return;
      scrollIntoView(el);
      highlightElement(el);
      await setReactValue(el, value, { charDelay: TYPING_DELAY });
    },
  });

  const fillDate = (name, value, label) => ({
    label,
    // react-datepicker inputs hold the display value; expect must match the DOM
    expect: { selector: `[name="${name}"]`, value: isoToDisplayDate(value), name },
    action: async () => {
      const el = findByName(name);
      if (!el) return;
      scrollIntoView(el);
      highlightElement(el);
      await setDateValue(el, value);
    },
  });

  return [
    // ── Section: Basic ──
    {
      label: `Ievada virsrakstu: ${title.slice(0, 40)}...`,
      expect: { selector: '[name="title"]', value: title, name: 'title' },
      action: async () => {
        const container = await waitForSelector('.create-record-nav-container');
        const el = findByName('title', container);
        if (!el) throw new Error('title field not found');
        scrollIntoView(el);
        highlightElement(el);
        await setReactValue(el, title, { charDelay: TYPING_DELAY });
      },
    },
    fillDate('date', recDate, `Ievada datumu: ${recDate}`),
    fillText('reg_nr', regNr, `Ievada reg. nr.: ${regNr}`),
    fillText('group', group, `Ievada grupu: ${group}`),
    // ── Section: Document ──
    fillDate('created_date', createdDate, `Ievada izveidosanas datumu: ${createdDate}`),
    fillDate('sent_date', sentDate, `Ievada nosutisanas datumu: ${sentDate}`),
    {
      label: `Pievieno valodu: ${language}`,
      action: async () => {
        const container = document.querySelector('.create-record-nav-container');
        const langSection = container?.querySelector('[class*="language-tags"]')?.parentElement;
        const input = langSection?.querySelector('input[type="text"]');
        if (!input) throw new Error('Language input not found');
        scrollIntoView(input);
        highlightElement(input);
        await addTagValue(input, language, { charDelay: TYPING_DELAY });
      },
    },
    fillText('sent_reg_nr', sentRegNr, `Ievada nosutisanas reg. nr.: ${sentRegNr}`),
    fillText('nomenclature_nr', nomenclatureNr, `Ievada nomenklaturas nr.: ${nomenclatureNr}`),
    // Keywords (tag input)
    {
      label: `Pievieno atslegvardus: ${keywords.join(', ')}`,
      action: async () => {
        const container = document.querySelector('.create-record-nav-container');
        const kwSection = container?.querySelector('[class*="keyword-tags"], [class*="keyword-input"]')?.closest('[class*="-field"]');
        const input = kwSection?.querySelector('input[type="text"]');
        if (!input) return; // Skip if not found
        scrollIntoView(input);
        for (const kw of keywords) {
          highlightElement(input);
          await setReactValue(input, kw, { charDelay: TYPING_DELAY });
          await sleep(100);
          // Try clicking add button first, fallback to Enter
          const addBtn = kwSection.querySelector('[class*="keyword-add-btn"]');
          if (addBtn) {
            addBtn.click();
          } else {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          }
          await sleep(200);
        }
      },
    },
    // ── Section: Description ──
    fillText('annotation', annotation, `Ievada anotaciju`),
    fillText('notes', notes, `Ievada piezimes`),
    fillText('tech_info', techInfo, `Ievada tehnisko info`),
    // ── Section: Access ──
    {
      label: `Iestata piekluves ierobezojumu: open`,
      expect: { selector: '[name="access_restriction"]', value: 'open', name: 'access_restriction' },
      action: async () => {
        const el = findByName('access_restriction');
        if (!el) return;
        scrollIntoView(el);
        highlightElement(el);
        setSelectValue(el, 'open');
      },
    },
    fillText('user_restriction_notes', userRestrNotes, `Ievada lietotaja ierobezojuma piezimes`),
  ];
};

// ─── Metadata Recipes ───────────────────────────────────────────────────────

export const metadataVisaRecipe = (opts = {}) => {
  const person = opts.person || randomPerson();
  const date = opts.date || randomDate();
  const notes = opts.notes || pick(VISA_NOTES);

  return [
    {
      label: `Ievada personu: ${person}`,
      action: async () => {
        const form = await waitForSelector('.metadata-card-form');
        const inputs = form.querySelectorAll('.metadata-card-input');
        const personInput = inputs[0]; // First input = person
        if (!personInput) throw new Error('person field not found');
        highlightElement(personInput);
        await setReactValue(personInput, person, { charDelay: TYPING_DELAY });
      },
    },
    {
      label: `Ievada datumu: ${date}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const dateInput = form?.querySelector('input[name="date"]');
        if (!dateInput) throw new Error('date field not found');
        highlightElement(dateInput);
        await setDateValue(dateInput, date);
      },
    },
    {
      label: `Ievada piezimes: ${notes}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const textarea = form?.querySelector('textarea');
        if (!textarea) throw new Error('notes field not found');
        highlightElement(textarea);
        await setReactValue(textarea, notes, { charDelay: TYPING_DELAY });
      },
    },
  ];
};

export const metadataAddresseeRecipe = (opts = {}) => {
  const addressee = opts.addressee || pick(ADDRESSEE_NAMES);

  return [
    {
      label: `Ievada adresatu: ${addressee}`,
      action: async () => {
        const form = await waitForSelector('.metadata-card-form');
        const input = form.querySelector('.metadata-card-input');
        if (!input) throw new Error('addressee field not found');
        highlightElement(input);
        await setReactValue(input, addressee, { charDelay: TYPING_DELAY });
      },
    },
  ];
};

export const metadataActionRecipe = (opts = {}) => {
  const author = opts.author || randomPerson();
  const responsible = opts.responsible_person || randomPerson();
  const task = opts.task || pick(ACTION_TASKS);
  const dueDate = opts.due_date || randomDate();
  const createdDate = opts.created_date || randomDate();

  return [
    {
      label: `Ievada autoru: ${author}`,
      action: async () => {
        const form = await waitForSelector('.metadata-card-form');
        const inputs = form.querySelectorAll('input[type="text"]');
        if (!inputs[0]) throw new Error('author field not found');
        highlightElement(inputs[0]);
        await setReactValue(inputs[0], author, { charDelay: TYPING_DELAY });
      },
    },
    {
      label: `Ievada atbildigo personu: ${responsible}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const inputs = form?.querySelectorAll('input[type="text"]');
        if (!inputs?.[1]) throw new Error('responsible_person field not found');
        highlightElement(inputs[1]);
        await setReactValue(inputs[1], responsible, { charDelay: TYPING_DELAY });
      },
    },
    {
      label: `Ievada uzdevumu: ${task}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const inputs = form?.querySelectorAll('input[type="text"]');
        if (!inputs?.[2]) throw new Error('task field not found');
        highlightElement(inputs[2]);
        await setReactValue(inputs[2], task, { charDelay: TYPING_DELAY });
      },
    },
    {
      label: `Ievada terminu: ${dueDate}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const dueDateInput = form?.querySelector('input[name="due_date"]');
        if (!dueDateInput) throw new Error('due_date field not found');
        highlightElement(dueDateInput);
        await setDateValue(dueDateInput, dueDate);
      },
    },
    {
      label: `Ievada izveidosanas datumu: ${createdDate}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const createdDateInput = form?.querySelector('input[name="created_date"]');
        if (!createdDateInput) throw new Error('created_date field not found');
        highlightElement(createdDateInput);
        await setDateValue(createdDateInput, createdDate);
      },
    },
  ];
};

export const metadataReadStatusRecipe = (opts = {}) => {
  const person = opts.person || randomPerson();
  const date = opts.date || randomDate();
  const notes = opts.notes || pick(READ_STATUS_NOTES);

  // Same structure as visa
  return metadataVisaRecipe({ person, date, notes });
};

// ─── Navigation helpers ─────────────────────────────────────────────────────

/** Wait for a selector to disappear (form closed after submit). */
const waitGone = (selector, timeoutMs = 8000) =>
  new Promise((resolve, reject) => {
    if (!document.querySelector(selector)) return resolve();
    const observer = new MutationObserver(() => {
      if (!document.querySelector(selector)) { observer.disconnect(); resolve(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); reject(new Error(`Timeout: ${selector} still visible`)); }, timeoutMs);
  });

/**
 * Switch to the "Dokumenti" tab in a textual item's segmented view (no-op if already there
 * or if the tab doesn't exist, e.g. media items use a combined view).
 */
const switchToDokumentiTab = async () => {
  const tabs = document.querySelectorAll('.item-view-tab');
  for (const tab of tabs) {
    if (tab.textContent.trim().includes('Dokumenti')) {
      if (tab.classList.contains('item-view-tab-active')) return; // already there
      highlightElement(tab);
      tab.click();
      await sleep(900);
      return;
    }
  }
};

/** Click the last (newest) record row in the records list (table or card view). */
const clickLastRecordRow = async () => {
  await sleep(600);

  let rows = document.querySelectorAll('.records-table-body .table-row');
  let cards = document.querySelectorAll('.record-card');

  // Records list not visible — likely on the overview tab; switch to Dokumenti.
  if (rows.length === 0 && cards.length === 0) {
    await switchToDokumentiTab();
    await sleep(400);
    rows = document.querySelectorAll('.records-table-body .table-row');
    cards = document.querySelectorAll('.record-card');
  }

  if (rows.length) {
    const last = rows[rows.length - 1];
    const target = last.querySelector('.body-cell.title-cell') || last;
    scrollIntoView(target);
    highlightElement(target);
    target.click();
    await sleep(1000);
    return;
  }
  if (cards.length) {
    const last = cards[cards.length - 1];
    const target = last.querySelector('.record-card-body') || last;
    scrollIntoView(target);
    highlightElement(target);
    target.click();
    await sleep(1000);
    return;
  }

  // Diagnostic: dump tab state so the next puppet log line tells us why.
  const tabs = Array.from(document.querySelectorAll('.item-view-tab')).map(t => t.textContent.trim());
  throw new Error(`Nav atrasts neviens dokumenta ieraksts. Cilnes: [${tabs.join(', ')}]`);
};

/** Switch the open record's tab by visible label ('Informācija' | 'Metadati' | 'Datnes'). */
const switchRecordTab = async (label) => {
  const tabs = document.querySelectorAll('.record-tabs .record-tab');
  for (const tab of tabs) {
    if (tab.textContent.includes(label)) {
      highlightElement(tab);
      tab.click();
      await sleep(500);
      return;
    }
  }
  throw new Error(`Dokumenta cilne "${label}" nav atrasta`);
};

/** Click the back button on the currently-open detail page (record→item or item→inventory). */
const clickBackBtn = async () => {
  const btn = document.querySelector('.record-container .item-back-btn')
           || document.querySelector('.item-back-btn');
  if (!btn) throw new Error('Atpakaļ poga nav atrasta');
  highlightElement(btn);
  btn.click();
  await sleep(1500);
};

/** Inject files into a hidden file input and dispatch a change event. */
const injectFilesIntoInput = async (input, files) => {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(400);
};

/** Fetch real test files from /files/ directory; returns array of File objects. */
const fetchTestFiles = async (fileNames) => {
  const out = [];
  for (const name of fileNames) {
    try {
      const resp = await fetch(`/files/${encodeURIComponent(name)}`);
      if (resp.ok) {
        const blob = await resp.blob();
        out.push(new File([blob], name, { type: blob.type || 'application/octet-stream' }));
      }
    } catch { /* skip */ }
  }
  return out;
};

const TEXTUAL_FILE_NAMES = [
  'file.txt', 'file - kopija.txt', 'file - small.txt',
  'file-sample_1MB.docx', 'file-sample_1MB - kopija.docx',
  'edoc_file_sample.edoc', 'edoc_file_sample - kopija.edoc',
  'Financial Sample.xlsx',
];

const MEDIA_FILE_NAMES = {
  'Foto':   ['file_example_JPG_1MB.jpg', 'file_example_PNG_1MB.png', 'swan-1868697_960_720.jpg', 'monochrome-image-8598798_960_720.jpg'],
  'Video':  ['pexels-thirdman-5538262 (1080p).mp4', 'pexels-cottonbro-5532765 (2160p).mp4', 'video (2160p).mp4'],
  'Skaņas': ['1-minute-rain-medium-6767.mp3', 'easter-island.mp3', 'sample-12s.mp3', 'CantinaBand60.wav'],
};

/** Click the last (newest) item row in the items table. */
const clickLastItemRow = async () => {
  await sleep(500);
  const rows = document.querySelectorAll('.items-uniform-data-row');
  if (!rows.length) throw new Error('No item rows found');
  const lastRow = rows[rows.length - 1];
  highlightElement(lastRow);
  lastRow.click();
  await sleep(800);
};


// ─── Project-level recipes ──────────────────────────────────────────────────

export const projectCreateRecipe = (opts = {}) => {
  // Name: only letters, digits, underscore, hyphen allowed (no spaces)
  const name = opts.name || `Testa_projekts_${randInt(100, 999)}`;
  const directory = opts.directory || `C:\\EDN`;

  return [
    {
      label: `Ievada projekta nosaukumu: ${name}`,
      expect: { selector: '#projectName', value: name, name: 'projectName' },
      action: async () => {
        const el = document.getElementById('projectName');
        if (!el) throw new Error('projectName input not found');
        highlightElement(el);
        await setReactValue(el, name, { charDelay: TYPING_DELAY });
      },
    },
    {
      label: `Ievada projekta celu: ${directory.slice(0, 40)}...`,
      expect: { selector: '#projectDirectory', value: directory, name: 'projectDirectory' },
      action: async () => {
        const el = document.getElementById('projectDirectory');
        if (!el) throw new Error('projectDirectory input not found');
        highlightElement(el);
        await setReactValue(el, directory, { charDelay: TYPING_DELAY });
      },
    },
  ];
};

export const signersRecipe = (opts = {}) => {
  const creatorName = opts.creatorName || randomPerson();
  const creatorPosition = opts.creatorPosition || pick(['Direktors', 'Vadītājs', 'Projektu vadītājs', 'Arhīva pārzinis', 'Nodaļas vadītājs']);
  const signerName = opts.signerName || randomPerson();
  const signerPosition = opts.signerPosition || pick(['Valdes priekšsēdētājs', 'Izpilddirektors', 'Ģenerāldirektors', 'Departamenta vadītājs']);

  const fillById = (id, value, label) => ({
    label,
    expect: { selector: `#${id}`, value, name: id },
    action: async () => {
      const el = document.getElementById(id);
      if (!el) throw new Error(`${id} not found`);
      scrollIntoView(el);
      highlightElement(el);
      await setReactValue(el, value, { charDelay: TYPING_DELAY });
    },
  });

  return [
    fillById('creatorName', creatorName, `Ievada izveidotaja vardu: ${creatorName}`),
    fillById('creatorPosition', creatorPosition, `Ievada izveidotaja amatu: ${creatorPosition}`),
    fillById('signerName', signerName, `Ievada parakstitaja vardu: ${signerName}`),
    fillById('signerPosition', signerPosition, `Ievada parakstitaja amatu: ${signerPosition}`),
  ];
};

// ─── Verification modal & export helpers ───────────────────────────────────

const openVerificationModal = async () => {
  if (document.querySelector('.verification-modal')) {
    await sleep(200);
    return;
  }
  // Prefer the visible Statuss button; fall back to event
  const statusBtn = Array.from(document.querySelectorAll('.details-toggle-btn'))
    .find(btn => btn.textContent.trim().includes('Statuss'));
  if (statusBtn) {
    scrollIntoView(statusBtn);
    highlightElement(statusBtn);
    statusBtn.click();
  } else {
    window.dispatchEvent(new CustomEvent('openValidationModal'));
  }
  await waitForSelector('.verification-modal', 5000);
  await sleep(800); // allow validation to run
};

const closeVerificationModal = async () => {
  const modal = document.querySelector('.verification-modal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-footer-btn');
  if (closeBtn) {
    closeBtn.click();
    await sleep(500);
  }
};

const getVerificationFooterBtn = (index) => {
  const footer = document.querySelector('.verification-modal-footer .footer-actions');
  return footer?.querySelectorAll('.export-btn')[index];
};

const waitForButtonNotPending = async (getButton, timeoutMs = 90000) => {
  const start = Date.now();
  // Give React a moment to flip isPending
  await sleep(300);
  while (Date.now() - start < timeoutMs) {
    const btn = typeof getButton === 'function' ? getButton() : getButton;
    if (!btn) return; // button gone — modal closed
    if (!btn.querySelector('.fa-spinner')) return;
    await sleep(400);
  }
  throw new Error('Eksports taimoutoja (poga joprojām pending)');
};

const waitForOpexCompletion = async (timeoutMs = 600000) => {
  const start = Date.now();
  // Wait for overlay to appear
  while (Date.now() - start < 10000) {
    if (document.querySelector('.opex-progress-overlay')) break;
    await sleep(300);
  }
  // Poll for a terminal state. The close button alone is not reliable —
  // it briefly appears in the initial 'idle' phase before startExport runs.
  // Done/error renders an .opex-summary-icon; validation-failed renders neither
  // the progress bar nor stats row but still has the close button.
  while (Date.now() - start < timeoutMs) {
    const overlay = document.querySelector('.opex-progress-overlay');
    if (!overlay) return;
    if (overlay.querySelector('.opex-summary-icon')) return; // done or error
    const closeBtn = overlay.querySelector('.opex-progress-close-btn');
    const hasProgressUi = overlay.querySelector('.opex-stats-row, .opex-progress-bar-track');
    if (closeBtn && !hasProgressUi && Date.now() - start > 3000) {
      // After 3s grace, no progress UI + close btn = validation failed
      return;
    }
    await sleep(1000);
  }
  throw new Error('OPEX ģenerēšana taimoutoja');
};

const closeOpexProgress = async () => {
  const overlay = document.querySelector('.opex-progress-overlay');
  if (!overlay) return;
  const closeBtn = overlay.querySelector('.opex-progress-close-btn');
  if (closeBtn) {
    highlightElement(closeBtn);
    closeBtn.click();
    await sleep(800);
  }
};

// ─── Verification: US (Inventory list) Export ──────────────────────────────

export const exportInventoryListRecipe = () => [
  {
    label: 'Atver Statuss modali',
    action: openVerificationModal,
  },
  {
    label: 'Eksportē uzskaites sarakstu (US)',
    action: async () => {
      const btn = getVerificationFooterBtn(0);
      if (!btn) throw new Error('US eksporta poga nav atrasta');
      if (btn.disabled) throw new Error('US eksporta poga ir atspējota (projektā ir kļūdas)');
      scrollIntoView(btn);
      highlightElement(btn);
      btn.click();
      await waitForButtonNotPending(() => getVerificationFooterBtn(0), 90000);
      await sleep(500);
    },
  },
];

// ─── Verification: PN Akts Export ──────────────────────────────────────────

export const exportPnAktsRecipe = (opts = {}) => {
  // variants: 'electronic' (true) and/or 'physical' (false)
  const variants = opts.variants || ['electronic', 'physical'];
  const steps = [
    {
      label: 'Atver Statuss modali',
      action: openVerificationModal,
    },
  ];

  for (const variant of variants) {
    const isElectronic = variant === 'electronic';
    const label = isElectronic ? 'Elektroniskais' : 'Fiziskais';

    steps.push({
      label: `PN akts: atver popup (${label})`,
      action: async () => {
        const btn = getVerificationFooterBtn(1);
        if (!btn) throw new Error('PN akta eksporta poga nav atrasta');
        scrollIntoView(btn);
        highlightElement(btn);
        btn.click();
        await waitForSelector('.export-popup', 3000);
        await sleep(400);
      },
    });

    steps.push({
      label: `PN akts: eksportē (${label})`,
      action: async () => {
        const popup = document.querySelector('.export-popup');
        if (!popup) throw new Error('PN popup nav atrasts');
        const optBtns = popup.querySelectorAll('.export-option-btn');
        // PN popup: 0 = Elektroniskais (true), 1 = Fiziskais (false)
        const optBtn = isElectronic ? optBtns[0] : optBtns[1];
        if (!optBtn) throw new Error(`${label} poga nav atrasta`);
        highlightElement(optBtn);
        optBtn.click();
        await sleep(500);
        await waitForButtonNotPending(() => getVerificationFooterBtn(1), 90000);
        await sleep(500);
      },
    });
  }

  return steps;
};

// ─── Verification: OPEX Generate ───────────────────────────────────────────

export const generateOpexRecipe = (opts = {}) => {
  // variants: 'longterm' (false) and/or 'permanent' (true)
  const variants = opts.variants || ['longterm', 'permanent'];
  const steps = [
    {
      label: 'Atver Statuss modali',
      action: openVerificationModal,
    },
  ];

  for (const variant of variants) {
    const isPermanent = variant === 'permanent';
    const label = isPermanent ? 'Pastāvīgi' : 'Ilgstoši';

    steps.push({
      label: `OPEX: atver popup (${label})`,
      action: async () => {
        const btn = document.querySelector('.generate-opex-btn');
        if (!btn) throw new Error('OPEX ģenerēšanas poga nav atrasta');
        if (btn.disabled) throw new Error('OPEX poga ir atspējota (projektā ir kļūdas)');
        scrollIntoView(btn);
        highlightElement(btn);
        btn.click();
        await waitForSelector('.export-popup', 3000);
        await sleep(400);
      },
    });

    steps.push({
      label: `OPEX: ģenerē (${label} glabājamās lietas)`,
      action: async () => {
        const popup = document.querySelector('.export-popup');
        if (!popup) throw new Error('OPEX popup nav atrasts');
        const optBtns = popup.querySelectorAll('.export-option-btn');
        // OPEX popup: 0 = Ilgstoši (false), 1 = Pastāvīgi (true)
        const optBtn = isPermanent ? optBtns[1] : optBtns[0];
        if (!optBtn) throw new Error(`${label} poga nav atrasta`);
        highlightElement(optBtn);
        optBtn.click();
        await sleep(500);
      },
    });

    steps.push({
      label: `OPEX: gaida pabeigšanu (${label}) — līdz 10 min`,
      action: async () => {
        await waitForOpexCompletion(600000);
      },
    });

    steps.push({
      label: `OPEX: aizver progress modali`,
      action: closeOpexProgress,
    });
  }

  return steps;
};

// ─── Verification Full: US + PN (both) + OPEX (both) ───────────────────────

export const verificationExportsRecipe = () => {
  const steps = [];

  steps.push({
    label: '─── Atver Statuss modali ───',
    action: openVerificationModal,
  });

  // US export
  steps.push({
    label: 'Eksportē uzskaites sarakstu (US)',
    action: async () => {
      const btn = getVerificationFooterBtn(0);
      if (!btn) throw new Error('US eksporta poga nav atrasta');
      if (btn.disabled) throw new Error('US eksporta poga ir atspējota');
      scrollIntoView(btn);
      highlightElement(btn);
      btn.click();
      await waitForButtonNotPending(() => getVerificationFooterBtn(0), 90000);
      await sleep(500);
    },
  });

  // PN akts: both variants
  for (const variant of ['electronic', 'physical']) {
    const isElectronic = variant === 'electronic';
    const label = isElectronic ? 'Elektroniskais' : 'Fiziskais';

    steps.push({
      label: `PN akts (${label}): atver popup`,
      action: async () => {
        const btn = getVerificationFooterBtn(1);
        if (!btn) throw new Error('PN akta poga nav atrasta');
        scrollIntoView(btn);
        highlightElement(btn);
        btn.click();
        await waitForSelector('.export-popup', 3000);
        await sleep(400);
      },
    });

    steps.push({
      label: `PN akts (${label}): eksportē`,
      action: async () => {
        const popup = document.querySelector('.export-popup');
        if (!popup) throw new Error('PN popup nav atrasts');
        const optBtns = popup.querySelectorAll('.export-option-btn');
        const optBtn = isElectronic ? optBtns[0] : optBtns[1];
        if (!optBtn) throw new Error(`${label} poga nav atrasta`);
        highlightElement(optBtn);
        optBtn.click();
        await sleep(500);
        await waitForButtonNotPending(() => getVerificationFooterBtn(1), 90000);
        await sleep(500);
      },
    });
  }

  // OPEX: both variants
  for (const variant of ['longterm', 'permanent']) {
    const isPermanent = variant === 'permanent';
    const label = isPermanent ? 'Pastāvīgi' : 'Ilgstoši';

    steps.push({
      label: `OPEX (${label}): atver popup`,
      action: async () => {
        const btn = document.querySelector('.generate-opex-btn');
        if (!btn) throw new Error('OPEX poga nav atrasta');
        if (btn.disabled) throw new Error('OPEX poga ir atspējota');
        scrollIntoView(btn);
        highlightElement(btn);
        btn.click();
        await waitForSelector('.export-popup', 3000);
        await sleep(400);
      },
    });

    steps.push({
      label: `OPEX (${label}): ģenerē`,
      action: async () => {
        const popup = document.querySelector('.export-popup');
        if (!popup) throw new Error('OPEX popup nav atrasts');
        const optBtns = popup.querySelectorAll('.export-option-btn');
        const optBtn = isPermanent ? optBtns[1] : optBtns[0];
        if (!optBtn) throw new Error(`${label} poga nav atrasta`);
        highlightElement(optBtn);
        optBtn.click();
        await sleep(500);
      },
    });

    steps.push({
      label: `OPEX (${label}): gaida pabeigšanu — līdz 10 min`,
      action: async () => {
        await waitForOpexCompletion(600000);
      },
    });

    steps.push({
      label: `OPEX (${label}): aizver progress modali`,
      action: closeOpexProgress,
    });
  }

  steps.push({
    label: 'Aizver Statuss modali',
    action: closeVerificationModal,
  });

  return steps;
};

// ─── Full Project Puppet ────────────────────────────────────────────────────

const INVENTORY_CONFIGS = [
  { type: 'Tekstuāls', electronic: true, storageTerm: 'Pastāvīgi glabājamās lietas' },
  { type: 'Foto',       electronic: true, storageTerm: 'Pastāvīgi glabājamās lietas' },
  { type: 'Video',      electronic: true, storageTerm: 'Ilgstoši glabājamās lietas' },
  { type: 'Skaņas',     electronic: true, storageTerm: 'Pastāvīgi glabājamās lietas' },
  { type: 'Tekstuāls', electronic: false, storageTerm: 'Ilgstoši glabājamās lietas' },
];

/**
 * Full Project Puppet — from ZERO to a fully populated project.
 *
 * Flow:
 *   0. Create project (if empty state detected)
 *   1. Upload VVAIS report (skip — no real file to upload, proceed to manual creation)
 *   2. Fill institution signers
 *   3. Create 5 inventories (all types & configurations)
 *   4. Per inventory: create 2 items with ALL fields
 *   5. Per textual electronic item: create record + all 4 metadata types
 *   6. (Future: trigger OPEX generation)
 */
export const fullProjectRecipe = (opts = {}) => {
  const configs = opts.configs || INVENTORY_CONFIGS;
  const itemsPerInventory = opts.itemsPerInventory || 2;
  const steps = [];

  // ══════════════════════════════════════════════════════════════════════
  // Phase 0: Create project if no project exists
  // ══════════════════════════════════════════════════════════════════════
  steps.push({
    label: '═══ Faze 0: Projekta izveide ═══',
    action: async () => {
      // Check if empty state is showing (no projects)
      const emptyBtn = document.querySelector('.empty-state-btn');
      const projectPopup = document.querySelector('.project-popup');
      if (emptyBtn && !projectPopup) {
        highlightElement(emptyBtn);
        emptyBtn.click();
        await waitForSelector('.project-popup', 3000);
        await sleep(300);
      } else if (projectPopup) {
        // Popup already open
        await sleep(200);
      } else {
        // Project already exists — check if add button exists in tabs
        const addBtn = document.querySelector('.add-project-btn');
        if (addBtn) {
          highlightElement(addBtn);
          addBtn.click();
          await waitForSelector('.project-popup', 3000);
          await sleep(300);
        }
      }
    },
  });

  // Fill project form
  const projSteps = projectCreateRecipe();
  steps.push(...projSteps);

  // Submit project
  const projectName = projSteps[0]?.expect?.value || 'Testa_projekts'; // capture for tab switching
  steps.push({
    label: 'Iesniedz projektu',
    action: async () => {
      const popup = document.querySelector('.project-popup');
      if (!popup) return;
      const btn = popup.querySelector('.btn-action');
      if (!btn) throw new Error('Project submit button not found');
      highlightElement(btn);
      btn.click();

      try {
        await waitGone('.project-popup', 15000);
      } catch {
        const errEl = popup.querySelector('.form-error-message, .general-error');
        if (errEl) {
          throw new Error(`Projekta izveide neizdevas: ${errEl.textContent.trim()}`);
        }
        const cancelBtn = popup.querySelector('.btn-secondary');
        if (cancelBtn) cancelBtn.click();
        await sleep(500);
      }
      await sleep(2000);
    },
  });

  // Select the newly created project tab
  steps.push({
    label: `Atver projektu: ${projectName}`,
    action: async () => {
      await sleep(1000);

      // Check if already on the right project
      const activeTab = document.querySelector('button.tab_button.expanded .project_name, button.tab_button.active .project_name');
      if (activeTab && activeTab.textContent.trim() === projectName) {
        return; // Already on correct project
      }

      // Find and click the tab with matching name
      const allTabs = document.querySelectorAll('.tab_button');
      for (const tab of allTabs) {
        const nameEl = tab.querySelector('.project_name');
        if (nameEl && nameEl.textContent.trim() === projectName) {
          highlightElement(tab);
          tab.click();
          await sleep(2000); // Wait for project data to load
          return;
        }
      }

      // If no matching tab found, click the last tab (newest project)
      if (allTabs.length > 0) {
        const lastTab = allTabs[allTabs.length - 1];
        highlightElement(lastTab);
        lastTab.click();
        await sleep(2000);
      }
    },
  });

  // ══════════════════════════════════════════════════════════════════════
  // Phase 1: Upload VVAIS report from /files/ directory
  // ══════════════════════════════════════════════════════════════════════
  steps.push({
    label: '═══ Faze 1: Atskaites augšupielade ═══',
    action: async () => {
      // Wait for the project to load and check if upload popup auto-opened
      await sleep(1500);
      const uploadPopup = document.querySelector('.upload-popup-container');
      if (!uploadPopup) {
        // Check for missing report banner and click upload button
        const uploadBtn = document.querySelector('.missing-report-btn-primary');
        if (uploadBtn) {
          highlightElement(uploadBtn);
          uploadBtn.click();
          await waitForSelector('.upload-popup-container', 3000);
          await sleep(500);
        }
      }
    },
  });

  steps.push({
    label: 'Ielade testa atskaites failu (VVAIS xlsx)',
    action: async () => {
      const uploadPopup = document.querySelector('.upload-popup-container');
      if (!uploadPopup) return; // No upload needed

      // Load the test xlsx from /files/ (served directly by Django, no webpack)
      // Place the file in build/files/Fonds_Iestade_GV.xlsx
      const TEST_XLSX_NAME = 'Fonds_Iestade_GV.xlsx';

      let blob = null;

      // Primary: /files/ directory (served raw by Django)
      try {
        const resp = await fetch(`/files/${TEST_XLSX_NAME}`);
        if (resp.ok) blob = await resp.blob();
      } catch { /* not available */ }

      // Fallback: /static/media/ (CRA build output)
      if (!blob) {
        try {
          const resp = await fetch(`/static/media/${TEST_XLSX_NAME}`);
          if (resp.ok) blob = await resp.blob();
        } catch { /* not available */ }
      }

      if (!blob) {
        // No xlsx found anywhere — close popup and skip
        const cancelBtn = uploadPopup.querySelector('.upload-cancel-btn');
        if (cancelBtn) cancelBtn.click();
        await sleep(500);
        return;
      }

      const xlsxFile = new File([blob], TEST_XLSX_NAME, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Inject the file into the hidden file input via DataTransfer
      const fileInput = uploadPopup.querySelector('input[type="file"]');
      if (!fileInput) throw new Error('File input not found');

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(xlsxFile);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(500);

      highlightElement(uploadPopup.querySelector('.upload-dropzone'));
    },
  });

  steps.push({
    label: 'Nosuta atskaiti',
    action: async () => {
      const uploadPopup = document.querySelector('.upload-popup-container');
      if (!uploadPopup) return; // Skipped

      const confirmBtn = uploadPopup.querySelector('.upload-confirm-btn');
      if (!confirmBtn || confirmBtn.disabled) {
        // No file loaded or button disabled — close and skip
        const cancelBtn = uploadPopup.querySelector('.upload-cancel-btn');
        if (cancelBtn) cancelBtn.click();
        await sleep(500);
        return;
      }

      highlightElement(confirmBtn);
      confirmBtn.click();

      // Wait for upload to complete (popup closes or success message appears)
      const waitForUpload = async () => {
        for (let i = 0; i < 30; i++) { // Up to 15 seconds
          await sleep(500);
          const success = document.querySelector('.upload-success-message');
          if (success) {
            await sleep(1000);
            // Close the popup after success
            const closeBtn = document.querySelector('.upload-cancel-btn');
            if (closeBtn) closeBtn.click();
            await sleep(500);
            return;
          }
          if (!document.querySelector('.upload-popup-container')) return; // Popup closed
        }
      };
      await waitForUpload();
      await sleep(1000);

      // Close any auto-opened roadmap wizard
      const roadmapClose = document.querySelector('.roadmap-close-btn, [class*="roadmap"] [class*="close"]');
      if (roadmapClose) {
        roadmapClose.click();
        await sleep(500);
      }
    },
  });

  // ══════════════════════════════════════════════════════════════════════
  // Phase 2: Fill signers (if available)
  // ══════════════════════════════════════════════════════════════════════
  steps.push({
    label: '═══ Faze 2: Parakstitaju aizpildisana ═══',
    action: async () => {
      // Try to open signers modal
      const signersBtn = document.querySelector('.signers-btn');
      if (signersBtn) {
        highlightElement(signersBtn);
        signersBtn.click();
        await waitForSelector('.inst-signers-modal', 3000);
        await sleep(300);
      } else {
        // Signers button not available yet — try via event
        window.dispatchEvent(new CustomEvent('openSignersModal'));
        try {
          await waitForSelector('.inst-signers-modal', 3000);
        } catch {
          // Signers not available — skip
          return;
        }
        await sleep(300);
      }
    },
  });

  // Fill signers form
  const signerSteps = signersRecipe();
  steps.push(...signerSteps);

  // Submit signers
  steps.push({
    label: 'Saglaba parakstitajus',
    action: async () => {
      const modal = document.querySelector('.inst-signers-modal');
      if (!modal) return; // Skipped
      const btn = modal.querySelector('.inst-signers-btn-save');
      if (!btn) throw new Error('Signers save button not found');
      highlightElement(btn);
      btn.click();
      await sleep(1500);
      // Close modal if still open
      const closeBtn = document.querySelector('.inst-signers-btn-cancel');
      if (closeBtn && document.querySelector('.inst-signers-modal')) {
        closeBtn.click();
        await sleep(500);
      }
    },
  });

  // ══════════════════════════════════════════════════════════════════════
  // Phase 3: Create inventories, items, records, metadata
  // ══════════════════════════════════════════════════════════════════════
  steps.push({
    label: '═══ Faze 3: Inventaru, vienibu un ierakstu izveide ═══',
    action: async () => { await sleep(300); },
  });

  for (let invIdx = 0; invIdx < configs.length; invIdx++) {
    const cfg = configs[invIdx];
    const invLabel = `US ${invIdx + 1}/${configs.length} (${cfg.type})`;

    // ── Create inventory ──
    steps.push({
      label: `═══ ${invLabel}: Atver formu ═══`,
      action: async () => {
        window.dispatchEvent(new CustomEvent('openInventoryCreate'));
        await waitForSelector('.inventory-create-form', 3000);
        // React-select needs a moment after mount before its mousedown handler is wired.
        await sleep(700);
      },
    });

    // Generate inventory years — items must stay within this range
    const invStartYear = randInt(2018, 2022);
    const invEndYear = invStartYear + randInt(2, 5);

    // Fill inventory form
    const invSteps = inventoryCreateRecipe({
      type: cfg.type,
      electronic: cfg.electronic,
      storageTerm: cfg.storageTerm,
      startYear: invStartYear,
      endYear: invEndYear,
    });
    steps.push(...invSteps);

    // Submit inventory
    steps.push({
      label: `${invLabel}: Iesniedz formu`,
      action: async () => {
        const btn = document.querySelector('.inventory-create-submit-button');
        if (!btn) throw new Error('Submit button not found');
        highlightElement(btn);
        btn.click();
        await waitGone('.inventory-create-form', 8000);
        await sleep(800);
      },
    });

    // Select the newly created inventory (last in list)
    steps.push({
      label: `${invLabel}: Atver jaunizveidoto inventaru`,
      action: async () => {
        await sleep(1000);

        // Make sure the inventory list is visible (click sidebar if needed)
        const inventoryList = document.querySelector('.inventory-list');
        if (!inventoryList || inventoryList.offsetParent === null) {
          // We might be in item detail — need to go back first
          const backBtn = document.querySelector('.item-back-btn, [class*="back-btn"]');
          if (backBtn) {
            backBtn.click();
            await sleep(1000);
          }
        }

        // Wait for inventory list to have items
        let items = null;
        for (let i = 0; i < 10; i++) {
          items = document.querySelectorAll('.inventory-item');
          if (items.length >= invIdx + 1) break; // Wait until our new inventory appears
          await sleep(500);
        }

        if (!items || !items.length) throw new Error('No inventory items in list');
        const last = items[items.length - 1];
        highlightElement(last);
        last.click();
        await sleep(2000);
        try {
          await waitForSelector('.items-uniform-table-wrapper, .items-uniform-empty-state, .inv-action-btn', 5000);
        } catch { /* continue */ }
        await sleep(500);
      },
    });

    // ── Create items ──
    for (let itemIdx = 0; itemIdx < itemsPerInventory; itemIdx++) {
      const itemLabel = `${invLabel} > GV ${itemIdx + 1}`;

      // Open item create form — handle both empty state and table header buttons
      steps.push({
        label: `${itemLabel}: Atver formu`,
        action: async () => {
          await sleep(500);
          // Try header button first (exists when items table is shown)
          let btn = document.querySelector('.items-uniform-header-btn-create');
          if (!btn) {
            // Try empty state button (shown when no items exist yet)
            btn = document.querySelector('.inv-action-btn.inv-add-btn') ||
                  document.querySelector('.items-uniform-empty-state button') ||
                  document.querySelector('[class*="empty"] [class*="add-btn"]');
          }
          if (!btn) throw new Error('Create item button not found (tried header + empty state)');
          scrollIntoView(btn);
          highlightElement(btn);
          btn.click();
          await waitForSelector('.create-item-nav-container', 5000);
          await sleep(300);
        },
      });

      // Fill item form — dates must be within inventory range AND start < end
      const itemStartDate = randomDate(invStartYear, invEndYear - 1);
      // Ensure end date is after start date (at least 1 month later)
      const startParts = itemStartDate.split('-').map(Number);
      const minEndDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      minEndDate.setMonth(minEndDate.getMonth() + 1); // At least 1 month after start
      // Cap at inventory end
      const invEnd = new Date(invEndYear, 11, 31);
      const endBase = minEndDate > invEnd ? invEnd : minEndDate;
      const itemEndDate = `${endBase.getFullYear()}-${pad(endBase.getMonth() + 1)}-${pad(Math.min(endBase.getDate(), 28))}`;

      const itemSteps = itemCreateRecipe({
        start_date: itemStartDate,
        end_date: itemEndDate,
      });
      steps.push(...itemSteps);

      // Submit item
      steps.push({
        label: `${itemLabel}: Iesniedz formu`,
        action: async () => {
          const container = document.querySelector('.create-item-nav-container');
          if (!container) throw new Error('Item form not found');
          const btn = container.querySelector('.create-item-nav-btn-primary[type="submit"]');
          if (!btn) throw new Error('Submit button not found');

          // Log form state before submit for debugging
          const formInputs = container.querySelectorAll('input, textarea, select');
          const formState = {};
          formInputs.forEach(inp => {
            const name = inp.name || inp.id || inp.className.split(' ')[0];
            if (name && inp.value) formState[name] = inp.value.slice(0, 50);
          });
          console.log('%c[Puppet] Item form state before submit:', 'color: #f59e0b', formState);

          highlightElement(btn);
          btn.click();

          try {
            await waitGone('.create-item-nav-container', 10000);
          } catch {
            // Form didn't close — check for validation errors
            const errors = container.querySelectorAll('.field-error, .general-error, [class*="error"]');
            const errorTexts = [];
            errors.forEach(el => {
              const text = el.textContent.trim();
              if (text && text.length < 200) errorTexts.push(text);
            });

            console.log('%c[Puppet] Item form validation errors:', 'color: #ef4444', errorTexts);

            // Try to close the form so the puppet can continue
            const cancelBtn = container.querySelector('.create-item-nav-btn-cancel, [class*="cancel"]');
            if (cancelBtn) {
              cancelBtn.click();
              await sleep(500);
            }

            if (errorTexts.length > 0) {
              throw new Error(`Validacijas kludas: ${errorTexts.join('; ')}`);
            }
            throw new Error('Forma netika aizverta (nezinamas validacijas kludas — skatiet konsoli)');
          }
          await sleep(1500);
        },
      });

      // Create media records for Foto/Video/Skaņas via UI (drives CreateMediaRecord modal)
      if (['Foto', 'Video', 'Skaņas'].includes(cfg.type) && cfg.electronic) {
        // Open item detail
        steps.push({
          label: `${itemLabel}: Atver vienības detaļas`,
          action: clickLastItemRow,
        });

        // Open the create-media-record modal
        steps.push({
          label: `${itemLabel} > Mediju: Atver mediju ieraksta formu`,
          action: async () => {
            await sleep(500);
            const btn = document.querySelector('.item-action-btn.item-action-create-btn:not([disabled])');
            if (!btn) throw new Error('Pievienot Ierakstu poga nav atrasta vai atspējota');
            scrollIntoView(btn);
            highlightElement(btn);
            btn.click();
            await waitForSelector('.media-record-modal-backdrop', 5000);
            await sleep(500);
          },
        });

        // Step 1: drop the media file into the modal
        steps.push({
          label: `${itemLabel} > Mediju: Augšupielādē failu`,
          action: async () => {
            const candidates = MEDIA_FILE_NAMES[cfg.type] || [];
            const files = await fetchTestFiles([pick(candidates)]);
            if (!files.length) throw new Error(`Nav atrasts neviens ${cfg.type} testa fails /files/ mapē`);

            const modal = document.querySelector('.media-record-modal-container');
            if (!modal) throw new Error('Mediju modal nav atrasts');
            const input = modal.querySelector('input[type="file"]');
            if (!input) throw new Error('Faila ievades lauks nav atrasts');
            highlightElement(modal.querySelector('.media-record-dropzone') || modal);
            await injectFilesIntoInput(input, files);
            // Wait for the "selected file" preview to render
            await sleep(800);
          },
        });

        // Step 1 → 2 transition: click "Augšupielādēt".
        // Server-side auto-extraction (ffmpeg/exiftool) for large video files can take
        // 30-90s on slow machines, so we wait up to 2 minutes here.
        steps.push({
          label: `${itemLabel} > Mediju: Pāriet uz metadatiem`,
          action: async () => {
            const modal = document.querySelector('.media-record-modal-container');
            const submitBtn = modal?.querySelector('.media-record-btn-submit');
            if (!submitBtn) throw new Error('Augšupielādēt poga nav atrasta');
            highlightElement(submitBtn);
            submitBtn.click();

            const UPLOAD_TIMEOUT_MS = 120000;
            const POLL_MS = 500;
            const start = Date.now();
            let lastErrorBanner = null;

            while (Date.now() - start < UPLOAD_TIMEOUT_MS) {
              await sleep(POLL_MS);
              // Success path A: metadata form rendered (advanced to step 2)
              if (document.querySelector('.media-record-metadata-form')) return;
              // Success path B: modal closed (record saved in one step)
              if (!document.querySelector('.media-record-modal-backdrop')) return;
              // Error path: server-side error banner rendered inside the modal
              const banner = document.querySelector('.media-record-error-banner .media-record-error-text');
              if (banner) lastErrorBanner = banner.textContent.trim();
            }

            const elapsedSec = Math.round((Date.now() - start) / 1000);
            const detail = lastErrorBanner
              ? `Servera kļūda: ${lastErrorBanner}`
              : `Augšupielāde nepabeigta ${elapsedSec}s laikā (faila izmērs vai servera lēnums?)`;
            throw new Error(`Metadatu solis netika atvērts. ${detail}`);
          },
        });

        // Step 2: fill metadata fields (only if metadata step is shown)
        steps.push({
          label: `${itemLabel} > Mediju: Aizpilda metadatus`,
          action: async () => {
            const form = document.querySelector('.media-record-metadata-form');
            if (!form) return; // Already saved (no metadata step needed)

            // Helper to set a field if present
            const setField = async (name, value) => {
              const el = form.querySelector(`[name="${name}"]`);
              if (!el) return;
              scrollIntoView(el);
              highlightElement(el);
              if (el.tagName === 'SELECT') {
                setSelectValue(el, value);
              } else {
                await setReactValue(el, String(value), { charDelay: 25 });
              }
            };

            if (cfg.type === 'Foto') {
              await setField('color', pick(['color', 'grayscale']));
              await setField('horizontal_resolution', randInt(1200, 4000));
              await setField('vertical_resolution', randInt(1200, 4000));
            } else if (cfg.type === 'Video') {
              await setField('color', pick(['color', 'grayscale']));
              await setField('horizontal_resolution', pick([1920, 1280, 3840]));
              await setField('vertical_resolution', pick([1080, 720, 2160]));
              await setField('duration', `00:${pad(randInt(1, 59))}:${pad(randInt(0, 59))}`);
            } else { // Skaņas
              await setField('duration', `00:${pad(randInt(1, 59))}:${pad(randInt(0, 59))}`);
            }
          },
        });

        // Save the media record
        steps.push({
          label: `${itemLabel} > Mediju: Saglabā`,
          action: async () => {
            // If modal already closed (1-step path), skip
            if (!document.querySelector('.media-record-modal-backdrop')) return;
            const modal = document.querySelector('.media-record-modal-container');
            const submitBtn = modal?.querySelector('.media-record-btn-submit');
            if (!submitBtn) throw new Error('Saglabāt poga nav atrasta');
            highlightElement(submitBtn);
            submitBtn.click();
            try {
              await waitGone('.media-record-modal-backdrop', 15000);
            } catch {
              // Try to close if it's stuck
              const cancel = document.querySelector('.media-record-btn-cancel');
              if (cancel) cancel.click();
              throw new Error('Mediju modal netika aizvērts pēc saglabāšanas');
            }
            await sleep(800);
          },
        });

        // Navigate back from item detail to items list
        steps.push({
          label: `${itemLabel}: Atgriežas pie saraksta`,
          action: async () => {
            const backBtn = document.querySelector('.item-back-btn');
            if (backBtn) {
              highlightElement(backBtn);
              backBtn.click();
              await sleep(1500);
            }
            try {
              await waitForSelector('.items-uniform-table-wrapper, .items-uniform-empty-state, .inv-action-btn', 3000);
            } catch { /* continue */ }
            await sleep(500);
          },
        });
      }

      // Create textual records for Tekstuāls + electronic inventories
      if (cfg.type === 'Tekstuāls' && cfg.electronic) {
        // Open the item detail
        steps.push({
          label: `${itemLabel}: Atver vienibas detaļas`,
          action: clickLastItemRow,
        });

        // Open record create form — try multiple button locations
        steps.push({
          label: `${itemLabel} > Dok: Atver formu`,
          action: async () => {
            await sleep(500);
            // Try main action button
            let btn = document.querySelector('.item-action-btn.item-action-create-btn:not([disabled])');
            if (!btn) {
              // Try empty state "create first record" button
              btn = document.querySelector('.records-empty-state .inv-action-btn') ||
                    document.querySelector('.records-header-btn-create') ||
                    document.querySelector('.create-record-btn') ||
                    document.querySelector('[class*="empty"] [class*="create"], [class*="empty"] [class*="add"]');
            }
            if (!btn) throw new Error('Create record button not found');
            if (btn.disabled) throw new Error('Create record button is disabled');
            scrollIntoView(btn);
            highlightElement(btn);
            btn.click();
            await waitForSelector('.create-record-nav-container', 5000);
            await sleep(300);
          },
        });

        // Fill record form — dates must be within item's date range
        const recDate = itemStartDate; // Use item start date as record date (guaranteed in range)
        const recSteps = recordCreateRecipe({
          date: recDate,
          created_date: recDate,
          sent_date: recDate,
        });
        steps.push(...recSteps);

        // Submit record
        steps.push({
          label: `${itemLabel} > Dok: Iesniedz formu`,
          action: async () => {
            const container = document.querySelector('.create-record-nav-container');
            if (!container) throw new Error('Record form not found');
            const btn = container.querySelector('.create-record-nav-btn-primary[type="submit"]');
            if (!btn) throw new Error('Submit button not found');

            highlightElement(btn);
            btn.click();

            try {
              await waitGone('.create-record-nav-container', 10000);
            } catch {
              const errors = container.querySelectorAll('.field-error, .general-error, [class*="error"]');
              const errorTexts = [];
              errors.forEach(el => {
                const text = el.textContent.trim();
                if (text && text.length < 200) errorTexts.push(text);
              });

              const cancelBtn = container.querySelector('.create-record-nav-btn-cancel, [class*="cancel"]');
              if (cancelBtn) { cancelBtn.click(); await sleep(500); }

              if (errorTexts.length > 0) {
                throw new Error(`Validacijas kludas: ${errorTexts.join('; ')}`);
              }
              throw new Error('Forma netika aizverta (nezinamas validacijas kludas)');
            }
            await sleep(1000);
          },
        });

        // Open the newly-created record (drives the document detail page)
        steps.push({
          label: `${itemLabel} > Dok: Atver dokumenta detaļas`,
          action: clickLastRecordRow,
        });

        // ── Upload files via UI (Datnes tab) ──
        steps.push({
          label: `${itemLabel} > Dok: Pārslēdz uz Datnes`,
          action: async () => { await switchRecordTab('Datnes'); },
        });

        steps.push({
          label: `${itemLabel} > Dok: Augšupielādē failus`,
          action: async () => {
            // Pick 1-3 real test files
            const fileCount = randInt(1, 3);
            const picks = [];
            for (let f = 0; f < fileCount; f++) {
              picks.push(TEXTUAL_FILE_NAMES[(itemIdx + f) % TEXTUAL_FILE_NAMES.length]);
            }
            const files = await fetchTestFiles(picks);
            if (!files.length) {
              // Fallback: synthesize a small text file
              files.push(new File([`Testa fails — ${randomPerson()}`], `dokuments_${itemIdx + 1}.txt`, { type: 'text/plain' }));
            }
            const input = document.querySelector('.record-files-wrapper input[type="file"]');
            if (!input) throw new Error('Faila ievades lauks nav atrasts dokumenta lapā');
            const dropzone = document.querySelector('.files-dropzone');
            if (dropzone) highlightElement(dropzone);
            await injectFilesIntoInput(input, files);
            // Click the upload-confirm button on the pending bar
            for (let i = 0; i < 10; i++) {
              const uploadBtn = document.querySelector('.files-pending-btn-upload');
              if (uploadBtn) {
                highlightElement(uploadBtn);
                uploadBtn.click();
                break;
              }
              await sleep(300);
            }
            // Wait for upload to finish (spinner gone, file list visible)
            for (let i = 0; i < 60; i++) {
              await sleep(500);
              const stillUploading = document.querySelector('.files-pending-btn-upload .fa-spinner');
              if (!stillUploading) break;
            }
            await sleep(500);
          },
        });

        // ── Add 4 metadata cards via UI (Metadati tab) ──
        steps.push({
          label: `${itemLabel} > Dok: Pārslēdz uz Metadati`,
          action: async () => { await switchRecordTab('Metadati'); },
        });

        // Field order MUST match RecordMetadata.js section config — inputs have no
        // `name` attr, so we match them positionally via .metadata-card-input.
        const META_SECTIONS = [
          {
            key: 'actions', label: 'Darbības',
            fieldOrder: ['author', 'responsible_person', 'task', 'due_date', 'created_date', 'notes'],
            buildFn: () => buildAction(itemStartDate),
          },
          {
            key: 'addressees', label: 'Adresāti',
            fieldOrder: ['addressee'],
            buildFn: () => buildAddressee(),
          },
          {
            key: 'visas', label: 'Vīzas',
            fieldOrder: ['person', 'date', 'notes'],
            buildFn: () => buildVisa(itemStartDate),
          },
          {
            key: 'read_status', label: 'Lasīšanas statuss',
            fieldOrder: ['person', 'date', 'notes'],
            buildFn: () => buildReadStatus(itemStartDate),
          },
        ];

        for (let mIdx = 0; mIdx < META_SECTIONS.length; mIdx++) {
          const section = META_SECTIONS[mIdx];

          steps.push({
            label: `${itemLabel} > Meta ${section.label}: pārslēdz un atver`,
            action: async () => {
              // Click the section tab by index (order matches RecordMetadata.js section config)
              const sectionBtns = document.querySelectorAll('.metadata-section-btn-inline');
              if (!sectionBtns[mIdx]) throw new Error(`Metadatu sadaļa ${section.label} nav atrasta`);
              highlightElement(sectionBtns[mIdx]);
              sectionBtns[mIdx].click();
              await sleep(500);
              // Click "Pievienot" — empty state or .metadata-card-add
              const addBtn = document.querySelector('.btn-metadata.btn-metadata-create-empty')
                          || document.querySelector('.metadata-card.metadata-card-add');
              if (!addBtn) throw new Error(`Pievienot poga (${section.label}) nav atrasta`);
              highlightElement(addBtn);
              addBtn.click();
              await waitForSelector('.metadata-card-form', 3000);
              await sleep(300);
            },
          });

          steps.push({
            label: `${itemLabel} > Meta ${section.label}: aizpilda un saglabā`,
            action: async () => {
              const form = document.querySelector('.metadata-card-form');
              if (!form) throw new Error('Metadatu forma nav atrasta');
              const data = section.buildFn();
              // Inputs (input + textarea) appear in the same order as section.fieldOrder.
              const inputs = form.querySelectorAll('.metadata-card-input');

              for (let i = 0; i < section.fieldOrder.length; i++) {
                const fieldName = section.fieldOrder[i];
                const value = data[fieldName];
                const el = inputs[i];
                if (!el || value == null || value === '') continue;
                scrollIntoView(el);
                highlightElement(el);
                if (el.tagName === 'TEXTAREA') {
                  await setReactValue(el, String(value), { charDelay: 20 });
                } else if (el.closest('.react-datepicker__input-container')) {
                  await setDateValue(el, String(value));
                } else {
                  await setReactValue(el, String(value), { charDelay: 20 });
                }
              }

              const saveBtn = form.querySelector('.metadata-card-btn-save');
              if (!saveBtn) throw new Error('Saglabāt poga nav atrasta');
              highlightElement(saveBtn);
              saveBtn.click();
              try {
                await waitGone('.metadata-card-form', 8000);
              } catch {
                throw new Error(`${section.label} saglabāšana taimoutoja vai validācija neizdevās`);
              }
              await sleep(500);
            },
          });
        }

        // Navigate back: record → item
        steps.push({
          label: `${itemLabel} > Dok: Atgriežas pie vienības`,
          action: async () => {
            await clickBackBtn();
          },
        });

        // Navigate back: item → items list
        steps.push({
          label: `${itemLabel}: Atgriežas pie saraksta`,
          action: async () => {
            const backBtn = document.querySelector('.item-back-btn');
            if (backBtn) {
              highlightElement(backBtn);
              backBtn.click();
              await sleep(1500);
            }
            try {
              await waitForSelector('.items-uniform-table-wrapper, .items-uniform-empty-state, .inv-action-btn', 3000);
            } catch { /* continue */ }
            await sleep(500);
          },
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // Phase 4: Verifikācija un eksporti (US + PN both + OPEX both)
  // ══════════════════════════════════════════════════════════════════════
  steps.push({
    label: '═══ Faze 4: Verifikācija un eksporti ═══',
    action: async () => { await sleep(300); },
  });

  steps.push(...verificationExportsRecipe());

  steps.push({
    label: '═══ Pabeigts! ═══',
    action: async () => { await sleep(100); },
  });

  return steps;
};

// ─── Recipe registry ────────────────────────────────────────────────────────

export const RECIPES = {
  full_project: {
    id: 'full_project',
    name: '*** PILNS PROJEKTS (0 lidz pilnam)',
    formSelector: 'body', // Always available — handles its own navigation
    openEvent: null,
    submitSelector: null,
    getSteps: fullProjectRecipe,
  },
  project_create: {
    id: 'project_create',
    name: 'Jauns projekts',
    formSelector: '.project-popup',
    openEvent: null,
    submitSelector: '.project-popup .btn-action',
    getSteps: projectCreateRecipe,
  },
  signers: {
    id: 'signers',
    name: 'Parakstitaji (iestade)',
    formSelector: '.inst-signers-modal',
    openEvent: 'openSignersModal',
    submitSelector: '.inst-signers-btn-save',
    getSteps: signersRecipe,
  },
  inventory_create: {
    id: 'inventory_create',
    name: 'Jauns US (Inventars)',
    formSelector: '.inventory-create-form',
    openEvent: 'openInventoryCreate',
    submitSelector: '.inventory-create-submit-button',
    getSteps: inventoryCreateRecipe,
  },
  item_create: {
    id: 'item_create',
    name: 'Jauna GV (Vieniba)',
    formSelector: '.create-item-nav-container',
    openEvent: null, // opened by parent component
    submitSelector: '.create-item-nav-btn-primary[type="submit"]',
    getSteps: itemCreateRecipe,
  },
  record_create_doc: {
    id: 'record_create_doc',
    name: 'Jauns tekstuals dokuments',
    formSelector: '.create-record-nav-container',
    openEvent: null,
    submitSelector: '.create-record-nav-btn-primary[type="submit"]',
    getSteps: recordCreateRecipe,
  },
  metadata_visa: {
    id: 'metadata_visa',
    name: 'Viza (metadati)',
    formSelector: '.metadata-card-form',
    openEvent: null,
    submitSelector: '.metadata-card-btn-save',
    getSteps: metadataVisaRecipe,
  },
  metadata_addressee: {
    id: 'metadata_addressee',
    name: 'Adresats (metadati)',
    formSelector: '.metadata-card-form',
    openEvent: null,
    submitSelector: '.metadata-card-btn-save',
    getSteps: metadataAddresseeRecipe,
  },
  metadata_action: {
    id: 'metadata_action',
    name: 'Darbiba (metadati)',
    formSelector: '.metadata-card-form',
    openEvent: null,
    submitSelector: '.metadata-card-btn-save',
    getSteps: metadataActionRecipe,
  },
  metadata_read_status: {
    id: 'metadata_read_status',
    name: 'Iepazisanas statuss (metadati)',
    formSelector: '.metadata-card-form',
    openEvent: null,
    submitSelector: '.metadata-card-btn-save',
    getSteps: metadataReadStatusRecipe,
  },
  export_inventory_list: {
    id: 'export_inventory_list',
    name: 'Eksports: Uzskaites saraksts (US)',
    formSelector: 'body',
    openEvent: null,
    submitSelector: null,
    getSteps: exportInventoryListRecipe,
  },
  export_pn_akts: {
    id: 'export_pn_akts',
    name: 'Eksports: PN akts (Elektroniskais + Fiziskais)',
    formSelector: 'body',
    openEvent: null,
    submitSelector: null,
    getSteps: exportPnAktsRecipe,
  },
  generate_opex: {
    id: 'generate_opex',
    name: 'Ģenerē OPEX (Ilgstoši + Pastāvīgi)',
    formSelector: 'body',
    openEvent: null,
    submitSelector: null,
    getSteps: generateOpexRecipe,
  },
  verification_full: {
    id: 'verification_full',
    name: 'Verifikācija pilna (US + PN + OPEX)',
    formSelector: 'body',
    openEvent: null,
    submitSelector: null,
    getSteps: verificationExportsRecipe,
  },
};

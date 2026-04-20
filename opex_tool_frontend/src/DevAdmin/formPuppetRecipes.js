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
 */
const fillDatepicker = async (input, dateStr) => {
  // Focus the input — this opens the popup
  input.focus();
  await sleep(300);

  // Select all existing text so typing replaces it
  input.select();
  await sleep(50);

  // Type the date
  await setReactValue(input, dateStr, { charDelay: TYPING_DELAY });
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
        // The first .inventory-create-select is the type dropdown
        const selects = document.querySelectorAll('.inventory-create-select');
        if (!selects[0]) throw new Error('Type select not found');
        highlightElement(selects[0]);
        await selectReactSelectOption('.inventory-create-select', type, 400);
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
    expect: { selector: `[name="${name}"]`, value, name },
    action: async () => {
      const el = findByName(name);
      if (!el) return;
      scrollIntoView(el);
      highlightElement(el);
      setDateValue(el, value);
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
        const dateInput = form?.querySelector('input[type="date"]');
        if (!dateInput) throw new Error('date field not found');
        highlightElement(dateInput);
        setDateValue(dateInput, date);
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
        const dateInputs = form?.querySelectorAll('input[type="date"]');
        if (!dateInputs?.[0]) throw new Error('due_date field not found');
        highlightElement(dateInputs[0]);
        setDateValue(dateInputs[0], dueDate);
      },
    },
    {
      label: `Ievada izveidosanas datumu: ${createdDate}`,
      action: async () => {
        const form = document.querySelector('.metadata-card-form');
        const dateInputs = form?.querySelectorAll('input[type="date"]');
        if (!dateInputs?.[1]) throw new Error('created_date field not found');
        highlightElement(dateInputs[1]);
        setDateValue(dateInputs[1], createdDate);
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

/** Click an element matching selector, throw if not found. */
const clickEl = async (selector, label) => {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`${label || selector} not found`);
  highlightElement(el);
  el.click();
  await sleep(300);
};

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

/** Click the last (newest) record row in the records table. */
const clickLastRecordRow = async () => {
  // After record form closes, switch to the "Dokumenti" tab to see records list
  await sleep(1500);

  // Click the "Dokumenti" tab if not already active
  const docTab = document.querySelector('.item-view-tab:not(.item-view-tab-active)');
  if (docTab && docTab.textContent.includes('Dokumenti')) {
    highlightElement(docTab);
    docTab.click();
    await sleep(1500);
  }

  // Try up to 8 seconds for record rows to appear
  for (let i = 0; i < 16; i++) {
    // Click the TITLE CELL (not the row) — only the title cell triggers navigation
    const titleCells = document.querySelectorAll('.body-cell.title-cell');
    if (titleCells.length > 0) {
      const lastTitle = titleCells[titleCells.length - 1];
      highlightElement(lastTitle);
      lastTitle.click();
      await sleep(1500); // Wait for navigation to record detail
      return;
    }

    // Card view — click the card body
    const cards = document.querySelectorAll('.record-card-body');
    if (cards.length > 0) {
      highlightElement(cards[cards.length - 1]);
      cards[cards.length - 1].click();
      await sleep(1500);
      return;
    }

    await sleep(500);
  }

  throw new Error('No record title cells found after 8s');
};

/** Open a metadata section tab and click the add button. */
const openMetadataForm = async (sectionIndex) => {
  // Wait for metadata tabs to appear (record detail view needs to load)
  let tabs = null;
  for (let i = 0; i < 10; i++) {
    tabs = document.querySelectorAll('.metadata-section-btn-inline');
    if (tabs.length > 0) break;
    await sleep(500);
  }
  if (!tabs || !tabs[sectionIndex]) throw new Error(`Metadata tab ${sectionIndex} not found`);
  highlightElement(tabs[sectionIndex]);
  tabs[sectionIndex].click();
  await sleep(600);
  // Click add button (either empty-state or card-add)
  const addBtn = document.querySelector('.btn-metadata-create-empty') ||
                 document.querySelector('.metadata-card-add');
  if (!addBtn) throw new Error('Metadata add button not found');
  addBtn.click();
  await sleep(400);
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
        await sleep(300);
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

      // Only create records for textual + electronic inventories
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

        // Add metadata via API then navigate back to items list
        steps.push({
          label: `${itemLabel} > Dok: Pievieno metadatus (API)`,
          action: async () => {
            // Fetch updated project data to find the newly created record ID
            await sleep(1000);
            try {
              const projResp = await fetch(`/api/v1/project/${new URL(window.location.href).pathname.match(/\d+/)?.[0] || ''}/`);
              // Find project ID from the active tab
              const activeTab = document.querySelector('button.tab_button.expanded .project_name, button.tab_button.active .project_name');
              const projectTabs = document.querySelectorAll('.tab_button');
              let projectId = null;
              // Try to get project ID from React Query cache
              for (const key of Object.keys(window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers || {})) { break; }
              // Simpler: fetch the project list and find ours
              const listResp = await fetch('/api/v1/project/');
              if (listResp.ok) {
                const projects = await listResp.json();
                if (projects.length > 0) {
                  const proj = projects[projects.length - 1]; // Latest project
                  projectId = proj.id;
                  // Fetch full project data
                  const fullResp = await fetch(`/api/v1/project/${projectId}/`);
                  if (fullResp.ok) {
                    const fullProj = await fullResp.json();
                    // Find the last record in the last item of the current inventory
                    const inventories = fullProj?.institution?.fond?.inventories || [];
                    for (const inv of inventories) {
                      for (const item of (inv.items || [])) {
                        for (const record of (item.records || [])) {
                          // Add metadata to each record that has none
                          const metaResp = await fetch(`/api/v1/project/${projectId}/record/${record.id}/`);
                          if (metaResp.ok) {
                            const recData = await metaResp.json();
                            const hasMetadata = (recData.actions?.length || 0) + (recData.addressees?.length || 0) +
                                               (recData.visas?.length || 0) + (recData.read_statuses?.length || 0);
                            if (hasMetadata === 0) {
                              const addMeta = async (cls, data) => {
                                await fetch(`/api/v1/project/${projectId}/record/${record.id}/additional_metadata/?class=${cls}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(data)
                                });
                              };
                              await addMeta('visa', buildVisa(itemStartDate));
                              await addMeta('addressee', buildAddressee());
                              await addMeta('action', buildAction(itemStartDate));
                              await addMeta('read_status', buildReadStatus(itemStartDate));
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (err) {
              console.log('[Puppet] Metadata API error:', err.message);
            }
          },
        });

        // Navigate back from item detail to items list
        steps.push({
          label: `${itemLabel}: Atgriežas pie saraksta`,
          action: async () => {
            // Click the back button in item detail
            const backBtn = document.querySelector('.item-back-btn');
            if (backBtn) {
              highlightElement(backBtn);
              backBtn.click();
              await sleep(1500);
            }
            // Ensure we're seeing the items list — re-click the inventory in sidebar
            const inventoryItems = document.querySelectorAll('.inventory-item');
            if (inventoryItems.length > 0) {
              const lastInv = inventoryItems[inventoryItems.length - 1];
              if (!lastInv.classList.contains('selected')) {
                lastInv.click();
                await sleep(1500);
              }
            }
            // Wait for items table/empty state
            try {
              await waitForSelector('.items-uniform-table-wrapper, .items-uniform-empty-state, .inv-action-btn', 3000);
            } catch { /* continue */ }
            await sleep(500);
          },
        });
      }
    }
  }

  // Future: OPEX generation step placeholder
  steps.push({
    label: `═══ Pabeigts! (OPEX generesana — vel nav implementeta) ═══`,
    action: async () => {
      // TODO: When OPEX generation is implemented, trigger it here
      await sleep(100);
    },
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
};

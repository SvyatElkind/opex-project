import { HELP_CHAPTER_IDS } from '../Utils/HelpWindow';

/**
 * Help zones — the pickable "boxes" for the top-bar help picker.
 *
 * When the picker is armed, the element under the cursor is walked up the DOM
 * (`closest`) against every entry here and the DEEPEST match wins — a file card
 * sits inside a record, which sits inside the project page, and we want the file
 * card to answer. List order only breaks ties when two entries match the very
 * same element, so the list is kept most-specific-first to make that predictable.
 *
 * Deliberately coarse. These are structural regions at the domain-hierarchy
 * level — uzskaites saraksts / glabājamā vienība / dokuments / datnes — not
 * individual fields. Per-field explanations are the job of <FieldHelp>, and
 * per-form help is the job of the <HelpButton> inside each form; neither is
 * affected by the picker.
 *
 * Adding a zone: append an entry with a stable container class, a short Latvian
 * label (shown on the highlight) and the chapter/section it documents. An area
 * with no entry simply is not pickable — a dead click that dumps the user on
 * page 1 of the docs is worse than no target at all.
 */
export const HELP_ZONES = [
  // ── Modals / overlays — most specific, they sit on top of everything ──
  {
    selector: '.verification-modal',
    label: 'Pārbaude pirms eksporta',
    chapterId: HELP_CHAPTER_IDS.VERIFICATION,
    sectionId: 'verification-view',
  },
  {
    selector: '.settings-container',
    label: 'Iestatījumi',
    chapterId: HELP_CHAPTER_IDS.SETTINGS,
  },
  {
    selector: '.inst-signers-modal',
    label: 'Atbildīgās personas',
    chapterId: HELP_CHAPTER_IDS.PROJECTS,
    sectionId: 'institution-signers',
  },
  {
    selector: '.smart-guide-card, .smart-guide-minimized',
    label: 'Vadlīnijas',
    chapterId: HELP_CHAPTER_IDS.ROADMAP,
  },

  // ── Record level: files and metadata live inside a record, so they win ──
  {
    selector: '.record-files-wrapper, .files-card',
    label: 'Datnes',
    chapterId: HELP_CHAPTER_IDS.RECORDS,
    sectionId: 'record-files',
  },
  {
    selector: '.metadata-sections-inline, .metadata-card',
    label: 'Dokumenta metadati',
    chapterId: HELP_CHAPTER_IDS.RECORDS,
    sectionId: 'record-metadata',
  },
  {
    selector: '.records-table-container, .records-list-modern',
    label: 'Dokumentu saraksts',
    chapterId: HELP_CHAPTER_IDS.RECORDS,
    sectionId: 'search-filter-records',
  },
  {
    selector: '.record-container',
    label: 'Dokuments',
    chapterId: HELP_CHAPTER_IDS.RECORDS,
  },

  // ── Item level ──
  {
    selector: '.items-uniform-table-wrapper, .items-detail-view',
    label: 'Glabājamo vienību saraksts',
    chapterId: HELP_CHAPTER_IDS.ITEMS,
    sectionId: 'manage-item',
  },
  {
    selector: '.item-detail-wrapper, .item-combined-view',
    label: 'Glabājamā vienība',
    chapterId: HELP_CHAPTER_IDS.ITEMS,
  },

  // ── Inventory level ──
  {
    selector: '.inventory-details',
    label: 'Uzskaites saraksta dati',
    chapterId: HELP_CHAPTER_IDS.INVENTORIES,
    sectionId: 'edit-inventory',
  },
  {
    selector: '.inventory-list, .inventories-container, .inventories-section',
    label: 'Uzskaites saraksti',
    chapterId: HELP_CHAPTER_IDS.INVENTORIES,
  },

  // ── Project / chrome level — least specific, matched last ──
  {
    selector: '.navigation-container',
    label: 'Navigācija',
    chapterId: HELP_CHAPTER_IDS.NAVIGATION,
    sectionId: 'breadcrumbs',
  },
  {
    selector: '.missing-report-content',
    label: 'VVAIS atskaites augšupielāde',
    chapterId: HELP_CHAPTER_IDS.PROJECTS,
    sectionId: 'upload-vvais-report',
  },
  {
    selector: '.tabs',
    label: 'Projekti',
    chapterId: HELP_CHAPTER_IDS.PROJECTS,
    sectionId: 'manage-project',
  },
  {
    selector: '.ProjectPage',
    label: 'Projekta lapa',
    chapterId: HELP_CHAPTER_IDS.PROJECTS,
    sectionId: 'project-main-page',
  },
];

/** Single selector string used for a fast "is this inside any zone?" test. */
export const ALL_ZONES_SELECTOR = HELP_ZONES.map(z => z.selector).join(', ');

/**
 * Resolve the innermost help zone containing `element`.
 * @returns {{ element: HTMLElement, zone: object }|null}
 */
export const findHelpZone = (element) => {
  if (!element || typeof element.closest !== 'function') return null;

  let best = null;

  for (const zone of HELP_ZONES) {
    const match = element.closest(zone.selector);
    if (!match) continue;
    // First match in list order wins, but prefer a deeper node if a later
    // zone resolves to an element contained by the current best.
    if (!best) {
      best = { element: match, zone };
    } else if (best.element.contains(match) && best.element !== match) {
      best = { element: match, zone };
    }
  }

  return best;
};

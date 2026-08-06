/* ==========================================
   BULK (MULTI CREATE / MULTI EDIT) UI STRINGS
   Vairāku glabājamo vienību un dokumentu izveide un rediģēšana
   ========================================== */

export const BULK_UI = {
    /* --- Selection toolbar --- */
    SELECTION_COUNT: "Atlasītas {count} no {total}",
    SELECTION_COUNT_RECORDS: "Atlasīti {count} no {total}",
    SELECTION_MORE: "+{count}",
    SELECTION_EDIT_BTN: "Rediģēt",
    SELECTION_DELETE_BTN: "Dzēst",
    SELECTION_COLUMNS_BTN: "Kolonnas",
    SELECTION_CLEAR_BTN: "Notīrīt",

    /* --- Header buttons --- */
    TOOLTIP_BULK_EDIT_ITEMS: "Rediģēt {count} atlasītās vienības",
    TOOLTIP_BULK_EDIT_RECORDS: "Rediģēt {count} atlasītos dokumentus",
    MENU_CREATE_ONE_ITEM: "Izveidot vienu vienību",
    MENU_CREATE_MANY_ITEMS: "Izveidot vairākas vienības",
    MENU_CREATE_ONE_RECORD: "Izveidot vienu dokumentu",
    MENU_CREATE_MANY_RECORDS: "Izveidot vairākus dokumentus",

    /* --- Field hints (the "?" bubbles specific to these popups) --- */
    HINT_MIXED: "Atlasītajām vienībām šajā laukā ir dažādas vērtības. Ja lauku atzīmēsiet, visām tiks uzlikta viena vērtība.",
    HINT_MODE: "Aizvietot — uzliek jauno vērtību. Pievienot klāt — pieraksta esošajai vērtībai galā. Notīrīt — iztukšo lauku.",
    HINT_PASTE: "Ielīmējiet nosaukumu kolonnu no Excel vai teksta faila — katra rinda kļūs par atsevišķu dokumentu.",
    HINT_PATTERN: "Šablonā {n} vietā tiks ielikts numurs. Piemēram, \"Protokols {n}\" ar sākumu 1 dod \"Protokols 1\", \"Protokols 2\"…",
    HINT_FILES: "Katra izvēlētā datne kļūs par atsevišķu dokumentu, un datne tiks pievienota tam dokumentam. Nosaukums tiek ņemts no datnes nosaukuma.",
    HINT_REVIEW: "Vienības ar kļūdām tiks izlaistas — pārējās tiks saglabātas.",

    /* --- Bulk edit popup --- */
    EDIT_TITLE_ITEMS: "Rediģē {count} glabājamās vienības",
    EDIT_TITLE_RECORDS: "Rediģē {count} dokumentus",
    EDIT_INTRO: "Atzīmētie lauki tiks pārrakstīti visām — neatzīmētie katrai vienībai paliks savi.",
    EDIT_INTRO_RECORDS: "Atzīmētie lauki tiks pārrakstīti visiem — neatzīmētie katram dokumentam paliks savi.",
    MIXED_VALUES: "dažādas vērtības",
    FOOTER_FIELDS_SELECTED: "Atzīmēts 1 lauks",
    FOOTER_FIELDS_SELECTED_MANY: "Atzīmēti {fields} lauki",
    FOOTER_NOTHING_SELECTED: "Nav atzīmēts neviens lauks",

    /* --- Modes --- */
    MODE_REPLACE: "Aizvietot",
    MODE_APPEND: "Pievienot klāt",
    MODE_CLEAR: "Notīrīt",

    /* --- Review step --- */
    REVIEW_TITLE: "Pārskats pirms saglabāšanas",
    REVIEW_AFFECTED: "mainīsies {count}",
    REVIEW_AFFECTED_NONE: "vērtība jau ir tāda pati",
    REVIEW_SKIPPED_TITLE: "{count} tiks izlaistas, jo tajās ir kļūda:",
    REVIEW_SKIPPED_TITLE_RECORDS: "{count} tiks izlaisti, jo tajos ir kļūda:",
    REVIEW_ALL_SKIPPED: "Nevienu dokumentu nevar saglabāt — vispirms jālabo kļūdas.",
    REVIEW_EMPTY_FIELD: "Lauks \"{label}\" ir atzīmēts, bet nav aizpildīts.",
    REVIEW_BACK_BTN: "← Atpakaļ",
    REVIEW_NEXT_BTN: "Pārskatīt →",
    REVIEW_SAVE_BTN: "Saglabāt {count}",

    /* --- Progress / results --- */
    PROGRESS_SAVING: "Saglabā… {done} / {total}",
    PROGRESS_CREATING: "Izveido… {done} / {total}",
    PROGRESS_STOP_BTN: "Apturēt",
    RESULT_SUCCESS: "{count} saglabātas",
    RESULT_SUCCESS_CREATE: "{count} izveidotas",
    RESULT_FAILED: "{count} neizdevās",
    RESULT_STOPPED: "Darbība apturēta. Paveiktais netiek atcelts.",
    RESULT_CLOSE_BTN: "Aizvērt",

    /* --- Multi create popup --- */
    CREATE_TITLE_ITEMS: "Izveidot vairākas glabājamās vienības",
    CREATE_TITLE_RECORDS: "Izveidot vairākus dokumentus",
    CREATE_STEP_SHARED: "1. Kopīgie lauki",
    CREATE_STEP_SHARED_HINT: "Attiecas uz visām jaunajām vienībām",
    CREATE_STEP_SHARED_HINT_RECORDS: "Attiecas uz visiem jaunajiem dokumentiem",
    CREATE_STEP_ROWS: "2. Katras vienības unikālie lauki",
    CREATE_STEP_ROWS_RECORDS: "2. Katra dokumenta unikālie lauki",
    CREATE_ROW_COUNT: "Rindas: {count}",
    CREATE_PASTE_BTN: "Ielīmēt sarakstu",
    CREATE_PATTERN_BTN: "Ģenerēt pēc šablona",
    CREATE_FILES_BTN: "Pievienot datnes",
    CREATE_ADD_ROW_BTN: "+ rinda",
    CREATE_CLEAR_ROWS_BTN: "Notīrīt rindas",
    CREATE_REMOVE_ROW: "Noņemt rindu",
    CREATE_SUBMIT_BTN: "Izveidot {count}",
    CREATE_NUMBER_HINT: "GV numurus piešķir sistēma pēc kārtas",
    CREATE_NO_ROWS: "Pievienojiet vismaz vienu rindu",

    /* --- Paste helper --- */
    PASTE_TITLE: "Ielīmējiet sarakstu",
    PASTE_HINT: "Katra rinda kļūs par atsevišķu vienību. Var ielīmēt arī kolonnas no Excel — pirmā kolonna ir nosaukums.",
    PASTE_HINT_RECORDS: "Katra rinda kļūs par atsevišķu dokumentu. Ja ielīmē divas kolonnas no Excel, otrā ir reģistrācijas numurs.",
    PASTE_PLACEHOLDER: "Sēdes protokoli 2020. I ceturksnis\nSēdes protokoli 2020. II ceturksnis\n…",
    PASTE_APPLY_BTN: "Pievienot rindas",
    PASTE_CANCEL_BTN: "Atcelt",

    /* --- Pattern helper --- */
    PATTERN_TITLE: "Ģenerēt pēc šablona",
    PATTERN_HINT: "Lietojiet {n} vietā, kur jāievieto numurs.",
    PATTERN_FIELD: "Šablons",
    PATTERN_PLACEHOLDER: "Sēdes protokoli 2020. {n}. ceturksnis",
    PATTERN_START: "Sākuma numurs",
    PATTERN_COUNT: "Cik rindas",
    PATTERN_APPLY_BTN: "Ģenerēt",

    /* --- Files helper --- */
    FILES_ATTACHED: "Datne: {name}",

    /* --- Warnings --- */
    WARNING_LARGE_SELECTION: "Atlasītas {count} vienības — tiks nosūtīts {count} atsevišķu pieprasījumu. Tas var aizņemt laiku.",
    WARNING_LARGE_CREATE: "Tiks izveidotas {count} vienības pa vienai. Tas var aizņemt laiku.",
    WARNING_NOT_REVERSIBLE: "Šo darbību nevar atsaukt.",

    /* --- Generic --- */
    CANCEL_BTN: "Atcelt",
    ROW_VALID: "Rinda ir derīga",
    COLUMN_ROW_NR: "Nr.",
    COLUMN_STATUS: "Statuss",
};

export default BULK_UI;

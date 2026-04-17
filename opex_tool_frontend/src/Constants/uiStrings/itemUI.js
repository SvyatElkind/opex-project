/* --- Item UI Strings --- */

export const ITEM_UI = {
    ID: "ID",
    NUMBER: "Numurs",
    TITLE: "Nosaukums",
    DATE: "Datums",
    START_DATE: "Sākuma Datums",
    END_DATE: "Beigu Datums",
    NOTES: "Piezīmes",
    RECORDS_COUNT: "Ierakstu skaits",
    STATUS: "Statuss",
    ACTIONS: "Darbības",
    CREATE_ITEM: "Izveidot Glabājamo Vienību",
    EDIT_ITEM: "Labot Glabājamo Vienību",
    DELETE_ITEM: "Dzēst Glabājamo Vienību",
    VIEW_RECORDS: "Skatīt Ierakstus",
    SAVE: "Saglabāt",
    SAVE_IN_PROGRESS: "Saglabā...",
    CANCEL: "Atcelt",
    BACK_TO_LIST: "Atpakaļ uz sarakstu",
    ITEM_DETAILS: "Glabājamās Vienības Detaļas"
}

export const ITEM_CREATE_UI = {
    TITLE: "Izveidot Jaunu Glabājamo Vienību",
    NUMBER_LABEL: "Numurs:",
    NUMBER_PLACEHOLDER: "Ievadiet numuru",
    TITLE_LABEL: "Nosaukums:",
    TITLE_PLACEHOLDER: "Ievadiet nosaukumu",
    DATE_LABEL: "Datums:",
    START_DATE_LABEL: "Sākuma Datums:",
    END_DATE_LABEL: "Beigu Datums:",
    NOTES_LABEL: "Piezīmes:",
    NOTES_PLACEHOLDER: "Ievadiet piezīmes",
    CREATE_BUTTON: "Izveidot",
    CREATE_IN_PROGRESS: "Izveido...",
    CANCEL_BUTTON: "Atcelt"
}

export const ITEM_EDIT_UI = {
    TITLE: "Labot Glabājamo Vienību",
    SAVE_BUTTON: "Saglabāt Izmaiņas",
    SAVE_IN_PROGRESS: "Saglabā...",
    CANCEL_BUTTON: "Atcelt"
}

export const ITEM_DELETE_UI = {
    TITLE: "Dzēst Glabājamo Vienību",
    TITLE_PLURAL: "Dzēst Glabājamās Vienības",
    CONFIRM_MESSAGE: "Vai tiešām vēlaties dzēst šo glabājamo vienību?",
    WARNING: "Tiks dzēsti arī visi ar to saistītie dokumenti!",
    WARNING_IRREVERSIBLE: "Šī darbība ir <strong>neatgriezeniska</strong>.",
    CANCEL: "Atcelt",
    CONFIRM: "Dzēst",

    // Delete popup specific
    POPUP_TITLE_SINGLE: "Dzēst glabājamo vienību?",
    POPUP_TITLE_MULTI: "Dzēst glabājamās vienības?",
    POPUP_WARNING_TEXT: "Šī darbība ir <strong>neatgriezeniska</strong>. Dzēšot vienību(-as), tiks dzēsta visa saistītā informācija:",
    POPUP_ITEM_LABEL: "Glabājamā vienība",
    POPUP_ITEMS_LABEL: "Glabājamās vienības",
    POPUP_RECORD_LABEL: "dokuments",
    POPUP_RECORDS_LABEL: "dokumenti",
    POPUP_RECORDS_LABEL_MULTI: "dokumentu",
    POPUP_NO_RECORDS: "Nav dokumentu",
    POPUP_TOTAL_ITEMS: "Kopā vienību:",
    POPUP_TOTAL_RECORDS: "Kopā dokumentu:",
    POPUP_CONSEQUENCES_TITLE: "Tiks dzēsts:",
    POPUP_CONSEQUENCE_ITEMS: "glabājamā(-ās) vienība(-as)",
    POPUP_CONSEQUENCE_RECORDS: "visi saistītie dokumenti",
    POPUP_CONSEQUENCE_FILES: "visas augšupielādētās datnes"
}

export const ITEM_ERROR = {
    NUMBER_REQUIRED: "Numurs ir obligāts lauks",
    TITLE_REQUIRED: "Nosaukums ir obligāts lauks",
    INVALID_DATE_RANGE: "Beigu datums nedrīkst būt agrāks par sākuma datumu",
    CREATE_FAILED: "Neizdevās izveidot glabājamo vienību",
    UPDATE_FAILED: "Neizdevās atjaunināt glabājamo vienību",
    DELETE_FAILED: "Neizdevās dzēst glabājamo vienību"
}

export const ITEM_ADDITIONAL_UI = {
    DELETE_CONFIRM: "Vai esat pārliecināts, ka vēlaties dzēst šo vienību?",
    DELETE_BATCH_CONFIRM: "Vai esat pārliecināts, ka vēlaties dzēst {count} vienības?",
    ERROR_ITEM_NOT_FOUND: "Kļūda: vienība nav atrasta",
    ERROR_ID_NOT_FOUND: "Kļūda: vienības ID nav atrasts",
    ERROR_CREATING_RECORD: "Kļūda veidojot dokumentu: {message}",
    ERROR_INVALID_RECORD: "Kļūda: Dokuments netika izveidots pareizi",
    DATE_PERIOD_REQUIRED: "Lūdzu, vispirms iestatiet uzskaites saraksta datumu periodu.\n\nDatums nav dots - lūdzu aizpildiet Sākuma datumu un Beigu datumu rediģēšanas logā.",

    // Table headers
    COLUMN_GV: "GV",
    COLUMN_SĒRIJAS: "Sērijas",
    COLUMN_KODS: "Kods",
    COLUMN_NOSAUKUMS: "Nosaukums",
    COLUMN_DATUMS: "Datums",
    COLUMN_PIEEJAMĪBA: "Pieejamība",
    COLUMN_VALODA: "Valoda",
    COLUMN_PIEZĪMES: "Piezīmes",
    COLUMN_DOK: "Dok.",

    // Tooltips
    TOOLTIP_GV_NOSAUKUMS: "Glabājamās Vienības Nosaukums",
    TOOLTIP_GV_DATUMS: "Glabājamās Vienības Datums",
    TOOLTIP_CREATE_NEW: "Izveidot jaunu GV",
    TOOLTIP_COLUMN_SETTINGS: "Kolonnu iestatījumi",
    TOOLTIP_DELETE_COUNT: "Dzēst {count} vienības",
    TOOLTIP_SELECT_TO_DELETE: "Izvēlieties vienības lai dzēstu",
    TOOLTIP_VIEW_FILE: "Skatīt datni",
    TOOLTIP_NO_FILE: "Nav datnes",
    TOOLTIP_VIEW_DOCUMENTS: "Skatīt dokumentus",
    TOOLTIP_CREATE_RECORD: "Izveidot dokumentu",
    TOOLTIP_EDIT_ITEM: "Labot vienību",
    TOOLTIP_DELETE_ITEM: "Dzēst vienību",

    // States
    NO_TITLE: "Bez nosaukuma",
    NO_ITEMS_FOUND: "Uzskaites sarakstā nav izveidota neviena glabājamā vienība",
    ITEM_NOT_FOUND: "Vienība nav atrasta",
    ITEM_NOT_FOUND_ERROR: "Kļūda: GV nav atrasta",

    // Column selector
    COLUMN_SELECTOR_TITLE: "Kolonnu Izvēle",

    COLUMN_NAMES: {
        GV_NUMURS: "GV Numurs",
        SĒRIJAS_KODS: "Sērijas Kods",
        NOSAUKUMS: "Nosaukums",
        DATUMS: "Datums",
        DOKUMENTI: "Dokumenti",
        IEROBEŽOTA_PIEEJAMĪBA: "Ierobežota Pieejamība",
        VALODA: "Valoda",
        PIEZĪMES: "Piezīmes"
    },

    // Related items table
    TABLE_GV: "GV",
    TABLE_US: "US",
    TABLE_NOSAUKUMS: "Nosaukums",
    REMOVE_BTN: "Noņemt"
}

export const ITEM_CREATE_FORM_UI = {
    // Title and subtitle
    TITLE: "Jauna glabājamā vienība",
    TITLE_WITH_NUMBER: "Glabājamā vienība (Nr. {number})",
    TITLE_EDIT: "Glabājamā Vienība",
    TITLE_EDIT_WITH_NUMBER: "Glabājamā Vienība (Nr. {number})",
    SUBTITLE: "{inventory}. uzskaites saraksts",
    CREATED_COUNT: " ({count} izveidoti)",
    SUCCESS_CREATE_MORE: "Vienība \"{title}\" izveidota veiksmīgi! Izveidojam vēl vienu...",
    SUCCESS_UPDATE: "Vienība veiksmīgi atjaunināta!",
    ERROR_OCCURRED: "Notika kļūda",

    // Buttons (without icons)
    CREATING_BTN: "Izveido...",
    CREATE_BTN: "Izveidot",
    SAVING_BTN: "Saglabā...",
    SAVE_BTN: "Saglabāt",
    CANCEL_BTN: "Atcelt",

    // Sections (sentence case - first letter capital, rest lowercase)
    SECTION_BASIC: "Pamatinformācija",
    SECTION_DATES: "Datuma informācija",
    SECTION_TECHNICAL: "Tehniskā informācija",
    SECTION_DESCRIPTION: "Saturs",
    SECTION_ACCESS: "Pieejamība un slepenība",
    SECTION_RELATED: "Saistītās glabājamās vienības",

    // Fields (without colons)
    FIELD_SĒRIJAS_KODS: "Sērijas kods",
    PLACEHOLDER_SĒRIJAS_KODS: "Ievadiet sērijas kodu",
    FIELD_NOSAUKUMS: "Nosaukums",
    PLACEHOLDER_NOSAUKUMS: "Ievadiet nosaukumu",
    FIELD_VALODA: "Valoda",
    PLACEHOLDER_VALODA_SEARCH: "Meklēt sarakstā vai ievadīt jaunu valodu",
    ADD_CUSTOM_LANGUAGE: "Pievienot \"{search}\"",
    FIELD_DATUMA_PIEZĪMES: "Datuma piezīmes",
    PLACEHOLDER_DATUMA_PIEZĪMES: "Papildu informācija par datumiem",
    FIELD_APJOMS: "Apjoms",
    FIELD_APJOMA_MĒRVIENĪBA: "Apjoma mērvienība",
    FIELD_KOPIJA: "Kopija",
    PLACEHOLDER_KOPIJA: "Kopijas informācija",
    FIELD_ARHĪVA_VĒSTURE: "Arhīva vēsture",
    PLACEHOLDER_ARHĪVA_VĒSTURE: "Arhivēšanas vēsture",
    FIELD_SISTEMATIZĀCIJA: "Sistematizācija",
    PLACEHOLDER_SISTEMATIZĀCIJA: "Sistematizācijas kods",

    // Description section fields (Content first, then Notes)
    FIELD_SATURS: "Saturs",
    PLACEHOLDER_SATURS: "Satura izklāsts",
    FIELD_PIEZĪMES: "Piezīmes",
    PLACEHOLDER_PIEZĪMES: "Papildu informācija",

    // Access and Security section
    FIELD_PIEEJAMĪBA: "Pieejamība",
    FIELD_SLEPENĪBA: "Slepenība",
    FIELD_PIEEJAMĪBAS_PIEZĪMES: "Pieejamības piezīmes",
    PLACEHOLDER_PIEEJAMĪBAS_PIEZĪMES: "Papildus informācija par pieejamību",
    FIELD_SLEPENĪBAS_PIEZĪMES: "Slepenības piezīmes",
    PLACEHOLDER_SLEPENĪBAS_PIEZĪMES: "Papildināt informāciju par slepenību",

    // Related items section
    PLACEHOLDER_MEKLĒT_VIENĪBAS: "Meklēt glabājamās vienības",
    NO_RELATED_ITEMS: "Nav izvēlētas saistītās glabājamās vienības",
    TABLE_HEADER_US: "US",
    TABLE_HEADER_GV: "GV",
    TABLE_HEADER_NOSAUKUMS: "Nosaukums",
    DROPDOWN_LABEL_US: "US:",
    DROPDOWN_LABEL_GV: "GV:",
    REMOVE_BTN: "Noņemt",
    DATE_VALIDATION_ERROR: "Vienības beigu datums ({itemDate}) nedrīkst būt vēlāks par uzskaites saraksta beigu datumu ({inventoryDate})",

    // Options
    OPTIONS_APJOMA_MĒRVIENĪBA: {
        LAPAS: "Lapas",
        DOKUMENTI: "Dokumenti",
        GLABĀJAMĀS_VIENĪBAS: "Glabājamās vienības"
    },
    OPTIONS_PIEEJAMĪBA: {
        VISPĀRĒJA: "Vispārēja",
        IEROBEŽOTA: "Ierobežota",
        STINGRI_IEROBEŽOTA: "Stingri ierobežota"
    },
    OPTIONS_SLEPENĪBA: {
        PUBLISKS: "Publisks",
        IEKŠĒJS: "Iekšējs",
        KONFIDENCIĀLS: "Konfidenciāls",
        SLEPENS: "Slepens"
    },

    // Language list
    LANGUAGES: [
        "Latviešu", "Krievu", "Angļu", "Vācu", "Franču", "Spāņu", "Itāļu",
        "Poļu", "Lietuviešu", "Igauņu", "Somu", "Zviedru", "Norvēģu", "Dāņu",
        "Holandiešu", "Portugāļu", "Grieķu", "Turku", "Arābu", "Ķīniešu",
        "Japāņu", "Korejiešu", "Hindi", "Hebrejsku", "Čehu", "Slovāku",
        "Rumāņu", "Bulgāru", "Ungāru", "Ukraiņu", "Serbu", "Horvātu", "Cita"
    ]
}

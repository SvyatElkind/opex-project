/* --- Worksace Level Constants --- */
/* !--- Workspace Level Constants ---! */

/* ==========================================
   COMPLETE APPLICATION CONSTANTS
   All text in proper Latvian with correct encoding
   ========================================== */

/* --- Workspace Level Constants --- */
/*src/Workspace/Workspace.js*/
export const WORKSPACE_UI = {
    LOADING: "Notiek Ielāde...",
    ERROR: "Kļūda ielādējot datus",
    NO_PROJECTS: "Nav projektu",
    RETRY: "Mēģināt vēlreiz"
}
/* !--- Workspace Level Constants ---! */

/* --- Project Level Constants --- */
/*src/Project/*/
export const PROJECT_UI = {
    CREATE_PROJECT_BTN: "Izveidot Projektu",
    CREATE_PROJECT_BTN_SHORT: "+",
    PROJECT_STATEMENT_WHEN_EMPTY: "",
    PROJECT_RENAME_BTN: "Pārdēvēt Projektu",
    PROJECT_DELETE_BTN: "Dzēst Projektu",
    PROJECT_ADD_REPORT_BTN: "Pievienot infomāciju par fondu",
    PROJECT_DETAILS_HIDE: "Paslēpt Projekta Detaļas",
    PROJECT_DETAILS_SHOW: "Parādīt Projekta Detaļas",
    PROJECT_TOOLTIP_CREATED_AT: "Izveidots:",
    PROJECT_TOOLTIP_DIR: "Vieta Diskā:",
    PROJECT_EMPTY_HEADER: "DAR𝑖",
    PROJECT_STATEMENT_WHEN_MISSING_REPORT: ""
}

export const PROJECT_CREATE_UI = {
    PROJECT_NAME_LABEL: "Jaunā projekta nosaukums",
    PROJECT_DIR_LABEL: "Norādiet projekta darba mapi ",
    PROJECT_CREATE_BTN: "Izveidot",
    PROJECT_CANCEL_BTN: "Atcelt"
}

export const PROJECT_RENAME_UI = {
    RENAME_TITLE: "Projekta Pārdēvēšana",
    RENAME_LABEL: "Projekta jaunais nosaukums:",
    RENAME_BUTTON: "Apstiprināt",
    RENAME_CANCEL: "Atcelt"
}

export const PROJECT_DELETE_UI = {
    DELETE_TITLE_PREFIX: "Dzēst projektu",
    DELETE_TITLE_SUFFIX: "?",
    DELETE_WARNING_TEXT: "Šī darbība ir",
    DELETE_WARNING_STRONG: "neatgriezeniska",
    DELETE_WARNING_CONTINUATION: ". Dzēšot projektu, tiks dzēsta visa projektā ievadītā informācija:",
    DELETE_PARAGRAPH_PT2: "Apstiprinot projekta dzēšanu tiks dzēstas visas darbības šajā projektā. Tā skaitā: informācija par izveidotajiem uzskaites sarakstiem, informācija par glabājamām vienībām un informācija par datnēm.",
    DELETE_PARAGRAPH_PT3: "Dzēstie projekti un informācija, kas piesaistīta tiem:",
    DELETE_PARAGRAPH_PT4: "NAV ATGŪSTAMA!",
    DELETE_CANCEL: "Atcelt",
    DELETE_CONFIRM: "Dzēst",
    DELETE_DELETING: "Dzēš Projektu...",
    DELETE_COUNTDOWN: "Dzēš pēc {countdown} sekundēm...",
    DELETE_PREPARING: "Gatavo dzēšanu...",
    DELETE_STOP: "Apturēt",

    // Dynamic data labels
    INVENTORIES_LABEL: "Uzskaites saraksti",
    ITEMS_LABEL: "Glabājamās vienības",
    RECORDS_LABEL: "Ieraksti",
    FILES_LABEL: "Faili"
}

export const PROJECT_ERROR = {
    VALIDATE_NAME_INPUT_MESSAGE_EMPTY: "Projekta nosaukums nedrīkst būt tukšs",
    VALIDATE_NAME_INPUT_MESSAGE_INVALID: "Projekta nosaukums norādīts nepareizi",
    VALIDATE_DIR_INPUT_MESSAGE_EMPTY: "Norādiet projekta direktoriju",
    VALIDATE_DIR_INPUT_MESSAGE_INVALID: "Projekta direktorija norādīta nepareizi"
}

export const PROJECT_REPORT_UI = {
    UPLOAD_TITLE: "Augšupielādēt informāciju par fondu",
    UPLOAD_DRAG_DROP: "Ievelciet datni šeit",
    UPLOAD_OR: "vai",
    UPLOAD_BROWSE: "izvēlieties no failu pārlūka.",
    UPLOAD_BUTTON: "Augšupielādēt",
    UPLOAD_CANCEL: "Atcelt",
    UPLOAD_IN_PROGRESS: "Augšupielādē...",
    UPLOAD_SUCCESS: "Atskaite veiksmīgi augšupielādēta!",
    UPLOAD_ERROR: "Kļūda augšupielādējot atskaiti",
    FILE_TOO_LARGE: "Fails ir par lielu (maksimums 50MB)",
    INVALID_FILE_TYPE: "Faila tips nav atbalstīts",
    SUPPORTED_FORMATS: "Atbalstītie formāti: XLSX, XLS"
}
/* !--- Project Level Constants ---! */

/* --- Fond Level Constants --- */
/*src/Fond/*/
export const FOND_UI = {
    FOND_NUMBER: "Fonda Numurs",
    FOND_TITLE: "Fonda Nosaukums",
    ARCH_TITLE: "Arhīva Nosaukums",
    FOND_CODE: "Fonda Kods",
    TOTAL_INVENTORIES: "Kopējais Uzskaites Sarakstu Skaits",
    TOTAL_ITEMS: "Kopējais Glabājamo Vienību Skaits",
    SUMMARY: "Kopsavilkums",
    DETAILS: "Detaļas"
}
/* !--- Fond Level Constants ---! */

/* --- Navigation Level Constants --- */
/*src/Navigation/*/
export const NAVIGATION_UI = {
    HOME: "Sākums",
    BACK: "Atpakaļ",
    FORWARD: "Uz priekšu",
    BREADCRUMB_SEPARATOR: "/",
    PROJECT: "Projekts",
    FOND: "Fonds",
    INVENTORY: "Uzskaites Saraksts",
    ITEM: "Glabājamā Vienība",
    RECORD: "Ieraksts"
}
/* !--- Navigation Level Constants ---! */

/* --- Institution Level Constants --- */
/*src/Institution/*/
export const INSTITUTION_CONSTANTS = {
    HEADER: "Institūciju Parakstītāji",
    FIELD_1: "Lauki",
    FIELD_2: "Vērtības",
    CREATOR: "Veidotājs",
    CREATOR_POSITION: "Veidotāja Amats",
    SIGNER: "Parakstītājs",
    SIGNER_POSITION: "Parakstītāja Amats",
    ADD_ALL_FIELDS: "Pievienot Visus Laukus",
    REG_FIELD: "Reģ. Nr.",
    EDIT_CREATOR: "Labot Veidotāju",
    EDIT_SIGNER: "Labot Parakstītāju",
    EDIT_CREATOR_POSITION: "Labot Veidotāja Amatu",
    EDIT_SIGNER_POSITION: "Labot Parakstītāja Amatu",
    CONFIRM_ALL_SIGNERS: "Apstiprināt Parakstītājus",
    CONFIRM_SIGNER: "Apstiprināt Parakstītāju",
    ADD_ALL_S_HEADER: "Parakstītāju Vārdi un Amati:",
    CANCEL_ALL_SIGNERS: "Atcelt",
    CANCEL_SIGNER: "Atcelt",
    EDIT_HEADER: "Labot:",
    EDIT: "Labot",
    EMPTY_FIELD: "Laukā Nav Norādīta Vērtība"
}
/* !--- Institution Level Constants ---! */

/* --- Inventory Level Constants --- */
/*src/Inventory/*/
export const INVENTORY_UI = {
    CREATE_INV_BTN: "Izveidot Jaunu Uzskaites Sarakstu",
    ID: "ID",
    NUMBER: "Numurs",
    TYPE: "Tips",
    ALLOW: "Atļaut Pilnu lauku atjaunošanu",
    ELECTRONIC: "Elektronisks",
    LAST_GV: "Pēdējais GV",
    ITEMS_PER_PERIOD: "Glabājamās vienības periodā",
    TOTAL_ITEMS: "Kopējo Glabājamo vienību skaits",
    STORAGE_TERM: "Glabāšanas periods",
    START_DATE: "Sākuma Datums",
    END_DATE: "Beigu Datums",
    ITEMS: "Glabājamās vienības",
    VIEW_DETAILS: "Skatīt Detaļas",
    EDIT_INVENTORY: "Labot Uzskaites Sarakstu",
    DELETE_INVENTORY: "Dzēst Uzskaites Sarakstu"
}

export const INVENTORY_CREATE_UI = {
    TITLE: "Jauns uzskaites saraksts",
    ELECTRONIC_LABEL: "Elektronisks:",
    TYPE_LABEL: "Veids:",
    TYPE_PLACEHOLDER: "Izvēlēties...",
    SUBFOND_LABEL: "Apakšfonds:",
    SUBFOND_PLACEHOLDER: "Ievadiet apakšfonda numuru",
    DATE_LABEL: "Aprasktīšanas periods:",
    STORAGE_TERM: "Glabāšanas termiņš:",
    STORAGE_TERM_PLACEHOLDER: "Izvēlēties...",
    CANCEL: "Atcelt",
    CREATE: "Izveidot",
    CREATE_IN_PROGRESS: "Izveido...",
    YEAR_START_PLACEHOLDER: "No",
    YEAR_END_PLACEHOLDER: "Līdz",
}

export const INVENTORY_EDIT_UI = {
    TITLE: "Labot uzskaites sarakstu",
    TITLE_REPORT: "Labot inventāra datumus",
    REPORT_INFO_MESSAGE: "📋 Informācija par šo uzskaites sarakstu iegūta no VVAIS. Iespējams rediģēt tikai zemāk esošos laukus.",
    ITEMS_EXIST_INFO_MESSAGE: "⚠️ Uzskaites sarakstam jau ir pievienotas glabājamās vienības. Iespējams rediģēt tikai zemāk esošos laukus.",
    SUBFOND_PLACEHOLDER: "Ievadīt subfonda numuru",
    SAVE: "Saglabāt izmaiņas",
    SAVE_IN_PROGRESS: "Saglabā...",
    CANCEL: "Atcelt",
    ERROR_TYPE_REQUIRED: "Lūdzu izvēlieties inventāra veidu",
    ERROR_STORAGE_TERM_REQUIRED: "Lūdzu izvēlieties glabāšanas termiņu",
    ERROR_DATES_REQUIRED: "Lūdzu norādiet gan sākuma, gan beigu datumu",
    ERROR_UPDATE_FAILED: "Neizdevās atjaunināt inventāru. Lūdzu mēģiniet vēlreiz."
}

export const INVENTORY_DELETE_UI = {
    TITLE: "Dzēst Uzskaites Sarakstu",
    CONFIRM_MESSAGE: "Vai tiešām vēlaties dzēst šo uzskaites sarakstu?",
    WARNING: "Šī darbība ir neatgriezeniska!",
    CANCEL: "Atcelt",
    CONFIRM: "Dzēst"
}

export const INVENTORY_PERIOD_REQUIRED_UI = {
    // Popup title - uses inventory number placeholder {inventoryNumber}
    TITLE_PREFIX: "Nav norādīts aprakstīšanas periods",
    TITLE_SUFFIX: " uzskaites saraksta aprakstīšanas periodu",
    // Popup content message
    CONTENT_TEXT: "Lai pievienotu glabājamo vienību",
    CONTENT_STRONG: "nepieciešams norādīt aprakstīšanas periodu",
    CONTENT_QUESTION: "",
    // Action buttons
    CANCEL: "Atcelt",
    CONFIRM: "Turpināt"
}

export const INVENTORY_CONSTANTS = {
    TYPE: ['Foto', 'Skaņas', 'Tekstuāls', 'Video'],
    TERMS: ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'],
    MEDIA_TYPES: ['Foto', 'Skaņas', 'Video'],
    TEXTUAL_TYPES: ['Tekstuāls']
}
/* !--- Inventory Level Constants ---! */

/* --- Item Level Constants --- */
/*src/Item/*/
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
    WARNING: "Tiks dzēsti arī visi ar to saistītie ieraksti!",
    WARNING_IRREVERSIBLE: "Šī darbība ir <strong>neatgriezeniska</strong>.",
    CANCEL: "Atcelt",
    CONFIRM: "Dzēst",

    // Delete popup specific
    POPUP_TITLE_SINGLE: "Dzēst glabājamo vienību?",
    POPUP_TITLE_MULTI: "Dzēst glabājamās vienības?",
    POPUP_WARNING_TEXT: "Šī darbība ir <strong>neatgriezeniska</strong>. Dzēšot vienību(-as), tiks dzēsta visa saistītā informācija:",
    POPUP_ITEM_LABEL: "Glabājamā vienība",
    POPUP_ITEMS_LABEL: "Glabājamās vienības",
    POPUP_RECORD_LABEL: "ieraksts",
    POPUP_RECORDS_LABEL: "ieraksti",
    POPUP_RECORDS_LABEL_MULTI: "ierakstu",
    POPUP_NO_RECORDS: "Nav ierakstu",
    POPUP_TOTAL_ITEMS: "Kopā vienību:",
    POPUP_TOTAL_RECORDS: "Kopā ierakstu:",
    POPUP_CONSEQUENCES_TITLE: "Tiks dzēsts:",
    POPUP_CONSEQUENCE_ITEMS: "glabājamā(-ās) vienība(-as)",
    POPUP_CONSEQUENCE_RECORDS: "visi saistītie ieraksti un dokumenti",
    POPUP_CONSEQUENCE_FILES: "visi augšupielādētie faili"
}

export const ITEM_ERROR = {
    NUMBER_REQUIRED: "Numurs ir obligāts lauks",
    TITLE_REQUIRED: "Nosaukums ir obligāts lauks",
    INVALID_DATE_RANGE: "Beigu datums nedrīkst būt agrāks par sākuma datumu",
    CREATE_FAILED: "Neizdevās izveidot glabājamo vienību",
    UPDATE_FAILED: "Neizdevās atjaunināt glabājamo vienību",
    DELETE_FAILED: "Neizdevās dzēst glabājamo vienību"
}
/* !--- Item Level Constants ---! */

/* --- Record Level Constants --- */
/*src/Record/*/
export const RECORD_UI = {
    // Form Labels
    TITLE: "Nosaukums",
    DATE: "Datums",
    CREATED_DATE: "Izveidošanas Datums",
    SENT_DATE: "Nosūtīšanas Datums",
    LANGUAGE: "Valoda",
    ANNOTATION: "Anotācija",
    KEY_WORDS: "Atslēgvārdi",
    REG_NR: "Reģistrācijas Nr.",
    SENT_REG_NR: "Nosūtīšanas Reģ. Nr.",
    GROUP: "Grupa",
    NOMENCLATURE_NR: "Nomenklatūras Nr.",
    NOTES: "Piezīmes",
    ACCESS_RESTRICTION: "Pieejamības ierobežojums",
    ACCESS_RESTRICTION_NOTES: "Ierobežojumu piezīmes",
    ACCESS_RESTRICTION_DATE: "Ierobežojumu datums",
    USER_RESTRICTION_NOTES: "Lietotāja ierobežojumu piezīmes",
    TECH_INFO: "Tehniskā informācija",
    FORMAT: "Formāts",
    RESOLUTION: "Izšķirtspēja",
    
    // Media Specific Fields
    DURATION: "Ilgums",
    COLOR: "Krāsa",
    HORIZONTAL_RESOLUTION: "Horizontālā izšķirtspēja",
    VERTICAL_RESOLUTION: "Vertikālā izšķirtspēja",
    
    // Actions & Buttons
    CREATE_RECORD: "Izveidot Ierakstu",
    EDIT_RECORD: "Labot Ierakstu",
    DELETE_RECORD: "Dzēst Ierakstu",
    SAVE_RECORD: "Saglabāt Ierakstu",
    SAVE_CHANGES: "Saglabāt Izmaiņas",
    CANCEL: "Atcelt",
    UPLOAD_FILE: "Augšupielādēt Failu",
    DELETE_FILE: "Dzēst Failu",
    
    // Navigation & Views
    DETAILS: "Detaļas",
    METADATA: "Metadati",
    FILES: "Faili",
    RECORDS_LIST: "Ierakstu saraksts",
    SWITCH_TO_TABLE: "Pārslēgties uz tabulu",
    SWITCH_TO_CARDS: "Pārslēgties uz kartītēm",
    BACK_TO_ITEM: "Atpakaļ uz Glabājamo Vienību",
    
    // Metadata Sections
    ACTIONS: "Darbības",
    ADDRESSEES: "Adresāti",
    READ_STATUS: "Lasīšanas statuss",
    ADD_ACTION: "Pievienot Darbību",
    ADD_ADDRESSEE: "Pievienot Adresātu",
    ADD_READ_STATUS: "Pievienot Lasīšanas statusu",
    
    // File Operations
    DRAG_DROP_FILES: "Velciet un nometiet failus šeit",
    SELECT_FILES: "Izvēlēties failus",
    UPLOADING: "Augšupielādē...",
    UPLOAD_SUCCESS: "Faili veiksmīgi augšupielādēti",
    UPLOAD_ERROR: "Kļūda augšupielādējot failus",
    
    // Record Types
    TEXTUAL_RECORD: "Tekstuāls ieraksts",
    PHOTO_RECORD: "Foto ieraksts",
    VIDEO_RECORD: "Video ieraksts",
    AUDIO_RECORD: "Audio ieraksts",
    DATABASE_RECORD: "Datubāzes ieraksts",
    
    // Status & Validation
    VALIDATED: "Validēts",
    NOT_VALIDATED: "Nav validēts",
    REQUIRED_FIELD: "Obligāts lauks",
    OPTIONAL_FIELD: "Neobligāts lauks",
    
    // Batch Operations
    SELECT_ALL: "Iezīmēt visus",
    DESELECT_ALL: "Atcelt iezīmēšanu",
    BATCH_DELETE: "Dzēst izvēlētos",
    BATCH_EDIT: "Labot izvēlētos",
    SELECTED_COUNT: "Izvēlēti:"
}

export const RECORD_VALIDATION = {
    // Field length limits from backend constants
    MAX_TITLE_LENGTH: 500,
    MAX_LANGUAGE_LENGTH: 20,
    MAX_ANNOTATION_LENGTH: 500,
    MAX_KEY_WORDS_LENGTH: 200,
    MAX_REG_NR_LENGTH: 30,
    MAX_SENT_REG_NR_LENGTH: 30,
    MAX_GROUP_LENGTH: 30,
    MAX_TYPE_LENGTH: 30,
    MAX_NOMENCLATURE_NR_LENGTH: 30,
    MAX_NOTES_LENGTH: 500,
    MAX_ACCESS_RESTRICTION_NOTES_LENGTH: 30,
    MAX_USER_RESTRICTION_NOTES_LENGTH: 30,
    MAX_ACCESS_RESTRICTION_LENGTH: 10,
    MAX_TECH_INFO_LENGTH: 500,
    MAX_COLOR_LENGTH: 10,
    MAX_DURATION_LENGTH: 8,
    MAX_FORMAT_LENGTH: 10,
    MAX_RESOLUTION_LENGTH: 20,
    
    // Action/Addressee field lengths
    MAX_ACTION_TASK_LENGTH: 200,
    MAX_ADDRESSEE_LENGTH: 200,
    MAX_PERSON_LENGTH: 50,
    // Validation patterns
    DURATION_REGEX: "/^\d{1,2}:[0-5]\d:[0-5]\d$/",
    
    // Valid values
    VALID_ACCESS_RESTRICTIONS: ['open', 'restricted', 'closed'],
    VALID_COLORS: ['color', 'bw', 'mixed'],
    
    // File validation
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB in bytes
    
    // File types allowed per inventory type
    ALLOWED_FILE_TYPES: {
        'Foto': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'],
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'],
        'Skaņas': ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'],
        'Tekstuāls': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
                     'application/pdf', 'text/plain', 'application/msword',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    
    // Media types that require single file constraint
    SINGLE_FILE_TYPES: ['Foto', 'Video', 'Skaņas'],
    
    // Text types that allow multiple files
    MULTIPLE_FILE_TYPES: ['Tekstuāls']
}

export const RECORD_ERROR_MESSAGES = {
    // Required field errors
    TITLE_REQUIRED: "Nosaukums ir obligāts",
    REG_NR_REQUIRED: "Reģistrācijas numurs ir obligāts",
    DATE_REQUIRED: "Datums ir obligāts",
    
    // Length validation errors
    TITLE_TOO_LONG: "Nosaukums ir garāks par 500 simboliem",
    LANGUAGE_TOO_LONG: "Valoda ir garāka par 20 simboliem",
    ANNOTATION_TOO_LONG: "Anotācija ir garāka par 500 simboliem",
    KEY_WORDS_TOO_LONG: "Atslēgvārdi ir garāki par 200 simboliem",
    REG_NR_TOO_LONG: "Reģistrācijas numurs ir garāks par 30 simboliem",
    SENT_REG_NR_TOO_LONG: "Nosūtīšanas reģistrācijas numurs ir garāks par 30 simboliem",
    GROUP_TOO_LONG: "Grupa ir garāka par 30 simboliem",
    NOMENCLATURE_NR_TOO_LONG: "Nomenklatūras numurs ir garāks par 30 simboliem",
    NOTES_TOO_LONG: "Piezīmes ir garākas par 500 simboliem",
    ACCESS_RESTRICTION_NOTES_TOO_LONG: "Ierobežojumu piezīmes ir garākas par 30 simboliem",
    USER_RESTRICTION_NOTES_TOO_LONG: "Lietotāja ierobežojumu piezīmes ir garākas par 30 simboliem",
    TECH_INFO_TOO_LONG: "Tehniskā informācija ir garāka par 500 simboliem",
    COLOR_TOO_LONG: "Krāsa ir garāka par 10 simboliem",
    DURATION_TOO_LONG: "Ilgums ir garāks par 8 simboliem",
    FORMAT_TOO_LONG: "Formāts ir garāks par 10 simboliem",
    RESOLUTION_TOO_LONG: "Izšķirtspēja ir garāka par 20 simboliem",
    
    // Specific validation errors
    INVALID_DURATION: "Glabājamās vienības skanēšanas ilgums norādīts nepareizi (formāts: HH:MM:SS)",
    INVALID_ACCESS_RESTRICTION: "Nepareizi norādīta pieejamības vērtība",
    ACCESS_RESTRICTION_DATE_REQUIRED: "Nav norādīts ierobežojuma datums",
    ACCESS_RESTRICTION_DATE_NOT_NEEDED: "Datumu nenorāda, ja ierobežojuma vērtība ir \"open\"",
    NOT_TEXT_RECORD: "Dokumentam jābūt tekstuālam elektroniskā formā",
    UNKNOWN_CLASS: "Nezināma klase",
    
    // File errors
    NO_FILES_PROVIDED: "Nav pievienoti faili",
    FILE_TOO_LARGE: "Fails ir par lielu (maksimums 50MB)",
    INVALID_FILE_TYPE: "Nepareizs faila tips",
    SINGLE_FILE_ONLY: "Šim ieraksta tipam atļauts tikai viens fails",
    MULTIPLE_FILES_NOT_ALLOWED: "Vairāki faili nav atļauti šim tipam",
    RECORD_TYPE_REQUIRED: "Ieraksta tips ir obligāts",
    METADATA_CLASS_REQUIRED: "Metadatu klase ir obligāta",
    GENERIC_ERROR: "Radās kļūda",
    
    // Operation errors
    CREATION_FAILED: "Neizdevās izveidot ierakstu",
    UPDATE_FAILED: "Neizdevās atjaunināt ierakstu",
    DELETE_FAILED: "Neizdevās dzēst ierakstu",
    UPLOAD_FAILED: "Neizdevās augšupielādēt failu",
    
    // Media record errors
    ITEM_HAS_PHOTO_RECORD: "Glabājamai vienībai jau ir foto ieraksts",
    ITEM_HAS_VIDEO_RECORD: "Glabājamai vienībai jau ir video ieraksts",
    ITEM_HAS_AUDIO_RECORD: "Glabājamai vienībai jau ir audio ieraksts",
    INVALID_MEDIA_TYPE: "GV tips nav foto, video, skaņas",
    NOT_ELECTRONIC_FORMAT: "GV tips nav foto, video, skaņas un/vai elektroniskā formā"
}

export const RECORD_SUCCESS_MESSAGES = {
    RECORD_CREATED: "Ieraksts ir veiksmīgi izveidots!",
    RECORD_UPDATED: "Ieraksts ir veiksmīgi atjaunināts!",
    RECORD_DELETED: "Ieraksts ir veiksmīgi dzēsts!",
    FILES_UPLOADED: "Faili ir veiksmīgi augšupielādēti",
    FILE_DELETED: "Fails ir veiksmīgi dzēsts",
    METADATA_ADDED: "Metadati ir veiksmīgi pievienoti",
    METADATA_UPDATED: "Metadati ir veiksmīgi atjaunināti",
    METADATA_DELETED: "Metadati ir veiksmīgi dzēsti",
    BATCH_DELETE_SUCCESS: "Izvēlētie ieraksti ir veiksmīgi dzēsti",
    BATCH_UPDATE_SUCCESS: "Izvēlētie ieraksti ir veiksmīgi atjaunināti",
    UPDATE: "Ieraksts ir veiksmīgi atjaunināts!"
}

export const RECORD_DELETE_UI = {
    TITLE: "Dzēst Ierakstu",
    TITLE_PLURAL: "Dzēst Ierakstus",
    CONFIRM_MESSAGE: "Vai tiešām vēlaties dzēst šo ierakstu?",
    WARNING: "Tiks dzēsti arī visi ar to saistītie faili!",
    WARNING_IRREVERSIBLE: "Šī darbība ir <strong>neatgriezeniska</strong>.",
    CANCEL: "Atcelt",
    CONFIRM: "Dzēst",

    // Delete popup specific
    POPUP_TITLE_SINGLE: "Dzēst ierakstu?",
    POPUP_TITLE_MULTI: "Dzēst ierakstus?",
    POPUP_WARNING_TEXT: "Šī darbība ir <strong>neatgriezeniska</strong>. Dzēšot ierakstu(-us), tiks dzēsta visa saistītā informācija:",
    POPUP_RECORD_LABEL: "Ieraksts",
    POPUP_RECORDS_LABEL: "Ieraksti",
    POPUP_FILE_LABEL: "fails",
    POPUP_FILES_LABEL: "faili",
    POPUP_FILES_LABEL_MULTI: "failu",
    POPUP_NO_FILES: "Nav failu",
    POPUP_TOTAL_RECORDS: "Kopā ierakstu:",
    POPUP_TOTAL_FILES: "Kopā failu:",
    POPUP_CONSEQUENCES_TITLE: "Tiks dzēsts:",
    POPUP_CONSEQUENCE_RECORDS: "ieraksts(-i)",
    POPUP_CONSEQUENCE_FILES: "visi pievienotie faili",
    POPUP_CONSEQUENCE_METADATA: "visi saistītie metadati"
}
/* !--- Record Level Constants ---! */

/* --- Media Record Creation Constants --- */
/*src/Record/CreateMediaRecord.js, EditMediaRecordMetadata.js*/
export const MEDIA_RECORD_UI = {
    // Dynamic dialog titles based on media type
    TITLES: {
        Foto: "Jauns fotodokuments",
        Video: "Jauns videodokuments",
        Skaņas: "Jauns skaņas dokuments"
    },

    // Edit dialog titles
    EDIT_TITLES: {
        Foto: "Labot fotodokumenta metadatus",
        Video: "Labot videodokumenta metadatus",
        Skaņas: "Labot skaņas dokumenta metadatus"
    },

    // Step labels (using "datne" instead of "fails")
    STEP_FILE_UPLOAD: "Datnes augšupielāde",
    STEP_METADATA: "Metadati",

    // File upload section
    FILE_UPLOAD_TITLE: "Datnes augšupielāde",
    FILE_UPLOAD_DESCRIPTION_PHOTO: "Izvēlieties foto datni augšupielādei",
    FILE_UPLOAD_DESCRIPTION_VIDEO: "Izvēlieties video datni augšupielādei",
    FILE_UPLOAD_DESCRIPTION_AUDIO: "Izvēlieties skaņas datni augšupielādei",
    FILE_DROP_TEXT: "Ievelciet datni šeit",
    FILE_DROP_OR: "vai",
    FILE_SELECT_BTN: "Izvēlēties datni",

    // File status messages (using "datne")
    FILE_SELECTED_SINGLE: "datne izvēlēta",
    FILES_SELECTED_PLURAL: "datnes izvēlētas",
    FILE_UPLOADING: "Augšupielādē datni...",
    FILE_UPLOAD_SUCCESS: "Datne veiksmīgi augšupielādēta!",
    FILE_UPLOAD_SUCCESS_AUTO_META: "Datne veiksmīgi augšupielādēta! Metadati automātiski nolasīti no datnes.",
    FILE_UPLOAD_ERROR: "Kļūda augšupielādējot datni",
    FILE_REQUIRED_ERROR: "Lūdzu, izvēlieties datni",

    // Metadata section
    METADATA_TITLE: "Metadatu informācija",
    METADATA_DESCRIPTION: "Pievienojiet papildu informāciju par augšupielādēto datni",
    METADATA_AUTO_INFO: "Daži metadati tika automātiski nolasīti no datnes.",
    METADATA_AUTO_WARNING: "Jūs varat tos rediģēt, bet tas nav ieteicams, jo tie tika iegūti tieši no datnes metadatiem.",
    METADATA_PARTIAL_AUTO: "Datne augšupielādēta. Daži metadati nolasīti automātiski. Lūdzu, papildiniet:",
    METADATA_FAILED_AUTO: "Datne augšupielādēta, bet metadatus neizdevās nolasīt automātiski. Lūdzu, ievadiet tos manuāli.",
    METADATA_SAVE_SUCCESS: "Metadati veiksmīgi saglabāti!",
    METADATA_SAVE_ERROR: "Kļūda saglabājot metadatus",
    METADATA_SAVING: "Saglabā metadatus...",

    // Field labels
    FIELD_COLOR: "Krāsa",
    FIELD_COLOR_GRAYSCALE: "Melnbalta",
    FIELD_COLOR_COLOR: "Krāsaina",
    FIELD_COLOR_PLACEHOLDER: "Izvēlieties...",
    FIELD_HORIZONTAL_RESOLUTION: "Horizontālā izšķirtspēja",
    FIELD_VERTICAL_RESOLUTION: "Vertikālā izšķirtspēja",
    FIELD_DURATION: "Ilgums",
    FIELD_DURATION_PLACEHOLDER: "piem., 00:05:30",
    FIELD_DURATION_HINT: "Formāts: HH:MM:SS",
    FIELD_DURATION_HINT_EXTENDED: "Formāts: HH:MM:SS (stundas var būt lielākas par 24)",
    FIELD_RESOLUTION_PLACEHOLDER_H: "piem., 1920",
    FIELD_RESOLUTION_PLACEHOLDER_V: "piem., 1080",
    FIELD_AUTO_BADGE: "✓ Auto",
    FIELD_REMAINING_CHARS: "atlikušie",

    // Buttons
    BTN_CANCEL: "Atcelt",
    BTN_UPLOAD: "Augšupielādēt datni",
    BTN_UPLOADING: "Augšupielādē...",
    BTN_SAVE_METADATA: "Saglabāt metadatus",
    BTN_SAVE: "Saglabāt",
    BTN_SAVING: "Saglabā...",

    // Error messages for file type validation (400 errors)
    ERROR_NOT_VIDEO: "Datnes tips nav atpazīts kā video. Lūdzu, ievadiet metadatus manuāli.",
    ERROR_NOT_AUDIO: "Datnes tips nav atpazīts kā audio. Lūdzu, ievadiet metadatus manuāli.",
    ERROR_NOT_PHOTO: "Datnes tips nav atpazīts kā foto. Lūdzu, ievadiet metadatus manuāli.",
    ERROR_FILE_TYPE_UNKNOWN: "Datnes tips nav atpazīts. Lūdzu, ievadiet metadatus manuāli.",

    // Validation errors
    ERROR_FORM_INVALID: "Lūdzu, labojiet kļūdas formā",
    ERROR_RECORD_ID_MISSING: "Kļūda: ieraksta ID nav atrasts",

    // Edit metadata dialog
    EDIT_AUTO_WARNING_TITLE: "Brīdinājums par automātiski nolasītajiem metadatiem",
    EDIT_AUTO_WARNING_TEXT: "Daži šī ieraksta metadati tika automātiski nolasīti no datnes.",
    EDIT_AUTO_WARNING_STRONG: "nav ieteicams",
    EDIT_AUTO_WARNING_REASON: ", jo tie tika iegūti tieši no datnes metadatiem un precīzi atspoguļo datnes tehniskās īpašības.",
    EDIT_AUTO_HINT: "Automātiski nolasītie lauki ir atzīmēti ar \"✓\" marķējumu."
}
/* !--- Media Record Creation Constants ---! */

/* --- Error Messages --- */
export const ERROR_MESSAGES = {
    BACKEND_SERVER_ERROR: "Neizdevās izveidot savienojumu ar serveri!",
    
    PROJECT_CREATION_FAILED: "Neizdevās izveidot projektu: Lūdzu, sniedziet derīgus datus.",
    PROJECT_NOT_FOUND: "Kļūda: Pieprasītais projekts netika atrasts.",
    PROJECT_UPDATE_FAILED: "Neizdevās atjaunināt projektu: Lūdzu, pārbaudiet ievadītos datus.",
    PROJECT_DELETION_FAILED: "Neizdevās dzēst projektu: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    INSTITUTION_CREATION_FAILED: "Neizdevās izveidot iestādi: Lūdzu, sniedziet derīgus datus.",
    INSTITUTION_NOT_FOUND: "Kļūda: Pieprasītā iestāde netika atrasta.",
    INSTITUTION_UPDATE_FAILED: "Neizdevās atjaunināt iestādi: Lūdzu, pārbaudiet ievadītos datus.",
    INSTITUTION_DELETION_FAILED: "Neizdevās dzēst iestādi: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    INVENTORY_CREATION_FAILED: "Neizdevās izveidot uzskaites sarakstu: Lūdzu, sniedziet derīgus datus.",
    INVENTORY_NOT_FOUND: "Kļūda: Pieprasītais uzskaites saraksts netika atrasts.",
    INVENTORY_UPDATE_FAILED: "Neizdevās atjaunināt uzskaites sarakstu: Lūdzu, pārbaudiet ievadītos datus.",
    INVENTORY_DELETION_FAILED: "Neizdevās dzēst uzskaites sarakstu: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    ITEM_CREATION_FAILED: "Neizdevās izveidot glabājamo vienību: Lūdzu, sniedziet derīgus datus.",
    ITEM_NOT_FOUND: "Kļūda: Pieprasītā glabājamā vienība netika atrasta.",
    ITEM_UPDATE_FAILED: "Neizdevās atjaunināt glabājamo vienību: Lūdzu, pārbaudiet ievadītos datus.",
    ITEM_DELETION_FAILED: "Neizdevās dzēst glabājamo vienību: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    RECORD_CREATION_FAILED: "Neizdevās izveidot ierakstu: Lūdzu, sniedziet derīgus datus.",
    RECORD_NOT_FOUND: "Kļūda: Pieprasītais ieraksts netika atrasts.",
    RECORD_UPDATE_FAILED: "Neizdevās atjaunināt ierakstu: Lūdzu, pārbaudiet ievadītos datus.",
    RECORD_DELETION_FAILED: "Neizdevās dzēst ierakstu: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    GENERIC_ERROR: "Radās negaidīta kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.",
    NETWORK_ERROR: "Tīkla kļūda. Pārbaudiet interneta savienojumu.",
    TIMEOUT_ERROR: "Pieprasījums pārsniedza laika limitu. Lūdzu, mēģiniet vēlreiz.",
    PERMISSION_DENIED: "Jums nav atļaujas veikt šo darbību.",
    VALIDATION_ERROR: "Datu validācijas kļūda. Pārbaudiet ievadītos datus."
}
/* !--- Error Messages ---! */

/* --- Alert/Success Messages --- */
export const ALERT_MESSAGES = {
    PROJECT_CREATED: "Projekts ir veiksmīgi izveidots!",
    PROJECT_UPDATED: "Projekts ir veiksmīgi atjaunināts!",
    PROJECT_DELETED: "Projekts ir veiksmīgi dzēsts!",
    
    INSTITUTION_CREATED: "Iestāde ir veiksmīgi izveidota!",
    INSTITUTION_UPDATED: "Iestāde ir veiksmīgi atjaunināta!",
    INSTITUTION_DELETED: "Iestāde ir veiksmīgi dzēsta!",
    
    INVENTORY_CREATED: "Uzskaites saraksts ir veiksmīgi izveidots!",
    INVENTORY_UPDATED: "Uzskaites saraksts ir veiksmīgi atjaunināts!",
    INVENTORY_DELETED: "Uzskaites saraksts ir veiksmīgi dzēsts!",
    
    ITEM_CREATED: "Glabājamā vienība ir veiksmīgi izveidota!",
    ITEM_UPDATED: "Glabājamā vienība ir veiksmīgi atjaunināta!",
    ITEM_DELETED: "Glabājamā vienība ir veiksmīgi dzēsta!",
    
    OPERATION_SUCCESS: "Darbība veiksmīgi pabeigta!",
    CHANGES_SAVED: "Izmaiņas ir saglabātas!",
    DATA_EXPORTED: "Dati ir veiksmīgi eksportēti!",
    REPORT_GENERATED: "Atskaite ir veiksmīgi ģenerēta!"
}
/* !--- Alert/Success Messages ---! */

/* --- Project Additional Constants --- */
/*src/Project/*/
export const PROJECT_ADDITIONAL_UI = {
    DELETED_SUCCESS: "Projekts veiksmīgi dzēsts",
    RENAMED_SUCCESS: "Projekts veiksmīgi pārdēvēts",
    COPIED_TO_CLIPBOARD: "Nokopēts starpliktuvē",
    REPORT_UPLOADED_SUCCESS: "Atskaite veiksmīgi augšupielādēta",
    PROJEKTS_VALIDĒTS_BADGE: "Projekts validēts",
    VVAIS_IMPORTĒTA_BADGE: "VVAIS atskaite importēta",
    PIEVIENOT_PARAKSTĪTĀJUS_TITLE: "Pievienot parakstītājus",
    PARAKSTĪTĀJI_BTN: "Personas",
    VIEW_VERIFICATION_TITLE: "Skatīt projekta verifikācijas struktūru",
    STATUS_BTN: "Statuss",
    ATSKAITE_NAV_PIEVIENOTA_HEADER: "Informācija par fondu nav pievienota",
    DZĒŠ_PROJEKTU_HEADER: "Dzēš Projektu...",
    DZĒŠ_PĒC_SECONDS: "Dzēš pēc {countdown} sekundēm...",
    GATAVO_DZĒŠANU: "Gatavo dzēšanu...",
    JAUNS_PROJEKTS_TITLE: "Jauns projekts",
    PROJEKTA_NOSAUKUMS_PLACEHOLDER: "Projekta nosaukums",
    SIMBOLI_ATLIKA: "simboli atlikuši",
    PROJEKTA_CEĻŠ_PLACEHOLDER: "C:\\ceļš\\uz\\projektu",
    IZVEIDO_LOADING: "Izveido...",
    RENAME_PLACEHOLDER: "Ievadiet jaunu nosaukumu",
    FILE_INFO_FORMAT: "XLSX • {size}",
    UPLOAD_PROCESSING: "Apstrādā...",
    FORMAT_INFO: "Tikai {format} ({maxSize})",
    DELETE_ITEMS_LIST: {
        METADATI: "Visi projekta metadati",
        FONDI: "Visi fondi un iestādes",
        UZSKAITES: "Visi uzskaites saraksti",
        VIENĪBAS: "Visas glabājamās vienības",
        IERAKSTI: "Visi ieraksti un dokumenti",
        FAILI: "Visi augšupielādētie faili"
    }
}
/* !--- Project Additional Constants ---! */

/* --- Item Constants --- */
/*src/Item/*/
export const ITEM_ADDITIONAL_UI = {
    DELETE_CONFIRM: "Vai esat pārliecināts, ka vēlaties dzēst šo vienību?",
    DELETE_BATCH_CONFIRM: "Vai esat pārliecināts, ka vēlaties dzēst {count} vienības?",
    ERROR_ITEM_NOT_FOUND: "Kļūda: vienība nav atrasta",
    ERROR_ID_NOT_FOUND: "Kļūda: vienības ID nav atrasts",
    ERROR_CREATING_RECORD: "Kļūda veidojot ierakstu: {message}",
    ERROR_INVALID_RECORD: "Kļūda: Ieraksts netika izveidots pareizi",
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
    TOOLTIP_VIEW_FILE: "Skatīt failu",
    TOOLTIP_NO_FILE: "Nav faila",
    TOOLTIP_VIEW_DOCUMENTS: "Skatīt dokumentus",
    TOOLTIP_CREATE_RECORD: "Izveidot ierakstu",
    TOOLTIP_EDIT_ITEM: "Labot vienību",
    TOOLTIP_DELETE_ITEM: "Dzēst vienību",

    // States
    NO_TITLE: "Bez nosaukuma",
    NO_ITEMS_FOUND: "Uzskaites sarakstā nav izveidota neviena glabājamā vienība",
    ITEM_NOT_FOUND: "Vienība nav atrasta",
    ITEM_NOT_FOUND_ERROR: "Item not found",

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
/* !--- Item Constants ---! */

/* --- Institution Additional Constants --- */
/*src/Institution/*/
export const INSTITUTION_ADDITIONAL_UI = {
    SUCCESS_SAVED: "Parakstītāju informācija saglabāta veiksmīgi!",
    MODAL_TITLE: "Iestādes atbildīgās personas",
    CLOSE_BTN_ARIA: "Aizvērt",
    SECTION_IZVEIDOTĀJS: "Aprakstīšanu veica",
    SECTION_PARAKSTĪTĀJS: "Parakstītājs",
    FIELD_VĀRDS_UZVĀRDS: "Vārds, Uzvārds",
    FIELD_AMATS: "Amats",
    PLACEHOLDER_IZVEIDOTĀJA_VĀRDS: "",
    PLACEHOLDER_IZVEIDOTĀJA_AMATS: "",
    PLACEHOLDER_PARAKSTĪTĀJA_VĀRDS: "",
    PLACEHOLDER_PARAKSTĪTĀJA_AMATS: "",
    SIMBOLI_ATLIKA: "simboli atlikuši",
    CANCEL_BTN: "Atcelt",
    SAVING_BTN: "Saglabā...",
    SAVE_BTN: "Saglabāt"
}
/* !--- Institution Additional Constants ---! */

/* --- Record Creation Form Constants --- */
/*src/Record/*/
export const RECORD_CREATE_FORM_UI = {
    DOCUMENT_TITLE: "Dokumenta pievienošana",
    CREATING_BTN: "Pievieno",
    CREATE_BTN: "Pievienot",
    CANCEL_BTN: "Atcelt",

    SECTION_BASIC: "Pamata informācija",
    SECTION_DOCUMENT: "Dokumenta detaļas",
    SECTION_DESCRIPTION: "Apraksts",
    SECTION_ACCESS: "Pieejamība",

    // Field labels
    FIELD_NOSAUKUMS: "Nosaukums",
    FIELD_DATUMS: "Datums",
    FIELD_REĢISTRĀCIJAS_NR: "Reģistrācijas Nr.",
    FIELD_GRUPA: "Grupa",
    FIELD_IZVEIDOŠANAS_DATUMS: "Izveidošanas datums",
    FIELD_NOSŪTĪŠANAS_DATUMS: "Nosūtīšanas datums",
    FIELD_VALODA: "Valoda",
    FIELD_ATSLĒGVĀRDI: "Atslēgvārdi",
    FIELD_ANOTĀCIJA: "Anotācija",
    FIELD_PIEZĪMES: "Piezīmes",
    FIELD_PIEEJAMĪBA: "Pieejamība",
    FIELD_PIEKĻUVES_IEROBEŽOJUMS: "Pieejamība", // Legacy alias
    FIELD_IEROBEŽOJUMA_PIEZĪMES: "Ierobežojuma piezīmes",
    FIELD_IEROBEŽOJUMA_DATUMS: "Ierobežojuma datums",
    FIELD_LIETOTĀJA_IEROBEŽOJUMU_PIEZĪMES: "Lietošanas nosacījumi",
    FIELD_TEHNISKĀ_INFORMĀCIJA: "Tehniskā informācija",

    // Placeholders
    PLACEHOLDER_NOSAUKUMS: "Ievadiet nosaukumu",
    PLACEHOLDER_DOKUMENTA_NOSAUKUMS: "Ievadiet nosaukumu",
    PLACEHOLDER_REG_NR: "Ievadiet reģistrācijas numuru",
    PLACEHOLDER_REG_NR_EXAMPLE: "123/2025",
    PLACEHOLDER_GRUPA: "Iekšējs, ārējs, saņemts",
    PLACEHOLDER_IZVEIDOŠANAS_DATUMS: "Izvēlieties izveidošanas datumu",
    PLACEHOLDER_NOSŪTĪŠANAS_DATUMS: "Izvēlieties nosūtīšanas datumu",
    PLACEHOLDER_VALODA: "Meklēt vai pievienot valodu",
    PLACEHOLDER_ATSLĒGVĀRDI: "Atslēgvārdi (atdalīti ar komatiem)",
    PLACEHOLDER_ATSLĒGVĀRDI_SHORT: "Atdalīti ar komatiem",
    PLACEHOLDER_NOSŪTĪŠANAS_REG_NR: "Ievadiet nosūtīšanas reģ. nr.",
    PLACEHOLDER_NOMENKLATŪRAS_NR: "Ievadiet nomenklatūras nr.",
    PLACEHOLDER_ANOTĀCIJA: "Ievadiet anotāciju",
    PLACEHOLDER_DOKUMENTA_ANOTĀCIJA: "Ievadiet dokumenta anotāciju",
    PLACEHOLDER_PIEZĪMES: "Ievadiet piezīmes",
    PLACEHOLDER_PAPILDUS_PIEZĪMES: "Ievadiet papildus piezīmes",
    PLACEHOLDER_TEHNISKĀ_INFO: "Ievadiet tehnisko informāciju",
    PLACEHOLDER_TEHNISKĀS_DETAĻAS: "Tehniskās detaļas",
    PLACEHOLDER_IEROBEŽOJUMA_IEMESLI: "Aprakstiet ierobežojuma iemeslus",

    // Other
    CHAR_COUNTER_REMAINING: "atlikušie",
    UNIT_LABEL_FORMAT: "{title} | {date}",

    OPTIONS_PIEEJAMĪBA: {
        VISPĀRĒJA: "Vispārēja",
        IEROBEŽOTA: "Ierobežota"
    },
    FIELD_IEROBEŽOJUMU_PIEZĪMES: "Ierobežojumu piezīmes",
    PLACEHOLDER_IEROBEŽOJUMU_PIEZĪMES: "Ievadiet ierobežojumu piezīmes",
    FIELD_IEROBEŽOJUMU_DATUMS: "Ierobežojumu datums",
    PLACEHOLDER_IEROBEŽOJUMU_DATUMS: "Izvēlieties ierobežojumu datumu",
    FIELD_LIETOTĀJA_IEROBEŽOJUMI: "Lietošanas nosacījumi",
    PLACEHOLDER_LIETOTĀJA_IEROBEŽOJUMI: "Ievadiet lietošanas nosacījumus"
}
/* !--- Record Creation Form Constants ---! */

/* --- Verification Constants --- */
/*src/Verification/*/
export const VERIFICATION_UI = {
    MODAL_TITLE: "Projekta Statuss",
    REFRESH_VALIDATION_TITLE: "Atjaunināt",
    REFRESH_BTN: "Atjaunināt",
    EXPORT_INVENTORY_LIST: "Eksportēt Uzskaites Sarakstu",
    EXPORT_ACCEPTANCE_REPORT: "Eksportēt Pieņemšanas Aktu",
    CLOSE_BTN: "Aizvērt",
    TOGGLE_PHYSICAL: "Fiziskais",
    TOGGLE_ELECTRONIC: "Elektroniskais",
    TOGGLE_PHYSICAL_SHOW: "Rādīt fiziskos dokumentus",
    TOGGLE_PHYSICAL_HIDE: "Rādīt elektroniskos dokumentus",
    TOGGLE_PHYSICAL_LABEL: "Fiziskie",
    TOGGLE_ELECTRONIC_LABEL: "Elektroniskie",
    FILTER_LABEL: "Filtrēt:",
    FILTER_ALL: "Visi",
    FILTER_ALL_TITLE: "Rādīt visu",
    FILTER_ERRORS: "Kļūdas",
    FILTER_ERRORS_LABEL: "Tikai Kļūdas",
    FILTER_ERRORS_TITLE: "Rādīt tikai kļūdas",
    READY_FOR_OPEX: "Gatavs OPEX eksportam",
    READY_OPEX_SHORT: "Gatavs",
    NOT_READY_FOR_OPEX: "Nav gatavs OPEX eksportam",
    NOT_READY_OPEX_SHORT: "Nav gatavs",
    TOTAL_INVENTORIES: "Kopā uzskaites sarakstu:",
    VALID_INVENTORIES: "Derīgi uzskaites saraksti:",
    INVENTORIES_WITH_ERRORS: "Ar kļūdām:",
    TOTAL_ITEMS: "Kopā glabājamo vienību:",
    TOTAL_RECORDS: "Kopā ierakstu:",
    TOTAL_FILES: "Kopā failu:",
    TOTAL_ERRORS: "Kļūdas:",
    TOTAL_WARNINGS: "Brīdinājumi:",
    STATS_US_IMPORTED: "Importētie US",
    STATS_US_CREATED: "Izveidotie US",
    STATS_VIENĪBAS: "Glabājamās vienības",
    STATS_DOKUMENTI: "Dokumenti",
    STATS_FAILI: "Faili",
    STATS_KĻŪDAS: "Kļūdas",
    STATS_BRĪDINĀJUMI: "Brīdinājumi",
    VALIDATION_FAILED: "Validācija neizdevās",
    VALIDATION_IN_PROGRESS: "Notiek validācija...",
    VALIDATING_MESSAGE: "Validē projekta struktūru...",
    VALIDATION_PROGRESS: "Validācija progress...",
    ERROR_CANNOT_VALIDATE: "Nevar validēt projektu",
    FOOTER_INFO_TEXT: "Šī verifikācija pārbauda, vai projekta struktūra ir gatava OPEX pakotnes ģenerēšanai.",
    EXPORT_US_TOOLTIP_READY: "Eksportēt uzskaites sarakstu",
    EXPORT_US_TOOLTIP_NOT_READY: "Novērsiet visas kļūdas pirms eksportēšanas",
    EXPORTING_BTN: "Eksportē...",
    EXPORT_US_BTN: "Eksportēt US sarakstu",
    EXPORT_PN_TOOLTIP_READY: "Eksportēt pieņemšanas-nodošanas aktu",
    EXPORT_PN_BTN: "Eksportēt PN aktu",
    MISSING_SIGNERS_MESSAGE: "Institūcijas parakstītāji nav pievienoti. Lūdzu, pievienojiet atbildīgo personu informāciju.",
    MISSING_SIGNERS_BTN: "Pievienot personas"
}
/* !--- Verification Constants ---! */

/* --- Guide Tab Constants --- */
/*src/Verification/VerificationModal.jsx - "Projekta ceļvedis" tab*/
export const GUIDE_TAB_UI = {
    SECTION_OVERVIEW: "Projekta kopsavilkums",
    SECTION_INVENTORY_BREAKDOWN: "Uzskaites sarakstu pārskats",
    SECTION_TYPE_DISTRIBUTION: "Satura sadalījums pa tipiem",
    COL_NUMBER: "Nr.",
    COL_TYPE: "Tips",
    COL_FORMAT: "Formāts",
    COL_STORAGE_TERM: "Glabāšanas termiņš",
    COL_ITEMS: "GV",
    COL_RECORDS: "Dokumenti",
    COL_FILES: "Faili",
    COL_SIZE: "Izmērs",
    COL_STATUS: "Statuss",
    FORMAT_ELECTRONIC: "Elektronisks",
    FORMAT_PHYSICAL: "Fizisks",
    NAVIGATE_TOOLTIP: "Pāriet uz uzskaites sarakstu",
    EMPTY_PHYSICAL: "Nav fizisko uzskaites sarakstu. Pārslēdziet uz elektronisko skatu.",
    EMPTY_ELECTRONIC: "Nav elektronisko uzskaites sarakstu. Pārslēdziet uz fizisko skatu.",
    STAT_INVENTORIES: "Uzskaites saraksti",
    STAT_ITEMS: "Glabājamās vienības",
    STAT_RECORDS: "Dokumenti",
    STAT_FILES: "Faili",
    STAT_SIZE: "Kopējais izmērs",
    STAT_ISSUES: "Kļūdas / Brīdinājumi"
}
/* !--- Guide Tab Constants ---! */

/* --- Navigation Additional Constants --- */
/*src/Navigation/*/
export const NAVIGATION_ADDITIONAL_UI = {
    BREADCRUMB_PROJEKTS: "Projekts",
    BREADCRUMB_FONDS: "",
    BREADCRUMB_UZSKAITES_SARAKSTS: "Uzskaites Saraksts",
    BREADCRUMB_GLABĀJAMĀ_VIENĪBA: "Glabājamā Vienība",
    BREADCRUMB_DOKUMENTS: "Dokuments",
    BREADCRUMB_TITLE_FORMAT: "{type}: {value}",
    BREADCRUMB_ARIA_LABEL: "Breadcrumb navigation"
}
/* !--- Navigation Additional Constants ---! */

/* --- Help Constants --- */
/*src/Help/*/
export const HELP_UI = {
    HELP_BUTTON_TITLE: "Palīdzība",
    CLOSE_HELP: "Aizvērt palīdzību"
}
/* !--- Help Constants ---! */

/* --- Common Action Constants --- */
export const COMMON_ACTION_UI = {
    IZVEIDO: "Izveido...",
    SAGLABA: "Saglabā...",
    APSTRADA: "Apstrādā...",
    ATCELT: "Atcelt",
    NOEMT: "Noņemt",
    AIZVĒRT: "Aizvērt",
    APTURĒT: "Apturēt",
    SUCCESS_HEADER: "Success"
}
/* !--- Common Action Constants ---! */

/* --- Utility Constants --- */
export const COMMON_UI = {
    YES: "Jā",
    NO: "Nē",
    OK: "Labi",
    CANCEL: "Atcelt",
    SAVE: "Saglabāt",
    DELETE: "Dzēst",
    EDIT: "Labot",
    CREATE: "Izveidot",
    BACK: "Atpakaļ",
    NEXT: "Tālāk",
    CLOSE: "Aizvērt",
    CONFIRM: "Apstiprināt",
    LOADING: "Ielādē...",
    SAVING: "Saglabā...",
    DELETING: "Dzēš...",
    SEARCH: "Meklēt",
    FILTER: "Filtrēt",
    SORT: "Kārtot",
    EXPORT: "Eksportēt",
    IMPORT: "Importēt",
    PRINT: "Drukāt",
    DOWNLOAD: "Lejupielādēt",
    UPLOAD: "Augšupielādēt",
    SELECT_ALL: "Iezīmēt visus",
    DESELECT_ALL: "Atcelt iezīmēšanu",
    REFRESH: "Atjaunot",
    RESET: "Atiestatīt",
    EMPTY_STRING: " "
}
/* !--- Utility Constants ---! */

/* --- Alert Messages --- */

/* !--- Alert Messages ---! */

/* --- Query Keys for React Query --- */
export const QUERY_KEYS = {
    // Projects
    projects: ['projects'],
    project: (projectId) => ['project', 'detail', projectId],
    
    // Institutions
    institutions: ['institutions'],
    institution: (institutionId) => ['institution', institutionId],
    
    // Inventories
    inventories: (projectId) => ['inventories', projectId],
    inventory: (projectId, inventoryId) => ['inventory', projectId, inventoryId],
    
    // Items
    items: (projectId, inventoryId) => ['items', projectId, inventoryId],
    item: (projectId, itemId) => ['item', projectId, itemId],
    
    // Records
    records: (projectId, itemId) => ['records', projectId, itemId],
    record: (projectId, recordId) => ['record', projectId, recordId],
    
    // Media Records  
    mediaRecords: (projectId, itemId) => ['mediaRecords', projectId, itemId],
    mediaRecord: (projectId, recordId) => ['mediaRecord', projectId, recordId],
    
    // Metadata
    metadata: (projectId, recordId) => ['metadata', projectId, recordId],
    metadataMethods: (projectId, recordId) => ['metadataMethods', projectId, recordId],
    
    // Files
    files: (projectId, recordId) => ['files', projectId, recordId]
};

/* --- Misc --- */
export const CALENDAR_UI = {
    START_DATE_LABEL: "Sākuma Datums:",
    START_DATE_PLACE_HOLDER:"Izvēlēties Sākuma Datumu",
    START_DATE_MONTH_PLACE_HOLDER:"Izvēlēties Sākuma Mēnesi",
    START_DATE_YEAR_PLACE_HOLDER:"Izvēlēties Sākuma Gadu",
    END_DATE_LABEL: "Beigu Datums:",
    END_DATE_PLACE_HOLDER:"Izvēlēties Beigu Datumu",
    END_DATE_MONTH_PLACE_HOLDER:"Izvēlēties Beigu Mēnesi",
    END_DATE_YEAR_PLACE_HOLDER:"Izvēlēties Beigu Gadu",
    // Compact placeholders (without labels)
    START_DATE_COMPACT: "no",
    END_DATE_COMPACT: "līdz",
}

export const VIEW_OPTIONS = {
    viewOptions : [
        { value: 'day', label: 'Diena' },
        { value: 'month', label: 'Mēnesis' },
        { value: 'year', label: 'Gads' }
    ]
}

export const CALENDAR_ERROR = {
    START_DATE_LARGER_THEN_END_DATE:"Sākuma datumam jābūt pirms/vienādam ar beigu datumu",
    END_DATE_SMALLER_THEN_START_DATE:"Beigu Datumam jābūt pēc/vienādam ar sākuma datumu"
}

export const TOAST_CONFIG = {
    TIMER : 2000
}
/* !--- Misc ---! */

/* --- API --- */
export const API_ENDPOINT ={
    API_BASE_URL : "/api/v1/project/",
    API_BASE_URL_RECORD: "http://127.0.0.1:8000/api/records/project/"
}
/* !--- API ---! */

/* --- Component Configuration --- */
export const UI_CONFIG = {
    // Pagination
    DEFAULT_PAGE_SIZE: 25,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    
    // File uploads
    MAX_FILES_PER_UPLOAD: 10,
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks
    
    // Debounce delays
    SEARCH_DEBOUNCE: 300,
    AUTOSAVE_DEBOUNCE: 1000,
    
    // Animation durations
    FADE_DURATION: 200,
    SLIDE_DURATION: 300,
    
    // Breakpoints
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    DESKTOP_BREAKPOINT: 1200
};
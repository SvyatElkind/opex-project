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
    PROJECT_ADD_REPORT_BTN: "Pievienot Atskaiti",
    PROJECT_DETAILS_HIDE: "Paslēpt Projekta Detaļas",
    PROJECT_DETAILS_SHOW: "Parādīt Projekta Detaļas",
    PROJECT_TOOLTIP_CREATED_AT: "Izveidots:",
    PROJECT_TOOLTIP_DIR: "Vieta Diskā:",
    PROJECT_EMPTY_HEADER: "OPEX struktūras un metadatu sagataves rīks",
    PROJECT_STATEMENT_WHEN_MISSING_REPORT: "Lūdzu, pievienojiet atskaiti, lai turpinātu darbu."
}

export const PROJECT_CREATE_UI = {
    PROJECT_NAME_LABEL: "Jaunā projekta nosaukums",
    PROJECT_DIR_LABEL: "Norādiet projekta direktoriju",
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
    DELETE_TITLE: "Projekta Dzēšana!",
    DELETE_PARAGRAPH_PT1: "Vai Esat pārliecināts, ka vēlaties dzēst projektu?",
    DELETE_PARAGRAPH_PT2: "Apstiprinot projekta dzēšanu tiks dzēstas visas darbības šajā projektā. Tā skaitā: informācija par izveidotajiem uzskaites sarakstiem, informācija par glabājamām vienībām un informācija par datnēm.",
    DELETE_PARAGRAPH_PT3: "Dzēstie projekti un informācija, kas piesaistīta tiem:",
    DELETE_PARAGRAPH_PT4: "NAV ATGŪSTAMA!",
    DELETE_CANCEL: "Atcelt",
    DELETE_CONFIRM: "Dzēst"
}

export const PROJECT_ERROR = {
    VALIDATE_NAME_INPUT_MESSAGE_EMPTY: "Projekta nosaukums nedrīkst būt tukšs",
    VALIDATE_NAME_INPUT_MESSAGE_INVALID: "Projekta nosaukums norādīts nepareizi",
    VALIDATE_DIR_INPUT_MESSAGE_EMPTY: "Norādiet projekta direktoriju",
    VALIDATE_DIR_INPUT_MESSAGE_INVALID: "Projekta direktorija norādīta nepareizi"
}

export const PROJECT_REPORT_UI = {
    UPLOAD_TITLE: "Augšupielādēt VVAIS Atskaiti",
    UPLOAD_DRAG_DROP: "Velciet un nometiet failu šeit",
    UPLOAD_OR: "vai",
    UPLOAD_BROWSE: "Izvēlieties Failu",
    UPLOAD_BUTTON: "Augšupielādēt",
    UPLOAD_CANCEL: "Atcelt",
    UPLOAD_IN_PROGRESS: "Augšupielādē...",
    UPLOAD_SUCCESS: "Atskaite veiksmīgi augšupielādēta!",
    UPLOAD_ERROR: "Kļūda augšupielādējot atskaiti",
    FILE_TOO_LARGE: "Fails ir par lielu (maksimums 50MB)",
    INVALID_FILE_TYPE: "Faila tips nav atbalstīts",
    SUPPORTED_FORMATS: "Atbalstītie formāti: PDF, DOC, DOCX, XLS, XLSX, TXT, attēli"
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
    START_DATE_LABEL: "Sākuma datums:",
    END_DATE_LABEL: "Beigu datums:",
    STORAGE_TERM: "Glabāšanas termiņš:",
    STORAGE_TERM_PLACEHOLDER: "Izvēlēties...",
    CANCEL: "Atcelt",
    CREATE: "Izveidot uzskaites sarakstu",
    CREATE_IN_PROGRESS: "Izveido...",
    YEAR_START_PLACEHOLDER: "Izvēlēties sākuma gadu",
    YEAR_END_PLACEHOLDER: "Izvēlēties beigu gadu",
}

export const INVENTORY_EDIT_UI = {
    TITLE: "Labot uzskaites sarakstu",
    TITLE_REPORT: "Labot inventāra datumus",
    REPORT_INFO_MESSAGE: "📋 Šis inventārs ir izveidots no VVAIS atskaites. Var rediģēt tikai datumus.",
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

export const INVENTORY_CONSTANTS = {
    TYPE: ['Foto', 'Skaņas', 'Tekstuāls', 'Video', 'Datubāze'],
    TERMS: ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'],
    MEDIA_TYPES: ['Foto', 'Skaņas', 'Video', 'Datubāze'],
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
    CONFIRM_MESSAGE: "Vai tiešām vēlaties dzēst šo glabājamo vienību?",
    WARNING: "Tiks dzēsti arī visi ar to saistītie ieraksti!",
    CANCEL: "Atcelt",
    CONFIRM: "Dzēst"
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
    BATCH_UPDATE_SUCCESS: "Izvēlētie ieraksti ir veiksmīgi atjaunināti"
}
/* !--- Record Level Constants ---! */

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
    RESET: "Atiestatīt"
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
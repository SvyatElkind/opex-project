/* --- Worksace Level Constants --- */
/*src/Workspace/Workspace.js*/
export const WORKSPACE_UI ={
    LOADING: "Notiek Ielāde..."
}
/* !--- Workspace Level Constants ---! */

/* --- Project Level Constants --- */
/*src/*/
export const PROJECT_UI = {
    CREATE_PROJECT_BTN: "Izveidot Projektu",
    CREATE_PROJECT_BTN_SHORT: "+",
    PROJECT_STATEMENT_WHEN_EMPTY: "Projektu Sadaļa ir tukša, lūdzu izveidojiet Projektu",
    PROJECT_RENAME_BTN: "Pārdēvēt Projecktu",
    PROJECT_DELETE_BTN: "Dzēst Projektu",
    PROJECT_ADD_REPORT_BTN: "Pievienot Atskaiti",
    PROJECT_DETAILS_HIDE: "Paslēpt Projekta Detaļas",
    PROJECT_DETAILS_SHOW: "Parādīt Projekta Detaļas",
    PROJECT_TOOLTIP_CREATED_AT: "Izveidots :",
    PROJECT_TOOLTIP_DIR: "Vieta Diskā : ",
}
export const PROJECT_CREATE_UI = {
    PROJECT_NAME_LABEL: "Jaunā Projekta Nosaukums",
    PROJECT_DIR_LABEL: "Izvēlēties Projekta Direktoriju",
    PROJECT_CREATE_BTN: "Izveidot",
    PROJECT_CANCEL_BTN: "Atcelt"
}
export const PROJECT_RENAME_UI ={
    RENAME_TITLE : "Projekta Pārdēvēšana",
    RENAME_LABLE : "Projekta Jaunais Nosaukums:",
    RENAME_BUTTON : "Pārdēvēt"
}
export const PROJECT_DELETE_UI = {
    DELETE_TITLE: "Projekta Dzēšana!",
    DELETE_PARAGRAPH : "Vai esat pārliecināts ka vēlaties dzēst Projektu? - šī darbība ir neatgriežama!!!",
    DELETE_CANCEL: "Atcelt",
    DELETE_CONFIRM: "Dzēst"
}
export const PROJECT_ERROR = {
    VALIDATE_NAME_INPUT_MESSAGE_EMPTY : "Projekta nosaukums nedrīkst būt tukšs",
    VALIDATE_NAME_INPUT_MESSAGE_INVALID : "Projekta nosaukums norādīts nepareizi",
    VALIDATE_DIR_INPUT_MESSAGE_EMPTY: "Norādiet projekta direktoriju",
    VALIDATE_DIR_INPUT_MESSAGE_INVALID : "Projekta direktorija norādīta nepareizi"    
}
/* !--- Project Level Constants ---! */

/* --- Navigation Level Constants --- */
export const NAVIGATION_UI ={

}

/* !--- Navigation Level Consatnts ---! */

/* --- Institution Level Constants --- */
export const INSTITUTION_CONSTANTS = {
    HEADER:"Institūciju Parakstītāji",
    FIELD_1:"Lauki",
    FIELD_2:"Vērtības",
    CREATOR:"Veidotājs",
    CREATOR_POSITION:"Veidotāja Amats",
    SIGNER:"Parakstītājs",
    SIGNER_POSITION:"Parakstītāja Amats",
    ADD_ALL_FIELDS:"Pievienot Visus Laukus",
    REG_FIELD:"Reģ. Nr.",
    EDIT_CREATOR: "Labot Veidotāju",
    EDIT_SIGNER:"Labot Parakstītāju",
    EDIT_CREATOR_POSITION:"Labot Veidotāja Amatu",
    EDIT_SIGNER_POSITION:"Labot Parakstītāja Amatu",
    CONFIRM_ALL_SIGNERS:"Apstiprināt Parakstītājus",
    CONFIRM_SIGNER:"Apstiprināt Parakstītāju",
    ADD_ALL_S_HEADER:"Parakstītāju Vārdi un Amati :",
    CANCEL_ALL_SIGNERS: "Atcelt",
    CANCEL_SIGNER : "Atcelt",
    EDIT_HEADER: "Labot :",
    EDIT : "Labot",
    EMPTY_FIELD: "Laukā Nav Norādīta Vērtība",
}
/* !--- Institution Level Constants ---! */

/* --- Inventory Level Constants --- */
export const INVENTORY_UI = {
    CREATE_INV_BTN: "Izveidot Jaunu Uzskaites Sarakstu",
    ID: "ID",
    NUMBER: "Numurs",
    TYPE: "Tips",
    ALLOW: "Atļaut Pilnu lauku atjaunošanu",
    ELECTRONIC: "Elektronisks",
    LAST_GV: "Pēdējais GV",
    ITEMS_PER_PERIOD: "Glabājamās vienības perioādā",
    TOTAL_ITEMS: "Kopējo Glabājamo vienību skaits",
    STORAGE_TERM: "Glabāšanas periods",
    START_DATE:"Sākuma Datums",
    END_DATE:"Beigu Datums",
    ITEMS: "Glabājamās vienības",
}

export const INVENTORY_CREATE_UI = {
    TITLE: "Izveidot Jaunu Uzskaites Sarakstu",
    ELECTRONIC_LABEL: "Elektronisks: ",
    TYPE_LABLE: "Tips:",
    SUBFOND_LABLE: "Subfonds",
    START_DATE_LABEL: "Sākuma Datums:",
    END_DATE_LABEL: "Beigu Datums:",
    STORAGE_TERM: "Glabāšanas periods",
    CANCEL: "Atcelt",
    CREATE: "Izveidot"
}

export const INVENTORY_CONSTANTS = {
    TYPE : ['Foto', 'Skaņas', 'Tekstuāls', 'Video', 'Datubāze'],
    TERMS: ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas'],
    MEDIA_TYPES: ['Foto', 'Skaņas', 'Video', 'Datubāze'],
    TEXTUAL_TYPES: ['Tekstuāls']
}
/* !--- Inventory Level Constants ---! */

/* --- Item Level Constants --- */
export const ITEM_UI = {
    ID: "ID",
    NUMBER: "Numurs",
    TITLE: "Nosaukums",
    DATE: "Datums",
    RECORDS_COUNT: "Ierakstu skaits",
    STATUS: "Statuss",
    ACTIONS: "Darbības",
    CREATE_ITEM: "Izveidot Glabājamo Vienību",
    EDIT_ITEM: "Labot Glabājamo Vienību",
    DELETE_ITEM: "Dzēst Glabājamo Vienību",
    VIEW_RECORDS: "Skatīt Ierakstus"

}

/* !--- Item Level Constants ---! */

/* --- Record Level Constants --- */
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
    
    // Metadata Sections
    ACTIONS: "Darbības",
    ADDRESSEES: "Adresāti", 
    READ_STATUS: "Lasīšanas statuss",
    ADD_ACTION: "Pievienot Darbību",
    ADD_ADDRESSEE: "Pievienot Adresātu",
    ADD_READ_STATUS: "Pievienot Lasīšanas statusu",
    
    // File Operations
    DRAG_DROP_FILES: "Vilkt un nomest failus šeit",
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
    OPTIONAL_FIELD: "Neobligāts lauks"
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
    MAX_NOTES_LENGTH: 200,
    
    // Validation patterns
    DURATION_REGEX: /^\d{1,2}:[0-5]\d:[0-5]\d$/,
    
    // Valid values
    ACCESS_RESTRICTION_VALUES: ['open', 'closed'],
    LANGUAGES: [
        'Latviešu', 'Angļu', 'Vācu', 'Krievu', 'Franču', 
        'Spāņu', 'Itāļu', 'Portugāļu', 'Nīderlandiešu', 
        'Poļu', 'Čehu', 'Slovāku', 'Ungāru', 'Rumāņu',
        'Bulgāru', 'Horvātu', 'Slovēņu', 'Lietuviešu',
        'Igauņu', 'Somu', 'Zviedru', 'Norvēģu', 'Dāņu'
    ],
    
    // File validation
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_FILE_TYPES: {
        'Foto': ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp', 'image/gif'],
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/flv'],
        'Skaņas': ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/m4a'],
        'Tekstuāls': [
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/rtf', 'application/rtf'
        ],
        'Datubāze': ['application/sql', 'application/json', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    }
}
export const RECORD_ERROR_MESSAGES = {
    // Field validation errors (from backend MSG_E_* constants)
    TITLE_REQUIRED: "Nosaukums ir obligāts",
    TITLE_TOO_LONG: "Vērtība ir garāka par 500 simboliem.",
    LANGUAGE_TOO_LONG: "Vērtība ir garāka par 20 simboliem.",
    ANNOTATION_TOO_LONG: "Vērtība ir garāka par 500 simboliem.",
    KEY_WORDS_TOO_LONG: "Vērtība ir garāka par 200 simboliem.",
    REG_NR_TOO_LONG: "Vērtība ir garāka par 30 simboliem.",
    SENT_REG_NR_TOO_LONG: "Vērtība ir garāka par 30 simboliem.",
    GROUP_TOO_LONG: "Vērtība ir garāka par 30 simboliem.",
    NOMENCLATURE_NR_TOO_LONG: "Vērtība ir garāka par 30 simboliem.",
    NOTES_TOO_LONG: "Vērtība ir garāka par 500 simboliem.",
    ACCESS_RESTRICTION_NOTES_TOO_LONG: "Vērtība ir garāka par 30 simboliem.",
    USER_RESTRICTION_NOTES_TOO_LONG: "Vērtība ir garāka par 30 simboliem.",
    TECH_INFO_TOO_LONG: "Vērtība ir garāka par 500 simboliem.",
    COLOR_TOO_LONG: "Vērtība ir garāka par 10 simboliem.",
    DURATION_TOO_LONG: "Vērtība ir garāka par 8 simboliem.",
    FORMAT_TOO_LONG: "Vērtība ir garāka par 10 simboliem.",
    RESOLUTION_TOO_LONG: "Vērtība ir garāka par 20 simboliem.",
    
    // Specific validation errors
    INVALID_DURATION: "Glabājamās vienības skanēšanas ilgums norādīts nepareizi.",
    INVALID_ACCESS_RESTRICTION: "Nepareizi norādīta pieejamības vērtība.",
    ACCESS_RESTRICTION_DATE_REQUIRED: "Nav norādīts ierobežojuma datums.",
    ACCESS_RESTRICTION_DATE_NOT_NEEDED: "Datumu nenorāda, ja ierobežojuma vērtība ir \"open\".",
    NOT_TEXT_RECORD: "Dokumentam jābūt tekstuālam elektroniskā formā.",
    UNKNOWN_CLASS: "Unknown class: {}.",
    
    // File errors
    NO_FILES_PROVIDED: "Nav norādīti faili.",
    FILE_TOO_LARGE: "Fails ir pārāk liels. Maksimālais izmērs: 100MB.",
    INVALID_FILE_TYPE: "Neatbalstīts faila tips šim ieraksta veidam.",
    SINGLE_FILE_ONLY: "Tikai viens fails var tikt augšupielādēts vienlaikus.",
    
    // Operation errors
    CREATION_FAILED: "Neizdevās izveidot ierakstu",
    UPDATE_FAILED: "Neizdevās atjaunināt ierakstu",
    DELETE_FAILED: "Neizdevās dzēst ierakstu",
    UPLOAD_FAILED: "Neizdevās augšupielādēt failu",
    
    // Media record errors
    ITEM_HAS_PHOTO_RECORD: "Item already has a photo record.",
    ITEM_HAS_VIDEO_RECORD: "Item already has a video record.",
    ITEM_HAS_AUDIO_RECORD: "Item already has an audio record.",
    INVALID_MEDIA_TYPE: "GV tips nav foto, video, skaņas",
    NOT_ELECTRONIC_FORMAT: "GV tips nav foto, video, skaņas un/vai elektroniskā formā"
}

export const RECORD_SUCCESS_MESSAGES = {
    RECORD_CREATED: "Ieraksts ir veiksmīgi izveidots!",
    RECORD_UPDATED: "Ieraksts ir veiksmīgi atjaunināts!",
    RECORD_DELETED: "Ieraksts ir veiksmīgi dzēsts!",
    FILES_UPLOADED: "Faili ir veiksmīgi augšupielādēti.",
    FILE_DELETED: "Fails ir veiksmīgi dzēsts.",
    METADATA_ADDED: "Metadati ir veiksmīgi pievienoti.",
    METADATA_UPDATED: "Metadati ir veiksmīgi atjaunināti.",
    METADATA_DELETED: "Metadati ir veiksmīgi dzēsti.",
    BATCH_DELETE_SUCCESS: "Izvēlētie ieraksti ir veiksmīgi dzēsti.",
    BATCH_UPDATE_SUCCESS: "Izvēlētie ieraksti ir veiksmīgi atjaunināti."
}


/* !--- Record Level Constans ---! */

/* --- Error Messages --- */
export const ERROR_MESSAGES = {
    BACKEND_SERVER_ERROR : "Neizdevās izveidot savienojumu ar serveri!",
    
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
    
    // Add record-specific errors here (already included in RECORD_ERROR_MESSAGES)
    RECORD_CREATION_FAILED: "Neizdevās izveidot ierakstu: Lūdzu, sniedziet derīgus datus.",
    RECORD_NOT_FOUND: "Kļūda: Pieprasītais ieraksts netika atrasts.",
    RECORD_UPDATE_FAILED: "Neizdevās atjaunināt ierakstu: Lūdzu, pārbaudiet ievadītos datus.",
    RECORD_DELETION_FAILED: "Neizdevās dzēst ierakstu: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    GENERIC_ERROR: "Radās negaidīta kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.",
    NETWORK_ERROR: "Tīkla kļūda. Pārbaudiet internetasavienojumu.",
    TIMEOUT_ERROR: "Pieprasījums pārsniedza laika limitu. Lūdzu, mēģiniet vēlreiz.",
    PERMISSION_DENIED: "Jums nav atļaujas veikt šo darbību.",
    VALIDATION_ERROR: "Datu validācijas kļūda. Pārbaudiet ievadītos datus."
};
/* !--- Error Messages ---! */

/* --- Alert Messages --- */
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
    
    // Record success messages are in RECORD_SUCCESS_MESSAGES
    
    OPERATION_SUCCESS: "Darbība veiksmīgi pabeigta!",
    CHANGES_SAVED: "Izmaiņas ir saglabātas!",
    DATA_EXPORTED: "Dati ir veiksmīgi eksportēti!",
    REPORT_GENERATED: "Atskaite ir veiksmīgi ģenerēta!"
};
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
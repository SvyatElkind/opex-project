/* --- Record UI Strings --- */

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
    DRAG_DROP_FILES: "Velciet un nometiet datnes šeit",
    SELECT_FILES: "Izvēlēties datnes",
    UPLOADING: "Augšupielādē...",
    UPLOAD_SUCCESS: "Datnes veiksmīgi augšupielādētas",
    UPLOAD_ERROR: "Kļūda augšupielādējot datnes",
    
    // Record Types
    TEXTUAL_RECORD: "Tekstuāls dokuments",
    PHOTO_RECORD: "Foto dokuments",
    VIDEO_RECORD: "Video dokuments",
    AUDIO_RECORD: "Skaņas dokuments",
    DATABASE_RECORD: "Datubāzes dokuments",
    
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
    
    // File types allowed per inventory type
    ALLOWED_FILE_TYPES: {
        'Foto': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'],
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'],
        'Skaņas': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'],
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
    NO_FILES_PROVIDED: "Nav pievienotas datnes",
    INVALID_FILE_TYPE: "Nepareizs datnes tips",
    SINGLE_FILE_ONLY: "Šim dokumenta tipam atļauta tikai viena datne",
    MULTIPLE_FILES_NOT_ALLOWED: "Vairākas datnes nav atļautas šim tipam",
    RECORD_TYPE_REQUIRED: "Dokumenta tips ir obligāts",
    METADATA_CLASS_REQUIRED: "Metadatu klase ir obligāta",
    GENERIC_ERROR: "Radās kļūda",

    // Operation errors
    CREATION_FAILED: "Neizdevās izveidot dokumentu",
    UPDATE_FAILED: "Neizdevās atjaunināt dokumentu",
    DELETE_FAILED: "Neizdevās dzēst dokumentu",
    UPLOAD_FAILED: "Neizdevās augšupielādēt datni",

    // Media record errors
    ITEM_HAS_PHOTO_RECORD: "GV jau ir pievienots foto dokuments",
    ITEM_HAS_VIDEO_RECORD: "GV jau ir pievienots video dokuments",
    ITEM_HAS_AUDIO_RECORD: "GV jau ir pievienots skaņas dokuments",
    INVALID_MEDIA_TYPE: "GV tips nav foto, video, skaņas",
    NOT_ELECTRONIC_FORMAT: "GV tips nav foto, video, skaņas un/vai elektroniskā formā"
}

export const RECORD_SUCCESS_MESSAGES = {
    RECORD_CREATED: "Dokuments ir veiksmīgi izveidots!",
    RECORD_UPDATED: "Dokuments ir veiksmīgi atjaunināts!",
    RECORD_DELETED: "Dokuments ir veiksmīgi dzēsts!",
    FILES_UPLOADED: "Datnes ir veiksmīgi augšupielādētas",
    FILE_DELETED: "Datne ir veiksmīgi dzēsta",
    METADATA_ADDED: "Metadati ir veiksmīgi pievienoti",
    METADATA_UPDATED: "Metadati ir veiksmīgi atjaunināti",
    METADATA_DELETED: "Metadati ir veiksmīgi dzēsti",
    BATCH_DELETE_SUCCESS: "Izvēlētie dokumenti ir veiksmīgi dzēsti",
    BATCH_UPDATE_SUCCESS: "Izvēlētie dokumenti ir veiksmīgi atjaunināti",
    UPDATE: "Dokuments ir veiksmīgi atjaunināts!"
}

export const RECORD_DELETE_UI = {
    TITLE: "Dzēst Dokumentu",
    TITLE_PLURAL: "Dzēst Dokumentus",
    CONFIRM_MESSAGE: "Vai tiešām vēlaties dzēst šo dokumentu?",
    WARNING: "Tiks dzēstas arī visas ar to saistītās datnes!",
    WARNING_IRREVERSIBLE: "Šī darbība ir <strong>neatgriezeniska</strong>.",
    CANCEL: "Atcelt",
    CONFIRM: "Dzēst",

    // Delete popup specific
    POPUP_TITLE_SINGLE: "Dzēst dokumentu?",
    POPUP_TITLE_MULTI: "Dzēst dokumentus?",
    POPUP_WARNING_TEXT: "Šī darbība ir <strong>neatgriezeniska</strong>. Dzēšot dokumentu(-us), tiks dzēsta visa saistītā informācija:",
    POPUP_RECORD_LABEL: "Dokuments",
    POPUP_RECORDS_LABEL: "Dokumenti",
    POPUP_FILE_LABEL: "datne",
    POPUP_FILES_LABEL: "datnes",
    POPUP_FILES_LABEL_MULTI: "datņu",
    POPUP_NO_FILES: "Nav datņu",
    POPUP_TOTAL_RECORDS: "Kopā dokumentu:",
    POPUP_TOTAL_FILES: "Kopā datņu:",
    POPUP_CONSEQUENCES_TITLE: "Tiks dzēsts:",
    POPUP_CONSEQUENCE_RECORDS: "dokuments(-i)",
    POPUP_CONSEQUENCE_FILES: "visas pievienotās datnes",
    POPUP_CONSEQUENCE_METADATA: "visi saistītie metadati"
}

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
    ERROR_RECORD_ID_MISSING: "Kļūda: dokumenta ID nav atrasts",

    // Edit metadata dialog
    EDIT_AUTO_WARNING_TITLE: "Brīdinājums par automātiski nolasītajiem metadatiem",
    EDIT_AUTO_WARNING_TEXT: "Daži šī dokumenta metadati tika automātiski nolasīti no datnes.",
    EDIT_AUTO_WARNING_STRONG: "nav ieteicams",
    EDIT_AUTO_WARNING_REASON: ", jo tie tika iegūti tieši no datnes metadatiem un precīzi atspoguļo datnes tehniskās īpašības.",
    EDIT_AUTO_HINT: "Automātiski nolasītie lauki ir atzīmēti ar \"✓\" marķējumu."
}

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
    PLACEHOLDER_LIETOTĀJA_IEROBEŽOJUMI: "Ievadiet lietošanas nosacījumus",

    // Inline strings extracted from CreateDocumentRecord.js
    DATE_OUT_OF_RANGE_WARNING: "Izvēlētais datums ir ārpus vienības datumu diapazona ({rangeText}). Dokumenta pievienošana nav iespējama.",
    ACCESS_MISMATCH_WARNING: "Vienības pieejamība ir \"{restriction}\" - dokumenta pieejamība neatbilst vienības ierobežojumam",
    DATE_OUT_OF_RANGE_ERROR: "Dokumenta datums ir ārpus vienības datumu diapazona. Lūdzu, izvēlieties datumu vienības diapazonā.",
    FORM_HAS_ERRORS: "Lūdzu, labojiet kļūdas formā",
    ERROR_CREATING_DOCUMENT: "Kļūda izveidojot dokumentu",

    // Edit-specific strings
    DOCUMENT_EDIT_TITLE: "Dokumenta rediģēšana",
    DATE_OUT_OF_RANGE_WARNING_EDIT: "Izvēlētais datums ir ārpus vienības datumu diapazona ({rangeText}). Dokumenta saglabāšana nav iespējama.",
    ERROR_UPDATING_DOCUMENT: "Kļūda atjauninot dokumentu",

    // Language list for record creation (lowercase variant)
    LANGUAGES: [
        "latviešu", "krievu", "angļu", "vācu", "franču", "spāņu", "itāļu",
        "poļu", "lietuviešu", "igauņu", "somu", "zviedru", "norvēģu", "dāņu",
        "holandiešu", "portugāļu", "grieķu", "turku", "arābu", "ķīniešu",
        "japāņu", "korejiešu", "hindi", "hebrejsku", "čehu", "slovāku",
        "rumāņu", "bulgāru", "ungāru", "ukraiņu", "serbu", "horvātu", "cita"
    ],
    DEFAULT_LANGUAGE: "latviešu"
}

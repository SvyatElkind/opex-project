/* --- Project UI Strings --- */

export const WORKSPACE_UI = {
    LOADING: "Notiek Ielāde...",
    ERROR: "Kļūda ielādējot datus",
    NO_PROJECTS: "Nav projektu",
    RETRY: "Mēģināt vēlreiz"
}

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
    RECORDS_LABEL: "Dokumenti",
    FILES_LABEL: "Datnes"
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
    INVALID_FILE_TYPE: "Faila tips nav atbalstīts",
    SUPPORTED_FORMATS: "Atbalstītie formāti: XLSX, XLS"
}

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
        DOKUMENTI: "Visi dokumenti",
        FAILI: "Visas augšupielādētās datnes"
    }
}

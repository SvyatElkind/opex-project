/* --- Common UI Strings --- */

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
    
    RECORD_CREATION_FAILED: "Neizdevās izveidot dokumentu: Lūdzu, sniedziet derīgus datus.",
    RECORD_NOT_FOUND: "Kļūda: Pieprasītais dokuments netika atrasts.",
    RECORD_UPDATE_FAILED: "Neizdevās atjaunināt dokumentu: Lūdzu, pārbaudiet ievadītos datus.",
    RECORD_DELETION_FAILED: "Neizdevās dzēst dokumentu: Lūdzu, mēģiniet vēlreiz vēlāk.",
    
    GENERIC_ERROR: "Radās negaidīta kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.",
    NETWORK_ERROR: "Tīkla kļūda. Pārbaudiet interneta savienojumu.",
    TIMEOUT_ERROR: "Pieprasījums pārsniedza laika limitu. Lūdzu, mēģiniet vēlreiz.",
    PERMISSION_DENIED: "Jums nav atļaujas veikt šo darbību.",
    VALIDATION_ERROR: "Datu validācijas kļūda. Pārbaudiet ievadītos datus."
}

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

export const TOAST_CONFIG = {
    TIMER : 2000
}

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

export const HELP_UI = {
    HELP_BUTTON_TITLE: "Palīdzība",
    CLOSE_HELP: "Aizvērt palīdzību"
}

// Top-bar help picker — "point at a part of the app to open its documentation"
export const HELP_PICKER_UI = {
    BUTTON_TITLE: "Palīdzība par ekrāna daļu",
    BANNER: "Norādiet uz ekrāna daļu, par kuru vēlaties palīdzību",
    CANCEL: "Atcelt (Esc)"
}

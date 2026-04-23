/* --- Inventory UI Strings --- */

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
    DELETE_INVENTORY: "Dzēst Uzskaites Sarakstu",

    // Inline strings extracted from Inventories.js
    NO_INVENTORIES: "Nav Uzskaites Sarakstu",
    SELECT_INVENTORY: "Izvēlaties Uzskaites Sarakstu",
    ERROR_DELETING_PREFIX: "Kļūda dzēšot uzskaites sarakstu: ",
    ERROR_UNKNOWN: "Nezināma kļūda"
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

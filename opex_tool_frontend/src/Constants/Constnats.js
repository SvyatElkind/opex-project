/* --- Worksace Level Constants --- */
export const WORKSPACE_UI ={
    LOADING: "Notiek Ielāde..."
}
/* !--- Workspace Level Constants ---! */

/* --- Project Level Constants --- */
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
}
/* !--- Inventory Level Constants ---! */

/* --- Item Level Constants --- */
export const ITEM_UI = {

}

/* !--- Item Level Constants ---! */

/* --- Record Level Constants --- */

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
    
    GENERIC_ERROR: "Radās negaidīta kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.",
};
/* !--- Error Messages ---! */

/* --- Alert Messages --- */
export const ALERT_MESSAGES = {
    
    PROJECT_CREATED: "Projekts ir veiksmīgi izveidots!",
    PROJECT_UPDATED: "Projekts ir veiksmīgi atjaunots!",
    PROJECT_DELETED: "Projekts ir veiksmīgi dzēsts!",
    
    INSTITUTION_CREATED: "Iestāde ir veiksmīgi izveidota!",
    INSTITUTION_UPDATED: "Iestāde ir veiksmīgi atjaunota!",
    INSTITUTION_DELETED: "Iestāde ir veiksmīgi dzēsta!",
};
/* !--- Alert Messages ---! */

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
}
/* !--- API ---! */
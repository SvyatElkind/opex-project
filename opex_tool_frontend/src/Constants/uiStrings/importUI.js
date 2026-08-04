/* ==========================================
   CSV / EXCEL IMPORT UI STRINGS (experimental)
   ========================================== */

export const IMPORT_UI = {
    /* --- Experimental framing --- */
    EXPERIMENTAL_BADGE: "EKSPERIMENTĀLS",
    EXPERIMENTAL_TAB: "Eksperimentāli",
    EXPERIMENTAL_TITLE: "Eksperimentālās funkcijas",
    EXPERIMENTAL_INTRO: "Šīs funkcijas ir izstrādes stadijā. Tās var nedarboties pareizi, var mainīties vai pazust nākamajās versijās, un tās nav rādītājs pārējā rīka kvalitātei un gatavībai. Ieslēdziet tās tikai tad, ja esat gatavs pārbaudīt rezultātu ar rokām.",
    EXPERIMENTAL_IMPORT_LABEL: "Imports no CSV / Excel faila",
    EXPERIMENTAL_IMPORT_HELP: "Ļauj izveidot glabājamās vienības un ierakstus no tabulas faila. Fails tiek apstrādāts tikai šajā datorā — nekur netiek sūtīts. Rezultāts pēc importa ir jāpārbauda. Atsaukšanas iespējas nav.",
    EXAMPLES_TITLE: "Paraugfaili",
    EXAMPLES_HINT: "Lejupielādējiet paraugu, aizstājiet datus ar saviem un importējiet.",
    EXAMPLE_XLSX: "Excel paraugs (ar instrukciju)",
    EXAMPLE_CSV: "CSV paraugs",
    EXAMPLE_CSV_ITEMS: "CSV — tikai vienības",
    EXAMPLE_CSV_RECORDS: "CSV — tikai ieraksti",

    WARNING_BANNER: "Rezultāts pēc importa jāpārbauda — atsaukt nevar. Fails tiek apstrādāts tikai šajā datorā.",

    /* --- Menu entries --- */
    MENU_IMPORT_ITEMS: "Importēt no CSV / Excel faila",
    MENU_IMPORT_RECORDS: "Importēt ierakstus no CSV / Excel faila",

    /* --- Popup shell --- */
    TITLE_ITEMS: "Imports no CSV / Excel",
    TITLE_RECORDS: "Ierakstu imports no CSV / Excel",
    SUBTITLE_RECORDS: "Visas faila rindas tiks pievienotas šai glabājamai vienībai",

    /* --- Field hints ("?" bubbles inside the import popup) --- */
    HINT_FILE: "Excel failā tiek lasīta lapa \"DATI\" vai pirmā lapa — pārējās lapas netiek ņemtas vērā. Ja garumzīmes izskatās sabojātas, saglabājiet failu no Excel kā \"CSV UTF-8\".",
    HINT_COLUMNS: "Kolonnu secība nav svarīga — svarīgi ir virsraksti pirmajā rindā. Reģistrs, atstarpes un garumzīmes netiek ņemtas vērā. Neatpazītas kolonnas tiek ignorētas, bet tās var piekārtot manuāli.",
    HINT_PREVIEW: "Katra faila rinda ir redzama pirms importa. Rindas ar kļūdu tiek izlaistas — pārējās tiek izveidotas. Rindas numurs atbilst rindas numuram failā.",
    HINT_PARENT: "Kurai glabājamai vienībai dokuments piesaistīsies: jaunai vienībai no šī paša faila (norādīta tās rinda) vai jau esošai vienībai (SAITE = GV:<numurs>).",

    /* --- Step 1: file --- */
    STEP_FILE: "1. Fails",
    FILE_CHOOSE: "Izvēlēties failu",
    FILE_DROP_HINT: "vai ievelciet failu šeit",
    FILE_ACCEPT_HINT: "Atbalstīts: .csv, .xlsx",
    FILE_INFO: "{name} · {kind} · {encoding} · {rows} rindas",
    FILE_INFO_XLSX: "{name} · Excel · lapa \"{sheet}\" · {rows} rindas",
    FILE_READING: "Lasa failu…",
    FILE_REPLACE: "Izvēlēties citu failu",

    /* --- Step 2: columns --- */
    STEP_COLUMNS: "2. Kolonnas",
    COLUMNS_RECOGNISED: "Atpazītas {known} no {total} kolonnām",
    COLUMNS_ALL_RECOGNISED: "Visas kolonnas atpazītas",
    COLUMNS_UNKNOWN: "Nav atpazīta un tiks ignorēta: \"{name}\"",
    COLUMNS_ASSIGN: "Piekārtot manuāli",
    COLUMNS_ASSIGN_NONE: "— ignorēt —",
    COLUMNS_MISSING_REQUIRED: "Nav atrasta obligāta kolonna: {names}",
    COLUMNS_NO_HEADER: "Failā neizdevās atrast virsrakstu rindu. Pirmajā rindā jābūt kolonnu nosaukumiem (piem. TIPS, NOSAUKUMS).",

    /* --- Step 3: preview --- */
    STEP_PREVIEW: "3. Priekšskatījums",
    PREVIEW_COLUMN_ROW: "Rinda",
    PREVIEW_COLUMN_TYPE: "Tips",
    PREVIEW_COLUMN_TITLE: "Nosaukums",
    PREVIEW_COLUMN_PARENT: "Piesaiste",
    PREVIEW_COLUMN_STATUS: "✔",
    PREVIEW_INVALID: "{invalid} ar kļūdu — tiks izlaistas",
    PREVIEW_ALL_VALID: "{rows} rindas, visas derīgas",
    PREVIEW_ONLY_ERRORS: "Rādīt tikai kļūdas",
    PREVIEW_SHOW_ALL: "Rādīt visas rindas",
    PREVIEW_EMPTY: "Failā nav neviena datu rinda",
    PREVIEW_TRUNCATED: "Rādītas pirmās {shown} rindas no {total}",

    PARENT_NEW_ITEM: "jauna GV (rinda {row})",
    PARENT_EXISTING_ITEM: "esošā GV {number}",
    PARENT_CURRENT_ITEM: "šī GV ({number})",

    /* --- Footer --- */
    FOOTER_WILL_CREATE: "Izveidos {items} vienības un {records} ierakstus",
    FOOTER_WILL_CREATE_ITEMS: "Izveidos {items} vienības",
    FOOTER_WILL_CREATE_RECORDS: "Izveidos {records} ierakstus",
    IMPORT_BTN: "Importēt {count}",
    CANCEL_BTN: "Atcelt",
    CLOSE_BTN: "Aizvērt",

    /* --- Step 4: run --- */
    PROGRESS_LABEL: "Importē… {done} / {total}",
    PROGRESS_PHASE_ITEMS: "Veido glabājamās vienības…",
    PROGRESS_PHASE_SYNC: "Nolasa izveidotās vienības…",
    PROGRESS_PHASE_RECORDS: "Veido ierakstus…",
    RESULT_SUCCESS: "{count} izveidotas",
    RESULT_FAILED: "{count} neizdevās",

    /* --- Errors --- */
    ERROR_UNSUPPORTED: "Neatbalstīts faila tips. Atbalstīts ir .csv un .xlsx.",
    ERROR_READ_FAILED: "Failu neizdevās nolasīt: {message}",
    ERROR_EMPTY_FILE: "Fails ir tukšs.",
    ERROR_TOO_MANY_ROWS: "Failā ir {rows} rindas. Vienā importā atļautas līdz {max} rindām — sadaliet failu vairākās daļās.",
    WARNING_MANY_ROWS: "Failā ir {rows} rindas — tiks nosūtīts tik pat atsevišķu pieprasījumu. Tas var aizņemt laiku.",
    WARNING_ENCODING: "Iespējams, garumzīmes ir sabojātas (fails nolasīts kā {encoding}). Saglabājiet failu no Excel kā \"CSV UTF-8\".",
    WARNING_EXPORT_TEMPLATE: "Šis izskatās pēc rīka izveidotā uzskaites saraksta (eksporta veidlapas). To importēt nevar — eksporta veidlapā vairākas vērtības ir apvienotas vienā šūnā. Lietojiet paraugfailu.",
    WARNING_RECORDS_NOT_SUPPORTED: "Šajā uzskaites sarakstā ierakstus (DOK rindas) izveidot nevar — tie ir pieejami tikai tekstuālos elektroniskos sarakstos. DOK rindas tiks izlaistas.",

    /* --- Row-level messages (mapper) --- */
    ROW_ERROR_NO_TYPE: "Nav norādīts rindas tips (kolonna TIPS: GV vai DOK)",
    ROW_ERROR_UNKNOWN_TYPE: "Nezināms rindas tips \"{value}\" (jābūt GV vai DOK)",
    ROW_ERROR_NO_PARENT: "Nav norādīta vecākvienība (kolonna SAITE)",
    ROW_ERROR_PARENT_NOT_FOUND: "Glabājamā vienība ar GV numuru {number} nav atrasta šajā uzskaites sarakstā",
    ROW_ERROR_PARENT_KEY_NOT_FOUND: "Nav atrasta GV rinda ar saiti \"{key}\"",
    ROW_ERROR_DUPLICATE_KEY: "Saite \"{key}\" lietota vairākās GV rindās",
    ROW_ERROR_BAD_DATE: "Neizdevās nolasīt datumu \"{value}\" (lauks {field})",
    ROW_ERROR_BAD_NUMBER: "Neizdevās nolasīt skaitli \"{value}\" (lauks {field})",
    ROW_ERROR_BAD_ENUM: "Nederīga vērtība \"{value}\" (lauks {field}). Atļauts: {allowed}",
    ROW_ERROR_RECORDS_NOT_SUPPORTED: "Šajā uzskaites sarakstā ierakstus izveidot nevar",
    ROW_SKIPPED_PARENT_FAILED: "Vecākvienība netika izveidota",
    ROW_ERROR_PARENT_ID_MISSING: "Neizdevās atrast izveidoto vecākvienību",

    /* --- Interrupted between phases --- */
    SYNC_FAILED: "{count} vienības tika izveidotas, bet ierakstus nevarēja tām piesaistīt, jo neizdevās nolasīt atjaunotos datus. Aizveriet logu, pārbaudiet sarakstu un importējiet ierakstus atsevišķi, kolonnā SAITE norādot GV:<numurs>.",

    /* --- Type labels --- */
    TYPE_ITEM: "GV",
    TYPE_RECORD: "DOK",
};

export default IMPORT_UI;

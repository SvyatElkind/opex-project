/* --- Navigation UI Strings --- */

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

export const NAVIGATION_ADDITIONAL_UI = {
    BREADCRUMB_PROJEKTS: "Projekts",
    BREADCRUMB_FONDS: "",
    BREADCRUMB_UZSKAITES_SARAKSTS: "Uzskaites Saraksts",
    BREADCRUMB_GLABĀJAMĀ_VIENĪBA: "Glabājamā Vienība",
    BREADCRUMB_DOKUMENTS: "Dokuments",
    BREADCRUMB_TITLE_FORMAT: "{type}: {value}",
    BREADCRUMB_ARIA_LABEL: "Breadcrumb navigation"
}

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

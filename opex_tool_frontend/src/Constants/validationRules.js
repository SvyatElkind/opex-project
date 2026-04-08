// Validation rules used in the Verification Tree (VerificationModal)
// Source: InheritanceUtils.js validation functions
//
// Severity levels:
// ERROR   - Blocks OPEX generation. Must be fixed before export.
// WARNING - Does not block OPEX generation. Informational / recommended fixes.

export const PROJECT_RULES = {
    // ERRORS
    MISSING_SIGNERS: {
        id: 'MISSING_SIGNERS',
        severity: 'ERROR',
        message_lv: 'Institūcijas parakstītāji nav pievienoti. Lūdzu, pievienojiet izveidotāja un parakstītāja informāciju.',
        description: 'Institution signers are missing. Creator, creator position, signer, and signer position must all be filled.',
        fields: ['institution.creator', 'institution.creator_position', 'institution.signer', 'institution.signer_position'],
        helpChapter: 'projects',
        helpSection: 'institution-signers',
    },
    NO_INVENTORIES: {
        id: 'NO_INVENTORIES',
        severity: 'ERROR',
        message_lv: 'Projektam nav uzskaites sarakstu',
        description: 'Project has no inventories at all.',
        fields: ['institution.fond.inventories'],
        helpChapter: 'inventories',
        helpSection: 'create-inventory',
    },
    INVENTORY_NOT_READY: {
        id: 'INVENTORY_NOT_READY',
        severity: 'ERROR',
        message_lv: 'Uzskaites saraksts nav gatavs OPEX ģenerēšanai',
        description: 'An inventory within the project has validation errors preventing OPEX generation.',
        fields: [],
    },
};

export const INVENTORY_RULES = {
    // ERRORS
    INVENTORY_MISSING_NUMBER: {
        id: 'INVENTORY_MISSING_NUMBER',
        severity: 'ERROR',
        message_lv: 'Uzskaites saraksta numurs ir obligāts',
        description: 'Inventory number is required.',
        field: 'number',
    },
    INVENTORY_MISSING_TYPE: {
        id: 'INVENTORY_MISSING_TYPE',
        severity: 'ERROR',
        message_lv: 'Uzskaites saraksta tips ir obligāts',
        description: 'Inventory type is required (Tekstuāls, Foto, Video, Skaņas).',
        field: 'type',
    },
    INVENTORY_NO_ITEMS: {
        id: 'INVENTORY_NO_ITEMS',
        severity: 'ERROR',
        message_lv: 'Uzskaites sarakstam ir norādīti datumi, bet nav vienību - pievienojiet vienības vai noņemiet datumus',
        description: 'User-created inventory has dates set but no items. Either add items or remove the dates.',
        field: 'items',
        condition: 'Only applies when from_report=false AND inventory has dates AND no items.',
        helpChapter: 'items',
        helpSection: 'create-item',
    },
};

export const ITEM_RULES = {
    // ERRORS
    ITEM_MISSING_TITLE: {
        id: 'ITEM_MISSING_TITLE',
        severity: 'ERROR',
        message_lv: 'Vienības nosaukums ir obligāts',
        description: 'Item title is required.',
        field: 'title',
    },
    ITEM_MISSING_NUMBER: {
        id: 'ITEM_MISSING_NUMBER',
        severity: 'ERROR',
        message_lv: 'Vienības numurs ir obligāts',
        description: 'Item number is required.',
        field: 'number',
    },
    ITEM_NO_RECORDS: {
        id: 'ITEM_NO_RECORDS',
        severity: 'ERROR',
        message_lv: 'Elektroniskā vienībai jābūt vismaz vienam dokumentam',
        description: 'Electronic textual item must have at least one record/document.',
        field: 'records',
        condition: 'Only applies to electronic textual items (electronic=true, type=Tekstuāls).',
        helpChapter: 'records',
        helpSection: 'create-record',
    },
    ITEM_NO_MEDIA_RECORDS: {
        id: 'ITEM_NO_MEDIA_RECORDS',
        severity: 'ERROR',
        message_lv: 'Elektroniskā {mediaType} vienībai jābūt atbilstošam {mediaType} ierakstam',
        description: 'Electronic media item must have at least one corresponding media record (photo_records / video_records / audio_records).',
        field: 'photo_records | video_records | audio_records',
        condition: 'Only applies to electronic media items (Foto, Video, Skaņas).',
    },
    MEDIA_RECORD_INCOMPLETE: {
        id: 'MEDIA_RECORD_INCOMPLETE',
        severity: 'ERROR',
        message_lv: '{mediaType} ierakstam trūkst obligāto lauku: {missingFields}',
        description: 'Media record is missing required metadata fields.',
        requiredFieldsByType: {
            Foto: ['color (krāsa)', 'horizontal_resolution (horizontālā izšķirtspēja)', 'vertical_resolution (vertikālā izšķirtspēja)'],
            Video: ['color (krāsa)', 'duration (ilgums)', 'horizontal_resolution (horizontālā izšķirtspēja)', 'vertical_resolution (vertikālā izšķirtspēja)'],
            Skaņas: ['duration (ilgums)'],
        },
    },

    // WARNINGS
    ITEM_MISSING_NOTES: {
        id: 'ITEM_MISSING_NOTES',
        severity: 'WARNING',
        message_lv: 'Ieteicams pievienot piezīmes',
        description: 'Recommended to add notes to the item.',
        field: 'notes',
        condition: 'Does NOT apply to electronic textual documents (ELECTRONIC_DOCUMENTS category).',
    },
    PHOTO_LOW_HORIZONTAL_RESOLUTION: {
        id: 'PHOTO_LOW_HORIZONTAL_RESOLUTION',
        severity: 'WARNING',
        message_lv: 'Foto horizontālā izšķirtspēja ({value}px) ir zemāka par ieteikto minimumu ({threshold}px)',
        description: 'Photo horizontal resolution is below the recommended minimum of 1000px.',
        field: 'horizontal_resolution',
        threshold: 1000,
    },
    PHOTO_LOW_VERTICAL_RESOLUTION: {
        id: 'PHOTO_LOW_VERTICAL_RESOLUTION',
        severity: 'WARNING',
        message_lv: 'Foto vertikālā izšķirtspēja ({value}px) ir zemāka par ieteikto minimumu ({threshold}px)',
        description: 'Photo vertical resolution is below the recommended minimum of 1000px.',
        field: 'vertical_resolution',
        threshold: 1000,
    },
    VIDEO_SHORT_DURATION: {
        id: 'VIDEO_SHORT_DURATION',
        severity: 'WARNING',
        message_lv: 'Video ilgums ({duration}) ir īsāks par 1 minūti',
        description: 'Video duration is shorter than 1 minute. Verify the file is correct.',
        field: 'duration',
        threshold: '60 seconds',
    },
    AUDIO_SHORT_DURATION: {
        id: 'AUDIO_SHORT_DURATION',
        severity: 'WARNING',
        message_lv: 'Audio ilgums ({duration}) ir īsāks par 1 minūti',
        description: 'Audio duration is shorter than 1 minute. Verify the file is correct.',
        field: 'duration',
        threshold: '60 seconds',
    },
};

export const RECORD_RULES = {
    // ERRORS
    RECORD_MISSING_TITLE: {
        id: 'RECORD_MISSING_TITLE',
        severity: 'ERROR',
        message_lv: 'Dokumenta nosaukums ir obligāts',
        description: 'Record/document title is required.',
        field: 'title',
    },
    RECORD_MISSING_DATE: {
        id: 'RECORD_MISSING_DATE',
        severity: 'ERROR',
        message_lv: 'Dokumenta datums ir obligāts',
        description: 'Record/document date is required.',
        field: 'date',
    },
    ELECTRONIC_DOC_NO_FILES: {
        id: 'ELECTRONIC_DOC_NO_FILES',
        severity: 'ERROR',
        message_lv: 'Elektroniskajam dokumentam jābūt vismaz vienam failam',
        description: 'Electronic document must have at least one attached file.',
        field: 'files',
        condition: 'Only applies to ELECTRONIC_DOCUMENTS category.',
        helpChapter: 'records',
        helpSection: 'file-attachments-detail',
    },
    ELECTRONIC_MEDIA_NO_FILE: {
        id: 'ELECTRONIC_MEDIA_NO_FILE',
        severity: 'ERROR',
        message_lv: 'Elektroniskajam medijam jābūt tieši vienam failam',
        description: 'Electronic media record must have exactly one attached file.',
        field: 'files',
        condition: 'Only applies to ELECTRONIC_MEDIA category.',
    },

    // WARNINGS
    RECORD_MISSING_ANNOTATION: {
        id: 'RECORD_MISSING_ANNOTATION',
        severity: 'WARNING',
        message_lv: 'Ieteicams pievienot anotāciju labākai dokumentācijai',
        description: 'Recommended to add an annotation for better documentation.',
        field: 'annotation',
    },
    RECORD_MISSING_KEYWORDS: {
        id: 'RECORD_MISSING_KEYWORDS',
        severity: 'WARNING',
        message_lv: 'Ieteicami pievienot atslēgvārdus meklēšanas uzlabošanai',
        description: 'Recommended to add keywords to improve search.',
        field: 'key_words',
    },
};

export const FILE_RULES = {
    // ERRORS
    FILE_MISSING: {
        id: 'FILE_MISSING',
        severity: 'ERROR',
        message_lv: 'Fails ir pazudis vai ir izdzēsts',
        description: 'File is missing or has been deleted (no original_name).',
        field: 'original_name',
    },
    FILE_ZERO_SIZE: {
        id: 'FILE_ZERO_SIZE',
        severity: 'ERROR',
        message_lv: 'Failam ir nulles izmērs',
        description: 'File has zero byte size.',
        field: 'size',
    },
    FILE_TYPE_MISMATCH_PHOTO: {
        id: 'FILE_TYPE_MISMATCH',
        severity: 'ERROR',
        message_lv: 'Faila tips neatbilst foto medija tipam',
        description: 'File extension does not match the photo media type.',
        field: 'extension',
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'],
        condition: 'Only applies to ELECTRONIC_MEDIA + Foto inventories.',
    },
    FILE_TYPE_MISMATCH_VIDEO: {
        id: 'FILE_TYPE_MISMATCH',
        severity: 'ERROR',
        message_lv: 'Faila tips neatbilst video medija tipam',
        description: 'File extension does not match the video media type.',
        field: 'extension',
        allowedExtensions: ['.mp4', '.avi', '.mov', '.wmv', '.mkv'],
        condition: 'Only applies to ELECTRONIC_MEDIA + Video inventories.',
    },
    FILE_TYPE_MISMATCH_AUDIO: {
        id: 'FILE_TYPE_MISMATCH',
        severity: 'ERROR',
        message_lv: 'Faila tips neatbilst audio medija tipam',
        description: 'File extension does not match the audio media type.',
        field: 'extension',
        allowedExtensions: ['.mp3', '.wav', '.aac', '.ogg', '.m4a'],
        condition: 'Only applies to ELECTRONIC_MEDIA + Skaņas inventories.',
    },

    // WARNINGS
    FILE_LARGE_SIZE: {
        id: 'FILE_LARGE_SIZE',
        severity: 'WARNING',
        message_lv: 'Fails ir ļoti liels (>500MB) un var radīt problēmas pakotnes ģenerēšanā',
        description: 'File is very large (over 500MB) and may cause issues during OPEX package generation.',
        field: 'size',
        threshold: '500 MB (524,288,000 bytes)',
    },
    TEXTUAL_FILE_SMALL_SIZE: {
        id: 'TEXTUAL_FILE_SMALL_SIZE',
        severity: 'WARNING',
        message_lv: 'Tekstuālā dokumenta fails ir ļoti mazs ({size} KB). Pārliecinieties, ka fails ir pareizais',
        description: 'Textual document file is very small (under 2KB). Verify the file is correct.',
        field: 'size',
        threshold: '2 KB (2,048 bytes)',
        condition: 'Only applies to ELECTRONIC_DOCUMENTS category.',
    },
    FILE_MISSING_METADATA: {
        id: 'FILE_MISSING_METADATA',
        severity: 'WARNING',
        message_lv: 'Faila metadati ir nepilnīgi (trūkst nosaukuma vai paplašinājuma)',
        description: 'File metadata is incomplete (missing original_name or extension).',
        field: 'metadata',
    },
};

export const AGGREGATED_RULES = {
    FILE_VALIDATION_FAILED: {
        id: 'FILE_VALIDATION_FAILED',
        severity: 'ERROR',
        description: 'A file within this record has validation errors. Shown on the record node.',
    },
    RECORD_VALIDATION_FAILED: {
        id: 'RECORD_VALIDATION_FAILED',
        severity: 'ERROR',
        description: 'A record within this item has validation errors. Shown on the item node with full breadcrumb path.',
    },
    ITEM_VALIDATION_FAILED: {
        id: 'ITEM_VALIDATION_FAILED',
        severity: 'ERROR',
        description: 'An item within this inventory has validation errors. Shown on the inventory node with full breadcrumb path.',
    },
};

export const ALL_ERRORS = [
    // Project
    PROJECT_RULES.MISSING_SIGNERS,
    PROJECT_RULES.NO_INVENTORIES,
    // Inventory
    INVENTORY_RULES.INVENTORY_MISSING_NUMBER,
    INVENTORY_RULES.INVENTORY_MISSING_TYPE,
    INVENTORY_RULES.INVENTORY_NO_ITEMS,
    // Item
    ITEM_RULES.ITEM_MISSING_TITLE,
    ITEM_RULES.ITEM_MISSING_NUMBER,
    ITEM_RULES.ITEM_NO_RECORDS,
    ITEM_RULES.ITEM_NO_MEDIA_RECORDS,
    ITEM_RULES.MEDIA_RECORD_INCOMPLETE,
    // Record
    RECORD_RULES.RECORD_MISSING_TITLE,
    RECORD_RULES.RECORD_MISSING_DATE,
    RECORD_RULES.ELECTRONIC_DOC_NO_FILES,
    RECORD_RULES.ELECTRONIC_MEDIA_NO_FILE,
    // File
    FILE_RULES.FILE_MISSING,
    FILE_RULES.FILE_ZERO_SIZE,
    FILE_RULES.FILE_TYPE_MISMATCH_PHOTO,
    FILE_RULES.FILE_TYPE_MISMATCH_VIDEO,
    FILE_RULES.FILE_TYPE_MISMATCH_AUDIO,
];

export const ALL_WARNINGS = [
    // Item
    ITEM_RULES.ITEM_MISSING_NOTES,
    ITEM_RULES.PHOTO_LOW_HORIZONTAL_RESOLUTION,
    ITEM_RULES.PHOTO_LOW_VERTICAL_RESOLUTION,
    ITEM_RULES.VIDEO_SHORT_DURATION,
    ITEM_RULES.AUDIO_SHORT_DURATION,
    // Record
    RECORD_RULES.RECORD_MISSING_ANNOTATION,
    RECORD_RULES.RECORD_MISSING_KEYWORDS,
    // File
    FILE_RULES.FILE_LARGE_SIZE,
    FILE_RULES.TEXTUAL_FILE_SMALL_SIZE,
    FILE_RULES.FILE_MISSING_METADATA,
];

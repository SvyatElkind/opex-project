# OPEX Tool — Domain Guide

> Why the system works the way it does

---

## What is OPEX?

**OPEX (Open Preservation Exchange)** is a digital preservation format created by Preservica. It defines a standard way to package digital files together with their metadata for long-term archival storage. An OPEX package is essentially a structured ZIP file containing:
- The actual digital files (documents, photos, videos, audio)
- XML metadata describing each file (who created it, when, what it contains)
- A folder hierarchy that mirrors the archival structure

The Latvian National Archives uses OPEX for accepting electronic documents from government institutions.

---

## What is VVAIS?

**VVAIS (Valsts vienotā arhīvu informācijas sistēma)** — the Unified State Archives Information System of Latvia. It's the national database that tracks all archival fonds, inventories, and items across Latvian institutions.

When an institution needs to transfer documents to the archives, they first register their planned transfer in VVAIS, which generates a **report** (atskaite). This report contains:
- The institution's details (name, fond number, fond code)
- A list of inventories (uzskaites saraksti) with their types and date ranges
- Inventory numbers and storage terms

**This OPEX Tool imports that VVAIS report** as the starting point for building the digital package.

---

## The Archival Hierarchy — Why This Sequence?

The hierarchy is not arbitrary. It follows the **Latvian archival standards** (based on ISAD(G) international standard) for organizing records:

```
Project
  └── Institution (Iestāde)
        └── Fond (Fonds)
              └── Inventory (Uzskaites saraksts)
                    └── Item (Glabājamā vienība)
                          └── Record (Ieraksts/Dokuments)
                                └── File (Datne)
                                └── Metadata (Metadati)
```

### Each level explained:

**Project** — A working container. One project = one transfer to the archives. A project groups everything the institution will deliver in a single batch. It doesn't exist in the archival standard — it's a tool concept.

**Institution (Iestāde)** — The organization creating the records. Every project belongs to exactly one institution. The institution has signers (creator + approver) who formally authorize the transfer. These names appear on the acceptance report.

**Fond (Fonds)** — An archival fond is the entire body of records created by one institution. Fond number and code come from VVAIS. One institution = one fond. The fond is the highest level in the archival hierarchy.

**Inventory (Uzskaites saraksts)** — A listing of items grouped by type and time period. This is where the key decisions happen:

- **Type** determines what kind of records go inside:
  - `Tekstuāls` — textual documents (letters, reports, decrees)
  - `Foto` — photographs
  - `Video` — video recordings
  - `Skaņas` — audio recordings
- **Electronic flag** determines if files must be attached (electronic = yes, physical = no)
- **Storage term** determines how long records are kept:
  - `Pastāvīgi glabājamās lietas` — permanent storage (forever)
  - `Ilgstoši glabājamās lietas` — long-term storage (typically 75 years)

**Why can't you change the type after adding items?** Because the type determines the entire data model below — what fields are required on items, what kind of records can be created, what file types are accepted. Changing type would invalidate all existing items and records.

**Item (Glabājamā vienība, GV)** — A physical or logical storage unit. In physical archives, this is literally a folder or box. In digital archives, it's a logical grouping. Each item has:
- A sequential number within the inventory
- A series code (e.g., "1.2.3") indicating organizational structure
- Date range (when the documents inside were created)
- Language, access restrictions, security level

**Why does the item need a date range?** Because records inside an item are validated against the item's dates. A document from 2023 can't go into an item dated 2010-2015.

**Record (Ieraksts)** — An individual document or media file entry. The record type depends on the inventory type:

| Inventory Type | Record Type | Required Fields |
|---------------|-------------|-----------------|
| Tekstuāls (electronic) | Document record | title, date, reg_nr, nomenclature_nr, language |
| Foto (electronic) | Photo record | file + color, horizontal_resolution, vertical_resolution |
| Video (electronic) | Video record | file + color, resolution, duration |
| Skaņas (electronic) | Audio record | file + duration |

**Why the different fields per type?** The OPEX XML schema requires specific metadata per media type. Photos need resolution and color space. Videos need duration. Audio needs duration. These aren't optional — the archive will reject packages with missing metadata.

**File (Datne)** — The actual digital file attached to a record:
- Textual records can have **multiple files** (a document might consist of several scanned pages)
- Media records have **exactly one file** (one photo, one video, one audio clip)

**Metadata (Metadati)** — Additional structured data attached to textual records:
- **Actions (Darbības)** — tasks assigned to the document
- **Addressees (Adresāti)** — who the document was sent to
- **Visas (Vīzas)** — approval signatures
- **Read Status (Lasīšanas statuss)** — who has read the document

---

## The Four Categories

The combination of inventory type + electronic flag creates four distinct categories that drive the entire UI behavior:

| Category | Type | Electronic | Behavior |
|----------|------|-----------|----------|
| **Documents** | Tekstuāls | No | Physical documents. No file uploads. Multiple records per item. |
| **Electronic Documents** | Tekstuāls | Yes | Digital documents. Multiple files per record. Multiple records per item. |
| **Electronic Media** | Foto/Video/Skaņas | Yes | Digital media. One file per record. One record per item. Auto-extraction of metadata from file. |
| **Media** | Foto/Video/Skaņas | No | Physical media. No file uploads. One record per item. Manual metadata entry only. |

**Why does this matter?** The UI adapts completely:
- Electronic Documents show a file upload dropzone with multi-file support
- Electronic Media show a single file upload with auto-metadata extraction
- Physical types hide the file upload entirely
- Media types enforce one-record-per-item (you can't add a second photo to a photo item)

---

## Why the Sequence is Mandatory

You can't skip steps because each level depends on data from the level above:

1. **Project first** — Everything is scoped to a project. No project = nowhere to put data.

2. **VVAIS report (optional but recommended)** — Creates institution, fond, and initial inventories automatically. Without it, you'd have to create everything manually, and the fond/institution data must match VVAIS records exactly.

3. **Institution signers before export** — The acceptance report (PN akts) requires creator and signer names. Without them, the export is invalid.

4. **Inventory before items** — The inventory type determines what fields items need. An item in a Foto inventory requires annotation (content description). An item in a Tekstuāls inventory requires language. The system can't know what to validate without the inventory context.

5. **Inventory dates before items** — Item date ranges are validated against the inventory date range. An item can't have dates outside its inventory's period.

6. **Items before records** — Records are scoped to items. The record form adapts based on the item's parent inventory type. A record in a Foto inventory shows resolution fields. A record in a Tekstuāls inventory shows registration number and nomenclature fields.

7. **Records before files** — Files are attached to records, not items. The allowed file types depend on the record type (JPEG/PNG for photos, MP4 for video, etc.).

8. **Everything before verification** — Verification checks the entire tree: are all required fields filled? Do all electronic records have files? Are dates consistent? Do media records have metadata?

9. **Verification before export** — The OPEX package generator reads the verified data structure and produces XML. Missing data = malformed XML = archive rejection.

---

## The Verification System

Before export, the tool validates the entire project tree. The verification checks:

### Per Inventory:
- Has a valid type and storage term
- Has at least one item
- Date range is complete

### Per Item:
- Has series code, title, date range
- Language is set (except for Foto type)
- Annotation is set (required for media types)
- Date range falls within inventory date range
- Has at least one record (for electronic inventories)

### Per Record:
- Textual: has title, date, registration number, nomenclature number, language
- Media: has required metadata (color, resolution, duration per type)
- Electronic records have at least one file attached

### Per File:
- File exists and has content (size > 0)
- File type matches the inventory type constraints

Errors are **blocking** — you cannot export until all errors are resolved.
Warnings are **informational** — you can export but should review them.

---

## The Export Outputs

The tool produces three types of exports:

1. **Inventory List (Uzskaites saraksts)** — A spreadsheet listing all items in each inventory, formatted according to Latvian archival standards.

2. **Acceptance Report (Pieņemšanas-nodošanas akts)** — The formal document that both the institution and the archive sign when transferring records. Comes in two variants:
   - Electronic format (for digital records)
   - Physical format (for paper records)

3. **OPEX Package** — The actual digital preservation package. This is the final deliverable — a structured folder with:
   - OPEX XML manifests at each folder level
   - All digital files organized in the archival hierarchy
   - Metadata embedded in the XML files

   Comes in two variants based on storage term:
   - `Pastāvīgi` — permanent storage records
   - `Ilgstoši` — long-term storage records

---

## Glossary

| Latvian Term | English | Code Reference |
|-------------|---------|---------------|
| Projekts | Project | `Project.js` |
| Iestāde | Institution | `Institution.js` |
| Fonds | Archival Fond | `Fond.js` |
| Uzskaites saraksts | Inventory / Finding Aid | `Inventory*.js` |
| Glabājamā vienība (GV) | Item / Storage Unit | `Item*.js` |
| Ieraksts | Record / Document | `Record*.js` |
| Datne | File | `RecordFiles.js` |
| Metadati | Metadata | `RecordMetadata.js` |
| Tekstuāls | Textual | Inventory type |
| Foto | Photo | Inventory type |
| Video | Video | Inventory type |
| Skaņas | Audio/Sound | Inventory type |
| Elektronisks | Electronic | Inventory flag |
| Pastāvīgi glabājamās lietas | Permanent storage items | Storage term |
| Ilgstoši glabājamās lietas | Long-term storage items | Storage term |
| Sērijas kods | Series code | Item field |
| Reģistrācijas numurs | Registration number | Record field |
| Nomenklatūras numurs | Nomenclature number | Record field |
| Pieejamības ierobežojums | Access restriction | Record field (open/closed) |
| Vīza | Visa / Approval stamp | Metadata type |
| Adresāts | Addressee | Metadata type |
| VVAIS | State Archives Information System | External system |
| OPEX | Open Preservation Exchange | Export format |
| PN akts | Acceptance report | Export document |

# CSV / Excel imports (eksperimentāla funkcija) — plāns

Sagatavots 2026-07-30.

> **Statuss (2026-07-30): 1.–6. fāze ieviesta.** Kods uzrakstīts un kompilējas;
> loģika pārklāta ar 60 testiem (`DevAdmin/testing/suites/importTests.js`) un
> `.xlsx` lasītājs — ar atsevišķu jest testu pret **īsto paraugfailu**
> (`Utils/xlsxReader.test.js`, `npm test`). Reālajā lietotnē ar īstu backend vēl
> **nav izspēlēts** — tas ir nākamais solis (10. sadaļas rokas scenāriji).
>
> Divi lēmumi, kas plānā bija atvērti (13. sadaļa), ieviešot izlemti:
> - **XLSX bibliotēka:** izvēlēts **D variants — savs minimāls lasītājs bez
>   atkarībām** (`Utils/xlsxReader.js`). Iemesls: jaunu npm atkarību nevar
>   instalēt, un `xlsx`/SheetJS npm versija ir ar zināmu CVE. Rezultāts: ~200
>   rindas, nulle atkarību, strādā ar īstu Excel failu (tests to pierāda).
> - **Netiešā piesaiste** (`DOK` rinda bez `SAITE`) — **atstāta**, jo
>   priekšskatījums katrai rindai parāda, kurai vienībai tā piesaistīsies, tāpēc
>   kārtošanas pārpratums ir redzams pirms importa.
>
> Paraugfaili: `opex_tool_frontend/public/examples/` (skat. 12. sadaļu).

Balstīts uz koda izvērtējumu: `Settings/context/SettingsContext.jsx`, `Settings/Settings.jsx`,
`Settings/components/*`, `items/serializers.py`, `items/helpers/constants.py`, `items/models.py`,
`records/serializers.py`, `records/models.py`, `records/helpers/validators.py`,
`project/helpers/helpers_export.py`, `helpers/local_imports.py`,
`Constants/itemConstants.js`, `Constants/recordConstants.js`, `Constants/bulkConstants.js`,
`hooks/useBulkOperations.js`, `opex_tool_frontend/package.json`.

---

## 1. Mērķis

Lietotājam bieži apraksti jau eksistē Excel tabulā (piem. iestādes lietu nomenklatūra vai
iepriekš sagatavots saraksts). Šobrīd tie jāpārraksta rokā. Imports ļauj vienā gājienā
izveidot glabājamās vienības un/vai ierakstus no `.csv` vai `.xlsx` faila.

Prasības, kas nosaka dizainu:

- **Viss notiek frontendā. Backend netiek mainīts — ne rindiņu.** Faila lasīšana,
  kolonnu kartēšana, vērtību pārveide, validācija un izpildes secība ir pārlūkā; datu
  saglabāšanai tiek lietoti tie paši esošie galapunkti, ko lieto formas
  (`POST /project/{id}/item/?inventory_id=…`, `POST /project/{id}/record/?item_id=…`).
  Nekādu jaunu galapunktu, serializeru lauku vai migrāciju.
- **Funkcija ir izslēdzama un pēc noklusējuma izslēgta** (iestatījumos).
- Lietotājam **skaidri jāpasaka, ka funkcija ir eksperimentāla** un nav rādītājs pārējā
  rīka kvalitātei.
- Struktūrai jādarbojas **daļēji un pilnībā**: tikai vienības; tikai ieraksti konkrētās
  vienībās; vai vienības kopā ar to ierakstiem vienā failā.

---

## 2. Ko parādīja izmeklējums (fakti, kas nosaka risinājumu)

1. **Vienības POST atbilde neatgriež `id`.** `ItemSerializer.Meta.fields` =
   `CREATE_ITEM_FIELDS + ['related_item_list', 'related_items', 'number', 'size',
   'unit_of_measure']` — `id` sarakstā **nav** (`items/serializers.py`,
   `items/helpers/constants.py`). Bet ieraksta izveidei ir vajadzīgs vecākvienības `id`
   (`?item_id=`). Tāpēc jauktā faila (vienības + ieraksti) imports **nevar** vienā solī
   izveidot vienību un uzreiz tai ierakstu.

   **Risinājums (frontend, bez backend izmaiņām):** POST atbilde satur `number` (tas ir
   `read_only`, bet serializēts), un `(number, inventory)` datubāzē ir unikāls
   (`unique_item_inventory_number`). Tāpēc: 1) izveido visas vienības, pierakstot
   atgriezto `number` pie tās faila rindas; 2) **nogaida** projekta datu pārlādi;
   3) uzbūvē karti `number → id` mērķa uzskaites sarakstam; 4) izveido ierakstus.
   Detalizēti 7.5. sadaļā.

   > **Backend netiek mainīts.** Serializerī varētu pievienot `'id'` un otrais solis
   > nebūtu vajadzīgs, bet tas ir apzināti atmests — visa šī funkcionalitāte ir tikai
   > frontendā, un backend paliek neaiztikts. Cena: viens papildu `GET` uz visu importu
   > un atkarība no tā, ka pārlāde izdodas (rīcība neveiksmes gadījumā — 7.5.).

2. **GV numurus piešķir serveris.** `Item.add_item()` pārraksta klienta doto numuru ar
   `inventory.last_gv + 1`. Failā **nedrīkst** būt GV numura kolonna jaunām vienībām —
   tās tiek pievienotas faila secībā saraksta beigās. Tāpēc arī ierakstu piesaiste jaunām
   vienībām nevar notikt pēc GV numura; vajag atsevišķu saites kolonnu (skat. 3.2.).

3. **Imports = vēl viens rindu avots jau uzbūvētajai grupas dzinējam.** Vairāku izveides
   loģika jau eksistē (`hooks/useBulkOperations.js` — secīga izpilde, progress,
   apturēšana, godīgs rezultāts; `MULTI_EDIT_PLAN.md` 3.–4. fāze). Imports pievieno
   priekšā tikai **parsēšanu + kolonnu kartēšanu + priekšskatījumu**; izpilde, validācija
   (`validateItemCreate`, `validateTextRecordCreate`), payload veidošana
   (`getRecordCreatePayload`) un rezultātu atskaite tiek lietota bez pārrakstīšanas.

4. **Esošais XLSX eksports NAV importējams atpakaļ.** `export_inventories_to_xlsx()` veido
   oficiālo uzskaites saraksta veidlapu ar apvienotām šūnām un salipinātām vērtībām
   (`{pie}` = pieejamība + pamatojums vienā šūnā; `{piez}` = datņu nosaukumi + piezīmes
   vienā šūnā). To nedrīkst jaukt ar importa formātu, un lietotājam tas ir jāpasaka
   tieši — pretējā gadījumā viņš mēģinās importēt eksportēto failu.

5. **Frontendā nav neviena CSV/XLSX bibliotēkas.** `package.json` — nav `xlsx`,
   `exceljs`, `papaparse`, nekā. CSV var parsēt bez bibliotēkas; XLSX (ZIP+XML) — nevar.
   Skat. 7. sadaļu (bibliotēkas izvēle) un 9. fāzēšanu.

6. **Ierakstu izveide darbojas tikai elektroniskiem tekstuāliem sarakstiem**
   (`validate_if_text_type_and_electronic`), un mediju vienībai drīkst būt tikai viens
   mediju ieraksts (`validate_if_record_exists`). Tāpēc `DOK` rindas ir atļautas tikai
   `Tekstuāls` + elektronisks sarakstā; citur imports pieņem tikai `GV` rindas.

7. **Datnes (faili) nav importējamas no tabulas.** Pārlūks no teksta ceļa nevar nolasīt
   datni. Tāpēc `DATNE` kolonnas v1 formātā **nav** — lai nerada nepatiesu gaidu. Nākotnē:
   lietotājs pievieno datņu mapi, un imports tās sasaista pēc nosaukuma (11. sadaļa).

8. **Iestatījumi glabājas `localStorage`** (`opex_settings`) ar `{...DEFAULT_SETTINGS,
   ...stored}` sapludināšanu — **sekla**. Jaunam `experimental` objektam jālasa katra
   atslēga ar noklusējuma atkāpi (`settings.experimental?.spreadsheetImport === true`),
   nevis jāpieņem, ka viss objekts ir klāt.

---

## 3. Faila struktūra

### 3.1. Viena tabula ar rindas tipu — kāpēc tā

CSV **nav lapu (sheets)**, tāpēc "vienības vienā lapā, ieraksti otrā" nozīmētu divus
atšķirīgus formātus CSV un Excel gadījumam. Tāpēc formāts ir **viena tabula, kurā katrai
rindai ir tips**:

| Kolonna | Nozīme |
|---|---|
| `TIPS` | `GV` = glabājamā vienība, `DOK` = dokuments (ieraksts). Pieņem arī `ITEM` / `RECORD` |
| `SAITE` | Saite starp `DOK` rindu un tās vecākvienību (skat. 3.2.) |

Excel gadījumā tiek lasīta **pirmā lapa** (vai lapa ar nosaukumu `DATI`, ja tāda ir).
Pārējās lapas tiek ignorētas — tāpēc paraugfailā otrā lapa (`INSTRUKCIJA`) ir drošs veids,
kā turēt pamācību tajā pašā failā.

### 3.2. `SAITE` — kā ieraksts atrod savu vienību

| `SAITE` vērtība `DOK` rindā | Nozīme |
|---|---|
| tukša | Pieder **tuvākajai augstāk esošajai `GV` rindai** (ērti, bet jutīgi pret rindu kārtošanu Excel) |
| `A`, `1`, `protokoli-2020` … | Pieder tai jaunajai vienībai, kuras `GV` rindā `SAITE` ir tā pati vērtība |
| `GV:12` | Pieder **jau esošai** vienībai ar GV numuru 12 šajā uzskaites sarakstā |

`GV` rindās `SAITE` ir brīvi izvēlēta atslēga (jāaizpilda tikai tad, ja to lieto `DOK`
rindas). Atslēgas eksistē **tikai faila ietvaros** — datubāzē tās neienāk.

Priekšskatījumā katrai `DOK` rindai tiek parādīts, **kurai vienībai tā tiešām piesaistīsies**
("→ jaunā GV #3 (rinda 2)" / "→ esošā GV 12"), lai netieša piesaiste nav akla.

### 3.3. Trīs lietojuma veidi ar vienu un to pašu formātu

**A. Tikai vienības** — failā tikai `GV` rindas:

```
TIPS ; SAITE ; SĒRIJAS_KODS ; NOSAUKUMS                    ; DATUMS_NO  ; DATUMS_LĪDZ
GV   ;       ; 1.2          ; Sēdes protokoli 2020. I cet. ; 01.01.2020 ; 31.03.2020
GV   ;       ; 1.2          ; Sēdes protokoli 2020. II cet.; 01.04.2020 ; 30.06.2020
```

**B. Tikai ieraksti esošās vienībās** — tikai `DOK` rindas ar `GV:<numurs>`:

```
TIPS ; SAITE ; NOSAUKUMS         ; DATUMS     ; REĢ_NR
DOK  ; GV:12 ; Protokols Nr. 1   ; 15.01.2020 ; 1-15/1
DOK  ; GV:12 ; Protokols Nr. 2   ; 20.02.2020 ; 1-15/2
DOK  ; GV:13 ; Vēstule VARAM     ; 05.03.2020 ; 1-19/7
```

Ja imports tiek atvērts **konkrētas vienības** dokumentu cilnē, `SAITE` nav vajadzīga —
visas `DOK` rindas piesaistās tai vienībai (skat. 4.2.).

**C. Vienības ar ierakstiem** — abi tipi vienā failā:

```
TIPS ; SAITE ; SĒRIJAS_KODS ; NOSAUKUMS                    ; DATUMS_NO  ; DATUMS_LĪDZ ; DATUMS     ; REĢ_NR
GV   ; A     ; 1.2          ; Sēdes protokoli 2020. I cet. ; 01.01.2020 ; 31.03.2020  ;            ;
DOK  ; A     ;              ; Protokols Nr. 1              ;            ;             ; 15.01.2020 ; 1-15/1
DOK  ; A     ;              ; Protokols Nr. 2              ;            ;             ; 20.02.2020 ; 1-15/2
GV   ; B     ; 1.3          ; Sarakste ar VARAM 2020       ; 01.01.2020 ; 31.12.2020  ;            ;
DOK  ; B     ;              ; Vēstule Nr. 1-19/7           ;            ;             ; 05.03.2020 ; 1-19/7
```

### 3.4. Kolonnas

Kolonnu **secība nav svarīga**; svarīgi ir virsraksti. Virsrakstu atpazīšana ir
"piedodoša": reģistrs, atstarpes/pasvītras un garumzīmes tiek normalizētas
(`Sērijas kods` = `SERIJAS_KODS` = `sērijas_kods`). Neatpazītas kolonnas tiek **ignorētas
ar brīdinājumu**, nevis kļūdu.

#### `GV` rindas (glabājamā vienība)

| Kolonna | Oblig. | Vērtības / formāts | Modeļa lauks |
|---|---|---|---|
| `SĒRIJAS_KODS` | ✔ | `1`, `1.2`, `1.2.3` (bez sākuma nullēm) | `series_code` |
| `NOSAUKUMS` | ✔ | teksts līdz 1000 | `title` |
| `DATUMS_NO` | ✔ | skat. 3.5. | `start_date` |
| `DATUMS_LĪDZ` | ✔ | skat. 3.5. | `end_date` |
| `DATUMA_PRECIZITĀTE` | – | `diena` / `mēnesis` / `gads` (ja tukšs — nolasa no datuma pieraksta) | `date_indicator` |
| `DATUMA_PIEZĪMES` | – | teksts | `date_note` |
| `VALODA` | ✔¹ | vairākas atdalītas ar `;` vai `,` (`Latviešu; Krievu`) | `language` |
| `SATURS` | ✔² | teksts līdz 2000 | `annotation` |
| `PIEZĪMES` | – | teksts līdz 1000 | `notes` |
| `SISTEMATIZĀCIJA` | – | teksts | `sistematisation` |
| `APJOMS` | – | vesels skaitlis (tikai papīra sarakstiem) | `size` |
| `APJOMA_MĒRVIENĪBA` | – | `Lapas` / `Dokumenti` / `Glabājamās vienības` | `unit_of_measure` |
| `PIEEJAMĪBA` | – | `Vispārēja` / `Ierobežota` / `Sensitīvi dati` (nokl. `Vispārēja`) | `restriction` |
| `PIEEJAMĪBAS_PAMATOJUMS` | ✔³ | teksts | `restriction_note` |
| `SLEPENĪBA` | – | `Publisks` / `Iekšējs` / `Konfidenciāls` / `Slepens` | `security_level` |
| `SLEPENĪBAS_PIEZĪMES` | – | teksts | `security_level_note` |
| `KOPIJA` | – | teksts | `copy` |
| `ARHĪVA_VĒSTURE` | – | teksts | `archival_history` |

¹ nav obligāta `Foto` tipa sarakstos · ² obligāts tikai `Foto`/`Video`/`Skaņas` ·
³ obligāts, ja `PIEEJAMĪBA` nav `Vispārēja`

#### `DOK` rindas (ieraksts)

| Kolonna | Oblig. | Vērtības / formāts | Modeļa lauks |
|---|---|---|---|
| `NOSAUKUMS` | ✔ | teksts līdz 500 | `title` |
| `DATUMS` | ✔ | jābūt vecākvienības datumu robežās | `date` |
| `REĢ_NR` | ✔ | teksts līdz 30 | `reg_nr` |
| `IZVEIDOŠANAS_DATUMS` | ✔ | datums (`blank=False` modelī) | `created_date` |
| `NOSŪTĪŠANAS_DATUMS` | ✔ | datums (`blank=False` modelī) | `sent_date` |
| `LIETAS_NR` | ✔ | teksts līdz 30 | `nomenclature_nr` |
| `VALODA` | ✔ | vairākas ar `;` | `language` |
| `NOSŪTĪTĀJA_REĢ_NR` | – | teksts | `sent_reg_nr` |
| `GRUPA` | – | teksts (`Iekšējs`, `Saņemts`…) | `group` |
| `ATSLĒGVĀRDI` | – | atdalīti ar `,` | `key_words` |
| `ANOTĀCIJA` | – | teksts līdz 500 | `annotation` |
| `PIEZĪMES` | – | teksts līdz 500 | `notes` |
| `TEHNISKĀ_INFORMĀCIJA` | – | teksts | `tech_info` |
| `PIEEJAMĪBA` | – | `Vispārēja` → `open`, `Ierobežota` → `closed` (nokl. `Vispārēja`) | `access_restriction` |
| `IEROBEŽOJUMA_DATUMS` | ✔⁴ | datums; ja `Vispārēja` — **jābūt tukšam** | `access_restriction_date` |
| `IEROBEŽOJUMA_PIEZĪMES` | – | teksts līdz 30 | `access_restriction_notes` |
| `LIETOŠANAS_NOSACĪJUMI` | – | teksts līdz 30 | `user_restriction_notes` |

⁴ obligāts un atļauts **tikai** tad, ja `PIEEJAMĪBA` = `Ierobežota`

`NOSAUKUMS`, `VALODA`, `PIEZĪMES`, `PIEEJAMĪBA`, `ANOTĀCIJA`/`SATURS` ir kopīgas kolonnas ar
tipa atkarīgu nozīmi — tas ļauj tabulu uzturēt šauru. `SATURS` ir vienības lauks,
`ANOTĀCIJA` — ieraksta.

### 3.5. Datumu formāti

Pieņem: `2020-01-15`, `15.01.2020`, `15/01/2020`, `2020-01`, `01.2020`, `2020`,
un **īstas Excel datuma šūnas** (Excel tās glabā kā skaitli — parsētājam tas jāapstrādā,
nevis jāiedod `44210` kā tekstu).

Precizitāte, ja `DATUMA_PRECIZITĀTE` tukša: `2020` → `gads`, `01.2020` → `mēnesis`,
pilns datums → `diena`. Gada/mēneša precizitātē datums tiek "pievilkts" tāpat kā
`CalendarComponent` to dara formās (1. janvāris / 31. decembris; mēneša pirmā/pēdējā diena),
lai backend `DateField` to pieņem.

### 3.6. CSV īpatnības (praktiski, nevis teorētiski)

- **Atdalītājs:** `;` vai `,` — nosaka automātiski pēc pirmās rindas. Latviešu Windows
  Excel "CSV UTF-8" saglabā ar `;`, tāpēc paraugfails ir ar `;`.
- **Kodējums:** nolasa kā baitus, pēc BOM nosaka UTF-8 / UTF-16. Ja BOM nav, mēģina
  UTF-8 (`TextDecoder('utf-8', {fatal:true})`) un, ja tas neizdodas, atkāpjas uz
  `windows-1257` (latviešu ANSI, ko raksta Excel "CSV (Comma delimited)"). Tas ir
  vienīgais veids, kā garumzīmes nesabojājas — un tas ir tipiskākais reālais klupšanas
  akmens.
- **Pēdiņas:** RFC 4180 — `"…"` ar `""` iekšā, atļautas jaunas rindas pēdiņās.
- **Rindu gali:** `CRLF` un `LF`.
- **Tukšas rindas** tiek izlaistas; rindas, kur visas šūnas tukšas, netiek uzskatītas par kļūdu.

---

## 4. Kā lietotājs to lieto

### 4.1. Ieslēgšana (pēc noklusējuma izslēgts)

Jauna iestatījumu cilne **"Eksperimentāli"** (`Settings.jsx` `tabs` + jauns
`components/ExperimentalSettings.jsx`):

```
╔══════════════════════════════════════════════════════════════════════════╗
║ ⚠ Eksperimentālās funkcijas                                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║ Šīs funkcijas ir izstrādes stadijā. Tās var nedarboties pareizi, var     ║
║ mainīties vai pazust nākamajās versijās, un **tās nav rādītājs pārējā**  ║
║ **rīka kvalitātei un gatavībai**. Ieslēdz tās tikai tad, ja esi gatavs   ║
║ pārbaudīt rezultātu ar rokām.                                            ║
║                                                                          ║
║ ☐ Imports no CSV / Excel faila                            [EKSPERIMENTĀLS]║
║   Ļauj izveidot glabājamās vienības un ierakstus no tabulas faila.       ║
║   Fails tiek apstrādāts tikai šajā datorā — nekur netiek sūtīts.         ║
║   Rezultāts pēc importa ir jāpārbauda. Atsaukšanas iespējas nav.         ║
║   [Lejupielādēt paraugfailus: CSV · Excel]                              ║
╚══════════════════════════════════════════════════════════════════════════╝
```

Kamēr slēdzis ir izslēgts, importa ieejas punktu **nav nekur** — ne izvēlnēs, ne taustiņos.

### 4.2. Ieejas punkti

| Kur | Ko importē | `SAITE` vajadzīga? |
|---|---|---|
| Vienību tabulas `＋` izvēlne → "Importēt no faila (eksperimentāls)" | `GV` un/vai `DOK` rindas šajā uzskaites sarakstā | Jā, `DOK` rindām (vai netieši pēc secības) |
| Vienības "Dokumenti" cilnes `＋` izvēlne → "Importēt ierakstus no faila" | tikai `DOK` rindas šai vienībai | Nē — visas rindas piesaistās šai vienībai |

Tas tieši atbilst prasībai "daļēji un pilnībā": viss uzskaites saraksts, vai tikai vienas
vienības dokumenti.

### 4.3. Importa logs — četri soļi

```
╔════════════════════════════════════════════════════════════════════════════════╗
║ ⚠ EKSPERIMENTĀLS  Imports no CSV / Excel                                  (?)  ║
║ Rezultāts jāpārbauda ar rokām. Atsaukt nevar. Fails netiek nekur sūtīts.        ║
╠════════════════════════════════════════════════════════════════════════════════╣
║ 1. FAILS                                                                       ║
║    [ Izvēlēties failu ]  vai ievelc šeit                                       ║
║    ✔ nomenklatura_2020.csv · CSV · UTF-8 · atdalītājs ";" · 43 rindas           ║
║    [Lejupielādēt paraugfailu]                                                  ║
║                                                                                ║
║ 2. KOLONNAS                                                                    ║
║    Atpazītas 18 no 19 kolonnām                                                 ║
║    ⚠ "PIEVIENOTĀ DATNE" — nav atpazīta, tiks ignorēta                          ║
║    ⚠ Kolonna "IZVEIDOŠANAS_DATUMS" nav atrasta — obligāta DOK rindām           ║
║      [ Piekārtot kolonnu manuāli ▾ ]                                           ║
║                                                                                ║
║ 3. PRIEKŠSKATĪJUMS                                                             ║
║    ┌────┬──────┬─────────────────────────────┬──────────────────┬────┐         ║
║    │ Nr.│ Tips │ Nosaukums                   │ Piesaiste        │ ✔  │         ║
║    ├────┼──────┼─────────────────────────────┼──────────────────┼────┤         ║
║    │ 2  │ GV   │ Sēdes protokoli 2020. I cet.│ jauna GV (#13)   │ ✔  │         ║
║    │ 3  │ DOK  │ Protokols Nr. 1             │ → rinda 2        │ ✔  │         ║
║    │ 4  │ DOK  │ Protokols Nr. 2             │ → rinda 2        │ ✖  │ ← datums ārpus GV robežām
║    │ 5  │ DOK  │ Vēstule                     │ → esošā GV 12    │ ✔  │         ║
║    └────┴──────┴─────────────────────────────┴──────────────────┴────┘         ║
║    Derīgas: 40 · Ar kļūdu: 3 (tiks izlaistas)  [Rādīt tikai kļūdas]            ║
╠════════════════════════════════════════════════════════════════════════════════╣
║ Izveidos 12 vienības un 28 ierakstus        [Atcelt]  [Importēt 40]            ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

4. solis — izpilde un rezultāts: tā pati progresa josla un godīgais rezultātu saraksts, kas
jau ir vairāku izveidē (`BulkProgress`), plus divfāžu norāde:
`Vienības 12/12 ✔ · Ieraksti 26/28 (2 neizdevās)`.

Kļūdas rindas paliek redzamas ar rindas numuru **failā**, lai lietotājs tās var atrast un
labot avota tabulā.

---

## 5. Eksperimentālās funkcijas ietvars

Trīs vietas, kur tas ir pateikts (apzināti atkārtoti):

1. **Iestatījumos** — cilne ar brīdinājumu un slēdzi (4.1.), pēc noklusējuma izslēgts.
2. **Ieejas punktā** — izvēlnes ierakstam blakus `EKSPERIMENTĀLS` nozīmīte.
3. **Logā** — pastāvīga (neaizveramā) brīdinājuma josla galvā, kas nepazūd ritinot.

Formulējums (galīgais teksts, latviski):

> **Eksperimentāla funkcija.** Šī funkcija ir izstrādes stadijā un nav rādītājs pārējā
> rīka kvalitātei. Tā var apstrādāt failu nepilnīgi vai nepareizi. Pēc importa
> rezultāts **obligāti jāpārbauda**. Atsaukšanas iespējas nav — kļūdas gadījumā
> izveidotās vienības un ieraksti jādzēš ar rokām.

Papildus jāpasaka arī tas, ko lietotājs varētu baidīties: **fails tiek apstrādāts tikai
šajā datorā un nekur netiek augšupielādēts** (rīks ir lokāls, un imports to nemaina).

---

## 6. Ieteikums: pirms importa — eksports

Tā kā atsaukšanas nav, logā (2. solī) ir saite **"Vispirms saglabā uzskaites saraksta
kopiju"**, kas izsauc jau esošo XLSX eksportu. Tas nav tehnisks aizsargs, bet praktisks —
un lēts, jo eksports jau eksistē.

---

## 7. Tehniskā arhitektūra

### 7.1. Parsēšanas plūsma (viss pārlūkā)

```
Fails
  ├─ .csv ─→ baiti ─→ kodējuma noteikšana (BOM / UTF-8 / windows-1257)
  │                 ─→ atdalītāja noteikšana ─→ RFC4180 parsētājs ─→ string[][]
  └─ .xlsx ─→ lapas nolasīšana (skat. 7.2.) ─→ šūnu vērtības (t.sk. datumu šūnas) ─→ any[][]
                                   │
                                   ▼
              virsrakstu rinda (meklē pirmo rindu, kur ir atpazīstams virsraksts)
                                   ▼
              kolonnu normalizācija + kartēšana uz modeļa laukiem
                                   ▼
              rindu tipizācija (GV / DOK) + SAITE atrisināšana
                                   ▼
              vērtību pārveide (datumi, saraksti, uzskaitījumi)
                                   ▼
              validācija: validateItemCreate / validateTextRecordCreate
                                   ▼
              priekšskatījums  ─→  divfāžu secīga izpilde (useBulkRunner)
```

### 7.2. XLSX lasīšana — izvēle jāizdara

| Variants | Plusi | Mīnusi |
|---|---|---|
| **A. `read-excel-file`** (npm, tikai lasīšana) | mazs, uzturēts, tieši šim uzdevumam | jauna atkarība; jāinstalē (`npm i`) |
| **B. `exceljs`** (npm) | pilns lasīt/rakstīt, plaši lietots | liels (~1 MB), vairāk nekā vajag |
| **C. `xlsx` / SheetJS no npm** | "acīmredzamā" izvēle | **npm versija 0.18.5 ir ar zināmu CVE (prototype pollution); labojums pieejams tikai SheetJS pašu CDN, ne npm.** Arhīva rīkam nav pieņemami |
| **D. Savs minimāls lasītājs** (ZIP + `DecompressionStream('deflate-raw')` + `DOMParser`) | nulle atkarību, viss pārlūkā | ~200 rindas smalka koda; jāapstrādā `sharedStrings`, inline virknes, datumu sērijas numuri, ZIP64 malu gadījumi |

**Ieteikums:** A. Ja jauna atkarība nav pieņemama — D, apzinoties riskus. C nelietot.
Līdz XLSX daļa nav gatava, Excel lietotājiem der `Saglabāt kā → CSV UTF-8`.

### 7.3. Jauni faili

| Fails | Saturs |
|---|---|
| `Constants/importConstants.js` | Kolonnu vārdnīca (virsraksts → lauks + tips), uzskaitījumu kartes, `TIPS`/`SAITE` konstantes, obligātie lauki pa tipiem |
| `Utils/csvParser.js` | Kodējuma un atdalītāja noteikšana + RFC4180 parsētājs (bez atkarībām) |
| `Utils/xlsxReader.js` | XLSX → `any[][]` (7.2. varianta ietvars; vienā vietā, lai varianta maiņa neizplatās) |
| `Utils/importMapper.js` | `string[][]` → tipizētas rindas, `SAITE` atrisināšana, vērtību pārveide, validācija; **tīra funkcija, pilnībā testējama** |
| `components/ImportPopup.jsx` + `.css` | 4 soļu logs; lieto `BulkProgress` un `useBulkRunner` |
| `Item/ImportItemsPopup.jsx` | Uzskaites saraksta konteksts (GV+DOK), divfāžu izpilde |
| `Record/ImportRecordsPopup.jsx` | Vienas vienības konteksts (tikai DOK) |
| `Settings/components/ExperimentalSettings.jsx` | Cilnes saturs ar brīdinājumu un slēdžiem |
| `Constants/uiStrings/importUI.js` | Visi jaunie latviešu teksti (`IMPORT_UI`) |
| `DevAdmin/testing/suites/importTests.js` | Parsētāja un kartētāja testi (skat. 10.) |
| `public/examples/*` | **Jau sagatavoti** paraugfaili (12. sadaļa) |

### 7.4. Mainītie faili

- `Settings/Settings.jsx` — jauna cilne `experimental`.
- `Settings/context/SettingsContext.jsx` — `experimental: { spreadsheetImport: false }`
  `DEFAULT_SETTINGS`, un lasīšana ar atkāpi (2.8. dēļ).
- `Item/Items.js`, `Record/RecordsList.js` — izvēlnēs papildu ieraksts, tikai ja slēdzis ieslēgts.
- `Constants/helpConstants.js` — jauna sadaļa par importu (ar brīdinājumu un kolonnu tabulu).
- `CHANGELOG.md` — obligāti.

### 7.5. Izpilde: divas fāzes (viss frontendā)

```
1. fāze: GV rindas ─ secīgi POST /item/?inventory_id=…
                     katrai rindai pieraksta atbildes `number`
             ▼
   nogaidīta projekta datu pārlāde  ─→  karte  number → id     (2.1. dēļ)
             ▼
2. fāze: DOK rindas ─ secīgi POST /record/?item_id=…
                     vecāks: SAITE → (jaunā GV rinda → number → id)  vai  GV:<nr> → id
```

Precīzi, ar esošajiem instrumentiem:

```js
// 1. fāze — tā pati secīgā izpilde, kas vairāku izveidē (useBulkRunner)
const { data } = await bulkApi.createItem(projectId, inventoryId, payload);
createdNumbers.set(row.key, data.number);          // id atbildē NAV

// starp fāzēm — pārlāde, ko OBLIGĀTI jānogaida
const project = await queryClient.fetchQuery({
    queryKey: QUERY_KEYS.project(projectId),        // ['project','detail',projectId]
    queryFn: async () => (await get(`/project/${projectId}/`)).data,
});

// karte number → id tikai mērķa uzskaites sarakstam
const inventory = project.institution.fond.inventories.find(inv => inv.id === inventoryId);
const idByNumber = new Map(inventory.items.map(item => [item.number, item.id]));
```

`invalidateQueries` šeit **nepietiek** — tas tikai atzīmē datus par novecojušiem un
karte tiktu būvēta no vecā keša. Vajag `fetchQuery`/`refetchQueries`, ko var nogaidīt.

Rīcība neveiksmēs — katra ar savu skaidru ziņojumu, nevis klusu izlaišanu:

| Kas notiek | Rīcība |
|---|---|
| 1. fāzē vienība neizdodas | Tās `DOK` rindas tiek izlaistas ar iemeslu "vecākvienība netika izveidota" |
| Pārlāde neizdodas | Imports apstājas pēc 1. fāzes. Ziņojums: "N vienības izveidotas, bet ierakstus nevarēja piesaistīt. Aizver logu, pārbaudi sarakstu un importē ierakstus atsevišķi ar `SAITE = GV:<numurs>`." Izveidotais netiek dzēsts un netiek slēpts |
| `number` nav atrodams kartē | Tā ieraksta rinda ✖ ("neizdevās atrast izveidoto vienību"), pārējās turpina |
| Lietotājs nospiež "Apturēt" 1. fāzē | 2. fāze nesākas; parāda, cik vienību izveidots |

---

## 8. Kļūdu apstrāde un limiti

| Situācija | Rīcība |
|---|---|
| Nezināma kolonna | Brīdinājums 2. solī, kolonna ignorēta |
| Trūkst obligātas kolonnas | Brīdinājums + iespēja piekārtot manuāli; ja nav — attiecīgā tipa rindas nav derīgas |
| Rindas kļūda (validācija) | Rinda atzīmēta ✖ ar iemeslu; imports turpinās bez tās |
| `GV:<nr>` neeksistē | Rinda ✖ ("vienība ar GV numuru N nav atrasta") |
| Divas `GV` rindas ar vienādu `SAITE` | Rinda ✖ ("atslēga lietota divreiz") |
| `DOK` rinda bez piesaistes | Rinda ✖ ("nav norādīta vecākvienība") |
| `DOK` rindas neelektroniskā/nemateriālā sarakstā | Bloķēts jau 2. solī ar paskaidrojumu (2.6.) |
| Sabojāts kodējums (mojibake) | Brīdinājums ar ieteikumu saglabāt kā "CSV UTF-8" |
| > 200 rindas | Brīdinājums par ilgumu (tik pat atsevišķu pieprasījumu) |
| > 1000 rindas | Bloķēts; ieteikums sadalīt failu (pārlūks nav pakešu apstrādes rīks) |
| Tukšs fails / nav virsrakstu rindas | Skaidra kļūda, nevis 0 rindu imports |

---

## 9. Fāzes

| Fāze | Saturs |
|---|---|
| **1** ✅ | Iestatījumu cilne + slēdzis + brīdinājumi (bez importa funkcionalitātes) |
| **2** ✅ | `csvParser.js` + `importMapper.js` + testi — **CSV, bez jaunām atkarībām** |
| **3** ✅ | `ImportPopup` (4 soļi) + `ImportItemsPopup` ar divfāžu izpildi |
| **4** ✅ | `ImportRecordsPopup` (tikai vienas vienības dokumenti) |
| **5** ✅ | XLSX atbalsts — savs lasītājs bez atkarībām (7.2. D variants) |
| **6** ✅ | Palīdzības sadaļa + paraugfailu lejupielādes saites logā un iestatījumos |
| **7** ⏸ | *Vēlāk:* datņu mape → piesaiste pēc nosaukuma; importa "izmēģinājums" bez saglabāšanas; kolonnu kartējuma saglabāšana priekšiestatījumā |

Fāze 1 un 2 ir noderīgas atsevišķi: 2. fāzes kartētājs ir tīra funkcija, ko var pārbaudīt
bez UI.

---

## 10. Testēšana

Parsētājs un kartētājs ir tīras funkcijas — tur ir vērtīgākie testi
(`DevAdmin/testing/suites/importTests.js`, palaižams no DevAdmin, kā
`bulkOperationTests.js`):

- CSV: `;` un `,` atdalītājs, pēdiņas, pēdiņas pēdiņās, jauna rinda šūnā, CRLF/LF, BOM,
  UTF-8 un windows-1257, tukšas rindas.
- Virsraksti: reģistrs, atstarpes, garumzīmes, nezināma kolonna, virsrakstu rinda otrajā rindā.
- Datumi: visi 3.5. formāti + Excel sērijas numurs + nederīgs datums.
- `SAITE`: tukša (secība), atslēga, `GV:12`, dubulta atslēga, neeksistējošs GV.
- Uzskaitījumi: `Ierobežota` → `closed`, `Vispārēja` + ierobežojuma datums = kļūda.
- Rindu tipizācija: `GV`/`ITEM`/`gv`, nezināms tips.
- Divfāžu izpilde: vecāka neizdošanās → bērni izlaisti ar iemeslu.

Rokas scenāriji: īsts Excel fails no Latvijas Windows (gan "CSV UTF-8", gan "CSV"),
fails ar 200+ rindām, fails ar tikai `DOK` rindām vienas vienības kontekstā.

---

## 11. Riski

| Risks | Mazināšana |
|---|---|
| Nepareizi importēti dati, ko grūti pamanīt | Priekšskatījums pirms izpildes; validācija pa rindām; ieteikums saglabāt eksportu; brīdinājums, ka jāpārbauda |
| Nav atsaukšanas | Pateikts trīs vietās; pēc importa rezultātu saraksts ar visu izveidoto |
| Lietotājs mēģina importēt **eksportēto** uzskaites sarakstu | 2. solī atpazīt veidnes pazīmes un pateikt tieši, ka tas nav importa formāts (2.4.) |
| Garumzīmes sabojājas | Kodējuma noteikšana + windows-1257 atkāpe + brīdinājums |
| Excel savdabības (formulas, apvienotas šūnas, datumi kā skaitļi) | Lasīt aprēķinātās vērtības; datumu šūnas apstrādāt atsevišķi; apvienotas šūnas 5. fāzē pārbaudīt ar īstu failu |
| Liels fails "iekar" pārlūku | Limiti (8.) + progress + apturēšana |
| Eksperimentāla funkcija met ēnu uz rīku | Pēc noklusējuma izslēgta; skaidrs formulējums, ka tā nav rādītājs kvalitātei |
| Jauna npm atkarība lokālā rīkā | Izvēle dokumentēta (7.2.); CSV daļa strādā bez atkarībām |

---

## 12. Paraugfaili (jau sagatavoti)

Atrodas `opex_tool_frontend/public/examples/` — no `public/` tie tiek iekopēti būvējumā,
tāpēc uz tiem var norādīt saiti tieši no lietotnes
(`${process.env.PUBLIC_URL}/examples/…`), un tos var arī vienkārši nosūtīt lietotājam.

| Fails | Saturs |
|---|---|
| `imports_paraugs.csv` | UTF-8 ar BOM, atdalītājs `;` — vienības + ieraksti (C variants) |
| `imports_paraugs.xlsx` | 3 lapas: `DATI` (tie paši dati), `INSTRUKCIJA` (kolonnu apraksts, atļautās vērtības), `PARAUGI` (visi trīs lietojuma veidi atsevišķi) |
| `imports_tikai_vienibas.csv` | A variants — tikai `GV` rindas |
| `imports_tikai_ieraksti.csv` | B variants — tikai `DOK` rindas ar `GV:` atsaucēm |

Faili ir veidoti tā, lai tos varētu importēt **tekstuālā elektroniskā** uzskaites sarakstā
ar aprakstīšanas periodu 2020. gads.

---

## 13. Jautājumi, kas jāizlemj

1. **XLSX bibliotēka:** vai drīkst pievienot `read-excel-file` (ieteikums), vai jātaisa
   savs lasītājs bez atkarībām? *(Abi varianti ir tikai frontendā.)*
2. **Netiešā piesaiste** (`DOK` rinda bez `SAITE` pieder augstākajai `GV` rindai) — atstāt
   ērtībai, vai prasīt vienmēr aizpildīt `SAITE`, lai nav pārpratumu ar kārtošanu?
3. **Rindu limits:** 1000 rindas kā cietais griezums — par daudz vai par maz?
4. **Vai vajag "izmēģinājuma" režīmu** (validē un rāda, bet neko neizveido) jau 3. fāzē?

> **Izlemts (2026-07-30): backend netiek mainīts.** Viss — faila lasīšana, kolonnu
> kartēšana, validācija, divfāžu izpilde — notiek frontendā, izmantojot jau esošos
> galapunktus. Vienības `id` netiek pievienots serializerim; tā vietā lieto
> `number → id` karti pēc nogaidītas pārlādes (2.1., 7.5.).

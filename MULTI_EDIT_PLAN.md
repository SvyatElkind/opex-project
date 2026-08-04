# Vairāku vienību / ierakstu izveide un rediģēšana — plāns

Sagatavots 2026-07-30.

> **Statuss (2026-07-30): 0.–4. fāze ieviesta.** Kods uzrakstīts un kompilējas;
> loģika pārklāta ar 49 testiem (`DevAdmin/testing/suites/bulkOperationTests.js`,
> palaižams no DevAdmin testu cilnes). Reālajā lietotnē vēl **nav izspēlēti**
> 9. sadaļas rokas scenāriji — tas ir nākamais solis.
> 5. fāze apzināti nav ieviesta (gaida atbildes uz 10. sadaļas jautājumiem).
> Ieviešanas laikā apstiprinājās viss 5. sadaļā aprakstītais, un atklājās divas
> papildu lietas, kas plānā nebija — skat. 5.9. un 5.10.

Balstīts uz reālo koda izvērtējumu:
`Item/Items.js`, `Item/CreateItemNavigable.js`, `Item/EditItemNavigable.js`,
`Record/RecordsList.js`, `Record/CreateDocumentRecord.js`, `Record/EditDocumentRecord.js`,
`components/SectionEditPopup.jsx`, `Constants/itemConstants.js`, `Constants/recordConstants.js`,
`hooks/useItems.js`, `hooks/useRecords.js`, `Settings/context/SettingsContext.jsx`,
`items/models.py`, `items/views.py`, `records/models.py`, `records/views.py`,
`records/helpers/validators.py`.

---

## 1. Problēma

Aprakstot vienu uzskaites sarakstu, lietotājs izveido desmitiem glabājamo vienību un
ierakstu, kur **lielākā daļa lauku ir identiski** (datējums, valoda, pieejamība,
slepenība, piezīmes, sērijas kods, apjoma mērvienība) un tikai daži ir unikāli
(nosaukums, reģ. nr., saturs). Šobrīd katra vienība jāievada pilnā formā no jauna —
tas ir lēni, garlaicīgi un rada pārrakstīšanās kļūdas. Tas pats attiecas uz
rediģēšanu: ja jāmaina viena pieejamības vērtība 30 vienībām, tas ir 30 formu.

## 2. Risinājuma kopsavilkums

Trīs daļas:

| # | Daļa | Ieejas punkts |
|---|---|---|
| **A** | **Izveidot vairākas** — jauns logs: "kopīgie lauki" + rindu tabula unikālajiem laukiem | Jauna poga blakus `＋` pogai galvas rindā |
| **B** | **Rediģēt vairākas** — jauns logs: katram laukam atzīmējams "mainīt šo lauku" | Ķeksīši rindās → zīmuļa poga **galvas rindā** (kā lietotājs ierosināja) |
| **C** | **Vizuālie signāli**, ka darbība attiecas uz vairākām vienībām | Atlases josla, iekrāsota loga galva, apstiprinājuma solis, rezultātu kopsavilkums |

Abas jaunās formas izmanto jau esošo infrastruktūru: `SectionEditPopup` stila portāla
korpusu, `getItemUpdatePayload()` / `getRecordUpdatePayload()` payload veidotājus,
`validateItemUpdate()` / `validateTextRecordCreate()` validāciju un `formPresets`
priekšiestatījumus no `SettingsContext`.

---

## 3. Kā to redz lietotājs

### 3.1. Uzsākšana — ķeksīši + zīmuļa poga galvas rindā

Šobrīd galvas rindā (`Items.js` → `HeaderRow`) ir trīs darbību šūnas, kas sakrīt ar
rindu darbību kolonnām: `＋` (virs rindas `＋`), `▤ kolonnas` (virs rindas `✎`),
`🗑` (virs rindas `🗑`).

Kamēr nekas nav atlasīts — nekas nemainās. Tiklīdz atzīmēts vismaz viens ķeksītis,
**kolonnu poga uz laiku pārtop par zīmuļa pogu** — tā nostājas tieši virs rindu
rediģēšanas pogām, kā lietotājs to aprakstīja:

```
nekas nav atlasīts:
[☐] [✔] GV NR │ SĒRIJAS │ NOSAUKUMS │ DATUMS │ … │  [＋]  [▤]   [🗑]
                                                    izveidot kolonnas dzēst

atlasītas 12:
[▣] [✔] GV NR │ SĒRIJAS │ NOSAUKUMS │ DATUMS │ … │  [＋]  [✎¹²] [🗑¹²]
                                                    izveidot rediģēt  dzēst
                                                            12 vienības
```

Kolonnu poga šajā laikā pieejama atlases joslā (skat. 3.2.), lai nekas nezūd.
Alternatīva — pievienot 4. šūnu — ir atmesta: tā izjauc galvas un rindu kolonnu
sakritību, kas šajā tabulā ir apzināti veidota.

Tas pats `Record/RecordsList.js` galvas rindā (`renderTableView`), kur jau ir
identiska trīs pogu grupa un `selectedRecords` (Set) stāvoklis.

### 3.2. Atlases josla (galvenais "vairāku" signāls)

Virs tabulas parādās josla — tā ir vienmēr redzama, kamēr ir atlase, arī ritinot:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ ▣ Atlasītas 12 no 148 │ GV 3, 4, 5, 7, 8 +7 │ [✎ Rediģēt] [🗑 Dzēst] [▤] [✕] │
└───────────────────────────────────────────────────────────────────────────────┘
```

Atlasītās rindas jau tagad iekrāsojas (`items-uniform-data-row-selected`) — to
saglabājam, papildus pievienojot kreisās malas akcenta joslu, lai atlase ir
pamanāma arī tad, ja fona krāsa ir vāja.

### 3.3. Vairāku rediģēšanas logs

Galvenais princips: **katram laukam ir savs ķeksītis "mainīt šo lauku"**. Tikai
atzīmētie lauki tiek pārrakstīti; pārējie katrai vienībai paliek savi. Ja atlasītajām
vienībām lauka vērtība atšķiras, lauks rāda `(dažādas vērtības)`, nevis melīgi
uzdod pirmās vienības vērtību par kopīgo.

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ ✎  Rediģē 12 glabājamās vienības                                     (?)  ║  ← dzintara/akcenta
║    GV 3, 4, 5, 7, 8, 11, 12, 14, 15, 18 +2                                ║     galva, nevis parastā zilā
╠═══════════════════════════════════════════════════════════════════════════╣
║ Atzīmē laukus, ko mainīt. Neatzīmētie lauki paliek nemainīti.             ║
║                                                                           ║
║ ☐ Sērijas kods       [ 1.2                    ]   (dažādas vērtības)      ║
║ ☑ Datējums           [ 01.01.2020 – 31.12.2020 ]                          ║
║ ☑ Valoda             (•) Aizvietot  ( ) Pievienot klāt                    ║
║                      [latviešu ✕] [angļu ✕]  + …                          ║
║ ☐ Pieejamība         [ Vispārēja ▾ ]                                      ║
║ ☐ Slepenība          [ Publisks ▾ ]              (dažādas vērtības)       ║
║ ☑ Piezīmes           (•) Aizvietot ( ) Pievienot beigās ( ) Notīrīt       ║
║                      [ Pārņemts no 2019. gada lietas                    ] ║
║ ☐ Apjoms / mērvienība  [ 0 ] [ Lapas ▾ ]                                  ║
║ ☐ Sistematizācija    [                        ]                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ Mainīsies 3 lauki 12 vienībām              [Atcelt]  [Pārskatīt →]        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### 3.4. Apstiprinājuma solis (obligāts)

Pārrakstīšana 12 vienībām nav atceļama (backend nav "undo"), tāpēc pirms saglabāšanas
tiek parādīts precīzs pārskats. Šis solis vienlaikus ir arī brīdinājums, ka darbība
attiecas uz vairākām vienībām:

```
║ Pārskats: 3 lauki → 12 vienības                                           ║
║   Datējums  →  01.01.2020 – 31.12.2020        (mainīsies 9 vienībām)       ║
║   Valoda    →  latviešu, angļu                (mainīsies 12 vienībām)     ║
║   Piezīmes  +  "Pārņemts no 2019. gada lietas" (mainīsies 12 vienībām)    ║
║                                                                           ║
║ ⚠ 2 vienībām ir kļūda citos laukos — tās tiks izlaistas:                  ║
║   GV 7  — Ierobežojuma pamatojums ir obligāts                             ║
║   GV 14 — Glabājamās vienības valoda nav norādīta                         ║
║                                          [← Atpakaļ]  [Saglabāt 10]       ║
```

### 3.5. Izpilde un rezultāts

Katra vienība ir atsevišķs `PUT` pieprasījums (skat. 5.2.), tāpēc:

```
║ Saglabā…  7 / 10   [▓▓▓▓▓▓▓░░░]                          [Apturēt]        ║
   ↓
║ ✔ 9 atjauninātas    ✖ 1 neizdevās                                         ║
║   GV 15 — "Nosaukums nevar būt garāks par 1000 simboliem"   [Labot →]     ║
║                                                        [Aizvērt]          ║
```

Daļēja neizdošanās tiek **pateikta atklāti**, nevis noklusēta — tā pati loģika, kas
jau ir `useBatchDeleteRecords` (`hooks/useRecords.js:347`), kur tiek atgriezts
`{successes, failures, partial}`.

### 3.6. Vairāku izveides logs

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ ＋  Izveidot vairākas glabājamās vienības                              (?)   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 1. KOPĪGIE LAUKI  (attiecas uz visām jaunajām vienībām)                      ║
║    Sērijas kods [1.2]     Datējums [01.01.2020 – 31.12.2020]                 ║
║    Valoda [latviešu ✕]    Pieejamība [Vispārēja ▾]  Slepenība [Publisks ▾]   ║
║    Apjoms [0] [Lapas ▾]   Piezīmes [ … ]                                     ║
║                                    [Ņemt no priekšiestatījuma ▾] [Saglabāt kā]║
║                                                                              ║
║ 2. KATRAS VIENĪBAS UNIKĀLIE LAUKI                          Rindas: 12        ║
║    [📋 Ielīmēt sarakstu]  [⚙ Ģenerēt pēc šablona]  [+ rinda]                 ║
║    ┌──────┬────────────────────────────────┬────────────────┬────┐           ║
║    │ GV*  │ Nosaukums (obligāts)           │ Datējums       │ ✔  │           ║
║    ├──────┼────────────────────────────────┼────────────────┼────┤           ║
║    │ 13   │ Sēdes protokoli 2020. I cet.   │ (kopīgais)     │ ✔  │           ║
║    │ 14   │ Sēdes protokoli 2020. II cet.  │ (kopīgais)     │ ✔  │           ║
║    │ 15   │                                │ (kopīgais)     │ ✖  │ ← trūkst  ║
║    └──────┴────────────────────────────────┴────────────────┴────┘           ║
║    * GV numuru piešķir sistēma — šeit tas ir tikai prognoze                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Izveidos 12 vienības (GV 13–24)                [Atcelt]  [Izveidot 12]       ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

Trīs veidi, kā ātri piepildīt rindas — tie ir tas, kas reāli novērš garlaicību:

1. **Ielīmēt sarakstu** — lietotājs iekopē nosaukumu kolonnu no Excel / teksta faila;
   katra rinda kļūst par vienu vienību. Šis ir visbiežākais reālais scenārijs.
2. **Ģenerēt pēc šablona** — `Sēdes protokoli 2020. {n}. ceturksnis`, `n` no 1 līdz 4;
   vai `{n}` ar sākuma vērtību un soli. Noder arī reģ. nr. sērijām ierakstiem.
3. **Rokā pa rindai** — tabulā ar Tab/Enter navigāciju, bez formas atvēršanas.

Rindas apakšā `✔ / ✖` rāda katras rindas validāciju **pirms** sūtīšanas (ar to pašu
`validateItemCreate`), lai lietotājs nesagaida 12 kļūdas pēc izpildes.

Ierakstiem (`Record`) tas pats logs plus ceturtais piepildīšanas veids:

4. **Viens fails = viens ieraksts** — lietotājs izvēlas 20 datnes; katra kļūst par
   ierakstu, nosaukums no datnes nosaukuma, pārējais no kopīgajiem laukiem.
   (Tehniski: `POST record` → tad `POST record/{id}/multiple_files/` katram ierakstam.)

### 3.7. Kopsavilkums — kā lietotājs saprot, ka rediģē vairākas

Apzināti vairāki vienlaicīgi signāli, jo tas ir tas solis, kur kļūda ir dārga:

1. Atlases josla ar skaitu `Atlasītas 12 no 148` un GV numuriem.
2. Atlasītās rindas iekrāsotas + akcenta josla malā.
3. Zīmuļa poga galvas rindā ar skaitļa nozīmīti `✎¹²` (tāda pati, kāda jau ir dzēšanas pogai).
4. Loga galva **citā krāsā** nekā parastajām rediģēšanas formām + virsraksts
   `Rediģē 12 glabājamās vienības` + GV numuru saraksts.
5. Katram laukam ķeksītis — vizuāli redzams, ka pēc noklusējuma **nekas** netiek mainīts.
6. Kājenē pastāvīgs skaitītājs `Mainīsies 3 lauki 12 vienībām`.
7. Obligāts apstiprinājuma solis ar precīzu "kas → kam" sarakstu.
8. Progresa josla ar skaitli (nevis bezgalīgs spinneris).
9. Rezultāta paziņojums `✔ 12 no 12 atjauninātas` + neizdevušos saraksts.

---

## 4. Lauku klasifikācija

Tā ir plāna svarīgākā daļa: kas drīkst būt kopīgs, kas nekad.

### 4.1. Glabājamā vienība (`Item`)

| Lauks | Izveidē vairākas | Rediģē vairākas | Piezīmes |
|---|---|---|---|
| `number` (GV NR) | ✖ | ✖ | Piešķir **serveris** (`items/models.py:238`), unikāls uzskaites sarakstā |
| `series_code` | ✔ kopīgs | ✔ | Regex `1`, `1.2`, `1.2.3` |
| `title` | ✔ unikāls (rindas) | ⚠ tikai prefikss/sufikss/aizvietošana — vēlāka fāze | |
| `start_date` / `end_date` / `date_indicator` | ✔ kopīgs | ✔ | Jāpārbauda pret uzskaites saraksta beigu datumu |
| `date_note` | ✔ kopīgs | ✔ | |
| `size` + `unit_of_measure` | ✔ kopīgs | ✔ | Tikai fiziskajiem (`!inventory.electronic`) |
| `language` | ✔ kopīgs | ✔ aizvietot / pievienot | API — virkne, UI — tagi; limits 200 simboli |
| `annotation` (Saturs) | ✔ kopīgs | ✔ aizvietot / pievienot beigās | Obligāts Foto/Video/Skaņas |
| `notes` | ✔ kopīgs | ✔ aizvietot / pievienot / notīrīt | |
| `sistematisation` | ✔ kopīgs | ✔ | |
| `restriction` + `restriction_note` | ✔ kopīgs | ✔ **pārī** | Ja `restriction ≠ Vispārēja`, pamatojums obligāts |
| `security_level` + `security_level_note` | ✔ kopīgs | ✔ pārī | |
| `copy`, `archival_history` | ✔ kopīgs | ✔ | |
| `related_item_list` | ✔ kopīgs | ⚠ pievienot / noņemt / aizvietot — vēlāka fāze | Simetriska M2M; kļūdas cena augsta |

### 4.2. Ieraksts (`Record`, tekstuālais elektroniskais)

| Lauks | Izveidē vairākas | Rediģē vairākas | Piezīmes |
|---|---|---|---|
| `title` | ✔ unikāls (rindas / datnes nosaukums) | ⚠ vēlāka fāze | |
| `date` | ✔ kopīgs | ✔ | **Obligāti** vecākvienības datumu diapazonā (`records/helpers/validators.py`) |
| `created_date`, `sent_date` | ✔ kopīgs | ✔ | `blank=False` — obligāti |
| `reg_nr` | ✔ unikāls (šablons `1-15/{n}`) | ✖ | |
| `sent_reg_nr` | ✔ kopīgs | ✔ | |
| `nomenclature_nr` (Lietas Nr.) | ✔ kopīgs | ✔ | Obligāts |
| `group` | ✔ kopīgs | ✔ | |
| `language` | ✔ kopīgs | ✔ aizvietot / pievienot | |
| `key_words` | ✔ kopīgs | ✔ pievienot | |
| `annotation` | ✔ kopīgs | ✔ aizvietot / pievienot | |
| `notes`, `tech_info` | ✔ kopīgs | ✔ | |
| `access_restriction` + `_notes` + `_date` + `user_restriction_notes` | ✔ kopīgs | ✔ **grupā** | `open` ⇒ datums **jābūt tukšs**; `closed` ⇒ datums obligāts |
| datnes | ✔ (1 datne = 1 ieraksts) | ✖ | |

### 4.3. Mediju ieraksti (Foto / Video / Skaņas)

Vienai vienībai drīkst būt **tikai viens** mediju ieraksts
(`validate_if_record_exists`, `records/helpers/validators.py`). Tāpēc "vairāku
izveide" mediju sarakstiem nozīmē citu plūsmu: **N datnes → N vienības, katrai viens
ieraksts**. Tā ir vērtīga, bet atsevišķa funkcionalitāte (7. fāze), un tā nedrīkst
iejaukties tekstuālo ierakstu plūsmā. Mediju metadatu (`color`, `duration`,
izšķirtspēja) masveida rediģēšana iet caur citu galapunktu (`media_record/?type=`) —
arī atsevišķi.

---

## 5. Tehniskie fakti, kas nosaka dizainu

Šie nav izvēles jautājumi — tie ir esošā backend uzvedība, ko ievērot:

1. **GV numuru piešķir serveris secīgi.** `Item.add_item()` pārraksta klienta doto
   numuru ar `inventory.last_gv + 1` (`items/models.py:238`). Tāpēc vairāku izveide
   **jāsūta pa vienam, secīgi** — paralēli pieprasījumi sacenstos par `last_gv`
   (SQLite). Logā rādītie GV numuri ir prognoze, nevis garantija.

2. **Atjaunināšanai nav daļējās (partial) atbalsta.** `UpdateItemSerializer` /
   `UpdateRecordSerializer` bez `partial=True` — `PUT` jāsūta **pilns objekts**.
   Tāpēc katrai vienībai payload jābūvē no *tās pašas* vērtībām plus tikai
   atzīmētajiem laukiem:
   `getItemUpdatePayload(item, inventory, overrides)` (`Constants/itemConstants.js:466`).
   Tas jau ir gatavs un tam ir dokumentēts iemesls — bez `related_item_list`
   backend izdzēš visas saistīto vienību saites.

3. **Nav grupas galapunkta un nav transakcijas.** Katra vienība = viens
   pieprasījums; daļēja izpilde ir iespējama un neatgriežama. No tā izriet:
   validēt visu **pirms** sūtīšanas, tad sūtīt, tad godīgi atskaitīties par
   rezultātu. Jaunus backend galapunktus šim **nav jātaisa** — precedents jau ir
   `useBatchDeleteRecords`.

4. **Nosacītā validācija ir starplauku.** `restriction ≠ Vispārēja` prasa
   `restriction_note`; ieraksta `access_restriction = closed` prasa
   `access_restriction_date`, bet `open` prasa, lai datums būtu **tukšs**. Tāpēc šie
   lauki logā jātur grupās, nevis atsevišķi.

5. **Ieraksta datums ir piesaistīts vecākvienībai.** `validate_record_date` prasa
   `item.start_date ≤ date ≤ item.end_date`. Ja kādreiz ierakstus atlasīs pāri
   vairākām vienībām, datuma pārbaude jāveic katrai vienībai atsevišķi.

6. **Optimistiskie kešatjauninājumi neder grupas darbībām.** `useCreateItem` sasaista
   optimistisko ierakstu ar `itemData.number` — ar servera piešķirtiem numuriem tas
   nesakritīs. `useUpdateItem` katrā izsaukumā invalidē visu projekta kešu — 30
   vienībām tas ir 30 invalidācijas. Grupas darbībām vajag atsevišķu ceļu: bez
   optimistiskā atjauninājuma, ar **vienu** invalidāciju beigās.

7. **Priekšiestatījumi jau eksistē.** `SettingsContext.formPresets`
   (`notes`, `itemLanguage`, `recordLanguage`, `restriction`, `securityLevel`,
   `keyWords`) jau tiek lietoti izveides formās. Vairāku izveides "kopīgie lauki"
   jāsasaista ar šo mehānismu (`[Ņemt no priekšiestatījuma]` / `[Saglabāt kā]`),
   nevis jāizdomā otra paralēla sistēma.

8. **Atlases stāvokļa nesakārtotība jāizlabo pirms grupas darbībām.** Šobrīd
   `Items.js`: `handleSelectAll` atlasa **visas** vienības, ne tikai redzamo lapu;
   atlase netiek notīrīta, mainot uzskaites sarakstu (`inventoryId`); pēc atsevišķas
   vienības dzēšanas ID paliek `selectedItems` (`handleConfirmDelete` tīra tikai, ja
   `> 1`). Dzēšanai tas ir mazsvarīgi, rediģēšanai — nē. Risinājums: atlasi vienmēr
   izšķirt pret aktuālo `items` sarakstu, tīrīt pie `inventoryId` maiņas, un
   "atlasīt visu" skaidri iezīmēt kā "visas 148", nevis "šo lapu".

9. **`related_item` vs `related_items`** (atklāts ieviešanas laikā). Projekta datos
   lauks ir `related_item`, bet vienības `PUT`/`POST` atbildē — `related_items`, un
   `useUpdateItem` šo atbildi ieraksta kešā. `getItemUpdatePayload()` lasīja tikai
   pirmo, tāpēc otrā rediģēšana pēc kārtas nosūtīja tukšu sarakstu un backend
   izdzēsa visas saistīto vienību saites. Palīgs tagad lasa abus.

10. **Ieraksta izveides payload sūtīja `null`** (atklāts ieviešanas laikā).
    `Record` modelī visi `CharField` ir `null=False`, tāpēc DRF atmeta tukšus
    neobligātos laukus ar "This field may not be null" — tā pati kļūda, kas jau bija
    izlabota atjaunināšanas ceļā, bet palika `CreateDocumentRecord.js` izveides ceļā.
    Tāpēc tapa `getRecordCreatePayload()`. Papildus apstiprinājās, ka `created_date`
    un `sent_date` ir **obligāti** (`blank=False`) — tie ir kopīgo lauku sarakstā, un
    to trūkums tiek noķerts pirms sūtīšanas, nevis kā 400 pusceļā.

---

## 6. Arhitektūra — jauni un mainītie faili

### Jauni faili

| Fails | Saturs |
|---|---|
| `components/BulkEditPopup.jsx` + `.css` | Kopīgais korpuss: portāls, iekrāsota galva ar skaitu un GV čipiem, ķermenis, apstiprinājuma solis, progresa josla, rezultātu tabula, kājene. Analogs `SectionEditPopup.jsx` lomai |
| `components/BulkFieldRow.jsx` | Viena lauka rinda: ķeksītis + etiķete + `FieldHelp` + kontrole + `(dažādas vērtības)` + režīmu izvēle (aizvietot / pievienot / notīrīt) |
| `components/SelectionToolbar.jsx` + `.css` | Atlases josla (3.2.) — kopīga vienībām un ierakstiem |
| `Item/BulkEditItemsPopup.jsx` | Vienību lauku kopa, validācija ar `validateItemUpdate`, payload ar `getItemUpdatePayload` |
| `Item/MultiCreateItemsPopup.jsx` + `.css` | Kopīgie lauki + rindu tabula + ielīmēšana + šablons |
| `Record/BulkEditRecordsPopup.jsx` | Ierakstu lauku kopa, `validateTextRecordCreate` + `getRecordUpdatePayload` |
| `Record/MultiCreateRecordsPopup.jsx` + `.css` | Tas pats ierakstiem + "1 datne = 1 ieraksts" |
| `hooks/useBulkOperations.js` | `useBulkUpdateItems`, `useBulkCreateItems`, `useBulkUpdateRecords`, `useBulkCreateRecords` — **secīga** izpilde, `onProgress` atzvans, apturēšana, `{results, successes, failures}`, viena keša invalidācija beigās |
| `Constants/bulkConstants.js` | Lauku grupas: kuri lauki ir grupas režīmā pieejami, kādos režīmos, kuri lauki iet pārī. Etiķetes ņemtas no esošajām `ITEM_FIELD_LABELS` / `RECORD_FIELD_LABELS` |
| `Constants/uiStrings/bulkUI.js` | Visas jaunās latviešu virknes (projekta konvencija — teksts konstantēs, ne komponentēs) |

### Mainītie faili

| Fails | Izmaiņa |
|---|---|
| `Item/Items.js` | Galvas rindas zīmuļa poga (aizvieto kolonnu pogu, kamēr ir atlase), `SelectionToolbar`, "Izveidot vairākas" poga, jauni stāvokļi, atlases sakārtošana (5.8.) |
| `Item/ItemsTable.css` | Zīmuļa pogas un atlases joslas stili blakus esošajiem `items-uniform-header-btn-*` |
| `Record/RecordsList.js` | Tas pats galvas rindā; jauni props `onBulkEditRecords`, `onMultiCreateRecords` |
| `Record/RecordsList.css` | Analogi stili |
| `Item/Item.js` | Ierakstu cilnes savienošana ar jaunajiem logiem (tur jau ir `EditDocumentRecord` savienojums) |
| `Constants/helpConstants.js` + `Constants/fieldHelp.js` | Palīdzības sadaļa par vairāku izveidi/rediģēšanu (katram logam jābūt `HelpButton` — projekta konvencija) |
| `CHANGELOG.md` | Ieraksts par katru fāzi (obligāti, skat. `CLAUDE.md`) |

Backend izmaiņas — **nav vajadzīgas**. Ja vēlāk gribēs ātrdarbību (viens
pieprasījums vietā 30), var pievienot grupas galapunktu, bet tas nav priekšnoteikums
un to nevajag darīt pirmajā kārtā.

---

## 7. Ieviešanas fāzes

Katra fāze ir pati par sevi noderīga un atsevišķi pārbaudāma.

**Ieviešanas atzīmes:** 0.–4. fāze ✅ uzrakstīta; 5. fāze ⏸ gaida lēmumu.
Divas atkāpes no plāna, abas apzinātas:

- **Vairāku izveides ieejas punkts.** Plānā nebija pateikts, kur tam ir poga.
  Galvenē vairs nav vietas ceturtajai šūnai (skat. 3.1.), tāpēc `＋` poga tagad
  atver divu ierakstu izvēlni: "Izveidot vienu" / "Izveidot vairākas". Tas maksā
  vienu papildu klikšķi vienas vienības izveidei, bet neaiztiek galvenes un rindu
  kolonnu sakritību un ir pašatklājošs.
- **"Saglabāt un izveidot nākamo" pievienots tikai vienībām.** `CreateDocumentRecord`
  gadījumā tas prasītu pārbūvēt izveides pēcapstrādi (tā izsauc `onCreate`, kas
  aizver logu un aizNavigē uz jauno ierakstu), un 4. fāzes logs to pašu vajadzību
  nosedz labāk.

### 0. fāze — ātrie uzlabojumi (mazs apjoms, tūlītējs efekts) ✅

- **"Saglabāt un izveidot nākamo" poga.** `CreateItemNavigable.js` **jau satur** visu
  loģiku (`handleSubmit(e, shouldContinue=true)`, `itemsCreated`, `resetForm()`,
  `SUCCESS_CREATE_MORE` teksts), bet kājenē nav pogas, kas to izsauc — kods šobrīd
  ir nesasniedzams. Pogas pievienošana dod vienas dienas laikā jūtamu atvieglojumu,
  vēl pirms lielie logi ir gatavi. Tas pats jāizvērtē `CreateDocumentRecord.js`.
- Atlases joslas pievienošana ar skaitu (bez rediģēšanas) + atlases stāvokļa
  sakārtošana (5.8.).

### 1. fāze — vairāku vienību rediģēšana ✅

`BulkEditPopup` + `BulkFieldRow` + `BulkEditItemsPopup` + `useBulkUpdateItems`,
galvas rindas zīmuļa poga `Items.js`. Lauki: datējums, valoda, pieejamība+pamatojums,
slepenība+piezīmes, piezīmes, saturs, sērijas kods, apjoms, sistematizācija, kopija,
arhīva vēsture. **Bez** nosaukuma un saistītajām vienībām.

Vislielākā vērtība pret vismazāko risku: payload veidotājs un validācija jau ir.

### 2. fāze — vairāku ierakstu rediģēšana ✅

`BulkEditRecordsPopup` + `useBulkUpdateRecords`, `RecordsList.js` galvas poga,
savienojums `Item.js` ierakstu cilnē. Īpaša uzmanība pieejamības lauku grupai un
datuma diapazonam (5.4., 5.5.).

### 3. fāze — vairāku vienību izveide ✅

`MultiCreateItemsPopup` + `useBulkCreateItems` (secīga izpilde ar progresu):
kopīgie lauki, rindu tabula, ielīmēšana no starpliktuves, šablona ģenerēšana,
rindu validācija pirms sūtīšanas, priekšiestatījumu sasaiste.

### 4. fāze — vairāku ierakstu izveide ✅

Tas pats ierakstiem + **"1 datne = 1 ieraksts"** (`POST record`, tad
`multiple_files` katram). Šī ir plūsma, kas visvairāk ietaupa laiku elektronisko
dokumentu aprakstīšanā.

### 5. fāze — papildinājumi pēc lietotāju atsauksmēm ⏸

- Nosaukumu masveida maiņa: prefikss / sufikss / atrast-un-aizvietot ar priekšskatījumu.
- Saistītās vienības grupas režīmā (pievienot / noņemt / aizvietot).
- "Kopēt no vienības" — paņemt visus kopīgos laukus no jau esošas vienības kā sākumvērtības.
- Mediju plūsma: N datnes → N vienības ar vienu mediju ierakstu katrai.

---

## 8. Riski un malu gadījumi

| Risks | Kā risinām |
|---|---|
| **Datu zudums** no nepilna `PUT` | Payload vienmēr caur `get*UpdatePayload()`; neatzīmēti lauki pārņem katras vienības pašas vērtības; nekad nesūtīt tukšu virkni tāpēc, ka lauks logā nebija redzams |
| **Daļēja izpilde** (7 no 12 saglabātas) | Validācija pirms sūtīšanas; progress; rezultātu tabula ar konkrētiem iemesliem; nekad neziņot "gatavs", ja daļa neizdevās |
| **Liela atlase** (piem. "atlasīt visas 500") | Kājenē skaidri norādīt darbību skaitu; brīdinājums virs ~50; poga "Apturēt"; apturot — pateikt, cik jau saglabāts |
| Nosacītā validācija (pamatojums, ierobežojuma datums) | Lauki grupās; atzīmējot `restriction`, automātiski atzīmējas arī `restriction_note` |
| Novecojusi atlase (dzēstas / cita saraksta vienības) | Atlasi vienmēr izšķirt pret aktuālo `items`; tīrīt pie `inventoryId` maiņas |
| Servera piešķirtie GV numuri ≠ logā rādītie | Logā rakstīt, ka numurs ir prognoze; pēc izveides parādīt reālos numurus |
| Ķeksīšu atlase pāri lapām nav redzama | Atlases joslā rādīt `12 no 148` un GV numurus, lai atlase ārpus redzamās lapas nav "neredzama" |
| Keša pārslodze (30 invalidācijas) | Grupas ceļš bez optimistiskiem atjauninājumiem, viena invalidācija beigās |
| Valodas lauks (virkne ↔ tagi) | Vienā vietā (`bulkConstants.js`) noteikta `join(', ')` un 200 simbolu pārbaude |

---

## 9. Testēšana

- **Vienībtesti** (`project/tests/`, `items/tests/`): jaunas backend izmaiņas nav, tāpēc
  galvenais slogs uz frontend loģiku — payload veidošana atzīmētajiem/neatzīmētajiem
  laukiem, "dažādas vērtības" noteikšana, ielīmētā saraksta parsēšana, šablona
  ģenerēšana, rindu validācija.
- **Rokas scenāriji, kas obligāti jāpārbauda:**
  1. Rediģēt 3 vienības, mainot tikai valodu → pārējie lauki katrai palikuši savi,
     saistītās vienības **nav** pazudušas.
  2. Rediģēt vienības, no kurām vienai trūkst obligātā lauka → tā tiek izlaista ar
     saprotamu ziņojumu, pārējās saglabājas.
  3. Uzlikt `Ierobežota` bez pamatojuma → forma neļauj, pirms sūta.
  4. Izveidot 12 vienības no ielīmēta saraksta → GV numuri secīgi, bez caurumiem.
  5. Izveidot ierakstus no 20 datnēm → 20 ierakstu, katram sava datne.
  6. Ieraksta datums ārpus vecākvienības diapazona → aizturēts pirms sūtīšanas.
  7. Atlasīt vienības, pārslēgt uzskaites sarakstu, atvērt rediģēšanu → nav svešu ID.
  8. Apturēt izpildi pusceļā → skaidrs, cik saglabāts.

---

## 10. Jautājumi, kas jāizlemj pirms kodēšanas

1. **Galvas rindas poga:** vai zīmulis aizvieto kolonnu pogu, kamēr ir atlase
   (ieteikums — jā, tad tas ir tieši virs rindu rediģēšanas pogām), vai tomēr
   pievienojam 4. šūnu?
2. **Nosaukumu masveida maiņa** — vajadzīga 1. fāzē vai var gaidīt 5. fāzi (ieteikums — gaidīt)?
3. **"1 datne = 1 ieraksts"** — vai tas ir svarīgāks par vienību vairāku izveidi?
   Ja jā, 3. un 4. fāzi apmainām vietām.
4. **Atlases limits** — pie cik vienībām rādīt brīdinājumu (ieteikums — 50) un vai
   vispār liekam ciešu ierobežojumu?
5. **Saistītās vienības** grupas rediģēšanā — atļaut vai apzināti neatļaut?

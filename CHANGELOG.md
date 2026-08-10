# Izmaiņu žurnāls (CHANGELOG)

Šajā failā tiek fiksētas visas koda izmaiņas. **Katra jauna izmaiņa jāpievieno šeit**
sadaļā "Nepublicēts" — skat. [Kā uzturēt šo failu](#kā-uzturēt-šo-failu) faila beigās.

---

## Nepublicēts (uncommitted, `frontend-dev`)

Bāze: `97eaa9f` (= `frontend-dev` pēc `db_development` ievilkšanas).

### DevAdmin: paplašināta testa datu veidošana un ātrās darbības

Izstrādes paneļa cilnes **Create** un **Actions** bija ierobežotas: katra poga veidoja
tieši vienu objektu, un "Fill Project" bija cieti iekodēts. Lielāka testa projekta
uzbūvēšana prasīja desmitiem klikšķu.

**Jauns kopīgs modulis** [devDataFactory.js](opex_tool_frontend/src/DevAdmin/devDataFactory.js) —
visi veidotāji un dzēsēji vienuviet, caur `apiClient`:

- **Ātrums.** Agrākais kods pēc katra izveidotā objekta izsauca pilnu
  `GET /project/{id}/`, lai atrastu tikko izveidotā objekta ID (līdz 4 pilnām projekta
  lejupielādēm uz vienu GV). Tagad tiek izmantots ID, ko atgriež pats `POST`, tāpēc
  N objektu izveide maksā N pieprasījumus. Kešatmiņa tiek atsvaidzināta vienu reizi
  darba beigās, nevis pēc katra soļa.
- Veidotāji: projekts, US, GV, Dok. (teksta un mediju), datne, metadati (visas 4 klases),
  kā arī `fillProject()` ar konfigurāciju un atcelšanas atbalstu.
- Dzēsēji un apstaigāšanas palīgi (`allRecordsOf`, `allFilesOf`).

**Create cilne** ([QuickCreate.jsx](opex_tool_frontend/src/DevAdmin/components/QuickCreate.jsx)):

- **Skaita izvēle** (1 / 5 / 10 / 25 / 50 vai brīvs skaitlis līdz 500) attiecas uz visām
  veidošanas pogām — GV, Dok., datnes, metadati, US un projekti.
- **Elektronisks / fizisks slēdzis.** Agrāk `electronic` bija cieti iekodēts uz `true`,
  tāpēc no šīs cilnes nevarēja izveidot nevienu fizisku uzskaites sarakstu — divas no
  četrām kategorijām (`DOCUMENTS`, `MEDIA`) nebija patestējamas. Pievienota arī
  glabāšanas termiņa izvēle.
- **Konfigurējams "Fill Project"** — US skaits, GV uz US, Dok. uz GV, datnes uz Dok.,
  metadati ieslēgti/izslēgti. Agrāk fiksēti 2 US x 3 GV.
- **"Fill US"** — aizpilda tikai izvēlēto uzskaites sarakstu.
- **Projektu izveide** — agrāk DevAdmin nevarēja izveidot projektu vispār; tagad var arī
  tad, ja neviens projekts nav atvērts. Nepieciešams norādīt **saknes mapi** (skat. zemāk).
- **Metadatu klases izvēle** (visi / visa / addressee / action / read_status) — agrāk
  tika pievienota viena nejauša klase.
- **Apturēšanas poga** garajiem darbiem.

**Actions cilne** ([QuickActions.jsx](opex_tool_frontend/src/DevAdmin/components/QuickActions.jsx)):

- **Delete Current Project** — dzēš tikai atvērto projektu. Agrāk vienīgā projektu
  dzēšanas iespēja bija "Delete ALL Projects".
- **Delete All Records / Delete All Files** aktīvajā projektā.
- **Create Test Project / Create 5 Test Projects**, **List Projects on Server**.
- Jaunās darbības iet caur `apiClient` (noilgums, atkārtošana, `ApiError`), nevis
  tiešu `fetch('/api/v1/...')`, kā to dara vecākie masveida palīgi.

### Labots: DevAdmin projektu izveide neizdevās ("Lūdzu izlabojiet kļūdas formas laukos")

Pirmajā versijā projektu veidotājs sūtīja tikai `{ name }`, tāpēc katrs mēģinājums
atgriezās ar lauku kļūdu un `0/5` izveidotiem projektiem.

- **Cēlonis:** projekta izveidei ir obligāts arī lauks **`folder`** — saknes mape, kurai
  jau jāeksistē šajā datorā. Backends to pārbauda ar `os.path.isdir(root_folder)` un tad
  izveido `<saknes_mape>/<nosaukums>` ([project/models.py:95](project/models.py#L95)
  `add_project`). Modelī `folder` ir `blank=False` un `unique`.
- **Labojums:** `createProject(name, rootFolder)` tagad prasa saknes mapi.
  Create cilnē pievienots lauks **"Saknes mape"**, kas tiek noteikts šādā secībā:
  1. lietotāja ievadītā vērtība (saglabāta `localStorage` atslēgā `devadmin_project_root`),
  2. esoša projekta `folder` vecākmape — tā garantēti eksistē, jo backends tur jau ir
     izveidojis projektu,
  3. ja nekas nav atrasts — darbība netiek izpildīta un žurnālā parādās skaidrs
     paskaidrojums, nevis lauku kļūda.
- **Kļūdu ziņojumi kļuvuši lietderīgi.** Pievienots `describeApiError()`, kas izvelk
  konkrētos lauku ziņojumus no `ApiError`. Agrāk žurnālā bija tikai vispārīgais
  "Lūdzu izlabojiet kļūdas formas laukos", kas neatklāja, kurš lauks tika noraidīts.
  Tagad visas Create cilnes darbības (US, GV, Dok., datnes, metadati) rāda lauka vārdu.

### Labots: projektu bez VVAIS atskaites nevarēja izdzēst no DevAdmin

Projekts bez atskaites bija iestrēdzis — tajā nevarēja neko veidot, un to nevarēja arī
dzēst no izstrādes paneļa.

- **Cēlonis:** `QuickActions` visas darbības balstīja uz `projectData?.id`. Projektam bez
  atskaites `GET /project/{id}/` atgriež `400`, tāpēc `activeProjectData` ir `undefined`,
  lai gan projekts ir izvēlēts — un poga "Delete Current Project" bija neaktīva.
- **Labojums:** `Project.js` tagad padod `DevAdminPanel` arī `selectedProjectId` un
  `projectsList` atsevišķi no ielādētajiem datiem. `QuickActions` lieto
  `currentProjectId = projectData?.id || selectedProjectId`, tāpēc dzēšana strādā pēc ID
  neatkarīgi no tā, vai detaļu pieprasījums izdevās. Apstiprinājuma logā tiek norādīts,
  ka projektam nav atskaites.
- **Pievienots projektu saraksts** ar dzēšanas pogu pie katra projekta. Projekti bez
  atskaites nekad nekļūst par "aktīvo" projektu, tāpēc bez šī saraksta tos no paneļa
  nevarēja aizsniegt vispār. Saraksts rāda ID, nosaukumu, atzīmi "aktīvs" un
  "bez atskaites" (pēc `report_status` lauka).

### Labots: trīs DevAdmin kešatmiņas atsvaidzināšanas neko nedarīja

`bulkDeleteInventories`, `bulkDeleteItems` un `populateReportInventories` izsauca
`invalidateQueries({ queryKey: ['project', projectData.id] })`. Sintakse bija pareiza
(v5 objekts), bet atslēgas forma nepareiza — īstā atslēga ir
`['project', 'detail', id]`, tāpēc prefiksa salīdzinājums neatbilda nevienam vaicājumam
un saraksts pēc masveida dzēšanas neatsvaidzinājās.

### Labots: DevAdmin masveida dzēšana ignorēja mediju ierakstus

Jaunās darbības "Delete All Records" un "Delete All Files" apstaigāja tikai `item.records`.

- **Cēlonis:** mediju ieraksti backendā glabājas atsevišķos laukos —
  `item.photo_records` / `video_records` / `audio_records`
  ([project/serializers.py:119](project/serializers.py#L119) `ItemSerializer`), nevis
  kopējā `records` masīvā. Tāpēc Foto/Video/Skaņas projektā abas darbības ziņoja
  "Nav dokumentu ko dzēst", bet jauktā projektā klusi izlaida visus mediju ierakstus un
  to datnes, vienlaikus ziņojot par veiksmi.
- **Otrs cēlonis:** mediju ierakstu dzēšanai ir cits galapunkts —
  `DELETE /project/{pid}/media_record/{rid}/?type=...`, nevis `/record/{rid}/`.
- **Labojums:** `allRecordsOf()` tagad apstaigā visus četrus masīvus un katru ierakstu
  atzīmē ar `isMedia` / `mediaType`; jaunais `deleteAnyRecord()` izvēlas pareizo
  galapunktu. `allFilesOf()` līdz ar to aptver arī mediju datnes.
- **Piezīme par `?type=` vērtībām:** derīgās ir `Foto`, `Skaņas`, `Video`
  ([helpers/constants.py:30-33](helpers/constants.py#L30)). `Record_API.deleteMediaRecord`
  dokumentācijas komentārs min `Audio`, kas **nav** derīga vērtība — `MEDIA_CLASS_MAP`
  tādu atslēgu nesatur. Komentārs nav labots (tas ir cita faila jautājums), bet
  `devDataFactory` lieto pareizās vērtības.

### Pārbaudīts pret reālo backendu

Visi 13 `devDataFactory` galapunkti salīdzināti ar `urls.py` maršrutiem, un vaicājumu
parametru nosaukumi (`fond_id`, `inventory_id`, `item_id`, `class`, `type`) — ar
`request.query_params.get(...)` skatos. Metadatu klases (`action`, `addressee`, `visa`,
`read_status`) atbilst `METADATA_CLASS_MAP`. Datņu lauka nosaukums `files` atbilst
`request.FILES.getlist('files')`.

Dzīvā pārbaude pret palaistu backendu: projekta izveide (`201`), dzēšana (`200`) un
saknes mapes atvasināšana no esoša projekta ceļa strādā. Testa projekts pēc pārbaudes
izdzēsts.

**Zināms ierobežojums (nav kļūda):** jaunizveidotā projektā nevar veidot US/GV/Dok.,
kamēr nav augšupielādēta VVAIS atskaite — bez tās `GET /project/{id}/` atgriež
`400 {"error": "Nav importēta VVAIS atskaite."}` un projektam nav fonda. Katru atskaiti
var izmantot tikai vienreiz, jo iestādes reģ. nr. un nosaukums ir unikāli. Tāpēc DevAdmin
neaugšupielādē atskaiti automātiski; Create cilnē pievienots par to brīdinājums.

### Labots: vēl viens React Query v4 izsaukums (`removeQueries`)

[useProjects.js:109](opex_tool_frontend/src/hooks/useProjects.js#L109) `useDeleteProject`
saglabāja veco parakstu `removeQueries(projectKeys.detail(id))`. Iepriekšējā labojumu
kārtā tas netika pamanīts, jo meklēšana bija pēc masīva literāļa `([`, bet šeit atslēgu
veido funkcijas izsaukums. Sekas tādas pašas kā pārējiem: filtrs bez `queryKey` sakrita
ar visiem vaicājumiem, tāpēc projekta dzēšana izmeta visu kešatmiņu.

### Jaunums: augšējā palīdzības poga norāda uz dokumentāciju pēc ekrāna daļas

Augšējā labā `?` poga agrāk atvēra dokumentāciju pirmajā lapā, un lietotājam pašam
bija jāatrod vajadzīgā nodaļa. Tagad tā ieslēdz **norādīšanas režīmu**:

1. Klikšķis uz `?` neatver neko — poga kļūst aktīva un kursors visā lapā pārvēršas par `?`.
2. Pārvietojot peli, **iekrāsojas veselas ekrāna daļas** (nevis atsevišķi lauki vai teksti),
   un uz rāmja parādās daļas nosaukums, piem. "Glabājamo vienību saraksts".
3. Klikšķis uz iekrāsotās daļas atver palīdzību **tieši tajā nodaļā**.
4. `Esc`, labais klikšķis, poga "Atcelt" vai atkārtots klikšķis uz `?` režīmu atceļ.

- **Jauns:** [HelpPicker.jsx](opex_tool_frontend/src/Help/HelpPicker.jsx) +
  [HelpPicker.css](opex_tool_frontend/src/Help/HelpPicker.css) — pārklājums, iekrāsošana
  un notikumu pārtveršana; [helpZones.js](opex_tool_frontend/src/Constants/helpZones.js) —
  reģistrs, kas saista ekrāna daļu ar palīdzības nodaļu/sadaļu (24 zonas: projekts,
  uzskaites saraksts, glabājamā vienība, dokumentu saraksts, dokuments, metadati, datnes,
  navigācija, pārbaude, iestatījumi, vadlīnijas, atbildīgās personas).
- **Zonas ir apzināti rupjas** — domēna hierarhijas līmenī, nevis pa laukiem. Atsevišķu
  lauku skaidrojumi paliek `<FieldHelp>` burbuļos, formu palīdzība — `<HelpButton>` pogās.
- **Pārējās palīdzības pogas nav mainītas.** Visas ~27 `?` pogas logos un formās
  (`<HelpButton chapterId=... />`) joprojām ar vienu klikšķi atver savu nodaļu.
  `HelpButton` ieguva neobligātu `onActivate` propu — tikai augšējā poga to lieto.
- Ja zem kursora nav reģistrētas zonas, klikšķis neko nedara un režīms paliek ieslēgts —
  labāk nekā aizvest lietotāju uz dokumentācijas pirmo lapu.
- Norādīšanas laikā tiek pārtverts arī `mousedown` (ne tikai `click`), jo daļa vadīklu
  (piem. `react-select`) reaģē uz nospiešanu — citādi izvēle nejauši nospiestu pogas zem kursora.

### Vadlīnijas tagad saista katru soli ar dokumentāciju

Vadlīniju kartīte atbildēja tikai uz "ko darīt tālāk" un aizveda uz pareizo ekrānu, bet
nekad nepaskaidroja "kā". Katram darbības veidam pievienota atsauce uz palīdzības nodaļu.

- Jauns `ACTION_HELP` un `getActionHelp()`
  [useGuidanceEngine.js](opex_tool_frontend/src/Guidance/useGuidanceEngine.js): piem.
  `CREATE_ITEM → items/create-item`, `UPLOAD_FILE → records/record-files`,
  `ADD_SIGNERS → projects/institution-signers`, `EXPORT → verification/exporting-opex`.
- Kartītē blakus galvenajai darbības pogai, atbildīgo personu rindai un katrai uzskaites
  saraksta rindai parādās neuzkrītoša `?` poga, kas atver attiecīgo nodaļu.
- Darbības veidam bez ieraksta `ACTION_HELP` poga netiek rādīta vispār — nav saišu,
  kas ved uz tukšu vietu.

### Kešatmiņa: React Query izsaukumi lietoja noņemtu v4 sintaksi (visa keša izmešana)

Projektā ir React Query **v5.76.1**, bet 26 izsaukuma vietās tika lietots v4 paraksts
`invalidateQueries(atslēga)` — masīvs kā pirmais arguments. v5 pirmo argumentu vairs
netulko kā atslēgu, bet kā **filtru objektu**. Masīvam nav `queryKey` lauka, tāpēc
filtrs sakrita ar **visiem** vaicājumiem: katra vienības/dokumenta/uzskaites saraksta
izveide, labošana vai dzēšana izmeta un pārlādēja visu kešatmiņu, nevis vienu projektu.

- **Cēlonis:** nepabeigta v4 → v5 migrācija. `useRecords.js`, `useFiles.js` un
  `useMetadata.js` jau lietoja pareizo objekta formu `{ queryKey: [...] }`, pārējie ne.
- **Sekas:** optimistiskie atjauninājumi
  [useItems.js](opex_tool_frontend/src/hooks/useItems.js) tika uzreiz atcelti ar pilnu
  pārlādi; katra darbība radīja lieku tīkla pieprasījumu vilni un formu "mirgošanu".
- **Labojums:** visi 26 izsaukumi pārrakstīti uz v5 formu — `invalidateQueries` un
  `cancelQueries` failos [useProjects.js](opex_tool_frontend/src/hooks/useProjects.js),
  [useItems.js](opex_tool_frontend/src/hooks/useItems.js),
  [useInventories.js](opex_tool_frontend/src/hooks/useInventories.js),
  [useInstitutions.js](opex_tool_frontend/src/hooks/useInstitutions.js),
  [Item.js](opex_tool_frontend/src/Item/Item.js),
  [Record.js](opex_tool_frontend/src/Record/Record.js),
  [RecordsList.js](opex_tool_frontend/src/Record/RecordsList.js) un
  [QuickCreate.jsx](opex_tool_frontend/src/DevAdmin/components/QuickCreate.jsx).
- Papildus izlabota **nepareiza atslēgas forma** 6 vietās: tika lietots
  `['project', projectId]`, lai gan īstā atslēga ir `['project', 'detail', projectId]`
  (`QUERY_KEYS.project`). Trīs no tām bija lieks dublikāts blakus pareizajam
  izsaukumam un ir noņemtas.

### Vadlīnijas ("Smart Guide") atkal iespējamas — jauna sadaļa iestatījumos

Vadlīniju kartīte bija pilnībā izslēgta ar `{false && ...}`
[Project.js](opex_tool_frontend/src/Project/Project.js) kodā, ar komentāru, ka sistēma
ir nepabeigta. Cietkodēts slēdzis aizstāts ar īstu lietotāja iestatījumu.

- **Jauna cilne "Vadlīnijas"** iestatījumu logā
  ([GuidanceSettings.jsx](opex_tool_frontend/src/Settings/components/GuidanceSettings.jsx)):
  galvenais slēdzis "Rādīt vadlīniju kartīti", rādīšanas režīms (Vienmēr / Kad ir
  kļūdas / Nekad), novietojums (apakšā vai augšā pa labi) un poga noraidīto
  brīdinājumu atiestatīšanai.
- **Noklusējums: ieslēgts** (`guidance.enabled: true`
  [SettingsContext.jsx](opex_tool_frontend/src/Settings/context/SettingsContext.jsx)) —
  kartīte pēc atjaunināšanas parādās visiem lietotājiem. Izslēdzot slēdzi, komponente
  netiek montēta nemaz.
- **Iestatījumi apvienoti vienā vietā.** `GuidanceContext` glabāja savus iestatījumus
  atsevišķā `localStorage` atslēgā `guidanceSettings`, kas nekur netika nolasīta —
  `showMode` ("Nekad" ieskaitot) un lielākā daļa `settings` lauku bija miris kods.
  Tagad `enabled` / `showMode` / `position` dzīvo `opex_settings` blakus pārējiem
  iestatījumiem (tātad tie arī eksportējas/importējas), bet `GuidanceContext` patur
  tikai sesijas stāvokli (vai lietotājs kartīti aizvēra vai minimizēja).
- **`showMode` beidzot darbojas.** `shouldShowGuide()` bija definēta, bet
  `SmartGuideCard` to nekad nesauca. Tagad kartīte režīmā "Kad ir kļūdas" parādās
  tikai tad, ja ir neizdarīti soļi vai validācijas kļūdas/brīdinājumi.

### Labots: iestatījumu grupu apvienošana zaudēja jaunus noklusējumus

`SettingsContext` ielādēja saglabātos iestatījumus ar `{ ...DEFAULT_SETTINGS, ...stored }`.
Ligzdotajām grupām (`validation`, `experimental`, `guidance`) saglabātais objekts
**aizstāja** noklusējumu pilnībā, tāpēc jebkura jauna apakšatslēga paliktu `undefined`
katram lietotājam, kam `opex_settings` jau eksistē.

- Bez šī labojuma jaunā `guidance` grupa nekad nesasniegtu esošos lietotājus.
- **Labojums:** pievienota `mergeWithDefaults()`, kas ligzdotās grupas apvieno vienu
  līmeni dziļāk. Lietota gan ielādē, gan `importSettings()`, gan `resetSettings()`.
- `resetSettings()` vairs nepiešķir `DEFAULT_SETTINGS` pēc atsauces — agrāk ligzdotos
  objektus varēja netīši izmainīt uz vietas un sabojāt noklusējumus visai sesijai.

### Labots: paslēptie brīdinājumi pārgāja no viena projekta uz citu

[SmartGuideCard.jsx](opex_tool_frontend/src/Guidance/SmartGuideCard.jsx) nolasīja
`opex_dismissed_warnings` tikai vienreiz, montējot komponenti. Kartīte paliek montēta,
pārslēdzoties starp projektu cilnēm, tāpēc projektā A paslēptie brīdinājumi tika
piemēroti arī projektam B. Nolasīšana pārcelta uz `useEffect`, kas seko projekta ID.

### Iestatījumu sadaļa "Formas" tagad prasa nospiest "Saglabāt izmaiņas"

Iestatījumu logā cilne **Formas** (formu priekšiestatījumi) bija vienīgā, kas rakstīja
izmaiņas uzreiz. Katrs klikšķis un katrs ievadītais burts nekavējoties nonāca
`SettingsContext` un `localStorage`; poga "Saglabāt izmaiņas" uz šo cilni neattiecās,
"Atcelt" izmaiņas neatcēla, un rādītājs "Ir nesaglabātas izmaiņas" nekad neparādījās.
Pārējās cilnes (Attēlošana, Validācija, Eksperimentālie) jau strādāja ar melnrakstu.

- **Cēlonis:** [FormDefaults.jsx](opex_tool_frontend/src/Settings/components/FormDefaults.jsx)
  neizmantoja `Settings.jsx` lokālo melnrakstu (`localSettings`), bet sauca
  `SettingsContext` funkcijas `updatePreset` / `createPreset` / `deletePreset` /
  `duplicatePreset` / `setActivePreset` tieši, un konteksts katru izmaiņu tūlīt
  saglabāja `localStorage`.
- **Labojums:** `FormDefaults` pārtaisīts par kontrolētu komponenti
  (`settings` + `onChange` propi, tāpat kā `DisplaySettings`). Visas darbības —
  lauku rediģēšana, izveide, dublēšana, pārdēvēšana, dzēšana un aktīvā
  priekšiestatījuma maiņa — tagad maina tikai `formPresets` / `activePresetId`
  melnrakstā. [Settings.jsx:85](opex_tool_frontend/src/Settings/Settings.jsx#L85)
  padod `localSettings` un `handleLocalChange`.
- **Ko lietotājs jūt:** pēc jebkuras izmaiņas cilnē "Formas" kājenē parādās
  "Ir nesaglabātas izmaiņas", "Saglabāt izmaiņas" kļūst aktīva, un tikai tās
  nospiešana ieraksta izmaiņas. "Atcelt" (vai loga aizvēršana) tagad izmaiņas
  atmet, iepriekš brīdinot par nesaglabātām izmaiņām.
- Noņemts maldinošais paziņojums "Aktīvais priekšiestatījums nomainīts!", kas
  parādījās vēl pirms saglabāšanas. Sadaļas apakšā pievienots paskaidrojums, ka
  izmaiņas stājas spēkā pēc saglabāšanas; dzēšanas apstiprinājuma tekstā tas pats
  norādīts.
- Noklusējuma priekšiestatījuma dzēšanas aizsardzība (agrāk `deletePreset` izmests
  `Error`) pārnesta uz komponenti kā paziņojums lietotājam.

### Ievilktas backend izmaiņas no `db_development` (`97eaa9f`)

`db_development` zars ievilkts `frontend-dev` (merge `97eaa9f`). Konfliktu nebija —
backend izmaiņas skar tikai `inventories/`, ko frontenda darbs neaiztiek. Ievilkts
viens jauns commit: `75968f5` "Refactor: add inventory process" (Svyat Elkind,
2026-08-05).

- **Uzskaites saraksta numuru tagad piešķir backends, nevis lietotne.**
  [inventories/models.py:132-137](inventories/models.py#L132-L137) — `add_inventory()`
  UI ceļā pārraksta `number` ar `MAX(number) + 1` attiecīgajā fondā. Agrāk numurs
  nāca no pieprasījuma un tika tikai validēts.
- **Izņemts `validate_inventory_number()`** ([inventories/helpers/validators.py](inventories/helpers/validators.py))
  un `Inventory.clean()` pārbaude, kas to sauca — validācija vairs nav vajadzīga, jo
  numuru ģenerē pats backends.
- **`Inventory.__str__` tagad rāda arī postfiksu** (`1a.US`, nevis `1.US`).

**Ko tas nozīmē frontendam (vēl nav mainīts — skat. zemāk):**
[Inventory/InventoryCreate.js:127-130](opex_tool_frontend/src/Inventory/InventoryCreate.js#L127-L130)
joprojām sarēķina `number: inventoryCount + 1` un sūta to uz serveri. Serveris to
tagad **ignorē**. Praksē numurs parasti sakritīs, bet ne vienmēr (piem., ja saraksts
ir dzēsts vai daļa sarakstu nāk no VVAIS atskaites) — tad
[InventoryCreate.js:211](opex_tool_frontend/src/Inventory/InventoryCreate.js#L211)
paziņojums "Uzskaites saraksts tiks izveidots ar numuru N" lietotājam parādīs vienu
numuru, bet izveidosies cits.

### Izlabota kļūda: "Slepenība" rādīja tukšu "—", nevis noklusējumu

Vairāku glabājamo vienību izveides logā lauks **Slepenība** rādīja tukšu `—`, lai gan
noklusējumam jābūt **"Publisks"**. Blakus esošā **Pieejamība** strādāja pareizi.

- **Cēlonis: Iestatījumu izvēlnes piedāvāja vērtības, kādu formās nekad nav bijis.**
  [Settings/components/FormDefaults.jsx](opex_tool_frontend/src/Settings/components/FormDefaults.jsx)
  opcijas bija ierakstītas ar roku un bija novirzījušās no īstajiem sarakstiem:

  | Lauks | Iestatījumi piedāvāja | Derīgās vērtības (`helpers/constants.py`) |
  |---|---|---|
  | Slepenība | `Iekšējam lietojumam` | `Iekšējs` |
  | Ierobežojuma tips | `Konfidenciāla` | `Sensitīvi dati` |
  | Piekļuves ierobežojums | `restricted` | tikai `open` / `closed` |

  Kad profilā nonāk vērtība, kuras izvēlnē nav, `BulkFieldControl` pieliek tukšu `—`
  opciju ([BulkFieldRow.jsx:66-68](opex_tool_frontend/src/components/BulkFieldRow.jsx#L66-L68)) —
  tieši to lietotājs arī redzēja. Tā pati vērtība neizturētu arī validāciju.
- **Labots pie saknes:** visas trīs Iestatījumu izvēlnes tagad tiek ģenerētas no tiem
  pašiem sarakstiem, ko lieto validācija (`ITEM_SECURITY_LEVEL_LIST`,
  `ITEM_RESTRICTION_LIST`, `RECORD_ACCESS_RESTRICTION_VALUES`), nevis rakstītas ar roku,
  tāpēc tās vairs nevar novirzīties.
- **Jau saglabātie profili tiek sakārtoti,** jo labojums izvēlnē neaizsniedz to, kas
  lietotājam jau stāv `localStorage`. `getActivePreset()`
  ([SettingsContext.jsx](opex_tool_frontend/src/Settings/context/SettingsContext.jsx))
  tagad pārtulko vecās vērtības uz to, kas bija domāts (`Iekšējam lietojumam` →
  `Iekšējs`, `Konfidenciāla` → `Sensitīvi dati`, `restricted` → `closed`), bet pilnīgi
  nezināmu vērtību noņem, lai forma paņemtu savu noklusējumu ("Publisks") — nevis
  paliktu tukša. Rezultāts memoizēts, lai atsauce nemainītos katrā renderī.
- **Formas izvēlnei pievienota trūkstošā vērtība.** `OPTIONS_SLEPENĪBA`
  ([uiStrings/itemUI.js](opex_tool_frontend/src/Constants/uiStrings/itemUI.js)) piedāvāja
  4 vērtības, kaut backends pieņem 5 — **"Sevišķi slepens" nebija izvēlams nevienā formā**.
  Tagad saraksti sakrīt.
- **Nemainīts:** paši noklusējumi izveides ceļos jau bija pareizi un palika kā bija —
  [MultiCreateItemsPopup.jsx:44](opex_tool_frontend/src/Item/MultiCreateItemsPopup.jsx#L44),
  [CreateItemNavigable.js:82](opex_tool_frontend/src/Item/CreateItemNavigable.js#L82),
  [importMapper.js:284](opex_tool_frontend/src/Utils/importMapper.js#L284),
  [ItemAccessSectionPopup.jsx:19](opex_tool_frontend/src/Item/sections/ItemAccessSectionPopup.jsx#L19).
  Kļūda bija datos, ko tie saņēma, nevis pašos noklusējumos.
- **Tests:** [Item/MultiCreateItemsPopup.test.js](opex_tool_frontend/src/Item/MultiCreateItemsPopup.test.js)
  uzzīmē īsto logu un pārbauda, ka bez profila Slepenība rāda "Publisks", ka `—` opcijas
  nav vispār, un ka **katra** derīgā Slepenības un Pieejamības vērtība tiešām atlasās —
  tieši tas, kas šoreiz bija salūzis. `npm test` — 22/22 (bija 16).

### Izlabota kļūda: backends nestartēja pēc `db_development` ievilkšanas

Pēc merge `97eaa9f` Django neielādējās vispār — `uvicorn opex_project.asgi:application`
krita ar `ImportError` jau lietotņu reģistra ielādes brīdī, tātad nestrādāja ne API,
ne admin, ne frontenda izsaukumi.

- **Cēlonis:** commit `75968f5` pievienoja `MSG_E_OBJECT_EXISTS` importa sarakstam
  [inventories/helpers/validators.py:8](inventories/helpers/validators.py#L8), bet
  **tāda konstante nekad nav eksistējusi** — `helpers/constants.py` definē
  `MSG_E_OBJECT_DOES_NOT_EXIST` un `MSG_E_OBJECT_NUMBER`. Vārds netika arī nekur
  lietots, tātad tā bija pārrakstīšanās, pārkārtojot importus refaktoringa laikā.
- **Labojums:** neeksistējošais vārds izņemts no importa rindas. Uzvedība nemainās —
  imports bija miris kods.
- **Apzināti minimāls labojums.** Aiztikta tikai viena rinda, lai neveidotos konflikts,
  kad tas pats tiks salabots `db_development` zarā. Šī ir izņēmuma izmaiņa backendā —
  klienta pusē to apiet nevar, jo serveris nestartē vispār.
- **Pārbaudīts:** `django.setup()` un `import opex_project.asgi` izpildās bez kļūdām;
  `manage.py makemigrations --check` — "No changes detected" (shēma nemainās).

### Nesakārtots / jāizlemj pirms commit

- **Vadlīnijas ieslēgtas pēc noklusējuma.** Kods, kas tās izslēdza, saturēja komentāru
  "the Guidance system is incomplete". Slēdzis tagad ir lietotāja rokās, bet
  noklusējums ir `true`, tāpēc kartīte parādīsies visiem. Ja pirms izlaišanas rodas
  šaubas par kartītes gatavību, `guidance.enabled` noklusējumu
  [SettingsContext.jsx](opex_tool_frontend/src/Settings/context/SettingsContext.jsx)
  var pārslēgt uz `false` — pārējais darbojas nemainīgi.
- **Koda pārskatē atrastais, kas apzināti NAV labots šajā piegājienā** (nav saistīts ar
  vadlīnijām; katrs ir atsevišķa izmaiņa):
  - `SettingsContext` funkcijas `createPreset` / `deletePreset` / `duplicatePreset` /
    `setActivePreset` pēc "Formas" cilnes pārtaisīšanas vairs nekur netiek sauktas.
    Atstātas, ja vēl noder; citādi dzēšamas.
  - Neizmantotas `package.json` atkarības: `@tanstack/react-query-persist-client`,
    `@tanstack/react-query-devtools`, `react-datetime-picker`, `web-vitals`,
    `@testing-library/user-event`. Komentārs
    [index.js:91](opex_tool_frontend/src/index.js#L91) sola keša saglabāšanu
    `localStorage`, bet neviens persisters nav uzstādīts — vai nu jāievieš, vai
    komentārs jālabo.
  - `apiClient` atkārto pieprasījumu līdz 2 reizēm, un React Query virsū vēl 3 —
    viens neveiksmīgs GET var izraisīt līdz 12 pieprasījumiem ar gaidīšanu.
  - `isNotFoundStatus` [errorService.js:155](opex_tool_frontend/src/services/errorService.js#L155)
    patiesībā ir 204 pārbaude (`isNoContentStatus` aizstājvārds) — nosaukums maldina.
  - `apiClient` `createTimeoutController` pievieno `abort` klausītāju ārējam signālam
    un nekad to nenoņem.
  - `getRouteValidationGrouped` [SmartGuideCard.jsx](opex_tool_frontend/src/Guidance/SmartGuideCard.jsx)
    saista validācijas rezultātus ar vienībām pēc masīva indeksa, nevis pēc `id`.
    Darbojas, kamēr validators atgriež masīvus tādā pašā secībā.
  - ESLint uzrāda 97 brīdinājumus ārpus `DevAdmin/` (lielākoties neizmantoti importi,
    daži `react-hooks/exhaustive-deps`). Nav kritiski, bet slēpj īstos brīdinājumus.
- **Jāpaziņo `db_development` autoram par `MSG_E_OBJECT_EXISTS`.** Augšminētais
  labojums ir tikai `frontend-dev` zarā. Kamēr tas nav salabots arī `db_development`,
  katrs nākamais merge atkal ienesīs bojāto importu.
- **Divi miruši importi tajā pašā failā atstāti neaiztikti** —
  `MSG_E_OBJECT_NUMBER` un `from django.db.models import Max`
  ([inventories/helpers/validators.py](inventories/helpers/validators.py)) pēc
  `validate_inventory_number()` izņemšanas vairs netiek lietoti. Tie **nerada kļūdu**
  (vārdi eksistē), tāpēc atstāti backend autoram — tā ir sakopšana, nevis labojums.
- **`InventoryCreate.js` numura paziņojums var maldināt.** Pēc `75968f5` numuru
  nosaka serveris. Frontendā būtu jāizvēlas viens no diviem: (a) noņemt `number` no
  pieprasījuma un vairs nesolīt konkrētu numuru pirms izveides, rādot faktisko numuru
  no servera atbildes, vai (b) atstāt kā ir, ja tiek garantēts, ka sarakstus nedzēš.
  **Nav mainīts**, jo tā ir izlemjama izmaiņa lietotāja plūsmā, nevis tehnisks
  labojums. Backends netiek aiztikts.
- **Backendā `last_number + 1` pieņem, ka fondā jau ir vismaz viens saraksts**
  ([inventories/models.py:136](inventories/models.py#L136)) — koda komentārs to arī
  saka. Ja fondā sarakstu nav, `MAX(number)` ir `None` un sanāk `TypeError`. Tas ir
  backend jautājums (`db_development` autoram), nevis frontenda labojums.

---

## 2026-08-06 — `056563b` (`frontend-dev`)

Bāze: `3067293` (iepriekšējais `origin/frontend-dev`).

### Terminoloģija: "ieraksts" → "dokuments" visā rīkā

Rīks entītiju starp glabājamo vienību un datnēm līdz šim sauca gan par "ierakstu",
gan par "dokumentu" — bieži abus vienā teikumā ("Ieraksts (Dokuments)", "Kopējais
dokumentu (ierakstu) skaits"). Tagad visur ir viens vārds — **dokuments**.

- **522 vietas 56 failos.** Latviešu locījumi pārtulkoti automātiski (abi vārdi ir
  vienas deklinācijas: `ieraksts/-a/-am/-u/-i/-iem/-us/-os` → `dokuments/-a/…`),
  pēc tam ar roku salaboti 31 vietā, kur sanāca "dokumenta dokuments" vai
  "dokuments (dokuments)".
- **Segums:** visi lietotnes teksti (`opex_tool_frontend/src/**` — `helpConstants.js`,
  `fieldHelp.js`, `uiStrings/*`, validācijas paziņojumi, DevAdmin žurnāli),
  [LIETOTAJA_ROKASGRAMATA.md](LIETOTAJA_ROKASGRAMATA.md), importa paraugfaili
  (`opex_tool_frontend/public/examples/`) un iekšējie QA/plānošanas dokumenti.
  Django backendā latviešu vārda "ieraksts" nav vispār, tāpēc tur nekas nebija jāmaina.
- **Divi vārdi ar citu nozīmi apzināti atstāti:** "pieraksta"/"Pierakstiet"
  (cits vārds) un `ierakstīt` (darbības vārds — "ierakstīt meklēšanas laukā").
- **Pārsaukts arī paraugfails:** `imports_tikai_ieraksti.csv` →
  `imports_tikai_dokumenti.csv`; `tools/make_import_examples.py` atjaunināts un
  paraugfaili (CSV + XLSX + README.txt) pārģenerēti.
- **Nemainīts apzināti:** `IERAKSTS` kā pieņemamā vērtība importa faila kolonnā TIPS
  ([importConstants.js:23](opex_tool_frontend/src/Constants/importConstants.js#L23)).
  Tas nav rādāms teksts, bet ievades pielaide — noņemot to, pārstātu strādāt faili,
  kas lietotājiem jau ir. Pievienots komentārs, kas to paskaidro.
- **Izlabota blakus atrasta kļūda:** `Navigation.css` krāsoja izsekošanas ceļu ar
  selektoru `[title*="Ieraksts"]`, bet pats teksts jau sen bija "Dokuments"
  (`navigationUI.js` → `BREADCRUMB_DOKUMENTS`), tāpēc **šis noformējums nestrādāja**.
  Tagad selektors sakrīt ar tekstu.
- **Nav mainīts:** `CHANGELOG.md` (vēsturisks pieraksts) un `CLAUDE.md` (tur "ieraksts"
  nozīmē ierakstu žurnālā, nevis entītiju). Koda identifikatori (`record`, `Record`,
  `records`, API lauki) palikuši angliski, kā visur pārējā kodā.
- Pārbaudīts: `npm test` 16/16 (t.sk. pārģenerētā `imports_paraugs.xlsx` nolasīšana un
  Word eksporta satura segums), `npm run build:dev` bez kļūdām.

### Palīdzības sadaļas eksports uz Word (.docx)

Palīdzības logā (`/?help=true`) blakus meklēšanas laukam ir jauna poga
**"Lejupielādēt Word"**, kas visu palīdzības saturu saglabā kā vienu `.docx` failu
(`OPEX_palidziba_GGGG-MM-DD.docx`). Fails top lietotāja datorā — nekas netiek sūtīts
uz serveri, un backend nav aiztikts.

- **Dokumenta uzbūve atkārto to, kas redzams ekrānā:** titullapa, satura rādītājs ar
  saitēm uz nodaļām un sadaļām, tad visas 16 nodaļas / 67 sadaļas tajā pašā secībā,
  katra nodaļa uz jaunas lappuses, lappušu numuri kājenē. Iznākums ~55 A4 lappuses.
- **Visi 10 satura bloku tipi ir pārtulkoti uz Word ekvivalentu:** `paragraph`,
  `heading`, `list` (aizzīmes), `steps` (numurēts saraksts — katrs sāk no 1),
  `note` (tonēta kaste ar krāsainu malu un apzīmējumu "Informācija"/"Uzmanību"/"Svarīgi"),
  `table` (īsta Word tabula ar atkārtotu galveni), `accordion` (atvērts),
  `code`, `ui-example` un `annotated-screen` (HTML noformējums nav atveidojams Word
  formātā, tāpēc no tā tiek izvilkts teksts un likts vienplatuma fonta kastē — visi
  paraksti, apraksti un ①②③ skaidrojumi saglabāti pilnībā), `color-palette`
  (tabula ar reāli iekrāsotām šūnām).
- **Krāsas tiek nolasītas no lietotnes tēmas** (`--color-primary` u.c.) eksporta brīdī,
  bet fona toņi vienmēr tiek jaukti pret baltu — arī tumšajā režīmā dokuments iznāk
  gaišs un drukājams.
- Jaunie faili: [opex_tool_frontend/src/Utils/docxWriter.js](opex_tool_frontend/src/Utils/docxWriter.js)
  (ZIP + OOXML rakstītājs), [opex_tool_frontend/src/Help/helpDocxExport.js](opex_tool_frontend/src/Help/helpDocxExport.js)
  (satura kartēšana), [opex_tool_frontend/src/Help/helpDocxExport.test.js](opex_tool_frontend/src/Help/helpDocxExport.test.js).
  Mainīti: `Help/Help.js`, `Help/Help.css`, `Constants/helpConstants.js` (`HELP_UI` teksti).
- **Bez jaunām atkarībām.** `.docx` ir ZIP ar XML, tāpēc rakstītājs ir uzrakstīts pats —
  tāpat kā `Utils/xlsxReader.js` lasīšanas pusē. Saspiešanai izmanto pārlūka
  `CompressionStream`; ja tā nav, ieraksti tiek glabāti nesaspiesti (fails lielāks,
  bet atveras tāpat). Kods ielādējas tikai pēc pogas nospiešanas (atsevišķs chunk),
  tāpēc palīdzības loga ielāde nekļūst smagāka.
- **Pārbaudīts:** ģenerētais fails atveras Microsoft Word 16 bez "labošanas" brīdinājuma
  (55 lpp., 120 tabulas, 83 satura rādītāja saites), visas XML daļas ir korektas, un
  automātiskā pārbaude apstiprina, ka **visas 1332 redzamās teksta virknes** no
  `helpConstants.js` ir nonākušas dokumentā. `npm test` — 16/16.

### Izlabota kļūda: trīs palīdzības sadaļas neatvērās (balts logs)

`Constants/helpConstants.js` — trīs bloki ar `type: 'steps'` glabāja soļus atslēgā
`items:`, nevis `steps:`. `Help.js` renderētājs sauc `contentItem.steps.map(...)`, tāpēc
sanāca `TypeError` un **viss palīdzības logs kļuva balts**, atverot šīs sadaļas:
Glabājamās Vienības → "Vairāku vienību izveide" un "Imports no CSV / Excel",
Ieraksti → "Vairāku ierakstu izveide". Šie soļu saraksti līdz šim nebija redzami vispār.

- **Cēlonis:** pārrakstīšanās, pievienojot jaunās sadaļas kopā ar bulk/import darbu
  (`3067293`). Atklāts, salīdzinot Word eksporta saturu ar avotu.
- Papildus `Help.js` renderētājs `list`, `steps` un `table` blokiem tagad pieļauj
  trūkstošu masīvu (`(x || [])`) — turpmāk šāda kļūda satura failā zaudēs vienu bloku,
  nevis nogāzīs visu logu.

### Frontenda būvējums pārbūvēts

`opex_tool_frontend/build-dev/` pārbūvēts ar `npm run build:dev`, lai augšminētās
izmaiņas būtu redzamas caur Django (`OPEX_BUILD=dev`).

### Būvējuma mapes pārbūve + backend saite uz paraugfailiem

- **Abas vecās būvējuma mapes izdzēstas un uztaisīta jauna dev būvējuma mape.**
  `opex_tool_frontend/build/` un `build-dev/` izdzēstas; ar `npm run build:dev`
  izveidota jauna `build-dev/` (DevAdmin ieslēgts, testa datnes `files/` un
  importa paraugfaili `examples/` iekopēti). Vecā `build-dev/` bija no 23. jūlija,
  t.i. **bez visa jaunā** — un tieši to backend pasniedza.
  Produkcijas `build/` šobrīd **nav**; kad vajag, to atjauno ar `npm run build`.
- **Backend pasniedz dev būvējumu.** `opex_project/settings.py` →
  `OPEX_BUILD = os.environ.get('OPEX_BUILD', 'dev')` (skat. arī sadaļu
  "Nesakārtots"). Palaišana nemainās:
  `uvicorn opex_project.asgi:application --host 127.0.0.1 --port 8000 --reload`.
- **Izlabota kļūda: paraugfailu lejupielāde nestrādāja caur backend.**
  `opex_project/urls.py` — pievienots maršruts `^examples/(?P<path>.*)$`, un
  `examples/` pievienots izņēmumiem "visu pārējo rādi kā React lapu" maršrutā.
  **Cēlonis:** `/examples/…` iekrita catch-all maršrutā, tāpēc serveris atdeva
  `index.html`, un pārlūks to saglabāja ar nosaukumu `imports_paraugs.xlsx`
  (548 baiti HTML, nevis fails). Tas strādāja tikai `npm start` režīmā.
  Pārbaudīts ar palaistu uvicorn: tagad `.csv` = 2351 B, `.xlsx` = 12666 B ar
  `PK` (īsts zip), `README.txt` = text/plain; `/`, SPA maršruti, `/help.html`,
  `/files/`, `/api/v1/` un `/admin/` darbojas kā iepriekš.

> Piezīme: `urls.py` ir **backend** fails. Tas ir vienīgais backend fails, kas
> aiztikts visā šajā darbā, un tas ir statisko datņu pasniegšanas konfigurācija,
> nevis loģika — tieši tas, ko lūdza uzdevums "konfigurēt Django palaišanu ar
> dev būvējumu". Bez tā frontendā jau ieviestās lejupielādes saites ir bojātas.

### Jauno logu teksta attīrīšana (mazāk atkārtojumu)

Pēc izskata saskaņošanas izrādījās, ka vienu un to pašu logi pasaka vairākas reizes.
Katrs skaitlis un noteikums tagad ir **vienā vietā**:

- **Vairāku rediģēšanā** atlasīto skaits bija četrās vietās (virsraksts, josla zem tā,
  kājene, pārskata virsraksts). Tagad tas ir tikai virsrakstā; josla zem virsraksta
  saka noteikumu ("Atzīmētie lauki tiks pārrakstīti visām — neatzīmētie katrai
  vienībai paliks savi"), kājene — cik lauku atzīmēts, pārskats — cik vienībām katrs
  lauks tiešām mainīsies. Divas joslas zem virsraksta apvienotas vienā.
- **Vairāku izveidē** josla zem virsraksta atkārtoja virsrakstu gandrīz vārds vārdā —
  noņemta. Apakšvirsraksts par GV numuriem pārcelts pie rindu tabulas, kur tas ir
  attiecināms (agrāk tas solīja "prognozi" tabulai, kurā GV kolonnas nemaz nav).
- **Importā** brīdinājuma josla vairs nesāk ar "Eksperimentāla funkcija" — to jau
  saka nozīmīte virsrakstā. Priekšskatījums rāda kļūdu skaitu tikai tad, ja kļūdas ir;
  kolonnu rinda saka "Visas kolonnas atpazītas", nevis daļskaitli, kad viss ir kārtībā.
- **Noņemti "?" burbuļi, kas atkārtoja blakus redzamo tekstu** (sadaļu virsrakstos) un
  vispārīgais burbulis, kas parādījās pie katras lauka rindas. Lauku līmeņa
  paskaidrojumi — tie, kas patiešām skaidro lauku — palikuši.
- **Izdzēsti 14 nelietoti teksti** (`BULK_UI`, `IMPORT_UI`), kas solīja neieviestas
  lietas: "Mēģināt vēlreiz neizdevušajām", priekšiestatījumu saglabāšana kopīgajiem
  laukiem, "vispirms saglabājiet kopiju". Tie nekur netika rādīti.
- **Izlabots:** tukšs fails tagad saka "Fails ir tukšs" (agrāk vienkārši nekas
  neparādījās); liela atlases brīdinājums pārvietots loga ķermenī, lai tas nekarātos
  starp joslām bez atkāpēm.

### Jauno logu izskata saskaņošana ar pārējo lietotni + lauku paskaidrojumi

Visi trīs jaunie logi (vairāku rediģēšana, vairāku izveide, imports) tagad izskatās
tāpat kā pārējās formas — atšķiras tikai saturs, nevis "korpuss".

- **Vienāds korpuss ar lielajām formām** (`CreateItemNavigable.css` stils):
  aizmiglots pārklājums ar primāro toni, kartes konteiners ar primāro apmali un
  `--border-radius-2xl`, gradienta virsraksta josla ar baltu tekstu, sadaļu kartes,
  kājenes josla. Iepriekš šiem logiem bija sava, atšķirīga noformējuma sistēma.
- **Pogas vairs nav savas** — logi lieto `create-item-nav-btn` /
  `-btn-primary` / `-btn-cancel` klases, tāpat kā izveides un rediģēšanas formas.
  Pašu `bulk-popup-btn` klašu vairs nav.
- **Lauku etiķetes, ievades lauki un palīdzības teksti** lieto tās pašas klases, ko
  formas (`create-item-nav-field-label`, `create-item-nav-input/select/textarea`,
  `field-hint`) — tas pats risinājums, ko jau lieto sadaļu rediģēšanas logi.
- **Atlases josla** (`SelectionToolbar`) pārtaisīta pēc esošās `.batch-actions-bar`
  parauga: primārais tonis, tāda pati izslīdēšanas animācija un pogu proporcijas.
- **Krāsainā virsraksta josla vairs nav tas, kas atšķir šos logus.** Tā vietā zem
  virsraksta ir josla ar skaidru tekstu ("Izmaiņas tiks saglabātas 12 glabājamām
  vienībām"), bet importam — sarkanā eksperimentālās funkcijas josla. Signāls
  saglabājas, bet noformējums ir vienots.

**Pievienoti lauku paskaidrojumi ("?" burbuļi), kur to trūka**

- Vairāku izveides logā kopīgajiem laukiem tagad ir tie paši `FieldHelp`
  paskaidrojumi, kas formās (agrāk tie bija pazuduši), un tie ir arī rindu tabulas
  kolonnām (Nosaukums, Reģ. nr.).
- Jauni paskaidrojumi tam, kas ir tikai šajos logos: ko nozīmē lauka ķeksītis, ko
  nozīmē "dažādas vērtības", ko dara režīmi (aizvietot / pievienot / notīrīt),
  ielīmēšana, `{n}` šablons, "1 datne = 1 ieraksts", pārskata solis.
- Importa logā: kāpēc jāsaglabā kā "CSV UTF-8", kā tiek atpazīti virsraksti, ko
  nozīmē kolonna "Piesaiste" priekšskatījumā.

### Jaunums: imports no CSV / Excel (eksperimentāla funkcija)

Lietotājs var izveidot glabājamās vienības un ierakstus no `.csv` vai `.xlsx` faila.
**Viss notiek pārlūkā** — faila lasīšana, kodējumu noteikšana, kolonnu kartēšana,
validācija. Backend **netiek mainīts**: saglabāšanai tiek lietoti tie paši galapunkti,
ko lieto formas. Plāns un pamatojums: [CSV_IMPORT_PLAN.md](CSV_IMPORT_PLAN.md).

**Pēc noklusējuma izslēgts.** Iestatījumos ir jauna cilne "Eksperimentāli" ar slēdzi un
skaidru brīdinājumu, ka funkcija ir izstrādes stadijā un **nav rādītājs pārējā rīka
kvalitātei**. Kamēr slēdzis izslēgts, importa ieejas punktu nav nekur. Brīdinājums
atkārtojas trīs vietās: iestatījumos, izvēlnes nozīmītē un neaizveramā joslā logā.

**Faila struktūra** — viena tabula, kurā katrai rindai kolonnā `TIPS` norādīts `GV`
(vienība) vai `DOK` (ieraksts), un `SAITE` saista ierakstu ar vienību: tukšs = tuvākā
augstāk esošā `GV` rinda, atslēga (`A`) = tā jaunā vienība, `GV:12` = jau esoša vienība.
Tas viens formāts sedz visus trīs gadījumus — tikai vienības, tikai ieraksti esošām
vienībām, vai abi kopā. (CSV nav lapu, tāpēc "vienības vienā lapā, ieraksti otrā"
nestrādātu.)

**Jauni faili**

- `Utils/csvParser.js` — kodējuma noteikšana (BOM → stingrs UTF-8 → **windows-1257**
  atkāpe), atdalītāja noteikšana (`;` `,` TAB `|`), RFC 4180 parsētājs. Bez atkarībām.
- `Utils/xlsxReader.js` — **savs minimāls .xlsx lasītājs bez atkarībām**: ZIP centrālā
  direktorija + `DecompressionStream('deflate-raw')` + `DOMParser`. Apstrādā koplietotās
  virknes, inline virknes un datumu šūnas (Excel sērijas numurus, arī 1900. gada
  pārestības korekciju).
- `Utils/importMapper.js` — tīra loģika: virsrakstu atpazīšana, vērtību pārveide,
  `SAITE` atrisināšana, validācija ar tām pašām funkcijām, ko lieto formas.
- `Utils/xlsxReader.test.js` — jest tests pret **īsto paraugfailu** (binārs fikss, ko
  pārlūka testu palaidējs nevar nolasīt). Palaižams ar `npm test`.
- `components/ImportPopup.jsx` + `.css` — 4 soļi vienā logā: fails → kolonnas →
  priekšskatījums → izpilde.
- `Item/ImportItemsPopup.jsx`, `Record/ImportRecordsPopup.jsx`
- `Constants/importConstants.js` (kolonnu vārdnīca, atļautās vērtības),
  `Constants/uiStrings/importUI.js`
- `Settings/components/ExperimentalSettings.jsx`
- `DevAdmin/testing/suites/importTests.js` — 60 testi (reģistrēts testu sarakstā)

**Mainītie faili**

- `Settings/Settings.jsx` + `Settings.css` — jauna cilne; `SettingsContext.jsx` —
  `experimental.spreadsheetImport: false`.
- `Item/Items.js`, `Record/RecordsList.js` — izvēlnēs importa ieraksts (tikai ar
  ieslēgtu slēdzi); `hooks/useBulkOperations.js` — `run()` papildināts ar `append` un
  `expectedTotal` (divfāžu importam viena progresa josla), jauns `bulkApi.getProject`.
- `Constants/helpConstants.js` — jaunas sadaļas `items.csv-import` un
  `records.csv-import-records`.

**Divfāžu izpilde (jaukts fails)**

Vienības `POST` atbilde neatgriež `id` (tikai `number`), bet ieraksta izveidei vajag
`?item_id=`. Tāpēc: 1) izveido vienības, pierakstot `number`; 2) **nogaida** projekta
datu pārlādi (`fetchQuery` — `invalidateQueries` nepietiktu, karte tiktu būvēta no vecā
keša); 3) `number → id` karte; 4) izveido ierakstus. Ja pārlāde neizdodas, imports
apstājas un pasaka, ka vienības izveidotas, bet ieraksti jāimportē atsevišķi ar
`SAITE = GV:<numurs>` — nekas netiek slēpts un nekas netiek uzminēts.

**Robežas, kas pateiktas lietotājam, nevis noklusētas**

- Datnes (faili) netiek importēti — tikai apraksti.
- GV numurus piešķir sistēma; failā to kolonnas nav.
- Eksportēto uzskaites saraksta veidlapu importēt nevar — logs to atpazīst un pasaka.
- `DOK` rindas tikai tekstuālos elektroniskos sarakstos.
- Virs 200 rindām — brīdinājums; virs 1000 — bloķēts ar ieteikumu sadalīt failu.
- Ja fails nolasīts kā `windows-1257`, logs brīdina, ka jāsaglabā kā "CSV UTF-8".

**Paraugfaili un rīks**

- `opex_tool_frontend/public/examples/` — `imports_paraugs.xlsx` (lapas `DATI` /
  `INSTRUKCIJA` / `PARAUGI`), `imports_paraugs.csv`, `imports_tikai_vienibas.csv`,
  `imports_tikai_ieraksti.csv`, `README.txt`. Uz tiem ir lejupielādes saites gan
  iestatījumos, gan importa logā.
- `tools/make_import_examples.py` (openpyxl) — ģenerē paraugfailus. Ja formāts mainās,
  faili jāģenerē no jauna, nevis jālabo ar roku.

### Jaunums: vairāku vienību / ierakstu izveide un rediģēšana (Multi create / multi edit)

Lietotājam vairs nav jāaizpilda pilna forma katrai līdzīgai glabājamai vienībai vai
ierakstam, un viena lauka maiņai 30 vienībās vairs nav vajadzīgas 30 formas.
Plāns un pamatojums: [MULTI_EDIT_PLAN.md](MULTI_EDIT_PLAN.md).

**Kā lietotājs to izmanto**

- **Vairāku rediģēšana:** atzīmē vienības/ierakstus ar ķeksīšiem → tabulas galvenē
  kolonnu pogas vietā parādās zīmuļa poga ar skaitu (tā nostājas tieši virs rindu
  rediģēšanas pogām) → logā atzīmē tikai tos laukus, kurus mainīt.
  **Neatzīmētie lauki paliek nemainīti katrai vienībai atsevišķi.**
- **Vairāku izveide:** galvenes `＋` poga tagad atver izvēlni "Izveidot vienu" /
  "Izveidot vairākas" → logā aizpilda kopīgos laukus vienreiz un pievieno rindas ar
  unikālajiem laukiem: ielīmējot sarakstu no Excel, ģenerējot pēc `{n}` šablona, vai
  ierakstiem — izvēloties datnes (**1 datne = 1 ieraksts**, nosaukums no datnes).
- **Signāli, ka darbība attiecas uz vairākām vienībām:** atlases josla virs tabulas
  (`Atlasītas 12 no 148` + GV numuri), skaitļa nozīmīte uz zīmuļa pogas, citā krāsā
  iekrāsota loga galva ar GV čipiem, pastāvīgs `Mainīsies N lauki M vienībām`
  kājenē, obligāts pārskata solis, progresa josla ar skaitli un godīgs rezultātu
  saraksts (arī daļējas neizdošanās gadījumā).
- **Ātrais uzlabojums:** `CreateItemNavigable` kājenē pievienota poga "Saglabāt un
  izveidot nākamo" — visa loģika (`handleSubmit(shouldContinue)`, `resetForm()`,
  `SUCCESS_CREATE_MORE`) failā jau bija, bet nebija pogas, kas to izsauc, tāpēc
  kods bija nesasniedzams.

**Jauni faili**

- `components/BulkEditPopup.jsx` + `.css` — kopīgais korpuss (portāls, iekrāsota
  galva, čipi, pārskata solis, progress, rezultāti); eksportē arī `BulkProgress`.
- `components/BulkFieldRow.jsx` — lauka rinda ar "mainīt šo lauku" ķeksīti, režīmu
  izvēli (aizvietot / pievienot / notīrīt) un `(dažādas vērtības)` norādi.
- `components/MultiCreatePopup.jsx` + `.css` — kopīgie lauki + rindu tabula,
  ielīmēšana, `{n}` šablons, datņu izvēle.
- `components/SelectionToolbar.jsx` + `.css` — atlases josla.
- `Item/BulkEditItemsPopup.jsx`, `Item/MultiCreateItemsPopup.jsx`
- `Record/BulkEditRecordsPopup.jsx`, `Record/MultiCreateRecordsPopup.jsx`
- `hooks/useBulkOperations.js` — **secīgs** izpildītājs ar progresu un apturēšanu,
  `bulkApi` izsaukumi, viena keša invalidācija darba beigās.
- `Constants/bulkConstants.js` — lauku aprakstītāji abām formām + tīra loģika
  (kopīgās/atšķirīgās vērtības, override būvēšana, ielīmētā teksta parsēšana,
  šablona izvēršana).
- `Constants/uiStrings/bulkUI.js` — visi jaunie latviešu teksti (`BULK_UI`).
- `DevAdmin/testing/suites/bulkOperationTests.js` — 49 testi šai loģikai
  (reģistrēts `DevAdmin/testing/index.js`).

**Mainītie faili**

- `Item/Items.js` — galvenes zīmuļa poga, izveides izvēlne, atlases josla, jaunie logi.
- `Record/RecordsList.js` — tas pats ierakstiem (tikai elektroniskiem tekstuāliem).
- `Item/ItemsTable.css`, `Record/RecordsList.css` — jauno pogu un izvēlņu stili;
  `.items-header-badge` beidzot ir nostilizēts (to jau lietoja dzēšanas poga, bet
  CSS nekad nebija).
- `Constants/Constants.js` — `BULK_UI` re-eksports.
- `Constants/helpConstants.js` — `items.batch-operations` papildināts ar vairāku
  izveidi/rediģēšanu; jauna sadaļa `records.batch-records`.

**Vienlaikus izlabotas trīs reālas kļūdas**

- `getItemUpdatePayload()` tagad nolasa gan `related_item`, gan `related_items`.
  Projekta datos lauks ir `related_item`, bet vienības `PUT` atbildē —
  `related_items`, un `useUpdateItem` šo atbildi ieraksta kešā. Rediģējot vienu
  vienību divreiz pēc kārtas, otrajā reizē tika nosūtīts tukšs saraksts un
  backend `update_related_items()` izdzēsa visas saistīto vienību saites.
- Jauns `getRecordCreatePayload()` (`Constants/recordConstants.js`) sūta tukšiem
  teksta laukiem `''`, nevis `null`. `Record` modelī visi `CharField` ir
  `null=False`, tāpēc DRF atmeta `null` ar "This field may not be null" — tā pati
  kļūda, kas jau bija izlabota atjaunināšanas ceļā, bet palika izveides ceļā.
  `access_restriction_date` paliek vienīgais `null`-atļautais lauks.
- `Items.js` atlase vairs nepaliek novecojusi: tā tiek notīrīta, mainot uzskaites
  sarakstu, un pēc atsevišķas vienības dzēšanas tās ID tiek izņemts no atlases
  (agrāk tīrīja tikai tad, ja dzēsa vairāk par vienu). Turklāt visas grupas
  darbības atlasi izšķir pret aktuālo sarakstu, nevis pret ID sarakstu.

**Apzināti neieviests (5. fāze, gaida lietotāja lēmumu)**

- Nosaukumu masveida maiņa (prefikss / sufikss / atrast-un-aizvietot).
- Saistīto vienību (`related_item_list`) grupas rediģēšana.
- Mediju plūsma "N datnes → N vienības ar vienu mediju ierakstu".
- "Saglabāt kopīgos laukus kā priekšiestatījumu" (pagaidām priekšiestatījuma
  vērtības tiek tikai nolasītas, kā izveides formās).

### Jaunums: sadaļu līmeņa rediģēšana (Section-level editing)

Lielākā jaunā funkcionalitāte. Katrai Vienības un Ieraksta detaļu skata sadaļai
pievienota zīmuļa poga, kas atver mazu uznirstošo logu tieši šīs sadaļas rediģēšanai.

- **Jauni faili:** `components/SectionEditPopup.jsx` + `.css` (kopīgais korpuss —
  portāls, virsraksts, kļūdu josla, Atcelt/Saglabāt).
- **7 Vienības popup faili:** `Item/sections/Item{Basic,Dates,Technical,Content,Notes,Access,Related}SectionPopup.jsx`
- **4 Ieraksta popup faili:** `Record/sections/Record{Basic,Document,Description,Access}SectionPopup.jsx`
- **Iesaiste:** `Item/Item.js` (+146), `Record/Record.js` — `editingSection` stāvoklis un pogas virsrakstos.
- **Jauni palīgi konstantēs:** `getItemUpdatePayload()` / `getRecordUpdatePayload()`,
  `split{Item,Record}ValidationErrors()`, `RECORD_VALIDATED_FIELDS`, lauku/sadaļu nosaukumu tabulas.
- `Utils/CalendarComponent.js` — jauns neobligāts `usePortal` props, lai kalendāra
  logs netiktu apgriezts mazajā popup logā (esošie izsaucēji nemainīti).

**Vienlaikus izlabotas divas reālas kļūdas:**
- Payload vienmēr sūta `related_item_list` — tā trūkums lika backend `update_related_items()`
  dzēst visas saistīto vienību saites.
- Tukšiem CharFields tiek sūtīts `''`, nevis `null` — DRF noraidīja tādus saglabājumus
  (`sent_reg_nr`, `group`, `language` u.c.).

### Jaunums: lauku palīdzības burbuļi (FieldHelp)

- **Jauni faili:** `Constants/fieldHelp.js` (49 ieraksti, `{ short, detail }`),
  `components/FieldHelp.jsx` + `.css`.
- "?" ikona pievienota lauku etiķetēm **11 esošās formās:** `InventoryCreate`, `InventoryEdit`,
  `CreateItemNavigable`, `EditItemNavigable`, `CreateDocumentRecord`, `EditDocumentRecord`,
  `CreateMediaRecord`, `EditMediaRecordMetadata`, `ProjectPopup`, `RenameProjectPopup`,
  `InstitutionSignersPopup`.
- Burbulis pozicionēts ar JS (`getBoundingClientRect` + `position: fixed`) un ierobežots
  pret ekrāna malām — apzināti, lai to neapgrieztu ritināms vecāks elements (jaunie popup logi).

### Palīdzības sistēma: precīza sadaļu atvēršana

- `Utils/HelpWindow.js` — `openHelpWindow(chapterId, sectionId, windowOptions)`.
  **Uzmanību:** `windowOptions` pārcelts no 2. uz 3. pozīciju.
- `Help/Help.js` — pievienots `hashchange` klausītājs. **Tā ir īstā kļūdas labošana:**
  palīdzības logs tiek atkārtoti izmantots (nosaukts logs), tāpēc atkārtots klikšķis
  mainīja tikai hash, bet nekad nepārvietojās uz sadaļu.
- `Help/HelpButton.js` — jauns `sectionId` props.
- 9 palīdzības pogas pārsaistītas uz precīzām sadaļām.
- **Kļūdas labojums:** `Verification/VerificationModal.jsx` poga rādīja uz pilnīgi nepareizu
  nodaļu (`projects` → `verification`, sadaļa `verification-view`).
- Jauns palīdzības satura bloks `annotated-screen` + 8 uzrakstīti ekrāni (`helpConstants.js` +308).

### Backend: projekta nosaukuma validācija (tikai latīņu alfabēts)

- `project/helpers/constants.py` — `REGEX_PROJECT_NAME`: `^[\w\-]+$` → `^[A-Za-z0-9_\-]+$`.
  `\w` atbilda arī garumzīmēm, tāpēc `Piejūra` tika pieņemts; nosaukums kļūst par mapes
  nosaukumu diskā, tāpēc ierobežojums.
- `Constants/projectConstants.js` — tā pati regex un ziņojums frontendā (sinhronizēts).
- **Jauns fails:** `project/migrations/0002_alter_project_name.py` — tikai validatora
  metadati, shēmas izmaiņu nav.
- `project/tests/test_models.py` — pārrakstīts (bija novecojis pret `add_project()` parakstu);
  jauns tests `test_add_project_when_invalid_symbols`.

### Lietotāju pieteikumu labojumi

| Nr. | Izmaiņa | Fails |
|---|---|---|
| 001 | Projekta nosaukuma validācija (skat. augstāk) | backend + frontend |
| 002 | Drukas kļūda: "Aprasktīšanas" → "Aprakstīšanas" | `uiStrings/inventoryUI.js` |
| 003 | Validācijas paziņojums padarīts krietni pamanāmāks (fonts 13→20px, platāks panelis) | `components/ValidationIndicator.css` |
| 004 | "Izvēlaties Uzskaites Sarakstu" → "Izvēlieties uzskaites sarakstu" | `uiStrings/inventoryUI.js` |
| 005 | "par jaunu" → "no jauna" | `Constants/helpConstants.js` |
| 006 | Tikai reģistrēts, koda izmaiņu **nav** (gaida saskaņošanu) | — |

### Kļūdu labojumi jaunajos komponentos

- **Datuma formāts (`ItemDatesSectionPopup`).** `CalendarComponent` atgriež `Date` objektus,
  nevis tekstu. Popup tos saglabāja neapstrādātus, tāpēc uz serveri aizgāja pilns ISO laikspiedols
  (`2025-03-13T22:00:00.000Z`) un Django `DateField` to noraidīja
  ("Date has wrong format. Use one of these formats instead: YYYY-MM-DD").
  Turklāt ISO pārvēršana nobīdīja datumu par vienu dienu atpakaļ.
  Labots ar `formatDate()` — tāpat kā pilnajā rediģēšanas formā.
  **Svarīgi:** `formatDate` jāizsauc **bez** trešā `dateIndicator` argumenta — ar to
  gada precizitāte dotu `"2025"`, mēneša `"03.2025"`, ko backend arī noraida.
- **Nepareizs CSS imports** visos 4 Ieraksta popup failos — importēja `Item/EditItemNavigable.css`,
  bet lieto `create-record-nav-*` klases no `Record/CreateDocumentRecord.css`.
- **Validācijas kļūdas nebija redzamas.** 4 laukiem (`unit_of_measure`, `restriction`,
  `security_level`, `date_indicator`) nebija `<FieldError>` vietas — Saglabāt izskatījās
  kā "neko nedara", bez paskaidrojuma. Pievienotas trūkstošās vietas.
- **Zīmuļa ikonas krāsa** — `.item-section-heading i` (Item.css) pārrakstīja pogas krāsu,
  arī hover stāvoklī. Pievienota precīzāka CSS kārtula.

### Ieraksta skats vienmēr atveras uz "Informācija"

`Record.js` — `record_active_tab` sessionStorage ieraksts tagad ir piesaistīts konkrētam
ierakstam (`{recordId, tab}`). Iepriekš tas bija tikai cilnes nosaukums bez piesaistes, un
`<Record>` tiek renderēts bez `key`, tāpēc React pārizmanto to pašu instanci — mount-laika
tīrīšana neizpildījās, un vecā vērtība "noplūda" nākamajā ierakstā, ko lietotājs atvēra no saraksta.
Pāreja starp ierakstiem (bultiņas, jump-to) joprojām saglabā cilni.

### Nesakārtots / jāizlemj pirms commit

- **`opex_project/settings.py`: `OPEX_BUILD` noklusējums ir `'dev'`** (nevis
  `'production'`). Tas pasniedz `build-dev/` ar ieslēgtu DevAdmin un testa datiem —
  tas ir apzināti, jo šobrīd tā tiek strādāts, bet **pirms izlaišanas jāpārslēdz
  atpakaļ uz `'production'`** un jāuztaisa `npm run build`. Bez pārslēgšanas
  lietotājs saņem versiju ar izstrādātāja paneli un testa datnēm.
- **`OPTIONS_PIEEJAMĪBA`: `"Stingri ierobežota"` → `"Sensitīvi dati"`.** Tas ir slēptas kļūdas
  labojums (vecā vērtība nebija nevienā validācijas sarakstā, tātad saglabāšana būtu neizdevusies),
  bet **datu migrācijas nav** vienībām, kas jau saglabātas ar veco vērtību.
- **`annotated-screen` lieto `dangerouslySetInnerHTML`** `mockup` saturam. Šobrīd saturs nāk no
  konstantēm, tāpēc nav izmantojams uzbrukumam, bet tas ir jauns neapstrādāta HTML ievades punkts.

---

## Kā uzturēt šo failu

**Katra koda izmaiņa jāpieraksta šeit.** Kārtība:

1. Pievieno ierakstu sadaļā **Nepublicēts**, atbilstošā apakšsadaļā (vai izveido jaunu).
2. Raksti **ko** izmaiņa maina lietotājam vai sistēmai, ne tikai kurš fails aiztikts.
   Ja tas ir kļūdas labojums — pieraksti arī **cēloni**, ne tikai simptomu.
3. Norādi failu ceļus, lai izmaiņu var atrast.
4. Ja izmaiņa nāk no lietotāja pieteikuma — pievieno numuru un saiti uz
   `Lietotaju_Pieteikumi/` mapi.
5. Ja kaut kas ir apzināti atstāts nepabeigts, riskants vai lokāls (piem. `settings.py`
   noklusējumi) — liec to sadaļā **Nesakārtots / jāizlemj pirms commit**, nevis slēp.
6. Kad izmaiņas tiek nokomitētas un nopušotas, pārvieto "Nepublicēts" saturu uz jaunu
   versijas sadaļu ar datumu un commit hash.

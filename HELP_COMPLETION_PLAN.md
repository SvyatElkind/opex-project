# Rokasgrāmatas un palīdzības sadaļas pabeigšanas plāns

Sagatavots 2026-07-23, balstoties uz pilnu esošo failu izvērtējumu:
`LIETOTAJA_ROKASGRAMATA.md`, `HELP_CONTENT_SPEC.md`, `HELP_SUGGESTIONS.md`,
`HELP_ILLUSTRATION_SYSTEM.md`, `opex_tool_frontend/src/Constants/helpConstants.js`,
`opex_tool_frontend/src/Help/*`, `QA/Help/*`, `QA/Constants/helpConstants.md`.

## Kopējais stāvoklis

| Daļa | Statuss |
|---|---|
| **Lietotāja rokasgrāmata** (`LIETOTAJA_ROKASGRAMATA.md`) | Gandrīz gatava — 16 nodaļas, nav TODO/stub, faktoloģiski precīza. Viena reāla nepilnība (1.1). |
| **Iekšējās palīdzības saturs** (`helpConstants.js`) | Saturiski gandrīz gatavs — 16 nodaļas / 64 sadaļas, nav tukšu vietu. Dažas nodaļas manāmi "tievākas", dažas kļūdas un viena pretruna. |
| **Palīdzības poga lietotnē** (`Help.js` / `HelpButton.js`) | Pats mehānisms **gatavs un darbojas** (QA 6/10, 9/10 — tikai kosmētika). Bet izvietojums pa lietotni **nepilnīgs**. |
| **Plānošanas dokumenti** (`HELP_CONTENT_SPEC.md` u.c.) | Iekšēji lietošanai, savā starpā nesaskaņoti — jāsakārto, pirms tos tālāk izmanto par pamatu. |

---

## 1. Augsta prioritāte — satura labojumi

1. **Projekta nosaukuma ierobežojums (garumzīmes).** Ne rokasgrāmatā, ne palīdzības sadaļā nav teikts, ka drīkst lietot tikai latīņu alfabēta burtus bez garumzīmēm/mīkstinājuma zīmēm — tikai "burti", ko lietotājs (skat. Lietotaju_Pieteikumi/001) saprot plašāk. Jālabo trīs vietās:
   - `LIETOTAJA_ROKASGRAMATA.md:126` (un atsauce 4.3. rindā par pārdēvēšanu)
   - `helpConstants.js` → `projects.create-project-form` (~354–358)
   - `helpConstants.js` → `help-to.workflow` (~191)

2. **Pretrunīgs datuma-izvēles apraksts uzskaites saraksta izveidē.** `helpConstants.js` → `inventories.create-inventory` / `edit-inventory` (~1118–1131, ~1389) teksts saka "izvēlieties gadu, mēnesi un dienu", bet blakus esošais `ui-example` rāda tikai gada lauku — un reālā UI (`YearPicker`) šobrīd tiešām atbalsta tikai pilnu gadu (skat. Lietotaju_Pieteikumi/002). Teksts jāsaskaņo ar faktisko uzvedību, kamēr precīzāka perioda izvēle (002. pieteikums) vēl nav ieviesta kodā.

3. **Divas palīdzības pogas ved uz nepareizu nodaļu.**
   - `Institution/InstitutionSignersPopup.jsx` → tagad `"projects"`, jābūt `"fond-institution"`
   - `Verification/VerificationModal.jsx` → tagad `"projects"`, jābūt `"verification"`

4. **Verifikācijas cilnes nosaukuma pretruna** iekšpus `HELP_CONTENT_SPEC.md`: 8. nodaļa apstiprina, ka cilnes ir *Info / Pārskats / Projekta ceļvedis* un ka "Atskaites" cilnes nav — bet 9. nodaļa (9.1, 9.3) to tomēr piemin. Jāpārbauda pret reālo `VerificationModal.jsx` un jālabo abās SPEC vietās, kā arī jāpārliecinās, ka `helpConstants.js` `verification` nodaļa neatkārto to pašu kļūdu.

---

## 2. Vidēja prioritāte — trūkstošs palīdzības pogas izvietojums

Dokumentētais nodoms (`Help/README.md`, `Help/INTEGRATION_EXAMPLE.md`) neatbilst reālajam izvietojumam:

- **`Workspace.js`** — nav pogas, lai gan tieši šeit README/INTEGRATION_EXAMPLE iesaka peldošu, vienmēr redzamu palīdzības pogu ("Option 1: Recommended"). Šis ir dokumentētais, bet nekad neieviestais globālais ieejas punkts.
- **`Settings.jsx`** un **`RoadmapWizard.jsx`** — nav pogas, lai gan `helpConstants.js` tam ir veltītas nodaļas (`settings`, `roadmap`) un konstantes (`HELP_CHAPTER_IDS.SETTINGS/.ROADMAP`) jau eksistē.
- Saraksta/pārlūkošanas skati (`Inventories.js`, `Items.js`, `RecordsList.js`, `Record.js`, `MediaRecordForm.js`, `RecordFiles.js`, `RecordMetadata.js`, `InventoryDelete.js`, `ActiveProject.js`, `DevAdminPanel.jsx`) — nav pogas. Var būt apzināta izvēle (izveides/rediģēšanas formās poga ir), bet vērts izlemt apzināti, nevis pēc noklusējuma.
- **Fonds** — pogas nav, bet tas ir pamatoti: `Fond/Fond.js` ir tikai lasāms kopsavilkums bez ievades laukiem.

---

## 3. Vidēja prioritāte — teksta kvalitāte `helpConstants.js`

- `~2438`: "sarkano ikonū" → "sarkano ikonu"
- `~1359`: "jābūt PĒCĀK" → "jābūt VĒLĀK"
- `~2359`: "Elektroniskais (default)" → "Elektroniskais (noklusējums)"
- `~2869–2882` (Terminu vārdnīca): `ONE_TO_ONE` / `ONE_TO_MANY` — nomainīt pret lasāmiem latviešu apzīmējumiem, atstājot angļu terminu iekavās, ja vajadzīgs
- `help-to.best-practices` (~312): "pārbaudiet interneta savienojumu" — noņemt/pārrakstīt, jo rīks strādā lokāli un šis ir paliekošs teksts no cita konteksta
- `items.create-item` (~1546–1563), `records.create-record` (~1790–1808), `navigation.breadcrumbs`/`.quick-actions` (~2726–2748) — manāmi īsāki un vienkāršāki nekā `projects`/`inventories` nodaļas (nav `heading`/`note`/`ui-example`). Vērts papildināt līdz tādai pašai detalizācijas pakāpei.
- `verification.exporting-opex` — piemin US saraksta eksporta formātu (.xlsx), bet ne PN akta formātu (.docx) — papildināt konsekvencei.

---

## 4. Zema prioritāte — kosmētika `LIETOTAJA_ROKASGRAMATA.md`

- Vārdnīcā (16. nodaļa) divi gandrīz identiski ieraksti "SHA-256 kontrolsumma" un "SHA-256" — apvienot vienā.
- 6.2 sadaļas nosaukums "Aprakstīšanu veica" nesakrīt ar kļūdas tekstu "Izveidotāja vārds ir obligāts" (6.4) — pati lietotne lieto abus terminus nekonsekventi; rokasgrāmatā var pievienot vienu teikumu, kas paskaidro, ka tas ir viens un tas pats lauks, vai arī tas jāsaskaņo pašā lietotnē (ārpus šī plāna, bet vērts pieminēt izstrādātājiem).

---

## 5. Iekšējie plānošanas dokumenti — jāsakārto pirms tālāka darba

Šie faili (`HELP_CONTENT_SPEC.md`, `HELP_SUGGESTIONS.md`, `HELP_ILLUSTRATION_SYSTEM.md`) lietotājam nav redzami, bet ir pamats turpmākajam darbam pie palīdzības satura, tāpēc pretrunas tajos "izplatīsies" tālāk, ja netiks salabotas:

- **OPEX saīsinājums — jau atrisināts, tikai jāatjauno SPEC.** `helpConstants.js` (~2835, ~3060) jau pareizi lieto "Open Preservation Exchange". `HELP_CONTENT_SPEC.md:47` un `:850` joprojām min neskaidro/nepareizo "Open Archival Information Exchange" — vienkārši jāizlabo SPEC, lai sakristu ar jau pareizo implementāciju.
- **Inventāra veidu skaits.** `HELP_ILLUSTRATION_SYSTEM.md:574` joprojām min "5 veidi", lai gan pareizais skaits (4) jau labots gan SPEC, gan SUGGESTIONS failos.
- **Kļūdu saraksti nesakrīt.** SPEC §8.7 (7 kļūdas) un ILLUSTRATION §8.6 (8 kļūdas, cita formulējuma) apraksta to pašu verifikācijas kļūdu sarakstu atšķirīgi. Jāpārbauda pret reālajiem `VerificationModal.jsx` kļūdu tekstiem un jānosaka viens autoritatīvs saraksts.
- **ILLUSTRATION nodaļu plāns nesedz visas SPEC sadaļas** (izlaiž saraksta/rediģēšanas/dzēšanas apakšsadaļas 4., 5., 7. nodaļā). Ja turpina ar ilustrāciju sistēmu, plāns jāpapildina, lai segtu visu SPEC apjomu.
- **Appendix A** solīts kā "pilna lauku uzziņa visām veidlapām", bet aptver tikai 2 no daudzajām (Ieraksti-Tekstuāls, Vienības). Jāizlemj: papildināt līdz solītajam apjomam vai pārformulēt darbības jomu uz mazāku.
- **Lēmums par 8 jaunajiem ilustrāciju blokiem** (`workflow-bar`, `hierarchy`, `field-card`, `comparison`, `annotated-screen`, `prerequisite`, `error-fix`, `decision-tree`) — pilnībā neieviesti (nav CSS, nav renderētāja koda). Šis ir atsevišķs, lielāks darba apjoms — vērts apzināti izlemt, vai to dara tagad, vai atliek uz vēlāk un pagaidām turpina ar jau esošajiem 10 bloku tipiem (SPEC pats saka, ka satura rakstīšanu var turpināt bez jaunajiem blokiem).
- **Meklētāja kļūda.** `HELP_SUGGESTIONS.md` min neatrisinātu `TypeError` meklēšanas indeksētājā, kas jāizlabo pirms meklēšanas seguma paplašināšanas.

---

## 6. Manuālā pārbaude lietotnē (Tavs solis)

Mērķis: pārliecināties, ka katra palīdzības sadaļa **lietotnē reāli izskatās labi** — nekas nav apgriezts, pārklāts, nesalasāms vai vizuāli salauzts — ko automātiska koda lasīšana nevar pārbaudīt.

Ieteicamā secība: vispirms izlabot 1. sadaļas punktus (ātri labojumi), tad iet cauri šim sarakstam, lai pārbaudītu jau atjaunināto tekstu.

Atveriet katru no 16 palīdzības nodaļām (Palīdzība → nodaļu saraksts kreisajā pusē) un katrā nodaļā pārskatiet visas sadaļas. Pie katras atzīmējiet: teksts salasāms / nekas nav pārklāts / tabulas un piemēri renderējas pareizi / atbilst tam, ko redzat reālajā formā.

| # | Nodaļa | Sadaļu skaits | ✔ |
|---|---|---|---|
| 1 | Darba sākšana (getting-started) | 4 | ☐ |
| 2 | Kā izmantot palīdzību (help-to) | 3 | ☐ |
| 3 | Projekti (projects) | 8 | ☐ |
| 4 | Uzskaites saraksti (inventories) | 5 | ☐ |
| 5 | Glabājamās vienības (items) | 6 | ☐ |
| 6 | Ieraksti (records) | 7 | ☐ |
| 7 | Verifikācija (verification) | 6 | ☐ |
| 8 | Fonds/Iestāde (fond-institution) | 2 | ☐ |
| 9 | Navigācija (navigation) | 3 | ☐ |
| 10 | Terminoloģija (terminology) | 3 | ☐ |
| 11 | Licences (licenses) | 3 | ☐ |
| 12 | Kontakti (contacts) | 3 | ☐ |
| 13 | Kļūdu ziņošana (bug-reports) | 3 | ☐ |
| 14 | Iestatījumi (settings) | 4 | ☐ |
| 15 | Ceļvedis (roadmap) | 3 | ☐ |
| 16 | Īsinājumtaustiņi (keyboard-shortcuts) | 1 | ☐ |

Papildus pārbaudāms vispārīgi (ne pa sadaļām):
- Meklēšana (Ctrl+K) — vai atrod sagaidāmo saturu, vai neaizlūst uz kādu no `steps` tipa blokiem (zināma kļūda, skat. 5. sadaļu augstāk).
- Priekšējā/nākamā sadaļa navigācija un breadcrumbs.
- Uzeja no dažādām vietām lietotnē (skat. 2. sadaļu augstāk) — vai pareizā nodaļa atveras, ne tikai vai poga vispār strādā.

Un atsevišķi — pilnas **`LIETOTAJA_ROKASGRAMATA.md`** izlasīšana no sākuma līdz beigām (16 nodaļas), pārbaudot, vai jebkur kaut kas šķiet novecojis salīdzinot ar to, ko redzat lietotnē šobrīd.

---

## Ieteicamā darba secība

1. 1. sadaļa (augstā prioritāte) — ātri, precīzi labojumi (stundas darbs).
2. 6. sadaļa (manuālā pārbaude) — dari to uzreiz pēc 1. punkta labojumiem, lai pārbaudītu jau atjaunināto tekstu un pamanītu jaunas lietas, ko automātiskā analīze nevarēja redzēt.
3. 2. un 3. sadaļa (pogu izvietojums, teksta kvalitāte).
4. 5. sadaļa (plānošanas dokumentu sakārtošana) un lēmums par ilustrāciju sistēmu — pirms jebkāda tālāka darba pie palīdzības satura paplašināšanas.
5. 4. sadaļa (kosmētika) — jebkurā brīdī, zema prioritāte.

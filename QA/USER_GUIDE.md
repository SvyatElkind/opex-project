# OPEX rīka lietotāja rokasgrāmata

Šī rokasgrāmata apraksta OPEX rīka priekšgala (frontend) lietošanu arhīva dokumentu pārvaldībai. Rīks pārvalda datus hierarhijā: **Projekts > Institūcija > Fonds > Uzskaites saraksts > Glabājamā vienība > Ieraksts/Dokuments > Fails**.

---

## 1. Darba sākšana

### Sistēmas prasības
- Mūsdienīga tīmekļa pārlūkprogramma (Chrome, Firefox, Edge)
- Tīkla savienojums ar OPEX serveri

### Pirmā palaišana
1. Atveriet lietotni pārlūkprogrammā.
2. Sākumlapā redzēsiet darba vietu (Workspace) ar esošajiem projektiem vai tukšu stāvokli.
3. Lai sāktu darbu, izveidojiet jaunu projektu vai atveriet esošu.

### Navigācija
- **Sānjosla (Sidebar):** Projektu saraksts un navigācijas koks ar hierarhisko struktūru.
- **Maizes drupatas (Breadcrumbs):** Rāda pašreizējo atrašanās vietu hierarhijā (var izslēgt iestatījumos).
- **Ātrā pārlēkšana (QuickJump):** Ātra navigācija uz jebkuru elementu projektā.

---

## 2. Projekta izveide

### Jauna projekta izveide
1. Nospiediet pogu **"Jauns projekts"**.
2. Aizpildiet laukus:
   - **Projekta nosaukums** -- obligāts, 1-20 simboli. Atļautie simboli: burti, cipari, `_` un `-`.
   - **Projekta mape** -- obligāta, ceļš līdz 100 simboliem.
3. Nospiediet **"Izveidot"**.

### Kļūdu ziņojumi:
- "Projekta nosaukums ir obligāts." -- nosaukums nav ievadīts
- "Projekta nosaukums nevar būt garāks par 20 simboliem." -- pārsniegts garuma limits
- "Projekta nosaukumā var izmantot burtus, ciparus `_` un `-`." -- neatļauti simboli
- "Projekts ar doto nosaukumu jau eksistē." -- nosaukums nav unikāls

### Projekta pārvaldība
- **Pārdēvēšana:** Ar peles labo klikšķi vai rediģēšanas pogu.
- **Dzēšana:** Brīdinājuma uznirstošais logs (`WarningPopup`) pirms dzēšanas.

---

## 3. VVAIS atskaites augšupielāde

### Augšupielādes process
1. Atveriet projektu.
2. Nospiediet **augšupielādes pogu** (upload).
3. Izvēlieties `.xlsx` failu:
   - **Velciet un nometiet** failu uz augšupielādes zonu, vai
   - **Nospiediet** faila izvēles pogu.
4. Fails tiek validēts:
   - Paplašinājumam jābūt `.xlsx`
   - Fails nevar būt tukšs
   - Maksimālais izmērs: 50 MB
5. Nospiediet **"Augšupielādēt"** un gaidiet apstrādi.

### Kas notiek pēc augšupielādes:
- Sistēma automātiski izveido **institūciju**, **fondu** un **uzskaites sarakstus** no atskaites datiem.
- Uzskaites saraksti no atskaites tiek atzīmēti ar `from_report = true` un tiem ir ierobežota rediģēšana.
- Uzskaites sarakstu tipi: `Tekstuāls`, `Foto`, `Video`, `Skaņas`
- Glabāšanas termiņi: `Pastāvīgi glabājamās lietas`, `Ilgstoši glabājamās lietas`

### Kļūdu ziņojumi:
- "Lūdzu izvēlieties failu." -- fails nav atlasīts
- "Izvēlētā faila paplašinājumam jābūt `.xlsx`." -- nepareizs formāts
- "Izvēlētais fails ir tukšs." -- tukšs fails

---

## 4. Uzskaites sarakstu pārvaldība

### 4.1 Izveide
1. Nospiediet **"Jauns uzskaites saraksts"**.
2. Aizpildiet formu:
   - **Veids** (obligāts) -- izvēlieties: `Tekstuāls`, `Foto`, `Video` vai `Skaņas`
   - **Elektronisks** -- atzīmējiet, ja dokumenti ir elektroniskā formā (pēc noklusējuma: ieslēgts)
   - **Datums no / Datums līdz** -- gada izvēle ar YearPicker
   - **Glabāšanas termiņš** (obligāts) -- izvēlieties: `Pastāvīgi glabājamās lietas` vai `Ilgstoši glabājamās lietas`
   - **Apakšfonds** (neobligāts) -- ieslēdziet un ievadiet numuru (min. 1)
3. Nospiediet **"Izveidot"**.
4. Numurs tiek piešķirts automātiski (nākamais secīgais numurs).

### 4.2 Rediģēšana
1. Atveriet uzskaites sarakstu un nospiediet **rediģēšanas pogu**.
2. Atkarībā no stāvokļa:
   - **Ierobežota rediģēšana** (no VVAIS vai ar vienībām): var mainīt tikai datumus, glabāšanas termiņu un apakšfondu.
   - **Pilna rediģēšana** (manuāli izveidots, bez vienībām): var mainīt arī elektronisko karogu.
3. Veids vienmēr ir tikai lasāms pēc izveides.

### 4.3 Dzēšana
- Uzskaites sarakstus no VVAIS atskaites **nevar dzēst** ("Nevar dzēst uzskaites sarakstu no VVAIS atskaites.").
- Manuāli izveidotus uzskaites sarakstus var dzēst ar apstiprinājuma dialogu.

---

## 5. Glabājamo vienību pārvaldība

### 5.1 Izveide
1. Atveriet uzskaites sarakstu.
2. Nospiediet **"Jauna glabājamā vienība"**.
3. Aizpildiet formu pa sadaļām:

**Pamata informācija:**
- **Sērijas kods** -- formāts: `1`, `1.2`, `1.2.3` (bez vadošajām nullēm, maks. 20 simboli)
- **Numurs** -- piešķirts automātiski
- **Nosaukums** -- obligāts, maks. 1000 simboli

**Datumi:**
- **Sākuma datums / Beigu datums** -- ar kalendāra komponenti
- **Datuma indikators** -- `year` (gads), `month` (mēnesis), `day` (diena) -- norāda datuma precizitāti
- **Datuma piezīme** -- papildu informācija par datumu

**Tehniskie dati:**
- **Apjoms** -- skaitliska vērtība
- **Apjoma mērvienība** -- `Lapas`, `Dokumenti` vai `Glabājamās vienības`

**Apraksts:**
- **Saturs (Anotācija)** -- obligāts mediju tipiem (`Foto`, `Video`, `Skaņas`), maks. 2000 simboli
- **Piezīmes** -- neobligāts, maks. 1000 simboli
- **Valoda** -- obligāts (izņemot `Foto` tipu), vairāku valodu izvēle. Pieejamās valodas: latviešu, krievu, angļu, vācu, franču, spāņu, itāļu, poļu, lietuviešu, igauņu, somu, zviedru, norvēģu, dāņu, holandiešu, portugāļu, grieķu, turku, arābu, ķīniešu, japāņu, korejiešu, hindi, hebrejsku, čehu, slovāku, rumāņu, bulgāru, ungāru, ukraiņu, serbu, horvātu, cita
- **Sistematizācija** -- neobligāts

**Pieejamība:**
- **Pieejamība** -- `Vispārēja`, `Ierobežota` vai `Sensitīvi dati`
- **Ierobežojuma pamatojums** -- obligāts, ja pieejamība nav `Vispārēja`
- **Slepenība** -- `Publisks`, `Iekšējs`, `Konfidenciāls`, `Slepens`, `Sevišķi slepens`

**Saistītie:**
- Saistīto glabājamo vienību pievienošana no tā paša projekta

### 5.2 Rediģēšana
- Atveriet vienību un nospiediet rediģēšanas pogu.
- Navigējiet starp vienībām ar bultiņām (iepriekšējā/nākamā).
- Izmaiņas saglabājas ar pogu "Saglabāt".

### 5.3 Dzēšana
- Apstiprinājuma dialogs pirms dzēšanas (ItemDeletePopup).
- Ja vienība nav atrasta, parādās ItemNotFoundPopup.

---

## 6. Ierakstu pārvaldība

### 6.1 Tekstuālie dokumenti (Tekstuāls inventārs)

1. Atveriet glabājamo vienību.
2. Nospiediet **"Dokumenta pievienošana"**.
3. Aizpildiet formu:

**Pamata informācija:**
- **Nosaukums** -- obligāts, maks. 500 simboli
- **Datums** -- obligāts
- **Reģistrācijas numurs** -- maks. 30 simboli
- **Grupa** -- maks. 30 simboli

**Dokumenta dati:**
- **Nosūtīšanas datums** -- neobligāts
- **Nosūtīšanas reģ. Nr.** -- maks. 30 simboli
- **Nomenklatūras numurs** -- maks. 30 simboli
- **Valoda** -- vairāku valodu izvēle ar meklēšanu

**Apraksts:**
- **Anotācija** -- maks. 500 simboli (ieteicams)
- **Atslēgvārdi** -- maks. 200 simboli (ieteicams meklēšanas uzlabošanai)
- **Piezīmes** -- maks. 500 simboli
- **Tehniskā informācija** -- maks. 500 simboli

**Pieejamība:**
- **Pieejamības ierobežojums** -- `open` (atvērts) vai `closed` (slēgts)
- Ja ierobežojums ir `closed`, obligāti jānorāda ierobežojuma datums
- **Pieejamības piezīmes** -- maks. 30 simboli
- **Lietotāja ierobežojuma piezīmes** -- maks. 30 simboli

4. Nospiediet **"Pievienot"**.

### 6.2 Mediju ieraksti (Foto/Video/Skaņas inventārs)

Mediju ierakstu izveide notiek **divos soļos**:

**1. solis -- Faila augšupielāde:**
1. Atveriet glabājamo vienību mediju inventārā.
2. Nospiediet izveidošanas pogu.
3. Velciet un nometiet failu vai izvēlieties ar pārlūku.
4. Tiek pieņemts **tikai viens fails** mediju ierakstam.
5. Nospiediet **"Augšupielādēt"**.
6. Sistēma automātiski mēģina nolasīt metadatus no faila.

**2. solis -- Metadatu ievade** (tikai ja automātiskā nolasīšana nav pilnīga):
- **Krāsa** (Foto, Video) -- `Pelēktonis` vai `Krāsains`
- **Horizontālā izšķirtspēja** (Foto, Video) -- pikseļos
- **Vertikālā izšķirtspēja** (Foto, Video) -- pikseļos
- **Ilgums** (Video, Skaņas) -- formāts `HH:MM:SS`

Automātiski nolasītie lauki tiek atzīmēti ar "Auto" atzīmi.

### Pieļaujamie failu tipi:
| Inventāra tips | Pieļaujamie formāti |
|----------------|---------------------|
| Foto | .jpg, .jpeg, .png, .gif, .tiff, .bmp |
| Video | .mp4, .avi, .mov, .wmv, .mkv |
| Skaņas | .mp3, .wav, .aac, .ogg, .m4a |

### 6.3 Ierakstu dzēšana
- Apstiprinājuma dialogs (RecordDeletePopup).
- Mediju ierakstu dzēšana dzēš arī piesaistīto failu.

---

## 7. Failu augšupielāde

### Tekstuālie dokumenti
- Pieļauj **vairāku failu** augšupielādi vienlaicīgi.
- Velciet un nometiet failus uz augšupielādes zonu vai izmantojiet failu pārlūku.
- Faili tiek attēloti tabulas vai karšu skatā.

### Mediju ieraksti
- Pieļauj **tieši vienu failu** katram ierakstam.
- Fails tiek augšupielādēts ieraksta izveides pirmajā solī.
- Mediju failus **nevar dzēst** atsevišķi no ieraksta.

### Failu pārvaldība
- **Sānu panelis:** Nospiediet uz faila, lai redzētu detaļas (nosaukums, paplašinājums, izmērs, augšupielādes datums).
- **Vairāku failu atlase:** Izmantojiet izvēles rūtiņas, lai atlasītu vairākus failus.
- **Pakešu dzēšana:** Atlasiet vairākus failus un dzēsiet vienlaicīgi.
- **Dzēšanas apstiprinājums:** Vienmēr tiek prasīts apstiprinājums pirms dzēšanas.

### Brīdinājumi:
- Fails pārsniedz 500 MB -- brīdinājums par iespējamām problēmām OPEX ģenerēšanā
- Tekstuālā dokumenta fails mazāks par 2 KB -- brīdinājums pārbaudīt failu
- Fails ar nulles izmēru -- kļūda, fails netiks pieņemts

---

## 8. Metadati

Metadatu sadaļa ir pieejama tekstuālo dokumentu ierakstos. Četras kategorijas:

### 8.1 Darbības
| Lauks | Tips | Obligāts |
|-------|------|----------|
| Autors | Teksts | Jā |
| Atbildīgā persona | Teksts | Jā |
| Uzdevums | Teksts | Jā |
| Termiņš | Datums | Jā |
| Izveidošanas datums | Datums | Jā |
| Piezīmes | Teksta lauks | Nē |

### 8.2 Adresāti
| Lauks | Tips | Obligāts |
|-------|------|----------|
| Adresāts | Teksts | Jā |

### 8.3 Vīzas
| Lauks | Tips | Obligāts |
|-------|------|----------|
| Persona | Teksts | Jā |
| Datums | Datums | Jā |
| Piezīmes | Teksta lauks | Nē |

### 8.4 Lasīšanas statuss
| Lauks | Tips | Obligāts |
|-------|------|----------|
| Persona | Teksts | Jā |
| Datums | Datums | Jā |
| Piezīmes | Teksta lauks | Nē |

### Darbības ar metadatiem:
- **Pievienot:** Nospiediet "+" pogu, aizpildiet formu, saglabājiet.
- **Rediģēt:** Nospiediet uz ieraksta, mainiet datus, saglabājiet.
- **Dzēst:** Nospiediet dzēšanas pogu, apstipriniet dialogā.

---

## 9. Verifikācija

### Kā darbojas verifikācija
1. Nospiediet **"Projekta Statuss"** pogu projekta rīkjoslā.
2. Verifikācijas modālis automātiski palaiž validāciju.
3. Rezultāti tiek attēloti:
   - **Kopsavilkums** -- uzskaites sarakstu, vienību, ierakstu, failu skaits un kopējais failu izmērs
   - **Kļūdu skaits** -- bloķē OPEX ģenerēšanu
   - **Brīdinājumu skaits** -- neietekmē OPEX ģenerēšanu

### Kļūdu līmeņi

**KĻŪDAS (ERROR)** -- jānovērš pirms eksporta:
- "Institūcijas parakstītāji nav pievienoti" -- aizpildiet parakstītāju informāciju
- "Projektam nav uzskaites sarakstu" -- pievienojiet vismaz vienu uzskaites sarakstu
- "Uzskaites saraksta numurs ir obligāts"
- "Uzskaites saraksta tips ir obligāts"
- "Vienības nosaukums ir obligāts"
- "Vienības numurs ir obligāts"
- "Elektroniskā vienībai jābūt vismaz vienam dokumentam"
- "Dokumenta nosaukums ir obligāts"
- "Dokumenta datums ir obligāts"
- "Elektroniskajam dokumentam jābūt vismaz vienam failam"
- "Elektroniskajam medijam jābūt tieši vienam failam"
- "Fails ir pazudis vai ir izdzēsts"
- "Failam ir nulles izmērs"
- "Faila tips neatbilst medija tipam"

**BRĪDINĀJUMI (WARNING)** -- ieteicams novērst:
- "Ieteicams pievienot piezīmes"
- "Foto izšķirtspēja ir zemāka par ieteikto minimumu (1000px)"
- "Video/Audio ilgums ir īsāks par 1 minūti"
- "Ieteicams pievienot anotāciju"
- "Ieteicams pievienot atslēgvārdus"
- "Fails ir ļoti liels (>500MB)"
- "Tekstuālā dokumenta fails ir ļoti mazs (<2KB)"

### Koka skats (Tree View)
- Hierarhisks attēlojums: Projekts > Uzskaites saraksts > Vienība > Ieraksts > Fails
- Katrs mezgls rāda kļūdu/brīdinājumu indikatorus
- Nospiediet uz mezgla, lai pārietu uz attiecīgo elementu labošanai

### Filtrēšanas režīmi:
- **Visi** -- rāda visus elementus
- **Problēmas** -- rāda tikai elementus ar kļūdām vai brīdinājumiem
- **Kļūdas** -- rāda tikai elementus ar kļūdām

---

## 10. Eksports

### Priekšnoteikumi
Eksports ir pieejams tikai tad, ja verifikācijā nav kļūdu (0 kļūdu).

### Eksporta iespējas

**10.1 Uzskaites sarakstu eksports**
- Ģenerē lejupielādējamu uzskaites sarakstu sarakstu.

**10.2 Pieņemšanas-nodošanas akta eksports (PN akts)**
1. Nospiediet PN akta eksporta pogu.
2. Izvēlieties veidu:
   - **Elektroniskais** -- elektronisko dokumentu akts
   - **Fiziskais** -- fizisko dokumentu akts
3. Fails tiek lejupielādēts.

**10.3 OPEX pakotnes ģenerēšana**
1. Nospiediet **"Ģenerēt OPEX pakotni"**.
2. Izvēlieties glabāšanas veidu:
   - **Ilgstoši glabājamās lietas**
   - **Pastāvīgi glabājamās lietas**
3. Sistēma ģenerē OPEX XML pakotni ar visiem metadatiem un failu atsaucēm.
4. Pakotne tiek lejupielādēta.

---

## 11. Iestatījumi

Nospiediet **zobrata ikonu** projekta rīkjoslā.

### 11.1 Attēlošana
- **Tēma:** Gaišā, Tumšā vai Automātiskā (seko sistēmas iestatījumam)
- **Fonta izmērs:** Vidējais (noklusējums), pielāgojams
- **Kompaktais skats:** Blīvāks izkārtojums
- **Rādīt maizes drupatas:** Ieslēgt/izslēgt navigācijas ceļu

### 11.2 Formas
- **Formu iepriekšiestatījumi (preseti):** Nosaukti iestatījumu komplekti ar noklusējuma vērtībām:
  - Vienības valoda
  - Ieraksta valoda
  - Pieejamības ierobežojums
  - Slepenības līmenis
  - Pieejamība
  - Atslēgvārdi
  - Piezīmes
- Noklusējuma presets: "Noklusējums" ar latviešu valodas noklusējumiem.
- Var izveidot vairākus presetus dažādiem darba scenārijiem.

### 11.3 Validācija
- **Galvenais slēdzis:** Ieslēgt/izslēgt visus validācijas brīdinājumus
- **Atsevišķi slēdži:**
  - Failu izmēra brīdinājumi
  - Ilguma brīdinājumi
  - Attēla izmēru brīdinājumi
  - Orientācijas brīdinājumi
- **Sliekšņi:**
  - Maks. faila izmērs: 100 MB
  - Min. faila izmērs: 10 KB
  - Maks. ilgums: 3600 sekundes
  - Min. ilgums: 1 sekunde
  - Maks. attēla izmēri: 4000x4000 px
  - Min. attēla izmēri: 800x600 px
  - Vēlamā orientācija: jebkura, horizontāla, vertikāla, kvadrātiska

### Saglabāšana
- Iestatījumi tiek glabāti pārlūka lokālajā krātuvē (`localStorage`).
- Nesaglabātas izmaiņas izraisa brīdinājumu: "Ir nesaglabātas izmaiņas. Vai tiešām aizvērt?"
- Veiksmīga saglabāšana: "Iestatījumi saglabāti!"

---

## 12. Tastatūras saīsnes

| Saīsne | Darbība |
|---------|---------|
| `Ctrl+Shift+D` | Atvērt/aizvērt izstrādātāja paneli (tikai izstrādes režīmā) |
| `Escape` | Aizvērt atvērtu modāli vai uznirstošo logu |
| Bultiņu taustiņi | Navigēt starp glabājamām vienībām rediģēšanas modālī |

### Modāļu aizvēršana:
- **Escape taustiņš** -- aizver aktīvo modāli (darbojas visos modāļos: inventāra izveide/rediģēšana, vienības rediģēšana, ieraksta izveide, verifikācija, iestatījumi)
- **Klikšķis ārpus modāļa** -- aizver modāli, nospiežot uz fona (backdrop)
- Aizvēršana ir bloķēta, kamēr notiek saglabāšana vai augšupielāde (disabled stāvoklī)

---

## 13. Kļūdu ziņošana

### Izmantojot izstrādātāja paneli (DevAdmin)

DevAdmin panelis ir pieejams izstrādes būvējumos (`npm start` vai `npm run build:dev`).

1. Nospiediet `Ctrl+Shift+D`, lai atvērtu paneli.
2. Izmantojiet atbilstošo cilni:
   - **State** -- pārbaudiet projekta datu stāvokli
   - **Network** -- pārbaudiet API pieprasījumus un atbildes
   - **Errors** -- testējiet kļūdu apstrādi
3. **Kopēšanas pogas:**
   - Katrā sadaļā ir pieejamas kopēšanas pogas, lai kopētu kļūdu informāciju starpliktuvē.
   - Šo informāciju var ielīmēt kļūdu ziņojumā.

### Kļūdu ziņojuma veidne:
Ziņojot par kļūdu, iekļaujiet:
1. **Darbība:** Ko mēģinājāt darīt
2. **Sagaidāmais rezultāts:** Ko gaidījāt
3. **Faktiskais rezultāts:** Kas notika
4. **Stāvokļa informācija:** No DevAdmin > State cilnes (izmantojiet kopēšanas pogu)
5. **Tīkla informācija:** No DevAdmin > Network cilnes (ja saistīts ar API)
6. **Pārlūkprogramma un versija:** Chrome/Firefox/Edge versija

### Validācijas testēšana:
DevAdmin panelī ir arī **Validation** cilne, kas ļauj:
- Pārbaudīt validācijas noteikumus ar pielāgotiem datiem
- Palaist automatizētus testu komplektus (Tests cilne)
- Pārbaudīt formu stāvokli (Forms cilne)

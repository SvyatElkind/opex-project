# OPEX rīks — Demonstrācijas testa dati un lauku skaidrojums

> **Kam paredzēts:** šo dokumentu var izmantot kā **scenāriju demonstrācijai** un kā **mācību materiālu** lietotājiem. Tas satur:
> 1. gatavus testa datus, ko ievadīt soli pa solim;
> 2. katra lauka skaidrojumu (kas tas ir, vai obligāts, kādi noteikumi);
> 3. piezīmes pasniedzējam par biežākajām kļūdām.
>
> Mērķis demonstrācijā: parādīt **visu veidu glabājamās vienības visos uzskaites sarakstu veidos** — Tekstuāls, Foto, Skaņas, Video (gan elektroniski, gan papīra).

---

## 1. Programmas struktūra (hierarhija)

Dati programmā ir sakārtoti pakāpeniski. Lai nokļūtu līdz glabājamai vienībai, vispirms jāizveido augšējie līmeņi:

```
Projekts
 └─ Iestāde
     └─ Fonds
         └─ Uzskaites saraksts (US)          ← šeit izvēlas VEIDU: Tekstuāls / Foto / Skaņas / Video
             └─ Glabājamā vienība (GV)        ← galvenā ievades forma
                 └─ Dokuments                 ← tikai medijiem (Foto / Skaņas / Video): krāsa, izšķirtspēja, ilgums
```

**Saīsinājumi, ko redzēsiet saskarnē:**
- **US** = Uzskaites saraksts
- **GV** = Glabājamā vienība

> 💡 **Demonstrācijas loģika:** uzskaites saraksta **veids** nosaka, kā uzvedas glabājamās vienības forma. Piemēram, Foto sarakstā valoda nav obligāta, bet "Saturs" ir; papīra sarakstā parādās "Apjoms" un "Apjoma mērvienība". Tāpēc demonstrējam visus četrus veidus.

---

## 2. Demonstrācijas sagatavošana (Projekts → Iestāde → Fonds)

Šie soļi jāizdara vienreiz, lai būtu kur veidot uzskaites sarakstus un vienības.

### 2.1. Jauns projekts

| Lauks | Vērtība (testa dati) | Skaidrojums |
|---|---|---|
| **Projekta nosaukums** | `Demonstrācijas projekts 2026` | Brīvs teksts. |
| **Projekta ceļš** | `C:\OPEX\Demo` | Mape lietotāja datorā, kur glabāsies projekta dati. Jābūt derīgam Windows ceļam (sākas ar disku, piem., `C:\...`). |

> ℹ️ Visi faili glabājas **lokāli lietotāja datorā** norādītajā mapē.

### 2.2. Iestāde

| Lauks | Vērtība (testa dati) | Obligāts | Skaidrojums |
|---|---|---|---|
| **Reģ. Nr.** | `90000012345` | Jā | Tikai cipari, līdz 15 zīmēm. Jābūt unikālam. |
| **Nosaukums** | `Demonstrācijas novada pašvaldība` | Jā | Iestādes pilns nosaukums (līdz 500 zīmēm), unikāls. |
| **Veidotājs** | `Anna Bērziņa` | Nē | Persona, kas sagatavoja uzskaites sarakstu. |
| **Veidotāja amats** | `Arhīva pārzine` | Nē | |
| **Parakstītājs** | `Jānis Ozoliņš` | Nē | Persona, kas saskaņo/paraksta. |
| **Parakstītāja amats** | `Izpilddirektors` | Nē | |

### 2.3. Fonds

| Lauks | Vērtība (testa dati) | Obligāts | Skaidrojums |
|---|---|---|---|
| **Fonda kods** | `LVA-DEMO-001` | Jā | Unikāls fonda apzīmējums (līdz 30 zīmēm). |
| **Arhīva abreviatūra** | `LVA` | Jā | Jābūt no atļautā saraksta (skatīt 8. nodaļu). |
| **Arhīva nosaukums** | `Latvijas Valsts arhīvs` | Jā | **Jāatbilst tieši** izvēlētajai abreviatūrai (skatīt tabulu 8. nodaļā). |
| **Fonda numurs** | `1` | Jā | Vesels skaitlis. |
| **Fonda nosaukums** | `Demonstrācijas novada pašvaldības fonds` | Jā | Līdz 500 zīmēm. |

> ⚠️ **Biežākā kļūda:** "Arhīva nosaukums" jāsakrīt ar abreviatūru. Ja izvēlas `LVA`, nosaukumam jābūt tieši `Latvijas Valsts arhīvs`. Pārējos pārus skatīt 8. nodaļā.

---

## 3. Uzskaites saraksta (US) izveide — lauku skaidrojums

Forma: **"Jauns uzskaites saraksts"**.

| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Veids** | Jā | `Foto`, `Skaņas`, `Tekstuāls` vai `Video`. **Nosaka, kādi lauki būs glabājamai vienībai.** |
| **Elektronisks** (ķeksis) | — | Ieslēgts pēc noklusējuma = elektroniski dokumenti. **Izslēdz**, ja saraksts ir papīra formā → tad glabājamai vienībai parādās "Apjoms" un "Apjoma mērvienība". |
| **Aprakstīšanas periods (No / Līdz)** | Jā | Gadi. **Svarīgi:** visu vienību datumiem jāietilpst šajā periodā (vienības beigu datums nedrīkst pārsniegt saraksta beigu gadu). |
| **Glabāšanas termiņš** | Jā | `Pastāvīgi glabājamās lietas` vai `Ilgstoši glabājamās lietas`. |
| **Apakšfonds** | Nē | Papildu ķeksis; ja ieslēgts, var norādīt apakšfonda numuru. |
| **Numurs** | (automātisks) | Sistēma piešķir nākamo numuru automātiski. |

**Demonstrācijai izveidojam 5 uzskaites sarakstus:**

| Nr. | Veids | Elektronisks | Periods (No–Līdz) | Glabāšanas termiņš |
|---|---|---|---|---|
| 1 | Tekstuāls | ✅ Jā | 1991 – 2005 | Pastāvīgi glabājamās lietas |
| 2 | Tekstuāls | ⬜ Nē (papīra) | 1991 – 2010 | Ilgstoši glabājamās lietas |
| 3 | Foto | ✅ Jā | 1995 – 2015 | Pastāvīgi glabājamās lietas |
| 4 | Skaņas | ✅ Jā | 2000 – 2018 | Pastāvīgi glabājamās lietas |
| 5 | Video | ✅ Jā | 2005 – 2020 | Pastāvīgi glabājamās lietas |

---

## 4. Glabājamās vienības (GV) lauki — pilns skaidrojums

Forma sadalīta sadaļās (kreisajā pusē navigācija). Zvaigznīte (*) = obligāts.

### Pamatinformācija
| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Sērijas kods** * | Jā | Cipari, atdalīti ar punktiem: `1`, `1.2`, `3.4.5`. Katrs skaitlis 1–2 zīmes. Nedrīkst sākties ar nulli (piem., `01` nav atļauts). |
| **Nosaukums** * | Jā | Vienības nosaukums (līdz 1000 zīmēm). |
| **Valoda** | Atkarīgs | Vairākas valodas var pievienot kā birkas. **Obligāta visiem veidiem, IZŅEMOT Foto.** Var ievadīt arī savu valodu. |

### Datuma informācija
| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Datums (No / Līdz)** * | Jā | Izvēlas kalendārā. Var norādīt pēc gada / mēneša / dienas (kalendāra skats nosaka "datuma indikatoru"). Beigu datums **nedrīkst pārsniegt** uzskaites saraksta beigu datumu. |
| **Datuma piezīmes** | Nē | Brīvs paskaidrojums par datējumu. |

### Tehniskā informācija
| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Apjoms** | Nē | **Redzams tikai papīra (ne-elektroniskos) sarakstos.** Vesels skaitlis. |
| **Apjoma mērvienība** | Nē | **Tikai papīra sarakstos.** `Lapas`, `Dokumenti` vai `Glabājamās vienības`. |
| **Kopija** | Nē | Piem., `Oriģināls`, `Kopija`, `Noraksts`. |
| **Arhīva vēsture** | Nē | Informācija par dokumenta izcelsmi/pārvietošanu. |
| **Sistematizācija** | Nē | Sistematizācijas kods/shēma. |

### Saturs
| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Saturs** | Atkarīgs | Vienības satura izklāsts. **Obligāts medijiem (Foto, Skaņas, Video).** Tekstuālam — nav obligāts (bet ieteicams). Līdz 2000 zīmēm. |
| **Piezīmes** | Nē | Papildu informācija (līdz 1000 zīmēm). |

### Pieejamība un slepenība
| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Pieejamība** | Nē (noklusējums `Vispārēja`) | `Vispārēja`, `Ierobežota`, `Sensitīvi dati`. |
| **Slepenība** | Nē (noklusējums `Publisks`) | `Publisks`, `Iekšējs`, `Konfidenciāls`, `Slepens`. |
| **Pieejamības piezīmes** | Atkarīgs | **Obligāts, ja Pieejamība nav `Vispārēja`** — jānorāda ierobežojuma pamatojums un termiņš. |
| **Slepenības piezīmes** | Nē | Papildu paskaidrojums par slepenību. |

### Saistītās glabājamās vienības
| Lauks | Obligāts | Skaidrojums |
|---|---|---|
| **Saistītās vienības** | Nē | Var sasaistīt ar citām vienībām projektā (meklē pēc numura vai nosaukuma). Vienība nevar būt saistīta pati ar sevi. |

> 💡 **Atvieglojums demonstrācijai:** poga **"Izveidot vēl vienu"** ļauj pēc saglabāšanas uzreiz aizpildīt nākamo vienību ar to pašu sēriju — ērti, lai parādītu vairāku vienību ievadi.

---

## 5. Testa dati pa veidiem

> Aizpildiet tikai norādītos laukus. Lauki, kas nav minēti, var palikt ar noklusējuma vērtību vai tukši.

---

### A. Tekstuāls — Elektronisks (Uzskaites saraksts Nr. 1)

**GV 1**
- **Sērijas kods:** `1`
- **Nosaukums:** `Pašvaldības domes sēžu protokoli`
- **Valoda:** `Latviešu`
- **Datums:** `1991` – `1995` (gada skats)
- **Saturs:** `Domes sēžu protokoli par pašvaldības budžetu un saimnieciskajiem jautājumiem.`
- **Pieejamība:** `Vispārēja` · **Slepenība:** `Publisks`

**GV 2**
- **Sērijas kods:** `2`
- **Nosaukums:** `Sarakste ar valsts iestādēm`
- **Valoda:** `Latviešu`, `Krievu`
- **Datums:** `1996` – `2000`
- **Saturs:** `Iestādes ienākošā un izejošā sarakste ar ministrijām un pārvaldēm.`
- **Pieejamība:** `Ierobežota` → **Pieejamības piezīmes:** `Satur fizisko personu datus; ierobežojums līdz 2030. gadam.`
- **Slepenība:** `Iekšējs`

> Šeit parādās: valoda kā birkas (vairākas), pieejamības piezīmju **obligātums**, kad pieejamība nav "Vispārēja".

---

### B. Tekstuāls — Papīra (Uzskaites saraksts Nr. 2)

> Šajā sarakstā **parādās "Apjoms" un "Apjoma mērvienība"**, jo tas nav elektronisks.

**GV 1**
- **Sērijas kods:** `1`
- **Nosaukums:** `Personāla rīkojumi par pamatdarbību`
- **Valoda:** `Latviešu`
- **Datums:** `1991` – `2000`
- **Apjoms:** `245` · **Apjoma mērvienība:** `Lapas`
- **Kopija:** `Oriģināls`
- **Pieejamība:** `Vispārēja` · **Slepenība:** `Publisks`

**GV 2**
- **Sērijas kods:** `2`
- **Nosaukums:** `Darbinieku personas lietas`
- **Valoda:** `Latviešu`
- **Datums:** `1991` – `2010`
- **Apjoms:** `38` · **Apjoma mērvienība:** `Glabājamās vienības`
- **Pieejamība:** `Ierobežota` → **Pieejamības piezīmes:** `Personas dati; ierobežojums 75 gadi no lietas slēgšanas.`
- **Slepenība:** `Konfidenciāls` → **Slepenības piezīmes:** `Satur sensitīvu personāla informāciju.`

> Šeit parādās: "Apjoms" / "Apjoma mērvienība" (tikai papīra), dažādas mērvienības, augstāks slepenības līmenis ar piezīmi.

---

### C. Foto — Elektronisks (Uzskaites saraksts Nr. 3)

> Foto sarakstā: **valoda NAV obligāta**, bet **"Saturs" IR obligāts**. Pēc vienības izveides pievieno **Dokumentu** (krāsa + izšķirtspēja).

**GV 1**
- **Sērijas kods:** `1`
- **Nosaukums:** `Pilsētas svētku fotogrāfijas`
- **Valoda:** (var atstāt tukšu)
- **Datums:** `2010` (gada skats)
- **Saturs:** `Krāsainas fotogrāfijas no pilsētas svētku gājiena centrālajā laukumā.`
- **Pieejamība:** `Vispārēja` · **Slepenība:** `Publisks`
- **Dokuments:** Apraksts `Svētku gājiens` · Krāsa `krāsains` · Horizontālā izšķirtspēja `1920` · Vertikālā izšķirtspēja `1080`

**GV 2**
- **Sērijas kods:** `2`
- **Nosaukums:** `Vēsturiskā ēka pirms rekonstrukcijas`
- **Datums:** `1998`
- **Saturs:** `Melnbaltas fotogrāfijas, kas dokumentē kultūras pieminekļa stāvokli pirms restaurācijas.`
- **Dokuments:** Apraksts `Fasāde` · Krāsa `melnbalts` · Horizontālā izšķirtspēja `2560` · Vertikālā izšķirtspēja `1440`

> Šeit parādās: valodas lauks var palikt tukšs (Foto), "Saturs" obligātums, mediju dokumenta forma.

---

### D. Skaņas — Elektronisks (Uzskaites saraksts Nr. 4)

> Skaņu sarakstā: **valoda obligāta**, **"Saturs" obligāts**. Dokumentā jānorāda **Ilgums** (formātā HH:MM:SS).

**GV 1**
- **Sērijas kods:** `1`
- **Nosaukums:** `Domes sēdes audio dokuments`
- **Valoda:** `Latviešu`
- **Datums:** `2015`
- **Saturs:** `Pašvaldības domes kārtējās sēdes pilns audio dokuments.`
- **Dokuments:** Apraksts `1. daļa` · Ilgums `01:45:30`

**GV 2**
- **Sērijas kods:** `2`
- **Nosaukums:** `Novadnieku atmiņu intervijas`
- **Valoda:** `Latviešu`, `Krievu`
- **Datums:** `2008`
- **Saturs:** `Mutvārdu vēstures intervijas ar novada senioriem par pēckara periodu.`
- **Dokuments:** Apraksts `Intervija Nr. 1` · Ilgums `00:52:10`

> Šeit parādās: skaņu dokumenta lauks "Ilgums" un tā formāts.

---

### E. Video — Elektronisks (Uzskaites saraksts Nr. 5)

> Video sarakstā: **valoda obligāta**, **"Saturs" obligāts**. Dokumentā jānorāda **Krāsa + Ilgums + Izšķirtspēja** (visi obligāti).

**GV 1**
- **Sērijas kods:** `1`
- **Nosaukums:** `Pilsētas svētku videohronika`
- **Valoda:** `Latviešu`
- **Datums:** `2018`
- **Saturs:** `Videoieraksts no pilsētas svētku koncerta un svinīgās ceremonijas.`
- **Dokuments:** Apraksts `Koncerts` · Krāsa `krāsains` · Ilgums `02:10:00` · Horizontālā `1920` · Vertikālā `1080`

**GV 2**
- **Sērijas kods:** `2`
- **Nosaukums:** `Dokumentālā filma par novada vēsturi`
- **Valoda:** `Latviešu`
- **Datums:** `2012`
- **Saturs:** `Dokumentāla filma par novada izveidošanos un nozīmīgākajiem notikumiem.`
- **Dokuments:** Apraksts `Pilnā versija` · Krāsa `krāsains` · Ilgums `00:48:25` · Horizontālā `3840` · Vertikālā `2160`

> Šeit parādās: video dokuments apvieno visu — krāsu, ilgumu un izšķirtspēju.

---

## 6. Dokumenta (medija) lauki — skaidrojums

Pēc Foto / Skaņas / Video vienības izveides pievieno digitālo datni un aizpilda metadatus. Obligātie lauki **atkarīgi no saraksta veida**:

| Lauks | Foto | Skaņas | Video | Skaidrojums |
|---|:--:|:--:|:--:|---|
| **Apraksts** | nē | nē | nē | Brīvs dokumenta apraksts (nav obligāts). |
| **Krāsa** | ✅ | — | ✅ | Brīvs teksts, piem., `krāsains`, `melnbalts`, `sēpija`. |
| **Ilgums** | — | ✅ | ✅ | Formātā `HH:MM:SS`, piem., `01:23:45`. |
| **Horizontālā izšķirtspēja (px)** | ✅ | — | ✅ | Vesels skaitlis, piem., `1920`. |
| **Vertikālā izšķirtspēja (px)** | ✅ | — | ✅ | Vesels skaitlis, piem., `1080`. |

---

## 7. Svarīgas piezīmes pasniedzējam (biežākās kļūdas)

1. **Datumu robežas.** Vispirms uzskaites sarakstam jābūt norādītam periodam, citādi vienību nevar pievienot. Vienības beigu datums **nedrīkst pārsniegt** saraksta beigu gadu — citādi parādās kļūda.
2. **Sērijas kods.** Tikai cipari ar punktiem (`1`, `1.2`, `2.3.4`). Nedrīkst sākties ar nulli un katram skaitlim ne vairāk par 2 zīmēm.
3. **Valoda Foto sarakstā.** Foto gadījumā valodu var atstāt tukšu — pārējos veidos tā ir obligāta.
4. **"Saturs" medijiem.** Foto / Skaņas / Video vienībai "Saturs" ir obligāts — ja tukšs, saglabāt neizdosies.
5. **Pieejamības piezīmes.** Tiklīdz "Pieejamība" nav `Vispārēja`, kļūst obligātas "Pieejamības piezīmes" (pamatojums + termiņš).
6. **Apjoms tikai papīra sarakstos.** Lauki "Apjoms" un "Apjoma mērvienība" parādās tikai tad, ja sarakstam **izslēgts** ķeksis "Elektronisks".
7. **Ilguma formāts.** Skaņu/video dokumentā ilgums jāievada kā `HH:MM:SS` (ar divciparu stundām, piem., `00:05:30`).
8. **"Pieejamība" vērtības.** Visas trīs vērtības (`Vispārēja`, `Ierobežota`, `Sensitīvi dati`) ir derīgas. Izvēloties jebkuru, kas nav `Vispārēja`, kļūst obligātas "Pieejamības piezīmes" (skatīt 5. punktu).

---

## 8. Atsauces tabulas

### 8.1. Arhīvu abreviatūras un nosaukumi (Fonda izveidei)

Abreviatūrai un nosaukumam jāsakrīt:

| Abreviatūra | Arhīva nosaukums |
|---|---|
| LVA | Latvijas Valsts arhīvs |
| LVVA | Latvijas Valsts vēstures arhīvs |
| PDVA | Personāla dokumentu valsts arhīvs |
| KFFDA | Latvijas Valsts kinofotofonodokumentu arhīvs |
| VZVA | Ventspils zonālais valsts arhīvs |
| LZVA | Liepājas zonālais valsts arhīvs |
| JZVA | Jelgavas zonālais valsts arhīvs |
| TZVA | Tukuma zonālais valsts arhīvs |
| CZVA | Cēsu zonālais valsts arhīvs |
| JEZVA | Jēkabpils zonālais valsts arhīvs |
| AZVA | Alūksnes zonālais valsts arhīvs |
| RZVA | Rēzeknes zonālais valsts arhīvs |
| DZVA | Daugavpils zonālais valsts arhīvs |
| ZRA | Zemgales reģionālais arhīvs |
| VAZVA | Valmieras zonālais valsts arhīvs |
| SZVA | Siguldas zonālais valsts arhīvs |

### 8.2. Atļautās vērtības (izvēlnes)

| Lauks | Atļautās vērtības |
|---|---|
| **US veids** | Tekstuāls · Foto · Skaņas · Video |
| **Glabāšanas termiņš** | Pastāvīgi glabājamās lietas · Ilgstoši glabājamās lietas |
| **Apjoma mērvienība** | Lapas · Dokumenti · Glabājamās vienības |
| **Pieejamība** | Vispārēja · Ierobežota · Sensitīvi dati |
| **Slepenība** | Publisks · Iekšējs · Konfidenciāls · Slepens |

### 8.3. Valodas (piedāvātās birkas; var ievadīt arī savu)

Latviešu · Krievu · Angļu · Vācu · Franču · Spāņu · Itāļu · Poļu · Lietuviešu · Igauņu · Somu · Zviedru · Norvēģu · Dāņu · Holandiešu · Portugāļu · Grieķu · Turku · Arābu · Ķīniešu · Japāņu · Korejiešu · Hindi · Hebrejsku · Čehu · Slovāku · Rumāņu · Bulgāru · Ungāru · Ukraiņu · Serbu · Horvātu · Cita

---

*Dokuments sagatavots, balstoties uz programmas izveides formām (uzskaites saraksta, glabājamās vienības un dokumenta dialogiem).*

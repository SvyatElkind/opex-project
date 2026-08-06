/* ==========================================
   FIELD-LEVEL HELP CONTENT
   Single source of truth for per-field explanations, keyed by entity.field.
   Consumed by:
     - <FieldHelp> (components/FieldHelp.jsx) — uses `.short` for the hover tooltip
     - helpConstants.js `annotated-screen` callouts — uses `.detail` for the
       longer explanation shown in the help chapter's form mockup
   Keep both texts here so they never drift into a third/fourth copy of the
   same knowledge (see project/notes on InheritanceUtils.js for why that's a
   real risk in this codebase — conditional field-requirement rules already
   live independently in backend validators + frontend *Constants.js files).

   Naming: entity keys use the frontend state-variable name for the field
   (camelCase), not the backend/API snake_case name, since that's what call
   sites already have in scope.
   ========================================== */

export const FIELD_HELP = {
    project: {
        name: {
            short: 'Projekta nosaukums — līdz 20 rakstzīmēm, tikai burti, cipari, "_" un "-" (bez atstarpēm un garumzīmēm).',
            detail: 'Unikāls projekta nosaukums, kas redzams cilnē un tiek izmantots ģenerētajos failos. Atļauti tikai burti, cipari, apakšsvītra (_) un defise (-) — bez atstarpēm, garumzīmēm vai citiem simboliem. Maksimums 20 rakstzīmes.'
        },
        directory: {
            short: 'Pilns Windows mapes ceļš datorā, kur glabāsies projekta dati (piem., C:\\Projekti\\Arhivs).',
            detail: 'Norādiet pilnu ceļu līdz lokālai mapei diskā (sākas ar diska burtu, piem., C:\\...). Šajā mapē tiks ģenerēti uzskaites saraksti, pieņemšanas-nodošanas akti un OPEX struktūra. Tīkla ceļi (\\\\serveris\\...) netiek atbalstīti; izvēlieties ceļu tuvāk diska saknei.'
        },
        newName: {
            short: 'Jaunais projekta nosaukums — tie paši noteikumi kā izveidojot projektu (līdz 20 rakstzīmēm, bez garumzīmēm).',
            detail: 'Aizstāj esošo projekta nosaukumu. Atļauti tikai burti, cipari, apakšsvītra (_) un defise (-), maksimums 20 rakstzīmes. Projekta direktorija diskā nemainās.'
        },
    },
    institutionSigners: {
        creatorName: {
            short: 'Personas vārds un uzvārds, kas sagatavoja uzskaites sarakstu (izveidotājs).',
            detail: 'Pilns vārds un uzvārds personai, kas sagatavoja/aprakstīja uzskaites sarakstu. Šī informācija tiek izmantota ģenerētajos dokumentos un OPEX struktūrā.'
        },
        creatorPosition: {
            short: 'Izveidotāja amats iestādē (piem., "Arhivārs").',
            detail: 'Izveidotāja ieņemamais amats institūcijā. Tiek norādīts kopā ar vārdu ģenerētajos dokumentos.'
        },
        signerName: {
            short: 'Personas vārds un uzvārds, kas apstiprina/paraksta dokumentus.',
            detail: 'Pilns vārds un uzvārds personai, kas saskaņo un paraksta sagatavotos dokumentus (piem., iestādes vadītājs).'
        },
        signerPosition: {
            short: 'Parakstītāja amats iestādē (piem., "Izpilddirektors").',
            detail: 'Parakstītāja ieņemamais amats institūcijā. Nepieciešams, lai ģenerētu pieņemšanas-nodošanas aktus un citus oficiālos dokumentus.'
        },
    },
    inventory: {
        type: {
            short: 'Nosaka, kāda veida faili un cik dokumentu var pievienot glabājamām vienībām šajā sarakstā.',
            detail: 'Uzskaites saraksta veids — Tekstuāls, Foto, Skaņas vai Video. Nosaka atļautos failu formātus un cik dokumentus var pievienot vienai glabājamai vienībai (Tekstuāls — vairākus, pārējie — vienu). Pēc izveides veidu vairs nevar mainīt.'
        },
        electronic: {
            short: 'Ieslēgts = elektroniski faili jāaugšupielādē. Izslēgts = fiziskas vienības bez failiem.',
            detail: 'Ja ieslēgts, saraksts ir elektronisks — glabājamām vienībām jāpievieno digitālie faili. Ja izslēgts, saraksts ir fizisks (papīrs, kasetes u.tml.) — glabājamām vienībām parādās papildu lauki "Apjoms" un "Apjoma mērvienība", un failu augšupielāde nav pieejama.'
        },
        startDate: {
            short: 'Aprakstīšanas perioda sākuma gads — visu vienību datumiem jāietilpst šajā periodā.',
            detail: 'Perioda sākuma gads. Visām sarakstā izveidotajām glabājamajām vienībām jābūt datumiem šī perioda robežās.'
        },
        endDate: {
            short: 'Aprakstīšanas perioda beigu gads — vienības beigu datums to nedrīkst pārsniegt.',
            detail: 'Perioda beigu gads. Glabājamās vienības beigu datums nedrīkst pārsniegt šo gadu — pretējā gadījumā parādīsies kļūda.'
        },
        storageTerm: {
            short: 'Glabāšanas termiņš: pastāvīgi vai ilgstoši glabājamās lietas.',
            detail: 'Nosaka, cik ilgi saraksta materiāli jāglabā arhīvā — "Pastāvīgi glabājamās lietas" vai "Ilgstoši glabājamās lietas".'
        },
        subfond: {
            short: 'Ieslēdziet, ja saraksts pieder apakšfondam, un norādiet tā numuru.',
            detail: 'Papildu ķeksis apakšfonda gadījumiem. Ja ieslēgts, jānorāda apakšfonda numurs (pozitīvs skaitlis).'
        },
    },
    item: {
        series_code: {
            short: 'Cipari, atdalīti ar punktiem (piem., "1", "1.2"). Nedrīkst sākties ar nulli.',
            detail: 'Vienības sērijas kods — cipari, atdalīti ar punktiem (piem., 1, 1.2, 3.4.5). Katrs skaitlis līdz 2 zīmēm, nedrīkst sākties ar nulli (piem., "01" nav atļauts).'
        },
        title: {
            short: 'Glabājamās vienības nosaukums (līdz 1000 rakstzīmēm).',
            detail: 'Vienības nosaukums — apraksta, kas vienībā atrodas. Redzams sarakstos un ģenerētajos dokumentos.'
        },
        language: {
            short: 'Obligāta visiem sarakstu veidiem, IZŅEMOT Foto. Var pievienot vairākas valodas.',
            detail: 'Vienībā izmantotā(-ās) valoda(-as) — var pievienot vairākas kā birkas vai ievadīt savu. Obligāta visiem uzskaites saraksta veidiem, izņemot Foto, kur šis lauks var palikt tukšs.'
        },
        date_note: {
            short: 'Brīvs paskaidrojums par datējumu, ja tas nav pilnīgi precīzs.',
            detail: 'Papildu piezīme par vienības datējumu, piemēram, ja precīzs datums nav zināms vai tas ir aptuvens.'
        },
        size: {
            short: 'Redzams tikai papīra (ne-elektroniskos) sarakstos — vienību skaits vai lapu apjoms.',
            detail: 'Vienības fiziskais apjoms (vesels skaitlis). Šis lauks parādās tikai tad, ja uzskaites saraksts nav elektronisks.'
        },
        unit_of_measure: {
            short: 'Mērvienība apjomam — Lapas, Dokumenti vai Glabājamās vienības. Tikai papīra sarakstos.',
            detail: 'Kādās vienībās mērīts "Apjoms" lauks — Lapas, Dokumenti vai Glabājamās vienības. Redzams tikai papīra (ne-elektroniskos) sarakstos.'
        },
        copy: {
            short: 'Piemēram, "Oriģināls", "Kopija" vai "Noraksts".',
            detail: 'Norāda, vai vienība ir oriģināls, kopija vai noraksts.'
        },
        archival_history: {
            short: 'Informācija par dokumenta izcelsmi vai pārvietošanu.',
            detail: 'Brīvs teksts par vienības arhīva vēsturi — izcelsmi, iepriekšējo glabāšanas vietu, pārvietošanu u.tml.'
        },
        sistematisation: {
            short: 'Sistematizācijas kods vai shēma, ja tāda tiek lietota.',
            detail: 'Kods vai apzīmējums, kas norāda, pēc kādas shēmas vienība sistematizēta fondā.'
        },
        annotation: {
            short: 'Obligāts Foto, Skaņas un Video sarakstos. Tekstuālam nav obligāts, bet ieteicams.',
            detail: 'Vienības satura apraksts — līdz 2000 rakstzīmēm. Obligāts, ja uzskaites saraksta veids ir Foto, Skaņas vai Video; Tekstuālam sarakstam šis lauks nav obligāts, bet ir ieteicams.'
        },
        notes: {
            short: 'Papildu informācija par vienību (līdz 1000 rakstzīmēm).',
            detail: 'Brīva piezīme par vienību — jebkas, kas nepieklājas citos laukos, bet vēlāk palīdzēs to atpazīt.'
        },
        restriction: {
            short: 'Pieejamības līmenis — noklusējums "Vispārēja".',
            detail: 'Vienības pieejamības līmenis: Vispārēja, Ierobežota vai Sensitīvi dati. Izvēloties jebko, kas nav "Vispārēja", kļūst obligātas "Pieejamības piezīmes".'
        },
        security_level: {
            short: 'Slepenības līmenis — noklusējums "Publisks".',
            detail: 'Vienības slepenības līmenis: Publisks, Iekšējs, Konfidenciāls vai Slepens.'
        },
        restriction_note: {
            short: 'Obligāts, ja "Pieejamība" nav "Vispārēja" — norādiet pamatojumu un termiņu.',
            detail: 'Pieejamības ierobežojuma pamatojums un termiņš. Kļūst obligāts, tiklīdz "Pieejamība" ir citāda nekā "Vispārēja".'
        },
        security_level_note: {
            short: 'Papildu paskaidrojums par slepenības līmeni (nav obligāts).',
            detail: 'Brīvs teksts, kas paskaidro, kāpēc izvēlēts konkrētais slepenības līmenis, ja nepieciešams.'
        },
    },
    record: {
        title: {
            short: 'Dokumenta nosaukums.',
            detail: 'Dokumenta nosaukums — apraksta konkrēto dokumentu glabājamās vienības ietvaros.'
        },
        date: {
            short: 'Dokumenta datums — jāietilpst vecāka glabājamās vienības datumu diapazonā.',
            detail: 'Dokumenta datums. Ja tas ir ārpus vecāka glabājamās vienības datumu diapazona, parādīsies brīdinājums.'
        },
        reg_nr: {
            short: 'Dokumenta reģistrācijas numurs (piem., no lietvedības sistēmas).',
            detail: 'Numurs, ar kādu dokuments reģistrēts (piem., saņemtās/nosūtītās korespondences reģistrā).'
        },
        group: {
            short: 'Brīvs grupējuma apzīmējums dokumentu sagrupēšanai.',
            detail: 'Brīvs teksta lauks dokumentu grupēšanai pēc lietotāja izvēlētiem kritērijiem.'
        },
        created_date: {
            short: 'Datums, kad dokuments tika izveidots/sastādīts.',
            detail: 'Dokumenta izveidošanas (sastādīšanas) datums — var atšķirties no nosūtīšanas datuma.'
        },
        sent_date: {
            short: 'Datums, kad dokuments tika nosūtīts.',
            detail: 'Datums, kad dokuments tika nosūtīts adresātam.'
        },
        language: {
            short: 'Dokumenta valoda(-as) — var pievienot vairākas kā birkas.',
            detail: 'Dokumentā izmantotā(-ās) valoda(-as). Var pievienot vairākas kā birkas vai ievadīt savu.'
        },
        sent_reg_nr: {
            short: 'Nosūtītāja piešķirtais reģistrācijas numurs.',
            detail: 'Reģistrācijas numurs, ko dokumentam piešķīrusi nosūtītāja puse (nevis saņēmēja iestāde).'
        },
        nomenclature_nr: {
            short: 'Lietas numurs pēc lietu nomenklatūras.',
            detail: 'Numurs, kas norāda, kurā lietā (pēc iestādes lietu nomenklatūras) dokuments atrodas.'
        },
        key_words: {
            short: 'Atslēgvārdi meklēšanai — pievienojiet vairākus.',
            detail: 'Atslēgvārdi, kas atvieglo dokumenta atrašanu meklēšanā. Var pievienot vairākus.'
        },
        annotation: {
            short: 'Dokumenta satura īss apraksts (anotācija).',
            detail: 'Īss dokumenta satura izklāsts — palīdz ātri saprast, par ko dokuments ir, neatverot to.'
        },
        notes: {
            short: 'Papildu piezīmes par dokumentu.',
            detail: 'Brīva piezīme par dokumentu — jebkas, kas nepieklājas citos laukos.'
        },
        tech_info: {
            short: 'Tehniska informācija par dokumentu (formāts, izcelsme u.tml.).',
            detail: 'Tehniska rakstura informācija par dokumentu, piemēram, oriģinālais formāts vai digitalizācijas apstākļi.'
        },
        access_restriction: {
            short: 'Pieejamība — Vispārēja vai Ierobežota.',
            detail: 'Dokumenta pieejamības statuss. Ja atšķiras no vecāka glabājamās vienības pieejamības, parādīsies brīdinājums.'
        },
        access_restriction_notes: {
            short: 'Ierobežojuma iemesls (rādās neatkarīgi no izvēlētās pieejamības).',
            detail: 'Paskaidrojums par pieejamības statusu — piemēram, kāpēc dokuments ir vispārpieejams vai kāpēc tas ir ierobežots.'
        },
        access_restriction_date: {
            short: 'Obligāts, ja pieejamība ir "Ierobežota" — datums, līdz kuram ierobežojums spēkā.',
            detail: 'Datums, līdz kuram pieejamības ierobežojums ir spēkā. Obligāts, ja "Pieejamība" ir iestatīta uz "Ierobežota".'
        },
        user_restriction_notes: {
            short: 'Lietošanas nosacījumi, ja pieejamība ir ierobežota.',
            detail: 'Papildu nosacījumi, kas jāievēro, lietojot šo dokumentu, kamēr tas ir ierobežotas pieejamības statusā.'
        },
    },
    mediaRecord: {
        color: {
            short: 'Krāsains vai melnbalts. Nav lauka Skaņas dokumentiem.',
            detail: 'Norāda, vai foto/video attēls ir krāsains vai melnbalts. Obligāts Foto un Video dokumentiem; Skaņas dokumentiem šis lauks nav pieejams.'
        },
        horizontal_resolution: {
            short: 'Horizontālā izšķirtspēja pikseļos. Nav lauka Skaņas dokumentiem.',
            detail: 'Attēla/video horizontālā izšķirtspēja pikseļos (piem., 1920). Obligāts Foto un Video dokumentiem.'
        },
        vertical_resolution: {
            short: 'Vertikālā izšķirtspēja pikseļos. Nav lauka Skaņas dokumentiem.',
            detail: 'Attēla/video vertikālā izšķirtspēja pikseļos (piem., 1080). Obligāts Foto un Video dokumentiem.'
        },
        duration: {
            short: 'Ilgums formātā HH:MM:SS. Tikai Video un Skaņas dokumentiem.',
            detail: 'Dokumenta ilgums formātā HH:MM:SS (piem., 01:23:45). Obligāts Video un Skaņas dokumentiem; Foto dokumentiem šis lauks nav pieejams.'
        },
    },
};

/**
 * Safe accessor — never throws. Returns null for unmapped entity/field
 * combinations so callers (FieldHelp) can render nothing instead of an
 * empty tooltip while content is still being authored phase by phase.
 */
export const getFieldHelp = (entity, field) => FIELD_HELP[entity]?.[field] ?? null;

export default FIELD_HELP;

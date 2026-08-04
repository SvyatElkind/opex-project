# Lietotāju pieteikumu reģistrs

Šajā mapē tiek uzskaitīti un apstrādāti lietotāju iesniegtie pieteikumi — kļūdu
ziņojumi (bug) un uzlabojumu ieteikumi (suggestion).

## Process

1. **Saņemšana** — lietotājs iesniedz pieteikumu (e-pasts, saruna, ekrānuzņēmums).
2. **Kategorizēšana** — katram pieteikumam tiek piešķirta prioritāte:
   - **Augsta** — bloķē darbu, datu zudums, kritiska funkcionalitāte nedarbojas.
   - **Vidēja** — funkcionalitātes ierobežojums vai būtiska lietojamības problēma;
     apiet var, bet traucē.
   - **Zema** — kosmētiska kļūda, teksta/gramatikas labojums.
3. **Reģistrēšana** — pieteikums tiek ierakstīts failā `Pieteikumu_Registrs.xlsx`
   un tam tiek izveidota apakšmape `NNN_Nosaukums/`.
4. **Izpilde** — pēc labojuma tiek papildināts apakšmapes `apraksts.txt`
   (sadaļa "Kas tika izdarīts") ar visiem mainītajiem komponentiem, konstantēm
   un koda vietām.
5. **Slēgšana** — reģistrā tiek aizpildīts `Izpildes datums`, `Status` = `Pabeigts`
   un `Versija`, kurā labojums iekļauts.

## Reģistra kolonnas (`Pieteikumu_Registrs.xlsx`)

| Kolonna | Skaidrojums |
|---|---|
| Nr. | Kārtas numurs (inkrementāls). Nosaka secību un ļauj ātri atrast pieteikumu. |
| Nosaukums | Īss atsauces nosaukums. |
| Prioritāte | Augsta / Vidēja / Zema. |
| Apraksts | Lietotāja aprakstītā problēma vai ieteikums. |
| Iesniedzējs | Persona, kas iesniedza pieteikumu. |
| Iesniegšanas datums | Datums, kad pieteikums saņemts. |
| Izpildes datums | Datums, kad labojums pabeigts. |
| Status | Reģistrēts / Procesā / Pabeigts. |
| Versija | Programmas versija, kurā labojums iekļauts. |
| Direktorija | Ceļš uz pieteikuma apakšmapi. |

## Apakšmapes saturs

```
NNN_Nosaukums/
├── apraksts.txt      # problēmas apraksts + kas tika izdarīts (koda izmaiņas)
└── *.png             # ekrānuzņēmumi un citi pielikumi no lietotāja
```

## Statusu nozīme

- **Reģistrēts** — pieteikums pieņemts, darbs vēl nav sākts.
- **Procesā** — notiek analīze vai labošana.
- **Pabeigts** — labojums ieviests un pārbaudīts.

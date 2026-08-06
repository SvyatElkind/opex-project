Importa paraugfaili (CSV / Excel)
=================================

Šie faili ir PARAUGI, ko var dot lietotājam, lai parādītu, kā jāizskatās
importa failam. Tos var atvērt ar Excel vai LibreOffice, aizstāt datus ar
saviem un importēt rīkā.

UZMANĪBU: imports ir EKSPERIMENTĀLA funkcija. Tā ir izstrādes stadijā un
nav rādītājs pārējā rīka kvalitātei. Pēc importa rezultāts obligāti
jāpārbauda. Atsaukšanas iespējas nav.


Faili
-----

imports_paraugs.xlsx        Galvenais paraugs. Trīs lapas:
                              DATI        - dati, ko rīks nolasa
                              INSTRUKCIJA - visu kolonnu apraksts un
                                            atļautās vērtības
                              PARAUGI     - visi trīs lietojuma veidi
                            Rīks lasa TIKAI lapu DATI (vai pirmo lapu).

imports_paraugs.csv         Tie paši dati kā xlsx lapā DATI.
                            UTF-8 ar BOM, atdalītājs ";".

imports_tikai_vienibas.csv  Tikai glabājamās vienības (GV rindas).

imports_tikai_dokumenti.csv Tikai dokumenti jau esošām vienībām
                            (DOK rindas ar SAITE = "GV:<numurs>").


Struktūra īsumā
---------------

Viena tabula, kurā katrai rindai kolonnā TIPS ir norādīts, kas tā ir:

    GV  = glabājamā vienība
    DOK = dokuments

Kolonna SAITE saista dokumentu ar tā glabājamo vienību:

    tukšs    dokuments pieder tuvākajai augstāk esošajai GV rindai
    A / B    dokuments pieder tai jaunajai GV rindai, kurai SAITE ir "A"
    GV:12    dokuments pieder jau esošai vienībai ar GV numuru 12

Kolonnu secība nav svarīga - svarīgi ir virsraksti pirmajā rindā.
Neatpazītas kolonnas tiek ignorētas.

GV numurus piešķir sistēma pati, faila secībā - failā GV numura kolonnas
nav. Datnes (failus) imports nepievieno, tikai aprakstus.

DOK rindas var lietot tikai tekstuālos elektroniskos uzskaites sarakstos.


Ja garumzīmes izskatās sabojātas
--------------------------------

Saglabājot no Excel, jāizvēlas "CSV UTF-8 (Comma delimited)", nevis parasto
"CSV". Parastais CSV latviešu Windows vidē tiek saglabāts citā kodējumā, un
garumzīmes var tikt sabojātas.


Failu atjaunošana
-----------------

Šie faili ir ģenerēti ar tools/make_import_examples.py (repozitorija saknē).
Ja mainās importa formāts, jāmaina skripts un faili jāģenerē no jauna, nevis
jālabo ar roku - tā formāts un paraugi paliek saskaņoti.

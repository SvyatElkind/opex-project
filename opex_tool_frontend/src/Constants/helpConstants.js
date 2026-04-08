/* ==========================================
   HELP SECTION CONSTANTS
   All help content organized by chapters and sections
   Easy to update without touching React components
   ========================================== */

export const HELP_CHAPTERS = [
    {
        id: 'getting-started',
        title: 'Darba Sākšana',
        sections: [
            {
                id: 'introduction',
                title: 'Ievads',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Laipni lūdzam OPEX struktūras un metadatu sagataves rīkā. Šis rīks ir izstrādāts, lai palīdzētu izveidot un pārvaldīt digitālās arhīva struktūras atbilstoši OPEX standartam.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Šajā palīdzības sadaļā jūs atradīsiet informāciju par visām galvenajām funkcijām un to izmantošanu.'
                    },
                    {
                        type: 'color-palette',
                        label: 'Lietotnes krāsu palete',
                        colors: [
                            { name: 'Primārā', var: '--color-primary' },
                            { name: 'Sekundārā', var: '--color-secondary' },
                            { name: 'Terciārā', var: '--color-tertiary' },
                            { name: 'Kļūda', var: '--color-error' },
                            { name: 'Brīdinājums', var: '--color-warning' },
                            { name: 'Informācija', var: '--color-info' },
                            { name: 'Veiksmīgi', var: '--color-success' },
                            { name: 'Fons', var: '--color-background' }
                        ]
                    },
                    {
                        type: 'ui-example',
                        label: 'Pogu piemēri',
                        elements: [
                            { html: '<button class="btn-action" style="pointer-events:none">Darbības poga</button>', caption: 'btn-action' },
                            { html: '<button class="btn-error" style="pointer-events:none">Kļūdas poga</button>', caption: 'btn-error' },
                            { html: '<button class="btn-warning" style="pointer-events:none">Brīdinājuma poga</button>', caption: 'btn-warning' },
                            { html: '<button class="btn-secondary" style="pointer-events:none">Sekundārā poga</button>', caption: 'btn-secondary' }
                        ],
                        description: 'Šīs pogas tiek izmantotas visā lietotnē dažādām darbībām. Krāsas pielāgojas tumšajā režīmā.'
                    }
                ]
            },
            {
                id: 'first-launch',
                title: 'Pirmā Palaišana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Programmai sākoties, tiek atvērta galvenā lapa. Tās priekšā uzritinošais logs prasa lietotājam izveidot jaunu projektu.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Šis ir pirmais solis dokumentu sagatavošanai. Bez projekta nav iespējams turpināt darbu ar programmu.'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Uz galvenās lapas lietotājam ir iespēja:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Izveidot Projektu - atveras dialoga forma projekta izveidošanai',
                            'Palīdzības sadaļa (?) - atveras palīdzība citā logā'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/create-project.png',
                        alt: 'Projekta izveides dialogs',
                        caption: 'Projekta izveides dialogs pirmajā palaišanā'
                    }
                ]
            },
            {
                id: 'help-button',
                title: 'Palīdzības Poga',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Labajā augšējā stūrī atrodas "Palīdzības Poga", kas norādīta ar (?) simbolu.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lietotājam nospiežot šo pogu, atveras jaunā logā pilna palīdzības dokumentācija ar visām sadaļām un instrukcijām.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Palīdzības poga ir pieejama vienmēr, neatkarīgi no tā, kur lietotājs atrodas programmā. Jūs varat atvērt palīdzību jebkurā brīdī.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'system-requirements',
                title: 'Sistēmas Prasības',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Lai lietotu šo rīku, jums nepieciešams:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Mūsdienīgs tīmekļa pārlūks (Chrome, Firefox, Edge)',
                            'Aktīvs interneta savienojums',
                            'Pietiekama vieta diskā projektiem',
                            'Piekļuve lokālajam diskam (C:, D:, utt.) projekta direktorijas izveidei'
                        ]
                    }
                ]
            }
        ]
    },
    { 
        id: 'help-to',
        title: 'Aprakstīšanas Process',
        sections : [
            {
                id: 'textual',
                title: 'kā aprakstīt tekstuālos dokumentus',
                content : [
                    {
                        type: 'paragraph',
                        text: 'Tekstuālo dokumentu aprakstīšana ir galvenā darbība dokumentālo arhīva materiālu digitalizācijai. Šeit ir soļi, kā aprakstīt tekstuālos dokumentus:'
                    },
                    {
                        type: 'steps',
                        steps: [
                            'Izveidojiet uzskaites sarakstu ar tipu "Tekstuāls" un atzīmējiet "Elektronisks" ja dokumenti ir digitālā formā',
                            'Izveidojiet glabājamo vienību (GV) ar nosaukumu, datumiem un valodu',
                            'Pievienojiet dokumenta ierakstu ar nosaukumu, datumu, reģistrācijas numuru',
                            'Ja elektronisks — augšupielādējiet failu(s) katram ierakstam',
                            'Pievienojiet papildu metadatus (darbības, adresāti, vīzas) ja nepieciešams',
                            'Pārbaudiet vienību verifikācijas skatā un izlabojiet kļūdas'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Katram tekstuālam elektroniskam dokumentam jāpievieno vismaz viens fails. Fiziskiem dokumentiem faili nav nepieciešami.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'workflow',
                title: 'Pilna Darba Plūsma',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Šeit ir pilns darba process no projekta izveides līdz OPEX dokumentu iesniegšanai. Sekojiet šiem soļiem, lai veiksmīgi pabeigtu projektu.'
                    },
                    {
                        type: 'heading',
                        text: '10 Soļu Process'
                    },
                    {
                        type: 'paragraph',
                        text: '1. Izveidot Projektu'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz "Izveidot Projektu"',
                            'Ievadiet projekta nosaukumu (max 20 rakstzīmes, tikai burti, cipari, - un _)',
                            'Norādiet projekta direktoriju (pilns ceļš)',
                            'Pārbaudiet, ka datu glabāšanas vieta ir droša un pieejama',
                            'Noklikšķiniet "Izveidot"'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '2. Augšupielādēt VVAIS Atskaiti'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet tikko izveidoto projektu',
                            'Noklikšķiniet uz "Augšupielādēt VVAIS Atskaiti"',
                            'Izvēlieties .xlsx failu no VVAIS sistēmas',
                            'Sagaidiet, kamēr sistēma apstrādā atskaiti',
                            'Pārliecinieties, ka fonda un uzskaites sarakstu dati ir importēti'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '3. Pievienot Iestādes Parakstītājus'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz "Iestādes Parakstītāji" ikonas',
                            'Ievadiet izveidotāja vārdu, uzvārdu un amatu',
                            'Ievadiet parakstītāja vārdu, uzvārdu un amatu',
                            'Saglabājiet informāciju'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '4. Pārskatīt un Papildināt Inventārus'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pārskatiet importētos uzskaites sarakstus',
                            'Izveidojiet jaunus uzskaites sarakstus, ja nepieciešams',
                            'Pārbaudiet, vai uzskaites sarakstu veidi (Foto, Video, Skaņas, Tekstuāls) ir pareizi',
                            'Atzīmējiet vai norādiet, vai uzskaites saraksts ir elektronisks vai fizisks',
                            'Izmantojiet "zvaigznes" (favorīti), lai atzīmētu svarīgus sarakstus'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '5. Pievienot/Rediģēt Glabājamās Vienības'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet uzskaites sarakstu',
                            'Pārskatiet esošās glabājamās vienības (ja tās importētas)',
                            'Izveidojiet jaunas glabājamās vienības, ja nepieciešams',
                            'Aizpildiet obligātos laukus: GV numurs, nosaukums, datums',
                            'Pievienojiet papildu informāciju: valoda, piezīmes, ierobežota pieejamība',
                            'Izmantojiet kolonnu pielāgošanu, lai redzētu vajadzīgo informāciju'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '6. Pievienot Ierakstus un Failus'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet glabājamo vienību',
                            'Izveidojiet ierakstu (dokumentu ierakstu)',
                            'Aizpildiet ieraksta metadatus: nosaukums, reģ. numurs, datums, valoda',
                            'Pievienojiet Darbības, Adresātus, Vizas (ja tekstuāls dokuments)',
                            'Augšupielādējiet failus (obligāti elektroniskiem sarakstiem)',
                            'Pārbaudiet, ka faila formāts un izmērs atbilst prasībām (max 50MB)'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '7. Pārbaudīt Projektu (Validācija)'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz "Pārbaudīt Projektu" pogas',
                            'Pārskatiet validācijas koku',
                            'Pārbaudiet statistikas joslu: uzskaites saraksti, vienības, ieraksti, faili',
                            'Atzīmējiet sarkanos mezglus (kritiski kļūdas)',
                            'Pārskatiet dzeltenos mezglus (brīdinājumi)'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '8. Izlabot Kļūdas'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz sarkanā/dzeltena mezgla validācijas kokā',
                            'Lasiet kļūdas ziņojumu un ieteikumus',
                            'Navigācijiet uz problēmu vietu (noklikšķinot uz mezgla)',
                            'Izlabojiet kļūdu (aizpildiet tukšos laukus, pievienojiet trūkstošos failus)',
                            'Atgriezieties pie validācijas un pārbaudiet vēlreiz',
                            'Atkārtojiet, līdz visi mezgli ir zaļi'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '9. Eksportēt OPEX Dokumentus'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pārliecinieties, ka projekts ir validēts (zaļa atzīme "Gatavs OPEX")',
                            'Izvēlieties fizisko/elektronisko režīmu (atkarībā no nepieciešamības)',
                            'Noklikšķiniet "Eksportēt US" (Uzskaites Saraksts)',
                            'Noklikšķiniet "Eksportēt PN" (Pieņemšanas-Nodošanas akts)',
                            'Sagaidiet, kamēr faili tiek ģenerēti',
                            'Pārbaudiet lejupielādētos failus'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '10. Iesniegt'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pārbaudiet ģenerētos XLSX un citus OPEX failus',
                            'Iesniedziet failus atbilstoši arhīva prasībām',
                            'Saglabājiet projektu sistēmā turpmākai atsaucei',
                            'Izveidojiet dublējuma kopiju, ja nepieciešams'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Visa darba plūsma var aizņemt no dažām stundām līdz vairākām dienām atkarībā no projekta apjoma. Regulāri saglabājiet izmaiņas un pārbaudiet projektu, lai savlaicīgi atklātu kļūdas.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'best-practices',
                title: 'Labākā Prakse',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Ievērojot šos ieteikumus, jūs varat strādāt efektīvāk un izvairīties no izplatītākajām kļūdām.'
                    },
                    {
                        type: 'heading',
                        text: 'Vispārēji Ieteikumi'
                    },
                    {
                        type: 'list',
                        items: [
                            'Regulāri saglabājiet izmaiņas - Lai arī sistēma saglabā automātiski, nepaļaujieties tikai uz to',
                            'Izveidojiet dublējuma kopijas - Pirms lielu izmaiņu veikšanas, dublējiet projekta failus',
                            'Strādājiet sistemātiski - Nepārleciet no viena soļa uz citu, sekojiet darba plūsmai',
                            'Pārbaudiet projektu bieži - Neuzskrējiet kļūdas līdz beigām, pārbaudiet katru līmeni',
                            'Lasiet kļūdu ziņojumus uzmanīgi - Sistēma sniedz konkrētus ieteikumus, kā izlabot problēmas'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Uzskaites Sarakstu Izveidē'
                    },
                    {
                        type: 'list',
                        items: [
                            'Izmantojiet izlases (zvaigznes) svarīgiem inventāriem - Tā tos būs vieglāk atrast',
                            'Izvēlieties pareizo veidu (Foto/Video/Skaņas/Tekstuāls) - No tā atkarīgs, cik ierakstus var pievienot',
                            'Pareizi atzīmējiet elektronisko/fizisko statusu - Tas ietekmē failu augšupielādes prasības',
                            'Pārbaudiet datumu diapazonus - Sākuma datumam jābūt pirms beigu datuma'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Glabājamo Vienību Pārvaldībā'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pildiet laukus konsekvent - Izmantojiet vienādus datumus formātus, vienādu rakstību',
                            'Izmantojiet kolonnu pielāgošanu - Slēpjiet kolonnas, kuras neizmantojat',
                            'Pārbaudiet numurāciju - GV numuriem jābūt unikāliem un secīgiem',
                            'Pievienojiet piezīmes - Tās palīdzēs vēlāk atcerēties, kas ir glabājamā vienība',
                            'Izmantojiet pakešu dzēšanu uzmanīgi - Tā ir neatgriezeniska darbība!'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Ierakstu un Failu Darbā'
                    },
                    {
                        type: 'list',
                        items: [
                            'Augšupielādējiet failus uzreiz - Neuzskrējiet failu augšupielādi līdz beigām',
                            'Pārbaudiet faila izmēru - Maksimums 50MB, lielākus failus saspiežiet vai sadaliet',
                            'Izmantojiet pareizos formātus - Pārbaudiet, ka faila formāts atbilst uzskaites saraksta veidam',
                            'Aizpildiet visus metadatus - Jo vairāk informācijas, jo labāk',
                            'Pārbaudiet, vai fails ir augšupielādēts - Pirms saglabāšanas pārliecinieties, ka redzat faila nosaukumu'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Validācijas un Eksportēšanas Laikā'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pārbaudiet projektu pirms lielu izmaiņu veikšanas - Lai zinātu, kur esat',
                            'Izlabojiet VISAS sarkanās kļūdas - Bez tam nevarēsiet eksportēt',
                            'Pievērsiet uzmanību brīdinājumiem - Tie var būt svarīgi',
                            'Izvēlieties pareizo fizisko/elektronisko režīmu pirms eksportēšanas - Tas ietekmē, kas tiek eksportēts',
                            'Pārbaudiet eksportētos failus pirms iesniegšanas - Atveriet un pārbaudiet, vai viss ir pareizi'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Veiktspējas Uzlabošanai'
                    },
                    {
                        type: 'list',
                        items: [
                            'Slēpjiet nevajadzīgās kolonnas - Tā tabulas ielādēsies ātrāk',
                            'Izmantojiet filtrus un meklēšanu - Neritiniet visus ierakstus manuāli',
                            'Strādājiet pa daļām - Necentieties visu izdarīt vienā reizē',
                            'Lietojiet pakešu operācijas lielām izmaiņām - Dzēšot daudzas vienības, izmantojiet pakešu dzēšanu',
                            'Aizvēriet lieku logus un cilnes - Lai sistēma darbotos ātrāk'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja rodas problēmas, vispirms mēģiniet pārlādēt lapu (F5). Ja problēma atkārtojas, pārbaudiet interneta savienojumu un brīvo vietu diskā. Ja neko nepalīdz, sazinieties ar atbalstu.'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'projects',
        title: 'Projektu Pārvaldība',
        sections: [
            {
                id: 'create-project-form',
                title: 'Projekta Izveides Forma',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Projekta izveides dialogā lietotājam ir vairākas izvēles:'
                    },
                    {
                        type: 'heading',
                        text: 'Formas Elementi'
                    },
                    {
                        type: 'list',
                        items: [
                            'Palīdzības Poga (?) - Labajā augšējā stūrī. Nospiežot šo pogu, atveras palīdzība jaunā logā',
                            'Atcelt - Atcelšana aizver dialogu un atgriež uz sākumlapu',
                            'Izveidot - Posmē formu un izveido projektu, ja visi lauki ir pareizi aizpildīti'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Formas Lauki (Visi Obligāti)'
                    },
                    {
                        type: 'paragraph',
                        text: '1. Projekta Nosaukums:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Maksimālais simbolu skaits: 20',
                            'Atļautie simboli: burti, cipari, apakšsvītras (_) un domuzīmes (-)',
                            'Nedrīkst būt tukšs'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Piemērs: "Projekts_2024", "Arhivs-01", "Dokumenti2024"'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '2. Projekta Direktorija (Pilns Ceļš):'
                    },
                    {
                        type: 'list',
                        items: [
                            'Jānorāda pilns ceļš līdz mapei',
                            'Mape nevar atrasties ārpusējā nesējā (USB, tīkla disks)',
                            'Ieteicams izvēlēties direktoriju, kas atrodas diskā sekli (ne pārāk dziļi)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'PAREIZI: C:\\DOKUMENTI\\PROJEKTI'
                            },
                            {
                                type: 'paragraph',
                                text: 'NEPAREIZI: C:\\DOKUMENTI\\PROJEKTI\\VELVIENAMAPE\\UNVELVIENA\\VELVIENA\\...\\PROJEKTAMAPE (pārāk dziļa struktūra)'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Šajā mapē tiks ģenerēti:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Uzskaites saraksti',
                            'Pieņemšanas nodošanas akti',
                            'OPEX struktūra',
                            'Failu kopijas ar identifikatoriem'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Šo mapi novietojiet lietotājam zināmā vietā. Ja mape tiek izdzēsta vai pārvietota, programma uzskatīs, ka mape neeksistē un projekts būs jāveido par jaunu!'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Formas Validācija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Nospiežot "Izveidot", tiek pārbaudīts:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Vai visi lauki ir aizpildīti',
                            'Vai projekta nosaukums atbilst prasībām',
                            'Vai direktorija eksistē un ir pieejama',
                            'Vai lietotājam ir piekļuves tiesības šai direktorijai'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/create-project.png',
                        alt: 'Projekta izveides forma',
                        caption: 'Projekta izveides forma ar aizpildītiem laukiem'
                    }
                ]
            },
            {
                id: 'project-created',
                title: 'Pēc Projekta Izveides',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Kad pirmais projekts ir veiksmīgi izveidots:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Tiek izveidota projekta cilne augšējā daļā',
                            'Atveras jauns skats ar projekta detaļām',
                            'Šajā logā atradīsies visa informācija par projektu',
                            'Turpmākās darbības notiks šajā skatā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Pēc projekta izveides automātiski atveras dialogs VVAIS atskaites augšupielādei (ja projektam vēl nav atskaites).'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'project-main-page',
                title: 'Projekta Galvenā Lapa',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Projekta galvenajā lapā (kad nav atskaites) lietotājam ir iespēja:'
                    },
                    {
                        type: 'heading',
                        text: 'Pieejamās Darbības'
                    },
                    {
                        type: 'list',
                        items: [
                            '1) Pārdēvēt projektu - izvēlētajā projekta cilnē',
                            '2) Dzēst projektu - izvēlētajā projekta cilnē',
                            '3) Nokopēt projekta direktoriju - ar peles kreiso pogu uz projekta',
                            '4) Izveidot jaunu projektu - spiežot [+] pogu, kas atrodas blakus cilnei(-ēm)',
                            '5) Pievienot atskaiti - galvenā lapa piedāvā augšupielādēt VVAIS atskaiti',
                            '6) Atvērt palīdzību - ar (?) pogu labajā augšējā stūrī'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Projekta Informācija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ar peli uzbraucot virsu projekta cilnei, labajā apakšējā stūrī parādās:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Projekta izveidošanas datums',
                            'Projekta atrašanās vieta diskā (pilns ceļš)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Šī informācija palīdz atcerēties, kad projekts tika izveidots un kur tas atrodas.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'upload-vvais-report',
                title: 'VVAIS Atskaites Augšupielāde',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Ielādējoties jaunajam projektam vai projektam, kuram nav atskaites, atveras dialogs "Augšuplādēt VVAIS Atskaiti".'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Pievienot Atskaiti'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lietotājs var pievienot atskaiti divos veidos:'
                    },
                    {
                        type: 'list',
                        items: [
                            '1) Ievietot atskaiti, velkot to (drag & drop) uz norādīto teritoriju dialogā',
                            '2) Nospiest uz teritorijas un izvēlēties atskaites failu pārlūkā'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Pēc Atskaites Pievienošanas'
                    },
                    {
                        type: 'paragraph',
                        text: 'Kad atskaite ir pievienota:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Parādās pievienotā faila nosaukums',
                            'Ir iespēja to noņemt ar "Noņemt" pogu',
                            'Ir iespēja to augšupielādēt ar "Augšupielādēt" pogu'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'VVAIS atskaite ir Excel fails, kas satur strukturētu informāciju par fonda uzskaites sarakstiem.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Pēc Veiksmīgas Augšupielādes'
                    },
                    {
                        type: 'paragraph',
                        text: 'Kad atskaite ir veiksmīgi augšupielādēta:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Tukšais logs piepildās ar informāciju no atskaites',
                            'Tiek automātiski izveidoti uzskaites saraksti',
                            'Lietotājs var sākt darbu ar glabājamām vienībām un ierakstiem',
                            'Projekta struktūra kļūst pilnībā funkcionāla'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Pārliecinieties, ka augšupielādējat pareizo VVAIS atskaiti. Pēc augšupielādes dati tiks automātiski importēti un izveidoti uzskaites saraksti.'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/upload-report.png',
                        alt: 'VVAIS atskaites augšupielāde',
                        caption: 'Dialogs VVAIS atskaites augšupielādei'
                    }
                ]
            },
            {
                id: 'institution-signers',
                title: 'Institūcijas Parakstītāji',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Kad atskaite ir veiksmīgi pievienota un dati ir veiksmīgi ielādēti, ir iespējams pievienot parakstītājus projektam.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Parakstītāji ir nepieciešami, lai norādītu personas, kas ir atbildīgas par dokumentu sagatavošanu un apstiprināšanu. Šī informācija tiks izmantota ģenerētos dokumentos un OPEX struktūrā.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kā Piekļūt Parakstītāju Formai'
                    },
                    {
                        type: 'paragraph',
                        text: 'Parakstītāju poga atrodas labajā pusē, pretī projekta cilnēm, ar nosaukumu "Parakstītāji".'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lietotājam nospiežot šo pogu, atveras dialogs "Institūcijas Parakstītāji".'
                    },
                    {
                        type: 'heading',
                        text: 'Dialoga Elementi un Funkcijas'
                    },
                    {
                        type: 'paragraph',
                        text: 'Dialoga logā lietotājam ir pieejamas šādas opcijas:'
                    },
                    {
                        type: 'list',
                        items: [
                            '1) Palīdzības poga (?) - Atvērt palīdzību jaunā logā',
                            '2) Aizvēršanas poga (X) - Augšējā labajā stūrī, aizvērt dialogu formu bez saglabāšanas',
                            '3) Formas aizpildīšana - Ievadīt izveidotāja un parakstītāja informāciju',
                            '4) Saglabāt - Saglabāt ievadītos datus',
                            '5) Atcelt - Atcelt datu aizpildi un aizvērt dialogu'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Formas Struktūra'
                    },
                    {
                        type: 'paragraph',
                        text: 'Forma sastāv no divām galvenajām sadaļām:'
                    },
                    {
                        type: 'heading',
                        text: '1. Izveidotāja Sadaļa'
                    },
                    {
                        type: 'paragraph',
                        text: 'Izveidotājs ir persona, kas izveido un sagatavo dokumentus. Šajā sadaļā ir divi obligāti ievades lauki:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Vārds, Uzvārds - Izveidotāja pilns vārds un uzvārds',
                            'Amats - Izveidotāja amats institūcijā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Piemērs: Vārds, Uzvārds: "Jānis Bērziņš", Amats: "Arhivārs"'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: '2. Parakstītāja (Sagatavotāja) Sadaļa'
                    },
                    {
                        type: 'paragraph',
                        text: 'Parakstītājs (sagatavotājs) ir persona, kas apstiprina un paraksta dokumentus. Šajā sadaļā ir divi obligāti ievades lauki:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Vārds, Uzvārds - Parakstītāja (sagatavotāja) pilns vārds un uzvārds',
                            'Amats - Parakstītāja (sagatavotāja) amats institūcijā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Piemērs: Vārds, Uzvārds: "Anna Kalniņa", Amats: "Arhīva vadītāja"'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Datu Saglabāšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Pēc visu lauku aizpildīšanas:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Labajā apakšējā stūrī atrodas poga "Saglabāt"',
                            'Noklikšķinot uz "Saglabāt", ievadītie dati tiek saglabāti projektam',
                            'Dialogs tiek aizvērts automātiski pēc veiksmīgas saglabāšanas',
                            'Saglabātā informācija tiks izmantota visos projektam ģenerētajos dokumentos'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Datu Atcelšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja vēlaties atcelt datu ievadi bez saglabāšanas:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz pogas "Atcelt" dialoga apakšējā daļā',
                            'Visi ievadītie, bet nesaglabātie dati tiks zaudēti',
                            'Dialogs tiks aizvērts',
                            'Iepriekš saglabātie dati (ja tādi ir) paliks nemainīti'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Parakstītāju informācija ir nepieciešama, lai ģenerētu pieņemšanas nodošanas aktus un citus oficiālos dokumentus. Pārliecinieties, ka ievadāt pareizus datus!'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Parakstītāju Rediģēšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Jūs varat jebkurā laikā mainīt parakstītāju informāciju:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz pogas "Parakstītāji"',
                            'Atvērsies forma ar jau saglabātajiem datiem',
                            'Mainiet nepieciešamos laukus',
                            'Noklikšķiniet "Saglabāt", lai saglabātu izmaiņas'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Izmaiņas parakstītāju informācijā ietekmēs tikai turpmāk ģenerētos dokumentus. Jau izveidotie dokumenti netiks automātiski atjaunināti.'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/institution-signers.png',
                        alt: 'Institūcijas parakstītāju forma',
                        caption: 'Institūcijas parakstītāju ievades forma'
                    }
                ]
            },
            {
                id: 'create-new-project',
                title: 'Jauna Projekta Izveidošana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Jūs varat izveidot vairākus projektus un strādāt ar tiem vienlaicīgi.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai izveidotu jaunu projektu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz [+] pogas, kas atrodas blakus projekta cilnēm',
                            'Atveras projekta izveides dialogs',
                            'Aizpildiet formu tāpat kā pirmajam projektam',
                            'Noklikšķiniet "Izveidot"'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Katram projektam būs sava cilne, un jūs varat ātri pārslēgties starp projektiem, noklikšķinot uz attiecīgās cilnes.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'manage-project',
                title: 'Projekta Darbības un Pārvaldība',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Katram projektam ir pieejamas vairākas pārvaldības funkcijas.'
                    },
                    {
                        type: 'heading',
                        text: 'Projekta Pārdēvēšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai pārdēvētu projektu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz projekta cilnes ar labo peles pogu',
                            'Izvēlieties "Pārdēvēt"',
                            'Ievadiet jaunu nosaukumu',
                            'Apstipriniet izmaiņas'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Projekta Direktorijas Kopēšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai nokopētu projekta direktorijas ceļu starpliktuvē:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz projekta ar kreiso peles pogu',
                            'Ceļš tiek automātiski nokopēts',
                            'Varat ielīmēt to failpārvaldniekā vai citā vietā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Šī funkcija ir noderīga, lai ātri piekļūtu projekta failiem ārpus programmas.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'delete-project',
                title: 'Projekta Dzēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Projektu var dzēst, ja tas vairs nav nepieciešams.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai dzēstu projektu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz projekta cilnes ar labo peles pogu',
                            'Izvēlieties "Dzēst"',
                            'Apstipriniet dzēšanu dialoga logā',
                            'Projekts tiks neatgriezeniski dzēsts'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'UZMANĪBU: Dzēšot projektu, tiek dzēsts:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Projekta ieraksts datubāzē',
                                    'Visi ar projektu saistītie uzskaites saraksti',
                                    'Visas glabājamās vienības',
                                    'Visi ieraksti',
                                    'Visi augšupielādētie faili projekta direktorijā'
                                ]
                            },
                            {
                                type: 'paragraph',
                                text: 'ŠĪ DARBĪBA NAV ATGRIEŽAMA!'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'inventories',
        title: 'Uzskaites Saraksti',
        sections: [
            {
                id: 'inventory-introduction',
                title: 'Kas ir Uzskaites Saraksts?',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Uzskaites saraksts (US) ir galvenā organizācijas vienība projektā, kas grupē glabājamās vienības pēc to tipa.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Katram uzskaites sarakstam ir:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Unikāls numurs (automātiski piešķirts)',
                            'Veids (Foto, Video, Skaņas vai Tekstuāls)',
                            'Tips (Elektronisks vai Fizisks)',
                            'Datumu diapazons',
                            'Glabāšanas termiņš'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Uzskaites saraksti tiek izveidoti PĒDĒJIE automātiski, kad augšupielādējat VVAIS atskaiti, vai varat tos izveidot manuāli.'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-overview.png',
                        alt: 'Uzskaites saraksta pārskats',
                        caption: 'Uzskaites saraksta kartīte projekta skatā'
                    }
                ]
            },
            {
                id: 'create-inventory',
                title: 'Uzskaites Saraksta Izveide',
                content: [
                    {
                        type: 'heading',
                        text: 'Kā Izveidot Jaunu Uzskaites Sarakstu'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai izveidotu jaunu uzskaites sarakstu manuāli:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet projektu, kuram vēlaties pievienot uzskaites sarakstu',
                            'Noklikšķiniet uz pogas "Izveidot Jaunu Uzskaites Sarakstu"',
                            'Atvērsies izveides dialogs ar formu'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-create-button.png',
                        alt: 'Uzskaites saraksta izveides poga',
                        caption: 'Poga jauna uzskaites saraksta izveidei'
                    },
                    {
                        type: 'heading',
                        text: 'Izveides Formas Lauki'
                    },
                    {
                        type: 'paragraph',
                        text: 'Formā jums jāaizpilda šādi lauki:'
                    },
                    {
                        type: 'heading',
                        text: '1. Veids (Obligāts)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Izvēlieties uzskaites saraksta veidu no dropdown izvēlnes:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Foto - Fotoattēlu glabāšanai',
                            'Video - Video materiālu glabāšanai',
                            'Skaņas - Audio ierakstu glabāšanai',
                            'Tekstuāls - Dokumentu glabāšanai'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Veids nosaka, kāda veida failus varēsiet augšupielādēt un cik ierakstus var būt vienai glabājamai vienībai.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: '2. Elektronisks (Checkbox)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Atzīmējiet, vai uzskaites saraksts ir elektronisks:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atzīmēts (✓) = Elektronisks - varēsiet augšupielādēt digitālos failus',
                            'Neatzīmēts = Fizisks - aprakstīsiet tikai fiziskos objektus (bez failu augšupielādes)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Piemēram, fizisku uzskaites sarakstu var izmantot, lai aprakstītu kasetes, disketes vai papīra dokumentus, nefotografējot tos.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: '3. Apakšfonds (Izvēles)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja jūsu uzskaites saraksts pieder apakšfondam:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atzīmējiet checkbox "Apakšfonds"',
                            'Parādīsies ciparu ievades lauks',
                            'Ievadiet apakšfonda numuru (pozitīvs skaitlis)'
                        ]
                    },
                    {
                        type: 'heading',
                        text: '4. Sākuma un Beigu Datums (Obligāti)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Norādiet uzskaites saraksta datumu diapazonu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz "Sākuma datums" lauka',
                            'Izvēlieties gadu, mēnesi un dienu',
                            'Noklikšķiniet uz "Beigu datums" lauka',
                            'Izvēlieties gadu, mēnesi un dienu'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Sākuma datumam jābūt pirms vai vienādam ar beigu datumu!'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: '5. Glabāšanas Termiņš (Obligāts)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Izvēlieties glabāšanas termiņu no dropdown izvēlnes:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pastāvīgi glabājamās lietas',
                            'Ilgstoši glabājamās lietas'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-create-form.png',
                        alt: 'Uzskaites saraksta izveides forma',
                        caption: 'Aizpildīta izveides forma ar visiem laukiem'
                    },
                    {
                        type: 'heading',
                        text: 'Formas Iesniegšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Pēc visu lauku aizpildīšanas:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz pogas "Izveidot uzskaites sarakstu"',
                            'Sistēma pārbaudīs, vai visi lauki ir pareizi aizpildīti',
                            'Ja viss ir kārtībā, uzskaites saraksts tiks izveidots',
                            'Dialogs aizvērsies automātiski',
                            'Jaunais uzskaites saraksts parādīsies projekta skatā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Uzskaites saraksta numurs tiek piešķirts automātiski - jums nav jāuztraucas par numurāciju!'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja vēlaties atcelt izveidi, noklikšķiniet uz pogas "Atcelt" - dialogs aizvērsies bez saglabāšanas.'
                    }
                ]
            },
            {
                id: 'inventory-types',
                title: 'Uzskaites Sarakstu Veidi',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Sistēma atbalsta četrus uzskaites sarakstu veidus. Katram veidam ir savi īpaši noteikumi par to, kādus failus var augšupielādēt.'
                    },
                    {
                        type: 'heading',
                        text: 'Foto Uzskaites Saraksts'
                    },
                    {
                        type: 'paragraph',
                        text: 'Paredzēts fotoattēlu glabāšanai.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atļautie faila formāti: JPG, JPEG, PNG, GIF, BMP, TIFF',
                            'Vienai glabājamai vienībai - VIENS ieraksts (foto)',
                            'Maksimālais faila izmērs: 50MB'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Video Uzskaites Saraksts'
                    },
                    {
                        type: 'paragraph',
                        text: 'Paredzēts video materiālu glabāšanai.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atļautie faila formāti: MP4, AVI, MOV, WMV, MKV, FLV',
                            'Vienai glabājamai vienībai - VIENS ieraksts (video)',
                            'Maksimālais faila izmērs: 50MB'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Skaņas Uzskaites Saraksts'
                    },
                    {
                        type: 'paragraph',
                        text: 'Paredzēts audio ierakstu glabāšanai.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atļautie faila formāti: MP3, WAV, AAC, OGG, M4A, FLAC',
                            'Vienai glabājamai vienībai - VIENS ieraksts (audio)',
                            'Maksimālais faila izmērs: 50MB'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Tekstuāls Uzskaites Saraksts'
                    },
                    {
                        type: 'paragraph',
                        text: 'Paredzēts dokumentu glabāšanai. ⭐ ĪPAŠS NOTEIKUMS!'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atļautie faila formāti: PDF, DOC, DOCX, JPG, JPEG, PNG, TIF, TIFF',
                            'Vienai glabājamai vienībai - VAIRĀKI ieraksti (dokumenti)',
                            'Maksimālais faila izmērs: 50MB (katram)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Tekstuāls veids ir VIENĪGAIS, kas ļauj pievienot vairākus ierakstus vienai glabājamai vienībai. Tas ir noderīgi, piemēram, kad lietā ir vairāki dokumenti.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Elektronisks vai Fizisks?'
                    },
                    {
                        type: 'paragraph',
                        text: 'Izveidojot uzskaites sarakstu, jums jāizvēlas vai tas ir elektronisks vai fizisks:'
                    },
                    {
                        type: 'list',
                        items: [
                            'ELEKTRONISKS - Glabā digitālos failus. Failu augšupielāde OBLIGĀTA.',
                            'FIZISKS - Apraksta fiziskos objektus (kasetes, disketes, papīrus). Failu augšupielāde NAV PIEEJAMA.'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Piemēram: ja jums ir VHS video kasete, veidojiet FIZISKU Video uzskaites sarakstu. Ja jums ir digitāls video fails, veidojiet ELEKTRONISKU Video uzskaites sarakstu.'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-types.png',
                        alt: 'Uzskaites sarakstu veidi',
                        caption: 'Četri uzskaites sarakstu veidi un to īpašības'
                    }
                ]
            },
            {
                id: 'edit-inventory',
                title: 'Uzskaites Saraksta Rediģēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Jūs varat rediģēt uzskaites sarakstu, lai mainītu tā īpašības.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Rediģēt Uzskaites Sarakstu'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet projektu',
                            'Atrodiet uzskaites sarakstu, ko vēlaties rediģēt',
                            'Noklikšķiniet uz pogas "Rediģēt" (zīmuļa ikona)',
                            'Atvērsies rediģēšanas dialogs'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-edit-button.png',
                        alt: 'Uzskaites saraksta rediģēšanas poga',
                        caption: 'Rediģēšanas poga uz uzskaites saraksta'
                    },
                    {
                        type: 'heading',
                        text: 'Ko Var Rediģēt?'
                    },
                    {
                        type: 'paragraph',
                        text: 'Atkarībā no situācijas, jums būs pieejami dažādi lauki:'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja uzskaites saraksts ir TUKŠS (bez glabājamām vienībām):'
                    },
                    {
                        type: 'list',
                        items: [
                            '✓ Veids (Foto, Video, Skaņas, Tekstuāls)',
                            '✓ Elektronisks/Fizisks',
                            '✓ Apakšfonds',
                            '✓ Sākuma un beigu datums',
                            '✓ Glabāšanas termiņš'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja uzskaites sarakstam ir GLABĀJAMĀS VIENĪBAS vai tas ir no VVAIS ATSKAITES:'
                    },
                    {
                        type: 'list',
                        items: [
                            '✓ Apakšfonds',
                            '✓ Sākuma un beigu datums',
                            '✓ Glabāšanas termiņš',
                            '✗ Veids (NEVAR mainīt)',
                            '✗ Elektronisks/Fizisks (NEVAR mainīt)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja rediģēšana ir ierobežota, jūs redzēsiet ziņojumu formā, kas paskaidro kāpēc daži lauki nav rediģējami.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Svarīgs Datumu Noteikums'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja uzskaites sarakstam ir glabājamās vienības, jums ir jāievēro šāds noteikums:'
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Uzskaites saraksta beigu datumam jābūt PĒCĀK vai VIENĀDAM ar VISĀM glabājamo vienību beigu datumiem!'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Piemēram: Ja jums ir glabājamā vienība ar beigu datumu 2024-11-20, jūs NEVARAT mainīt uzskaites saraksta beigu datumu uz 2024-10-01, jo tas būtu pirms glabājamās vienības datuma.'
                    },
                    {
                        type: 'heading',
                        text: 'Izmaiņu Saglabāšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Pēc izmaiņu veikšanas:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz pogas "Saglabāt izmaiņas"',
                            'Sistēma pārbaudīs visas izmaiņas',
                            'Ja viss ir kārtībā, izmaiņas tiks saglabātas',
                            'Dialogs aizvērsies automātiski'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-edit-form.png',
                        alt: 'Uzskaites saraksta rediģēšanas forma',
                        caption: 'Rediģēšanas forma ar pieejamiem laukiem'
                    }
                ]
            },
            {
                id: 'delete-inventory',
                title: 'Uzskaites Saraksta Dzēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Jūs varat dzēst uzskaites sarakstu, ja tas vairs nav nepieciešams.'
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Uzskaites sarakstus, kas izveidoti no VVAIS atskaites, NEVAR dzēst! Dzēšanas poga nebūs redzama šādiem uzskaites sarakstiem.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kā Dzēst Uzskaites Sarakstu'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet projektu',
                            'Atrodiet uzskaites sarakstu, ko vēlaties dzēst',
                            'Noklikšķiniet uz pogas "Dzēst" (atkritnes ikona)',
                            'Atvērsies brīdinājuma dialogs'
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-delete-button.png',
                        alt: 'Uzskaites saraksta dzēšanas poga',
                        caption: 'Dzēšanas poga uz uzskaites saraksta'
                    },
                    {
                        type: 'heading',
                        text: 'Dzēšanas Apstiprināšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Kad noklikšķināt uz "Dzēst", parādīsies brīdinājuma dialogs ar svarīgu informāciju:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Uzskaites saraksta numurs',
                            'Glabājamo vienību skaits',
                            'Saraksts ar visu, kas tiks dzēsts'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai apstiprinātu dzēšanu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Izlasiet brīdinājumu rūpīgi',
                            'Noklikšķiniet uz pogas "Dzēst Uzskaites Sarakstu"',
                            'Sāksies 3 sekunžu atpakaļskaitīšana',
                            'Jūs redzēsiet skaitītāju: 3...2...1...',
                            'Pēc 3 sekundēm uzskaites saraksts tiks dzēsts automātiski'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Atpakaļskaitīšanas laikā jūs joprojām varat atcelt dzēšanu, noklikšķinot uz pogas "Apturēt".'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kas Tiek Dzēsts?'
                    },
                    {
                        type: 'paragraph',
                        text: 'Dzēšot uzskaites sarakstu, tiek NEATGRIEZENISKI dzēsts:'
                    },
                    {
                        type: 'list',
                        items: [
                            '❌ Pats uzskaites saraksts',
                            '❌ VISAS glabājamās vienības šajā uzskaites sarakstā',
                            '❌ VISI ieraksti visās glabājamās vienībās',
                            '❌ VISI augšupielādētie faili',
                            '❌ VISI metadati'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'BRĪDINĀJUMS: Šī darbība ir NEATGRIEZENISKA! Dzēstos datus NEVARĒS atgūt! Pārliecinieties, ka tiešām vēlaties dzēst šo uzskaites sarakstu pirms apstipriniet.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Pēc Dzēšanas'
                    },
                    {
                        type: 'paragraph',
                        text: 'Pēc veiksmīgas dzēšanas:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Dialogs aizvērsies automātiski',
                            'Uzskaites saraksts pazudīs no projekta',
                            'Pārējie uzskaites saraksti tiks automātiski pārnumurēti',
                            'Piemēram: ja dzēšat US #3, tad US #4 kļūst par #3, US #5 kļūst par #4, utt.'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Numurācija vienmēr paliek secīga - sistēma automātiski pārkārto numurus pēc dzēšanas.'
                            }
                        ]
                    },
                    {
                        type: 'image',
                        src: '/help-images/inventory-delete-dialog.png',
                        alt: 'Uzskaites saraksta dzēšanas dialogs',
                        caption: 'Dzēšanas brīdinājuma dialogs ar atpakaļskaitīšanu'
                    }
                ]
            }
        ]
    },
    {
        id: 'items',
        title: 'Glabājamās Vienības',
        sections: [
            {
                id: 'create-item',
                title: 'Glabājamās Vienības Izveide',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Glabājamās vienības (GV) tiek izveidotas uzskaites sarakstu ietvaros.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet uzskaites sarakstu',
                            'Noklikšķiniet uz "Izveidot Glabājamo Vienību"',
                            'Aizpildiet obligātos laukus (Numurs, Nosaukums)',
                            'Norādiet datumus',
                            'Pievienojiet piezīmes (ja nepieciešams)'
                        ]
                    }
                ]
            },
            {
                id: 'manage-item',
                title: 'Glabājamo Vienību Pārvaldība',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Katrai glabājamai vienībai var pievienot ierakstus - faktiskos failus un to metadatus.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Glabājamās vienības var labot vai dzēst.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Svarīgi noteikumi atkarībā no uzskaites saraksta tipa:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Foto, Video, Skaņas uzskaites sarakstiem - glabājamai vienībai var būt tikai VIENS ieraksts',
                                    'Tekstuāls uzskaites sarakstiem - glabājamai vienībai var būt VAIRĀKI ieraksti',
                                    'Metadati tiek pārmantoti no uzskaites saraksta un projekta līmeņa'
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'delete-item',
                title: 'Glabājamās Vienības Dzēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Glabājamo vienību var dzēst, ja tā vairs nav nepieciešama. Lai dzēstu glabājamo vienību:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet uzskaites sarakstu',
                            'Izvēlieties glabājamo vienību, kuru vēlaties dzēst',
                            'Noklikšķiniet uz dzēšanas pogas',
                            'Apstipriniet dzēšanu dialoga logā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Dzēšot glabājamo vienību, tiek dzēsts:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Glabājamās vienības ieraksts',
                                    'Visi ar to saistītie ieraksti',
                                    'Visi augšupielādētie faili'
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'batch-operations',
                title: 'Pakešu Operācijas',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Varat veikt darbības ar vairākām glabājamām vienībām vienlaikus, kas ietaupa laiku lieliem projektiem.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Izmantot Pakešu Dzēšanu'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet uzskaites sarakstu ar glabājamām vienībām',
                            'Izvēlieties vairākas vienības ar ķeksīšiem kreisajā pusē',
                            'Noklikšķiniet uz pogas "Dzēst izvēlētās" augšā',
                            'Apstipriniet dzēšanu dialoga logā',
                            'Sistēma dzēsīs visas izvēlētās vienības vienlaikus'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Pakešu dzēšana ir neatgriezeniska darbība! Pirms dzēšanas pārliecinieties, ka esat izvēlējies pareizās vienības.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Izvēles Skaitītājs'
                    },
                    {
                        type: 'paragraph',
                        text: 'Kad esat izvēlējies vienības, augšā parādās izvēles skaitītājs, kas rāda, cik vienības ir izvēlētas.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Skaitītājs: "Izvēlētas: X vienības"',
                            'Noklikšķinot uz X, atceļ visas izvēles',
                            'Var pievienot vai noņemt izvēles, skaitītājs atjaunosies'
                        ]
                    }
                ]
            },
            {
                id: 'column-customization',
                title: 'Kolonnu Pielāgošana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Glabājamo vienību saraksta skatā varat pielāgot, kuras kolonnas vēlaties redzēt. Tas ir noderīgi, lai koncentrētos uz svarīgāko informāciju.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Pielāgot Kolonnas'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet uzskaites sarakstu',
                            'Noklikšķiniet uz pogas "Kolonnas" (ikona ar kolonnām)',
                            'Atvērsies izvēlne ar visām pieejamajām kolonnām',
                            'Atzīmējiet vai noņemiet atzīmes kolonnām',
                            'Saraksta skats atjaunosies uzreiz'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Pieejamās Kolonnas'
                    },
                    {
                        type: 'list',
                        items: [
                            'GV numurs (vienmēr redzams, nevar paslēpt)',
                            'Sērijas kods',
                            'Nosaukums',
                            'Datums',
                            'Dokumentu skaits (ierakstu skaits)',
                            'Ierobežota pieejamība',
                            'Valoda',
                            'Piezīmes',
                            'Validācijas statuss (rāda, vai ir kļūdas)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Jūsu kolonnu izvēle tiek saglabāta lokāli jūsu pārlūkprogrammā. Katram uzskaites sarakstam var būt atšķirīga kolonnu konfigurācija.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'related-items',
                title: 'Saistītās Vienības',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Glabājamās vienības var būt savstarpēji saistītas, ja tās ir savā starpā loģiski saistītas (piemēram, dokumentu sērija, vairāku daļu lieta).'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Redzēt Saistītās Vienības'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet glabājamo vienību detalizētā skatā',
                            'Ritiniet uz leju līdz sadaļai "Saistītās Vienības"',
                            'Ja ir saistītās vienības, tās parādīsies sarakstā',
                            'Noklikšķiniet uz saites, lai pārietu uz saistīto vienību'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Saistību Īpašības'
                    },
                    {
                        type: 'list',
                        items: [
                            'Saistības ir divvirzienu - ja A ir saistīta ar B, tad B ir saistīta ar A',
                            'Saistītās vienības var būt no dažādiem uzskaites sarakstiem',
                            'Saistību skaits nav ierobežots',
                            'Saistības tiek dzēstas automātiski, ja viena no vienībām tiek dzēsta'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Saistības tiek izveidotas automātiski no VVAIS atskaites datu importa. Pašlaik nav iespējams manuāli izveidot jaunas saistības lietotāja saskarnē.'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'records',
        title: 'Ieraksti',
        sections: [
            {
                id: 'create-record',
                title: 'Ieraksta Izveide',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Ieraksti satur faktiskos failus un to metadatus.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ieraksta izveide atkarīga no uzskaites saraksta tipa:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Foto, Video, Skaņas - viens ieraksts uz glabājamo vienību',
                            'Tekstuāls - var būt vairāki ieraksti'
                        ]
                    }
                ]
            },
            {
                id: 'record-metadata',
                title: 'Ierakstu Metadati',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Katram ierakstam jānorāda metadati:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Nosaukums (obligāts)',
                            'Reģistrācijas numurs (nav obligāts)',
                            'Datums (obligāts)',
                            'Valoda',
                            'Anotācija',
                            'Atslēgvārdi',
                            'Tehniskā informācija'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Papildus var pievienot informāciju par piekļuves ierobežojumiem, adresātiem un darbībām.'
                    }
                ]
            },
            {
                id: 'record-files',
                title: 'Failu Pievienošana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Failiem ir noteikti ierobežojumi atkarībā no ieraksta tipa:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Foto - tikai attēlu formāti (JPG, JPEG, PNG, GIF, BMP, TIFF)',
                            'Video - video formāti (MP4, AVI, MOV, WMV, MKV, FLV)',
                            'Skaņas - audio formāti (MP3, WAV, AAC, OGG, M4A, FLAC)',
                            'Tekstuāls - dokumentu un attēlu formāti (PDF, DOC, DOCX, JPG, JPEG, PNG, TIF, TIFF)'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Maksimālais faila izmērs: 50MB'
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Elektroniskiem uzskaites sarakstiem faila augšupielāde ir OBLIGĀTA. Fiziskiem uzskaites sarakstiem faila augšupielāde nav pieejama.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'delete-record',
                title: 'Ieraksta Dzēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Ierakstu var dzēst, ja tas vairs nav nepieciešams. Lai dzēstu ierakstu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet glabājamo vienību',
                            'Izvēlieties ierakstu, kuru vēlaties dzēst',
                            'Noklikšķiniet uz dzēšanas pogas',
                            'Apstipriniet dzēšanu dialoga logā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Dzēšot ierakstu, tiek dzēsts:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Ieraksta ieraksts datubāzē',
                                    'Visi ar to saistītie augšupielādētie faili'
                                ]
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Atcerieties: Foto, Video un Skaņas uzskaites sarakstiem var būt tikai viens ieraksts uz glabājamo vienību, tāpēc dzēšot ierakstu, glabājamā vienība paliek bez ieraksta.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'document-vs-media',
                title: 'Dokumentu vs Mediju Ieraksti',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Sistēmā ir divi galvenie ierakstu veidi ar atšķirīgām īpašībām un metadatu laukiem.'
                    },
                    {
                        type: 'heading',
                        text: 'Dokumentu Ieraksti (Tekstuālie)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Dokumentu ieraksti tiek izmantoti tekstuālu dokumentu glabāšanai un aprakstīšanai.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Uzskaites saraksta veids: Tekstuāls',
                            'Vienai glabājamai vienībai var būt VAIRĀKI ieraksti',
                            'Atļautie failu formāti: PDF, DOC, DOCX, JPG, JPEG, PNG, TIF, TIFF',
                            'Papildu lauki: Darbības, Adresāti, Vizas',
                            'Var pievienot vairākus failus vienam ierakstam',
                            'Noderīgi lietu dokumentiem ar vairākām daļām'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Mediju Ieraksti (Foto, Video, Skaņas)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Mediju ieraksti tiek izmantoti multimedia failu glabāšanai.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Uzskaites saraksta veids: Foto, Video, vai Skaņas',
                            'Vienai glabājamai vienībai var būt tikai VIENS ieraksts',
                            'Specializēti metadatu lauki katram medija veidam',
                            'Foto: Krāsa (color) — Pelēktonis vai Krāsains, Horizontālā izšķirtspēja (horizontal_resolution) — pikseļos, Vertikālā izšķirtspēja (vertical_resolution) — pikseļos',
                            'Video: Krāsa (color) — Pelēktonis vai Krāsains, Horizontālā izšķirtspēja (horizontal_resolution) — pikseļos, Vertikālā izšķirtspēja (vertical_resolution) — pikseļos, Ilgums (duration) — formātā HH:MM:SS',
                            'Skaņas: Ilgums (duration) — formātā HH:MM:SS'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Izvēlieties dokumentu ierakstu, ja vienai vienībai nepieciešami vairāki ieraksti. Izvēlieties mediju ierakstu, ja katrai vienībai ir tikai viens foto/video/audio fails.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'file-attachments-detail',
                title: 'Failu Augšupielāde un Pārvaldība',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Katram ierakstam elektroniskos uzskaites sarakstos obligāti jāpievieno vismaz viens fails. Fiziskiem uzskaites sarakstiem failu augšupielāde nav pieejama.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Augšupielādēt Failus'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet ierakstu rediģēšanas vai izveides skatu',
                            'Ritiniet uz "Faili" sadaļu',
                            'Velciet failus uz augšupielādes zonas (drag & drop)',
                            'Vai noklikšķiniet uz zonas, lai izvēlētos failus no datora',
                            'Varat augšupielādēt vairākus failus vienlaikus (ja atbalstīts)',
                            'Sagaidiet, kamēr augšupielāde pabeigta (progresa josla)'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Failu Limiti'
                    },
                    {
                        type: 'list',
                        items: [
                            'Maksimālais faila izmērs: 50MB',
                            'Foto, Video, Skaņas ierakstiem: tikai VIENS fails',
                            'Tekstuālu ierakstiem: VAIRĀKI faili iespējami',
                            'Faila formātam jāatbilst uzskaites saraksta veidam'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Failu Pārvaldība'
                    },
                    {
                        type: 'list',
                        items: [
                            'Skatīt: Noklikšķiniet uz faila, lai atvērtu priekšskatījumu',
                            'Lejupielādēt: Noklikšķiniet uz lejupielādes ikonas',
                            'Dzēst: Noklikšķiniet uz dzēšanas ikonas (tikai pirms saglabāšanas)',
                            'Aizstāt: Dzēsiet veco un augšupielādējiet jauno'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Failus var dzēst pēc augšupielādes. Mediju failiem dzēšana notiek kopā ar ieraksta dzēšanu.'
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Elektroniskiem uzskaites sarakstiem faila augšupielāde ir OBLIGĀTA. Bez faila nevarēsiet saglabāt ierakstu un projekts neizvērsies validāciju.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'search-filter-records',
                title: 'Ierakstu Meklēšana un Filtrēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Lielās glabājamās vienības ar daudziem ierakstiem var meklēt un filtrēt, lai ātri atrastu nepieciešamo informāciju.'
                    },
                    {
                        type: 'heading',
                        text: 'Meklēšanas Funkcija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Meklēšanas lauks atrodas augšpusē ierakstu saraksta skatā.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Ievadiet meklēšanas tekstu laukā',
                            'Meklēšana notiek reālajā laikā (bez pogas "Meklēt")',
                            'Meklē visos ierakstu tekstuālajos laukos (nosaukums, anotācija, atslēgvārdi)',
                            'Meklēšana nav jutīga pret lielajiem/mazajiem burtiem',
                            'Lai atceltu meklēšanu, nodzēsiet meklēšanas lauku'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Filtrēšana Pēc Grupas'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ierakstus var grupēt un filtrēt pēc grupas.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz filtra izvēlnes (dropdown)',
                            'Izvēlieties grupu, kuru vēlaties redzēt',
                            'Sarakstā parādīsies tikai izvēlētās grupas ieraksti',
                            'Izvēlieties "Visas grupas", lai atceltu filtru'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Skatu Maiņa'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ierakstus var skatīt divos veidos:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Tabulas skats - Ieraksti redzami tabulā ar kolonnām',
                            'Karšu skats - Ieraksti redzami kā kartes ar priekšskatījumiem',
                            'Pārslēdzieties starp skatiem ar pogu augšējā labajā stūrī'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kolonnu Pielāgošana (Tabulas Skatā)'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz "Kolonnas" pogas',
                            'Atzīmējiet vai noņemiet kolonnas, kuras vēlaties redzēt',
                            'Tabula atjaunosies uzreiz',
                            'Jūsu izvēle tiek saglabāta lokāli'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Meklēšanu un filtrēšanu var kombinēt - piemēram, varat meklēt konkrētu vārdu tikai vienā grupā.'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'verification',
        title: 'Pārbaude un Validācija',
        sections: [
            {
                id: 'verification-view',
                title: 'Pārbaudes Skats',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Pārbaudes modalais logs ļauj pārbaudīt visu projektu un sagatavot to OPEX iesniegšanai. Šis ir svarīgs solis pirms dokumentu eksportēšanas.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā atvērt pārbaudes skatu'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz "Pārbaudīt projektu" pogas galvenajā projekta skatā',
                            'Logs automātiski palaiž validāciju',
                            'Redzēsiet statistiku un validācijas koka skatu'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Statistikas josla'
                    },
                    {
                        type: 'paragraph',
                        text: 'Augšējā daļā redzama statistikas josla, kas parāda:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Importēto uzskaites sarakstu skaits (no VVAIS atskaites)',
                            'Izveidoto uzskaites sarakstu skaits (manuāli pievienoti)',
                            'Kopējais glabājamo vienību skaits',
                            'Kopējais ierakstu (dokumentu) skaits',
                            'Kopējais failu skaits',
                            'Gatavības statuss OPEX iesniegšanai (✓ vai ✗)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Statistika tiek atjaunināta reālajā laikā, mainot projektā datus.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'validation-tree',
                title: 'Validācijas Koks',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Validācijas koks parāda visu projekta struktūru hierarhiskā veidā: Projekts → Uzskaites Saraksti → Glabājamās Vienības → Ieraksti → Faili'
                    },
                    {
                        type: 'heading',
                        text: 'Krāsu nozīmes'
                    },
                    {
                        type: 'list',
                        items: [
                            '🟢 Zaļš - Viss kārtībā, nav kļūdu un brīdinājumu',
                            '🟡 Dzeltens - Ir brīdinājumi, bet projektu var turpināt',
                            '🔴 Sarkans - Kritiski kļūdas, OBLIGĀTI jāizlabo pirms eksportēšanas'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Darbs ar validācijas koku'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz elementa, lai izvērstu/sakļautu tā apakšelementus',
                            'Noklikšķiniet uz elementa nosaukuma, lai pārietu uz to galvenajā skatā',
                            'Noklikšķiniet uz kļūdas ikonas, lai redzētu detalizētu kļūdas aprakstu',
                            'Izmantojiet navigācijas saites, lai ātri pārietu uz problemātiskiem elementiem'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Lai redzētu kļūdas detaļas, noklikšķiniet uz sarkanas vai dzeltenas ikonas. Atvērsies panelis ar detalizētu informāciju.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'understanding-errors',
                title: 'Kļūdu Izpratne',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Validācijas sistēma pārbauda vairākus aspektus, lai nodrošinātu, ka projekts atbilst OPEX standartam.'
                    },
                    {
                        type: 'heading',
                        text: 'Pārbaudes veidi'
                    },
                    {
                        type: 'list',
                        items: [
                            'Obligāto lauku pārbaude - vai visi nepieciešamie lauki ir aizpildīti',
                            'Formāta pārbaude - vai dati atbilst prasītajam formātam',
                            'Rakstzīmju limitu pārbaude - vai nav pārsniegti maksimālie simbolu skaiti',
                            'Hierarhijas pārbaude - vai struktūra ir pareiza',
                            'Failu pārbaude - vai elektroniskām vienībām ir pievienoti faili'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Biežākās kļūdas un to risinājumi'
                    },
                    {
                        type: 'list',
                        items: [
                            'Obligātais lauks nav aizpildīts - Aizpildiet norādīto lauku',
                            'Pārsniegts rakstzīmju limits - Saīsiniet tekstu līdz atļautajam garumam',
                            'Trūkst ieraksts - Pievienojiet vismaz vienu ierakstu glabājamai vienībai',
                            'Trūkst fails - Elektroniskām vienībām pievienojiet failu',
                            'Datumu kļūdas - Pārbaudiet, vai datumi ir loģiski (sākuma datums pirms beigu datuma)',
                            'Trūkst parakstītāju informācija - Pievienojiet izveidotāja un parakstītāja datus'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Sarkanas kļūdas OBLIGĀTI jāizlabo pirms eksportēšanas. Dzelteni brīdinājumi ir ieteicami izlabot, bet nav kritiski.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kā labot kļūdas'
                    },
                    {
                        type: 'list',
                        items: [
                            '1. Noklikšķiniet uz elementa ar kļūdu validācijas kokā',
                            '2. Izvēlieties "Pāriet uz..." no konteksta izvēlnes',
                            '3. Pārbaudes logs aizvērsies un atvērsies elements labošanai',
                            '4. Izlabojiet norādītās kļūdas',
                            '5. Atveriet pārbaudes logu atkārtoti, lai pārliecinātos, ka kļūdas ir novērstas'
                        ]
                    }
                ]
            },
            {
                id: 'filters-views',
                title: 'Filtri un Skati',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Pārbaudes skatā pieejami vairāki filtri, lai atvieglotu darbu ar lielajiem projektiem.'
                    },
                    {
                        type: 'heading',
                        text: 'Satura filtrs'
                    },
                    {
                        type: 'list',
                        items: [
                            'Rādīt visu - Parāda visu projekta struktūru neatkarīgi no validācijas statusa',
                            'Rādīt kļūdas - Parāda tikai elementus, kuriem ir kļūdas vai brīdinājumi',
                            'Problēmas - Parāda elementus, kuriem ir kļūdas VAI brīdinājumi'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Pārslēgšanās starp režīmiem:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Noklikšķiniet uz filtru pogas (ikona ar sarakstu vai brīdinājuma zīmi)',
                            'Sistēma automātiski izvēlas "Rādīt kļūdas", ja projektā ir kļūdas',
                            'Ja kļūdu nav, automātiski tiek izvēlēts "Rādīt visu"'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Fiziskais/Elektroniskais pārslēgs'
                    },
                    {
                        type: 'paragraph',
                        text: 'Šis pārslēgs nosaka, kāda veida dokumenti tiek pārbaudīti un eksportēti:'
                    },
                    {
                        type: 'list',
                        items: [
                            '💾 Elektroniskais (default) - Pārbauda un eksportē elektroniskos dokumentus. Obligāta failu pievienošana.',
                            '📦 Fiziskais - Pārbauda un eksportē fiziskos dokumentus. Failu pievienošana nav nepieciešama.'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Validācijas noteikumi atšķiras atkarībā no izvēlētā veida. Elektroniskajiem dokumentiem ir stingrākas prasības.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Atsvaidzināšanas poga'
                    },
                    {
                        type: 'paragraph',
                        text: 'Noklikšķiniet uz atsvaidzināšanas ikonas (↻), lai atkārtoti palaistu validāciju pēc izmaiņu veikšanas projektā.'
                    }
                ]
            },
            {
                id: 'exporting-opex',
                title: 'OPEX Eksportēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Pēc projekta veiksmīgas validācijas varat eksportēt dokumentus OPEX iesniegšanai arhīvā.'
                    },
                    {
                        type: 'heading',
                        text: 'Priekšnosacījumi eksportēšanai'
                    },
                    {
                        type: 'list',
                        items: [
                            'Projekts ir pilnībā validēts (zaļa atzīme "Gatavs OPEX")',
                            'Nav kritisku kļūdu (sarkano ikonū)',
                            'Visi obligātie lauki ir aizpildīti',
                            'Ierakstiem ir pievienoti nepieciešamie faili (elektroniskajiem)',
                            'Pievienota parakstītāju informācija'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja projekts nav gatavs, eksportēšanas pogas būs atspējotas (pelēkas). Vispirms jānovērš visas kļūdas.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Eksporta veidi'
                    },
                    {
                        type: 'paragraph',
                        text: '1. Eksportēt US (Uzskaites Sarakstu):'
                    },
                    {
                        type: 'list',
                        items: [
                            'Ģenerē XLSX failu ar pilnu inventāru sarakstu',
                            'Ietver visus uzskaites sarakstus, glabājamās vienības un ierakstus',
                            'Fails tiek lejupielādēts automātiski pēc ģenerēšanas'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: '2. Eksportēt PN (Pieņemšanas-Nodošanas aktu):'
                    },
                    {
                        type: 'list',
                        items: [
                            'Ģenerē oficiālu pieņemšanas-nodošanas dokumentu',
                            'Ietver parakstītāju informāciju un projekta kopsavilkumu',
                            'Fails tiek lejupielādēts automātiski'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Eksportēšanas process'
                    },
                    {
                        type: 'list',
                        items: [
                            '1. Pārliecinieties, ka projekts ir validēts ("Gatavs OPEX" zaļa atzīme)',
                            '2. Izvēlieties pareizo veidu (Fiziskais/Elektroniskais)',
                            '3. Noklikšķiniet uz "Eksportēt US" vai "Eksportēt PN"',
                            '4. Gaidiet, kamēr fails tiek ģenerēts (parādās ielādes indikators)',
                            '5. Fails automātiski lejupielādējas pārlūkprogrammā',
                            '6. Saglabājiet failu drošā vietā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'SVARĪGI: Pirms eksportēšanas pārbaudiet, vai esat izvēlējies pareizo veidu (Fiziskais/Elektroniskais). Šis iestatījums ietekmē ģenerēto dokumentu saturu.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Pēc eksportēšanas'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pārbaudiet lejupielādētos failus',
                            'Glabājiet dublējuma kopijas',
                            'Iesniedziet failus atbilstoši arhīva prasībām',
                            'Saglabājiet projektu sistēmā turpmākai atsaucei'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'fond-institution',
        title: 'Fonds un Iestāde',
        sections: [
            {
                id: 'fond-information',
                title: 'Fonda Informācija',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Fonda informācija tiek automātiski importēta no VVAIS atskaites faila, kad augšupielādējat projekta sākotnējo atskaiti.'
                    },
                    {
                        type: 'heading',
                        text: 'Fonda Dati'
                    },
                    {
                        type: 'paragraph',
                        text: 'Fonda skatā redzama šāda informācija:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Arhīva nosaukums - Arhīva pilnais nosaukums',
                            'Arhīva numurs - Arhīva unikālais identifikators',
                            'Fonda kods - Fonda identifikācijas kods',
                            'Fonda nosaukums - Fonda pilnais nosaukums',
                            'Uzskaites sarakstu skaits - Cik uzskaites sarakstu importēti no VVAIS',
                            'Vienību skaits - Kopējais glabājamo vienību skaits (gan importētas, gan jaunas)'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Fonda informācija ir TIKAI LASĀMA - to nevar rediģēt manuāli. Visi dati nāk no VVAIS sistēmas un tiek automātiski atjaunināti, atkārtoti augšupielādējot atskaiti.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Uzskaites Sarakstu Pārskats'
                    },
                    {
                        type: 'paragraph',
                        text: 'Fonda skatā redzami visi ar fondu saistītie uzskaites saraksti:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Importētie uzskaites saraksti - Automātiski izveidoti no VVAIS atskaites',
                            'Manuāli izveidotie uzskaites saraksti - Jauni saraksti, ko izveidojāt pats',
                            'Katram sarakstam redzams tā veids (Foto, Video, Skaņas, Tekstuāls)',
                            'Redzams, vai saraksts ir elektronisks vai fizisks',
                            'Statistika par glabājamām vienībām katrā sarakstā'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Projekta ietvaros varat strādāt tikai ar VIENU fondu. Ja jums ir nepieciešams aprakstīt vairākus fondus, izveidojiet atsevišķus projektus katram fondam.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'institution-signers',
                title: 'Iestādes Parakstītāji',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Lai sagatavotos OPEX eksportēšanai, obligāti jānorāda informācija par dokumentu izveidotāju un parakstītāju. Šī informācija tiek izmantota ģenerējot pieņemšanas-nodošanas aktu.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Pievienot Parakstītājus'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet projektu',
                            'Noklikšķiniet uz pogas "Iestādes parakstītāji" vai ikonu (persona)',
                            'Atvērsies parakstītāju rediģēšanas modalais logs',
                            'Aizpildiet visus obligātos laukus',
                            'Noklikšķiniet "Saglabāt"'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Obligātie Lauki'
                    },
                    {
                        type: 'paragraph',
                        text: 'Visi šie lauki ir obligāti, lai varētu veiksmīgi eksportēt OPEX dokumentus:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Izveidotāja vārds un uzvārds (maksimums 30 rakstzīmes)',
                            'Izveidotāja amats (maksimums 200 rakstzīmes)',
                            'Parakstītāja vārds un uzvārds (maksimums 30 rakstzīmes)',
                            'Parakstītāja amats (maksimums 200 rakstzīmes)'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Validācija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Forma ietver reāllaika validāciju:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Visi lauki tiek pārbaudīti, kad ievadāt tekstu',
                            'Ja lauks ir tukšs vai pārsniedz limitu, parādās kļūdas ziņojums',
                            'Poga "Saglabāt" ir aktīva tikai tad, ja visi lauki ir pareizi aizpildīti',
                            'Rakstzīmju skaitītājs parāda atlikušās/izmantotās rakstzīmes'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Bez šīs informācijas NEVARĒSIET eksportēt OPEX dokumentus! Pārbaudes (validācijas) procesā projekts tiks atzīmēts kā nav gatavs, ja šie lauki nav aizpildīti.'
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Parasti izveidotājs un parakstītājs ir dažādas personas: izveidotājs ir speciālists, kurš sagatavojis uzskaites sarakstus, bet parakstītājs ir atbildīgais vadītājs (piemēram, arhīva vadītājs).'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kur Tiek Izmantotas Šīs Ziņas'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pieņemšanas-nodošanas aktā (PN)',
                            'OPEX metadatos',
                            'Validācijas pārbaudēs',
                            'Eksporta failos'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'navigation',
        title: 'Navigācija',
        sections: [
            {
                id: 'breadcrumbs',
                title: 'Navigācijas Ceļš',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Lapas augšdaļā redzams navigācijas ceļš (breadcrumbs), kas parāda pašreizējo atrašanās vietu hierarhijā.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Noklikšķinot uz jebkura ceļa elementa, varat ātri pāriet uz attiecīgo līmeni.'
                    }
                ]
            },
            {
                id: 'quick-actions',
                title: 'Ātrās Darbības',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Katrā līmenī ir pieejamas ātrās darbības pogas, kas ļauj ātri izveidot, labot vai dzēst elementus.'
                    }
                ]
            }
        ]
    },
    {
        id: 'terminology',
        title: 'Terminoloģija',
        sections: [
            {
                id: 'basic-terms',
                title: 'Pamata Termini',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Šajā sadaļā ir skaidroti galvenie termini, kas tiek izmantoti OPEX rīkā.'
                    },
                    {
                        type: 'heading',
                        text: 'Projekts'
                    },
                    {
                        type: 'paragraph',
                        text: 'Augstākā līmeņa organizācijas vienība. Projekts satur visus ar konkrēto darbu saistītos datus: uzskaites sarakstus, glabājamās vienības un ierakstus.'
                    },
                    {
                        type: 'heading',
                        text: 'Uzskaites Saraksts (US)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Glabājamo vienību grupējums pēc tipa. Uzskaites saraksts definē, kāda veida materiālus tas satur (Foto, Video, Skaņas vai Tekstuāls) un vai tie ir elektroniski vai fiziski.'
                    },
                    {
                        type: 'heading',
                        text: 'Glabājamā Vienība (GV)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Viena arhīva vienība uzskaites sarakstā. Piemēram, viena foto kolekcija, viens video fails vai viens dokuments. Glabājamai vienībai ir numurs, nosaukums un citi metadati.'
                    },
                    {
                        type: 'heading',
                        text: 'Ieraksts (Dokuments)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Faktiskais digitālais fails un tā metadati. Ieraksts ir saistīts ar glabājamo vienību. Atkarībā no uzskaites saraksta tipa, glabājamai vienībai var būt viens vai vairāki ieraksti.'
                    },
                    {
                        type: 'heading',
                        text: 'OPEX'
                    },
                    {
                        type: 'paragraph',
                        text: 'Open Preservation Exchange - atvērts XML standarts digitālā arhīva struktūras un metadatu sagatavošanai.'
                    },
                    {
                        type: 'heading',
                        text: 'Metadati'
                    },
                    {
                        type: 'paragraph',
                        text: 'Dati par datiem. Informācija, kas apraksta failu vai ierakstu: nosaukums, datums, autors, apraksts utt.'
                    }
                ]
            },
            {
                id: 'inventory-terms',
                title: 'Uzskaites Sarakstu Termini',
                content: [
                    {
                        type: 'heading',
                        text: 'Elektronisks Inventārs'
                    },
                    {
                        type: 'paragraph',
                        text: 'Uzskaites saraksts, kurā glabā digitālos failus. Elektroniskam inventāram ir obligāta prasība augšupielādēt faktiskos failus.'
                    },
                    {
                        type: 'heading',
                        text: 'Fizisks Inventārs'
                    },
                    {
                        type: 'paragraph',
                        text: 'Uzskaites saraksts, kurā apraksta fiziskos objektus (papīra dokumentus, kasetes, disketes). Fiziskam inventāram nav iespējams augšupielādēt failus.'
                    },
                    {
                        type: 'heading',
                        text: 'ONE_TO_ONE (Viens pret Vienu)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Sakarības tips, kas nozīmē, ka vienai glabājamai vienībai var būt tikai viens ieraksts. Attiecas uz Foto, Video un Skaņas uzskaites sarakstiem.'
                    },
                    {
                        type: 'heading',
                        text: 'ONE_TO_MANY (Viens pret Daudziem)'
                    },
                    {
                        type: 'paragraph',
                        text: 'Sakarības tips, kas nozīmē, ka vienai glabājamai vienībai var būt vairāki ieraksti. Attiecas uz Tekstuāls uzskaites sarakstiem.'
                    },
                    {
                        type: 'heading',
                        text: 'Metadatu Pārmantošana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Process, kurā glabājamās vienības un ieraksti automātiski pārņem metadatus no augstāka līmeņa (projekta vai uzskaites saraksta). Piemēram, ja projektam norādīts datuma diapazons, tas automātiski tiek pielietots glabājamām vienībām.'
                    }
                ]
            },
            {
                id: 'technical-terms',
                title: 'Tehniskie Termini',
                content: [
                    {
                        type: 'heading',
                        text: 'VVAIS Atskaite'
                    },
                    {
                        type: 'paragraph',
                        text: 'Excel fails, kas satur strukturētu informāciju par fonda uzskaites sarakstiem. Var importēt OPEX rīkā, lai automātiski izveidotu uzskaites sarakstus.'
                    },
                    {
                        type: 'heading',
                        text: 'Glabāšanas Termiņš'
                    },
                    {
                        type: 'paragraph',
                        text: 'Laika periods, cik ilgi dokumenti ir jāglabā. Piemēram: "Pastāvīgi", "10 gadi", "5 gadi".'
                    },
                    {
                        type: 'heading',
                        text: 'Reģistrācijas Numurs'
                    },
                    {
                        type: 'paragraph',
                        text: 'Unikāls identifikators dokumentam vai ierakstam. Obligāts lauks katram ierakstam.'
                    },
                    {
                        type: 'heading',
                        text: 'Validācija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Datu pārbaudes process, lai nodrošinātu, ka ievadītā informācija atbilst noteikumiem. Piemēram, pārbauda, vai datums ir derīgs, vai faila formāts ir atļauts.'
                    },
                    {
                        type: 'heading',
                        text: 'Darbība'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lietotāja rīcība, kas ietekmē saglabātos datus tos rediģējot, dzēšot vai pievienojot.'
                    },
                    {
                        type: 'heading',
                        text: 'Navigācija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lietotāja rīcība, kas nomaina, izvērš vai konsolidē skatu vai elementu skatā.'
                    },
                    {
                        type: 'heading',
                        text: 'Elements'
                    },
                    {
                        type: 'paragraph',
                        text: 'Programmas vizuālā komponente, kura uzrāda informāciju, atļauj veikt darbības un navigāciju lietotājam. Piemēram: teksta logi, pogas, teksta ievades logi u.t.t.'
                    },
                    {
                        type: 'heading',
                        text: 'Rediģēt'
                    },
                    {
                        type: 'paragraph',
                        text: 'Datu vērtības maiņa vai papildināšana.'
                    },
                    {
                        type: 'heading',
                        text: 'Dzēst'
                    },
                    {
                        type: 'paragraph',
                        text: 'Datu neatgūstama iznīcināšana.'
                    },
                    {
                        type: 'heading',
                        text: 'Pievienot'
                    },
                    {
                        type: 'paragraph',
                        text: 'Datu vērtības vai datu kopuma izveidošana, papildināšana.'
                    }
                ]
            }
        ]
    },
    {
        id: 'licenses',
        title: 'Licences',
        sections: [
            {
                id: 'software-license',
                title: 'Programmatūras Licence',
                content: [
                    {
                        type: 'paragraph',
                        text: 'OPEX struktūras un metadatu sagataves rīks ir izstrādāts kā atvērtā koda projekts.'
                    },
                    {
                        type: 'heading',
                        text: 'Licences Noteikumi'
                    },
                    {
                        type: 'paragraph',
                        text: 'Šī programmatūra ir pieejama lietošanai un modificēšanai saskaņā ar licences noteikumiem. Lūdzu, skatiet LICENSE failu projekta repozitorijā pilnai informācijai.'
                    },
                    {
                        type: 'heading',
                        text: 'Atvērtā Koda Komponentes'
                    },
                    {
                        type: 'paragraph',
                        text: 'Šis projekts izmanto vairākas atvērtā koda bibliotēkas un komponentus:'
                    },
                    {
                        type: 'list',
                        items: [
                            'React - MIT License',
                            'Django - BSD License',
                            'Django REST Framework - BSD License',
                            'Libertinus Serif Display - OFL License'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Paldies visiem atvērtā koda projektu autoriem par viņu ieguldījumu!'
                    }
                ]
            },
            {
                id: 'data-license',
                title: 'Datu Licence',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Dati, kas tiek izveidoti un pārvaldīti šajā rīkā, pieder lietotājam.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Lietotājs ir pilnībā atbildīgs par:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Augšupielādēto failu autortiesībām',
                                    'Metadatu precizitāti',
                                    'Datu drošību un rezerves kopijām',
                                    'Atbilstību GDPR un citiem datu aizsardzības noteikumiem'
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'opex-standard',
                title: 'OPEX Standarts',
                content: [
                    {
                        type: 'paragraph',
                        text: 'OPEX (Open Preservation Exchange) ir atvērts XML standarts digitālā arhīva struktūras un metadatu sagatavošanai.'
                    },
                    {
                        type: 'paragraph',
                        text: 'OPEX standarts ir brīvi pieejams un var tikt izmantots bez ierobežojumiem. Vairāk informācijas par OPEX standartu:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Oficiālā dokumentācija: https://www.openpreservationexchange.org/',
                            'GitHub repozitorijs: https://github.com/openpreservation/opex'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'contacts',
        title: 'Atbalsts',
        sections: [
            {
                id: 'support',
                title: 'Tehniskā Atbalsta',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Ja jums ir jautājumi vai nepieciešama palīdzība ar OPEX rīka izmantošanu, lūdzu, sazinieties ar tehnisko atbalstu.'
                    },
                    {
                        type: 'heading',
                        text: 'Kontaktinformācija'
                    },
                    {
                        type: 'paragraph',
                        text: 'Tehniskais atbalsts:'
                    },
                    {
                        type: 'list',
                        items: [
                            'E-pasts: support@opex-tool.lv',
                            'Tālrunis: +371 XXXX XXXX',
                            'Darba laiks: Pirmdien-Piektdien, 9:00-17:00'
                        ]
                    }
                ]
            },
            {
                id: 'feedback',
                title: 'Atsauksmes un Priekšlikumi',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Mēs novērtējam jūsu atsauksmes un priekšlikumus rīka uzlabošanai!'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lūdzu, sūtiet savus priekšlikumus uz: feedback@opex-tool.lv'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Iekļaujiet savā ziņojumā:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Detalizētu problēmas aprakstu',
                                    'Soļus, kā problēmu reproducēt',
                                    'Ekrānuzņēmumus (ja iespējams)',
                                    'Pārlūka versiju un operētājsistēmu'
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'documentation',
                title: 'Dokumentācija',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Pilna dokumentācija par OPEX rīku ir pieejama projekta repozitorijā.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Dokumentācijas resursi:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Lietotāja rokasgrāmata',
                            'Tehniski dokumenti',
                            'API dokumentācija',
                            'Video pamācības'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'bug-reports',
        title: 'Kļudu Paziņojumi',
        isWarning: true,
        sections: [
            {
                id: 'report-bug',
                title: 'Kā Ziņot par Kļūdu',
                content: [
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja esat atklājis kļūdu vai problēmu rīka darbībā, lūdzu, ziņojiet par to pēc iespējas ātrāk!'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Lai ziņotu par kļūdu, veiciet šādus soļus:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Aprakstiet problēmu detalizēti',
                            'Norādiet, kas notika pirms kļūdas',
                            'Pievienojiet ekrānuzņēmumus',
                            'Norādiet pārlūka versiju',
                            'Sūtiet ziņojumu uz: bugs@opex-tool.lv'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Kļūdas Ziņojuma Šablons'
                    },
                    {
                        type: 'paragraph',
                        text: 'Lūdzu, izmantojiet šo šablonu, ziņojot par kļūdu:'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Kļūdas Apraksts:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Īss kļūdas apraksts',
                                    'Soļi, kā reproducēt problēmu',
                                    'Sagaidītā rezultāts',
                                    'Faktiskais rezultāts',
                                    'Pārlūks un versija',
                                    'Operētājsistēma',
                                    'Ekrānuzņēmumi vai kļūdas ziņojumi'
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'known-issues',
                title: 'Zināmās Problēmas',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Šeit ir uzskaitītas zināmās problēmas, pie kurām strādājam:'
                    },
                    {
                        type: 'heading',
                        text: 'Pārlūka Saderība'
                    },
                    {
                        type: 'list',
                        items: [
                            'Internet Explorer nav atbalstīts - lūdzu, izmantojiet modernu pārlūku',
                            'Safari vecākās versijās var būt displeja problēmas'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Failu Augšupielāde'
                    },
                    {
                        type: 'list',
                        items: [
                            'Lielie faili (>50MB) var izraisīt timeout kļūdas',
                            'Vienlaicīga daudzfailu augšupielāde var palēnināt sistēmu'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Šīs problēmas tiks novērstas nākamajos atjauninājumos. Ja jūs saskaries ar kādu no šīm problēmām, lūdzu, izmantojiet aprakstītos risinājumus vai sazinieties ar tehnisko atbalstu.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'critical-bugs',
                title: 'Kritiskās Kļūdas',
                content: [
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja esat saskāries ar kritisku kļūdu, kas liedz jums strādāt ar rīku:'
                            },
                            {
                                type: 'list',
                                items: [
                                    'Nekavējoties sazinieties ar tehnisko atbalstu pa tālruni',
                                    'Neveiciet nekādas izmaiņas sistēmā',
                                    'Saglabājiet kļūdas ziņojumu un ekrānuzņēmumu',
                                    'Gaidiet atbildi no tehniskā atbalsta pirms turpināt darbu'
                                ]
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Kritisko kļūdu kontakti:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Tālrunis: +371 XXXX XXXX (24/7)',
                            'E-pasts: critical@opex-tool.lv',
                            'Atbildes laiks: 1-2 stundas darba laikā'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'settings',
        title: 'Iestatījumi',
        icon: 'fa-cog',
        sections: [
            {
                id: 'display-settings',
                title: 'Attēlošanas Iestatījumi',
                content: [
                    { type: 'paragraph', text: 'Attēlošanas iestatījumi ļauj pielāgot lietotnes izskatu un uzvedību.' },
                    { type: 'table', headers: ['Iestatījums', 'Opcijas', 'Apraksts'], rows: [
                        ['Tēma', 'Gaišā / Tumšā / Automātiskā', 'Automātiskā seko sistēmas iestatījumam'],
                        ['Fonta izmērs', 'Mazs / Vidējs / Liels', 'Maina teksta izmēru visā lietotnē'],
                        ['Kompaktais skats', 'Ieslēgts / Izslēgts', 'Blīvāks izkārtojums ar mazāku atstarpi'],
                        ['Maizes drupatas', 'Ieslēgts / Izslēgts', 'Rāda navigācijas ceļu augšpusē']
                    ]},
                    { type: 'note', style: 'info', content: [
                        { type: 'paragraph', text: 'Visi iestatījumi tiek saglabāti pārlūka lokālajā krātuvē un saglabājas starp sesijām.' }
                    ]}
                ]
            },
            {
                id: 'form-presets',
                title: 'Formu Iepriekšiestatījumi',
                content: [
                    { type: 'paragraph', text: 'Formu preseti ļauj saglabāt noklusējuma vērtības, kas automātiski aizpilda formu laukus.' },
                    { type: 'paragraph', text: 'Katrs presets var saturēt:' },
                    { type: 'list', items: [
                        'Valoda (vienībām un ierakstiem)',
                        'Pieejamības ierobežojums',
                        'Slepenības līmenis',
                        'Atslēgvārdi',
                        'Piezīmes'
                    ]},
                    { type: 'steps', steps: [
                        'Atveriet Iestatījumus un izvēlieties cilni "Formas"',
                        'Nospiediet "Jauns presets" un ievadiet nosaukumu',
                        'Aizpildiet vēlamās noklusējuma vērtības',
                        'Saglabājiet un aktivizējiet presetu'
                    ]},
                    { type: 'paragraph', text: 'Aktīvais presets tiek izmantots automātiski, veidojot jaunas vienības un ierakstus.' }
                ]
            },
            {
                id: 'validation-settings',
                title: 'Validācijas Iestatījumi',
                content: [
                    { type: 'paragraph', text: 'Validācijas iestatījumi ļauj pielāgot brīdinājumu sliekšņus un ieslēgt/izslēgt atsevišķus brīdinājumu tipus.' },
                    { type: 'table', headers: ['Sliekšņa tips', 'Noklusējums', 'Apraksts'], rows: [
                        ['Maks. faila izmērs', '100 MB', 'Brīdinājums ja fails pārsniedz šo izmēru'],
                        ['Min. faila izmērs', '10 KB', 'Brīdinājums ja teksta fails ir mazāks'],
                        ['Maks. ilgums', '3600 sek.', 'Brīdinājums ja video/audio pārsniedz ilgumu'],
                        ['Min. ilgums', '1 sek.', 'Brīdinājums ja video/audio ir pārāk īss'],
                        ['Min. attēla izmēri', '800×600 px', 'Brīdinājums ja foto izšķirtspēja ir zema'],
                        ['Maks. attēla izmēri', '4000×4000 px', 'Brīdinājums ja foto ir ļoti liels']
                    ]},
                    { type: 'paragraph', text: 'Brīdinājumi neietekmē OPEX ģenerēšanu — tie ir informatīvi un kalpo kā kvalitātes kontrole.' }
                ]
            },
            {
                id: 'settings-import-export',
                title: 'Iestatījumu Imports un Eksports',
                content: [
                    { type: 'paragraph', text: 'Iestatījumus var eksportēt kā JSON failu un importēt citā pārlūkā vai datorā.' },
                    { type: 'steps', steps: [
                        'Atveriet Iestatījumus',
                        'Nospiediet "Eksportēt" lai lejupielādētu JSON failu',
                        'Lai importētu — nospiediet "Importēt" un izvēlieties iepriekš saglabāto failu',
                        'Pēc importa pārbaudiet iestatījumus un saglabājiet'
                    ]}
                ]
            }
        ]
    },
    {
        id: 'roadmap',
        title: 'Ceļa Karte',
        icon: 'fa-route',
        sections: [
            {
                id: 'roadmap-overview',
                title: 'Kas ir Ceļa Karte?',
                content: [
                    { type: 'paragraph', text: 'Ceļa karte ir projekta plānošanas rīks, kas ļauj definēt mērķus un sekot to izpildei. Katram projektam var izveidot vienu vai vairākus maršrutus ar konkrētiem mērķiem.' },
                    { type: 'paragraph', text: 'Maršruts satur:' },
                    { type: 'list', items: [
                        'Mērķa vienību (GV) skaitu',
                        'Mērķa ierakstu skaitu',
                        'Mērķa datņu skaitu',
                        'Uzskaites saraksta tipu un numuru',
                        'Statuss (aktīvs, pabeigts, arhivēts)'
                    ]}
                ]
            },
            {
                id: 'create-route',
                title: 'Maršruta Izveide',
                content: [
                    { type: 'steps', steps: [
                        'Atveriet Projekta Statusu (verifikācijas modāli)',
                        'Pārejiet uz cilni "Projekta ceļvedis"',
                        'Nospiediet "Izveidot maršrutu"',
                        'Izvēlieties uzskaites sarakstu vai izveidojiet jaunu',
                        'Norādiet mērķa GV, ierakstu un datņu skaitu',
                        'Saglabājiet maršrutu'
                    ]},
                    { type: 'note', style: 'info', content: [
                        { type: 'paragraph', text: 'Ceļvedis rāda progresa joslu un piedāvā nākamo darbību, pamatojoties uz pašreizējo projekta stāvokli.' }
                    ]}
                ]
            },
            {
                id: 'guidance-system',
                title: 'Viedais Palīgs',
                content: [
                    { type: 'paragraph', text: 'Viedais palīgs (Smart Guide) ir peldošā kartīte ekrāna apakšā, kas piedāvā nākamās darbības un rāda projekta progresu.' },
                    { type: 'list', items: [
                        'Rāda pašreizējo progresa procentu',
                        'Piedāvā konkrētu nākamo darbību ar pogu',
                        'Rāda validācijas kļūdas un brīdinājumus pa uzskaites sarakstiem',
                        'Var minimizēt vai aizvērt'
                    ]},
                    { type: 'paragraph', text: 'Palīga iestatījumus var mainīt: rādīšanas režīmu, pozīciju un filtrus.' }
                ]
            }
        ]
    },
    {
        id: 'keyboard-shortcuts',
        title: 'Tastatūras Saīsnes',
        icon: 'fa-keyboard',
        sections: [
            {
                id: 'shortcuts-list',
                title: 'Pieejamās Saīsnes',
                content: [
                    { type: 'table', headers: ['Saīsne', 'Darbība', 'Kur darbojas'], rows: [
                        ['Escape', 'Aizvērt aktīvo modāli vai uznirstošo logu', 'Visur'],
                        ['Ctrl+K', 'Atvērt meklēšanu palīdzībā', 'Palīdzības lapā'],
                        ['← / →', 'Pāriet uz iepriekšējo/nākamo vienību', 'GV rediģēšanas modālī'],
                        ['← / →', 'Pāriet uz iepriekšējo/nākamo ierakstu', 'Ieraksta skatā (ja nav rediģēšanas režīmā)'],
                        ['Enter', 'Apstiprināt ievadīto vērtību', 'GV numura ievadē, ieraksta meklēšanā']
                    ]},
                    { type: 'note', style: 'info', content: [
                        { type: 'paragraph', text: 'Bultiņu taustiņi darbojas tikai tad, ja nav aktīvs ievades lauks (input, textarea vai select elements).' }
                    ]}
                ]
            }
        ]
    }
];

export const HELP_UI = {
    WINDOW_TITLE: 'Palīdzība - OPEX Rīks',
    HEADER_TITLE: 'OPEX Rīka Dokumentācija',
    SEARCH_PLACEHOLDER: 'Meklēt palīdzībā...',
    NO_RESULTS: 'Nav atrasti rezultāti',
    CLOSE_WINDOW: 'Aizvērt',
    CHAPTERS_TITLE: 'Sadaļas',
    BACK_TO_TOP: 'Atpakaļ uz augšu'
};

// Helper function to get chapter by ID
export const getChapterById = (chapterId) => {
    return HELP_CHAPTERS.find(chapter => chapter.id === chapterId);
};

// Helper function to get section by chapter and section ID
export const getSectionById = (chapterId, sectionId) => {
    const chapter = getChapterById(chapterId);
    if (!chapter) return null;
    return chapter.sections.find(section => section.id === sectionId);
};

// Helper function to get all section IDs (for search functionality)
export const getAllSectionIds = () => {
    return HELP_CHAPTERS.flatMap(chapter =>
        chapter.sections.map(section => ({
            chapterId: chapter.id,
            sectionId: section.id,
            chapterTitle: chapter.title,
            sectionTitle: section.title
        }))
    );
};

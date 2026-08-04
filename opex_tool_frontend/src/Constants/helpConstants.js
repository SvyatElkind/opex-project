/* ==========================================
   HELP SECTION CONSTANTS
   All help content organized by chapters and sections
   Easy to update without touching React components
   ========================================== */

import { FIELD_HELP } from './fieldHelp';

export const HELP_CHAPTERS = [
    {
        id: 'getting-started',
        title: 'Darba Sākšana',
        icon: 'fa-play-circle',
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
                        type: 'ui-example',
                        label: 'Projekta uzbūve',
                        elements: [
                            { html: '<div style="font-family:var(--font-family-mono);font-size:var(--font-size-sm);line-height:2;padding:12px;background:var(--color-background-light);border-radius:var(--border-radius-base);border:1px solid var(--border-color-light)"><div style="color:var(--color-primary);font-weight:600">📁 Projekts</div><div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px"><div style="color:var(--text-primary)">📋 Uzskaites saraksts <span style="color:var(--text-muted);font-size:11px">(grupē pēc veida)</span></div><div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px"><div style="color:var(--text-primary)">📦 Glabājamā vienība <span style="color:var(--text-muted);font-size:11px">(mape, lieta, sējums...)</span></div><div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px"><div style="color:var(--text-primary)">📄 Ieraksts <span style="color:var(--text-muted);font-size:11px">(apraksta vienu dokumentu)</span></div><div style="padding-left:20px;border-left:2px solid var(--border-color-light);margin-left:8px"><div style="color:var(--text-secondary)">📎 Faili <span style="color:var(--text-muted);font-size:11px">(digitālie faili)</span></div></div></div></div></div></div>' }
                        ],
                        description: 'Katrs projekts ir veidots šādā hierarhijā: projekts satur uzskaites sarakstus, tie — glabājamās vienības, tās — ierakstus, un ierakstiem pievieno failus.'
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
                        type: 'ui-example',
                        label: 'Projekta izveides dialogs pirmajā palaišanā',
                        elements: [
                            { html: '<div style="display:flex;flex-direction:column;gap:8px;max-width:320px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Projekta nosaukums</label><input type="text" placeholder="Mans projekts..." style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Nosaukuma lauks' },
                            { html: '<div style="display:flex;flex-direction:column;gap:8px;max-width:320px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Direktorija</label><input type="text" placeholder="C:\\Projects\\arhivs..." style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Direktorijas lauks' },
                            { html: '<button class="btn-action" style="pointer-events:none">Izveidot Projektu</button>', caption: 'Izveides poga' }
                        ]
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
                            'Pietiekama brīvā vieta diskā projekta failiem',
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
        icon: 'fa-clipboard-list',
        sections : [
            {
                id: 'textual',
                title: 'Kā Aprakstīt Tekstuālos Dokumentus',
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
                        type: 'steps',
                        steps: [
                            { text: 'Izveidot projektu', detail: 'Ievadiet nosaukumu (līdz 20 rakstzīmēm: burti, cipari, - un _) un projekta direktorijas pilnu ceļu, tad noklikšķiniet "Izveidot".' },
                            { text: 'Augšupielādēt VVAIS atskaiti', detail: 'Atveriet projektu un augšupielādējiet .xlsx atskaiti — sistēma importē fondu un uzskaites sarakstus.' },
                            { text: 'Pievienot iestādes parakstītājus', detail: 'Ievadiet izveidotāja un parakstītāja vārdu, uzvārdu un amatu (obligāti eksportam).' },
                            { text: 'Pārskatīt un papildināt uzskaites sarakstus', detail: 'Pārbaudiet importēto sarakstu veidus un elektronisko/fizisko statusu; pievienojiet jaunus, ja nepieciešams.' },
                            { text: 'Pievienot/rediģēt glabājamās vienības', detail: 'Aizpildiet GV numuru, nosaukumu un datumus katrā uzskaites sarakstā.' },
                            { text: 'Pievienot ierakstus un failus', detail: 'Izveidojiet ierakstus ar metadatiem un augšupielādējiet failus (obligāti elektroniskiem sarakstiem).' },
                            { text: 'Pārbaudīt projektu (validācija)', detail: 'Atveriet pārbaudes skatu un pārskatiet validācijas koku un statistiku.' },
                            { text: 'Izlabot kļūdas', detail: 'Noklikšķiniet uz sarkanajiem/dzeltenajiem mezgliem, pārejiet uz problēmu un labojiet, līdz visi mezgli ir zaļi.' },
                            { text: 'Eksportēt OPEX dokumentus', detail: 'Kad projekts ir "Gatavs OPEX", eksportējiet US un PN aktu vai ģenerējiet pilnu OPEX pakotni.' },
                            { text: 'Iesniegt', detail: 'Pārbaudiet ģenerētos failus un iesniedziet tos atbilstoši arhīva prasībām; saglabājiet dublējumu.' }
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
                            'Pārbaudiet faila formātu - tam jāatbilst uzskaites saraksta veidam (faila izmēram nav ierobežojuma)',
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
        icon: 'fa-folder',
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
                        type: 'annotated-screen',
                        title: 'Projekta izveides forma',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Jauns projekts</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Nosaukums: Arhivs_2026</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Direktorija: C:\\Projekti\\Arhivs</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.project.name.detail },
                            { marker: '②', text: FIELD_HELP.project.directory.detail },
                        ]
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
                                text: 'SVARĪGI: Šo mapi novietojiet lietotājam zināmā vietā. Ja mape tiek izdzēsta vai pārvietota, programma uzskatīs, ka mape neeksistē un projekts būs jāveido no jauna!'
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
                        type: 'ui-example',
                        label: 'Projekta izveides forma ar aizpildītiem laukiem',
                        elements: [
                            { html: '<div style="display:flex;flex-direction:column;gap:8px;max-width:320px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Projekta nosaukums</label><input type="text" value="Arhīva projekts 2026" style="pointer-events:none;padding:6px 12px;border:1px solid var(--color-success);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Aizpildīts nosaukums' },
                            { html: '<div style="display:flex;flex-direction:column;gap:8px;max-width:320px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Direktorija</label><input type="text" value="C:\\Projects\\arhivs_2026" style="pointer-events:none;padding:6px 12px;border:1px solid var(--color-success);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Aizpildīta direktorija' },
                            { html: '<div style="display:flex;align-items:center;gap:6px"><i class="fas fa-check-circle" style="color:var(--color-success)"></i><span style="font-size:var(--font-size-sm);color:var(--color-success)">Direktorija eksistē</span></div>', caption: 'Validācijas statuss' }
                        ]
                    },
                    {
                        type: 'accordion',
                        title: 'Bieži sastopamās problēmas ar projekta direktoriju',
                        content: [
                            {
                                type: 'list',
                                items: [
                                    'Tīkla ceļš (\\\\serveris\\...) netiek atbalstīts — izmantojiet lokālo disku (C:, D:, ...)',
                                    'Pārāk gara vai dziļa ceļa struktūra — izvēlieties ceļu tuvāk diska saknei',
                                    'Mape jau satur citu projektu — izvēlieties tukšu vai jaunu mapi',
                                    'Tukšs ceļa lauks — ceļš ir obligāts'
                                ]
                            }
                        ]
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
                        type: 'ui-example',
                        label: 'Dialogs VVAIS atskaites augšupielādei',
                        elements: [
                            { html: '<div style="pointer-events:none;border:2px dashed var(--border-color-light);border-radius:var(--border-radius-base);padding:24px;text-align:center;color:var(--text-muted);font-size:var(--font-size-sm)"><i class="fas fa-cloud-upload-alt" style="font-size:24px;margin-bottom:8px;display:block;color:var(--color-primary)"></i>Velciet failu šeit vai noklikšķiniet</div>', caption: 'Vilkšanas zona' },
                            { html: '<button class="btn-action" style="pointer-events:none"><i class="fas fa-upload"></i> Augšupielādēt VVAIS Atskaiti</button>', caption: 'Augšupielādes poga' }
                        ]
                    },
                    {
                        type: 'accordion',
                        title: 'Ko darīt, ja VVAIS fails netiek pieņemts?',
                        content: [
                            {
                                type: 'list',
                                items: [
                                    'Pārbaudiet, ka fails ir .xlsx formātā no VVAIS sistēmas',
                                    'Pārliecinieties, ka fails nav atvērts programmā Excel augšupielādes laikā',
                                    'Ja fails ir bojāts, eksportējiet to no VVAIS vēlreiz un mēģiniet atkārtoti'
                                ]
                            }
                        ]
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
                        type: 'annotated-screen',
                        title: 'Institūcijas parakstītāju forma',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Iestādes atbildīgās personas</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Aprakstīšanu veica: Jānis Bērziņš, Arhivārs</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span></span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Parakstītājs: Anna Kalniņa, Arhīva vadītāja</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span></span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.institutionSigners.creatorName.detail },
                            { marker: '②', text: FIELD_HELP.institutionSigners.creatorPosition.detail },
                            { marker: '③', text: FIELD_HELP.institutionSigners.signerName.detail },
                            { marker: '④', text: FIELD_HELP.institutionSigners.signerPosition.detail },
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
                        type: 'ui-example',
                        label: 'Institūcijas parakstītāju ievades forma',
                        elements: [
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Izveidotājs</label><input type="text" placeholder="Vārds Uzvārds" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Izveidotājs' },
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Amats</label><input type="text" placeholder="Arhivārs" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Izveidotāja amats' },
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Parakstītājs</label><input type="text" placeholder="Vārds Uzvārds" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Parakstītājs' },
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Amats</label><input type="text" placeholder="Direktors" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:200px" /></div>', caption: 'Parakstītāja amats' }
                        ]
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
        icon: 'fa-list',
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
                                text: 'Uzskaites saraksti tiek izveidoti automātiski, kad augšupielādējat VVAIS atskaiti, vai varat tos izveidot manuāli.'
                            }
                        ]
                    },
                    {
                        type: 'ui-example',
                        label: 'Uzskaites saraksta kartīte projekta skatā',
                        elements: [
                            { html: '<div style="pointer-events:none;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);padding:12px;display:flex;align-items:center;gap:12px;max-width:360px"><i class="fas fa-list" style="font-size:18px;color:var(--color-primary)"></i><div><div style="font-weight:600;font-size:var(--font-size-sm)">Dokumentu uzskaites saraksts</div><div style="font-size:11px;color:var(--text-muted)">Elektronisks · 5 lietas</div></div><span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;background:var(--color-success);color:white"><i class="fas fa-check"></i> Gatavs</span></div>', caption: 'Saraksta kartīte' },
                            { html: '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:var(--color-background-light);color:var(--text-muted)"><i class="fas fa-database"></i> 5</span>', caption: 'Lietu skaits' }
                        ]
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
                        type: 'ui-example',
                        label: 'Poga jauna uzskaites saraksta izveidei',
                        elements: [
                            { html: '<button class="btn-action" style="pointer-events:none"><i class="fas fa-plus"></i> Izveidot Jaunu Uzskaites Sarakstu</button>', caption: 'Izveides poga' }
                        ]
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
                        type: 'annotated-screen',
                        title: 'Jauna uzskaites saraksta forma',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Jauns uzskaites saraksts</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Veids: Tekstuāls</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Elektronisks: ✓</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>No: 2020  Līdz: 2025</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Glabāšanas termiņš: Pastāvīgi</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Apakšfonds: (neizvēlēts)</span>
                                    <span class="help-callout-marker">⑤</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.inventory.type.detail },
                            { marker: '②', text: FIELD_HELP.inventory.electronic.detail },
                            { marker: '③', text: `${FIELD_HELP.inventory.startDate.detail} ${FIELD_HELP.inventory.endDate.detail}` },
                            { marker: '④', text: FIELD_HELP.inventory.storageTerm.detail },
                            { marker: '⑤', text: FIELD_HELP.inventory.subfond.detail },
                        ]
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
                        type: 'ui-example',
                        label: 'Aizpildīta izveides forma ar visiem laukiem',
                        elements: [
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Veids</label><select style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:220px"><option>Dokumentu</option></select></div>', caption: 'Veida izvēle' },
                            { html: '<div style="display:flex;align-items:center;gap:8px;pointer-events:none"><input type="checkbox" checked /><label style="font-size:var(--font-size-sm);color:var(--text-primary)">Elektronisks</label></div>', caption: 'Elektronisks' },
                            { html: '<div style="display:flex;gap:12px"><div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">No datuma</label><input type="text" value="2020" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:80px" /></div><div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Līdz datumam</label><input type="text" value="2025" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:80px" /></div></div>', caption: 'Datumu diapazons' },
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Glabāšanas termiņš</label><select style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:220px"><option>Pastāvīgi</option></select></div>', caption: 'Glabāšanas termiņš' }
                        ]
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
                        type: 'table',
                        headers: ['Veids', 'Paredzēts', 'Atļautie formāti', 'Ieraksti uz GV'],
                        rows: [
                            ['Tekstuāls', 'Dokumenti, vēstules, atskaites', 'PDF, DOC, DOCX, JPG, PNG, TIF, TIFF', 'Vairāki'],
                            ['Foto', 'Fotoattēli', 'JPG, JPEG, PNG, GIF, BMP, TIFF', 'Viens'],
                            ['Video', 'Video materiāli', 'MP4, AVI, MOV, WMV, MKV, FLV', 'Viens'],
                            ['Skaņas', 'Audio ieraksti', 'MP3, WAV, AAC, OGG, M4A, FLAC', 'Viens']
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Faila izmēram nav ierobežojuma. Failu formātam jāatbilst uzskaites saraksta veidam.'
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
                        type: 'ui-example',
                        label: 'Četri uzskaites sarakstu veidi un to īpašības',
                        elements: [
                            { html: '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;background:var(--color-primary);color:white"><i class="fas fa-file-alt"></i> Dokumentu</span>', caption: 'Dokumentu' },
                            { html: '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;background:var(--color-secondary);color:white"><i class="fas fa-photo-video"></i> Foto/Video</span>', caption: 'Foto/Video' },
                            { html: '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;background:var(--color-tertiary);color:white"><i class="fas fa-music"></i> Audio</span>', caption: 'Audio' },
                            { html: '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;background:var(--color-info);color:white"><i class="fas fa-film"></i> Video</span>', caption: 'Video' }
                        ]
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
                        type: 'ui-example',
                        label: 'Rediģēšanas poga uz uzskaites saraksta',
                        elements: [
                            { html: '<button class="btn-warning" style="pointer-events:none"><i class="fas fa-pencil-alt"></i> Rediģēt</button>', caption: 'Rediģēšanas poga' }
                        ]
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
                        type: 'ui-example',
                        label: 'Rediģēšanas forma ar pieejamiem laukiem',
                        elements: [
                            { html: '<div style="display:flex;flex-direction:column;gap:6px;max-width:280px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Veids</label><select style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:220px;opacity:0.5" disabled><option>Dokumentu</option></select></div>', caption: 'Veids (nav rediģējams)' },
                            { html: '<div style="display:flex;gap:12px"><div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">No datuma</label><input type="text" value="2020" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:80px" /></div><div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Līdz datumam</label><input type="text" value="2025" style="pointer-events:none;padding:6px 12px;border:1px solid var(--border-color-light);border-radius:var(--border-radius-base);font-family:var(--font-family-primary);font-size:var(--font-size-sm);width:80px" /></div></div>', caption: 'Rediģējami datumi' },
                            { html: '<button class="btn-action" style="pointer-events:none"><i class="fas fa-save"></i> Saglabāt</button>', caption: 'Saglabāšanas poga' }
                        ]
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
                        type: 'ui-example',
                        label: 'Dzēšanas poga uz uzskaites saraksta',
                        elements: [
                            { html: '<button class="btn-error" style="pointer-events:none"><i class="fas fa-trash"></i> Dzēst</button>', caption: 'Dzēšanas poga' }
                        ]
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
                        type: 'ui-example',
                        label: 'Dzēšanas brīdinājuma dialogs ar atpakaļskaitīšanu',
                        elements: [
                            { html: '<div style="pointer-events:none;display:flex;align-items:center;gap:8px"><i class="fas fa-exclamation-triangle" style="color:var(--color-warning);font-size:18px"></i><span style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Vai tiešām vēlaties dzēst šo uzskaites sarakstu?</span></div>', caption: 'Brīdinājuma teksts' },
                            { html: '<div style="pointer-events:none;display:flex;gap:8px"><button class="btn-error" style="pointer-events:none;opacity:0.6"><i class="fas fa-trash"></i> Dzēst (3s)</button><button class="btn-secondary" style="pointer-events:none">Atcelt</button></div>', caption: 'Atpakaļskaitīšanas poga' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'items',
        title: 'Glabājamās Vienības',
        icon: 'fa-box',
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
                    },
                    {
                        type: 'annotated-screen',
                        title: 'Pamatinformācija un datumi',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Glabājamā vienība — Pamatinformācija</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Sērijas kods: 1.2</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Nosaukums: Domes sēžu protokoli</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Valoda: Latviešu</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Datuma piezīmes: (nav)</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.item.series_code.detail },
                            { marker: '②', text: FIELD_HELP.item.title.detail },
                            { marker: '③', text: FIELD_HELP.item.language.detail },
                            { marker: '④', text: FIELD_HELP.item.date_note.detail },
                        ]
                    },
                    {
                        type: 'annotated-screen',
                        title: 'Tehniskā informācija un saturs',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Glabājamā vienība — Tehniskā informācija</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Apjoms: 245  Mērvienība: Lapas</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Kopija: Oriģināls</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Arhīva vēsture: (nav)</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Sistematizācija: (nav)</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Saturs: Domes sēžu protokoli...</span>
                                    <span class="help-callout-marker">⑤</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Piezīmes: (nav)</span>
                                    <span class="help-callout-marker">⑥</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: `${FIELD_HELP.item.size.detail} ${FIELD_HELP.item.unit_of_measure.detail}` },
                            { marker: '②', text: FIELD_HELP.item.copy.detail },
                            { marker: '③', text: FIELD_HELP.item.archival_history.detail },
                            { marker: '④', text: FIELD_HELP.item.sistematisation.detail },
                            { marker: '⑤', text: FIELD_HELP.item.annotation.detail },
                            { marker: '⑥', text: FIELD_HELP.item.notes.detail },
                        ]
                    },
                    {
                        type: 'annotated-screen',
                        title: 'Pieejamība un slepenība',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Glabājamā vienība — Pieejamība un slepenība</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Pieejamība: Vispārēja</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Slepenība: Publisks</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Pieejamības piezīmes: (nav)</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Slepenības piezīmes: (nav)</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.item.restriction.detail },
                            { marker: '②', text: FIELD_HELP.item.security_level.detail },
                            { marker: '③', text: FIELD_HELP.item.restriction_note.detail },
                            { marker: '④', text: FIELD_HELP.item.security_level_note.detail },
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
                        text: 'Kad esat izvēlējies vienības, virs tabulas parādās atlases josla, kas rāda, cik vienības ir atlasītas no kopējā skaita, un uzskaita to GV numurus. Tas ir svarīgi tāpēc, ka atlase var būt plašāka par redzamo lapu.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Skaitītājs: "Atlasītas X no Y"',
                            'Joslā ir pogas "Rediģēt", "Dzēst", "Kolonnas" un "Notīrīt atlasi"',
                            'Var pievienot vai noņemt izvēles, skaitītājs atjaunosies'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Vairāku Vienību Rediģēšana'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja vairākām vienībām jāmaina viens un tas pats lauks — piemēram, datējums, valoda vai pieejamība — tās nav jārediģē pa vienai.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atzīmējiet vienības ar ķeksīšiem kreisajā pusē',
                            'Tabulas galvenē kolonnu pogas vietā parādās zīmuļa poga ar atlasīto skaitu — nospiediet to (to pašu var izdarīt no atlases joslas)',
                            'Logā atzīmējiet tikai tos laukus, kurus vēlaties mainīt — neatzīmētie lauki katrai vienībai paliks nemainīti',
                            'Ja atlasītajām vienībām lauka vērtība atšķiras, blakus laukam ir norāde "dažādas vērtības"',
                            'Teksta laukiem var izvēlēties, vai vērtību aizvietot, pievienot klāt esošajai vai notīrīt',
                            'Nospiediet "Pārskatīt", pārbaudiet kopsavilkumu un tikai tad saglabājiet'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Vairāku vienību rediģēšanu nevar atsaukt. Pārskata solī ir redzams, cik vienībām katrs lauks tiešām mainīsies un kuras vienības tiks izlaistas kļūdu dēļ.'
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Nosaukumu un GV numuru masveidā mainīt nevar: nosaukums katrai vienībai ir unikāls, bet GV numuru piešķir sistēma pati.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Vairāku Vienību Izveide'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja jāizveido daudz līdzīgu vienību, tabulas galvenē nospiediet "+" pogu un izvēlieties "Izveidot vairākas vienības".'
                    },
                    {
                        type: 'steps',
                        items: [
                            'Aizpildiet kopīgos laukus — tie attieksies uz visām jaunajām vienībām (sērijas kods, datējums, valoda, pieejamība, piezīmes un citi)',
                            'Pievienojiet rindas ar nosaukumiem: ielīmējiet sarakstu no Excel vai teksta faila, ģenerējiet pēc šablona (piemēram, "Sēdes protokoli 2020. {n}. ceturksnis"), vai ievadiet pa vienai',
                            'Katras rindas galā redzams, vai rinda ir derīga — kļūdas ir redzamas pirms saglabāšanas',
                            'Nospiediet "Izveidot" — vienības tiek veidotas pa vienai, un progress ir redzams'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Logā redzamie GV numuri ir tikai prognoze — īstos numurus piešķir sistēma izveides brīdī, pēc kārtas.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'csv-import',
                title: 'Imports no CSV / Excel (eksperimentāls)',
                content: [
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Imports ir EKSPERIMENTĀLA funkcija. Tā ir izstrādes stadijā, var apstrādāt failu nepilnīgi vai nepareizi, un tā nav rādītājs pārējā rīka kvalitātei. Pēc importa rezultāts obligāti jāpārbauda. Atsaukšanas iespējas nav — kļūdas gadījumā izveidotās vienības un ieraksti jādzēš ar rokām.'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja apraksti jau ir Excel tabulā, tos var ievietot rīkā, nepārrakstot ar rokām. Funkcija pēc noklusējuma ir izslēgta — to ieslēdz Iestatījumos, sadaļā "Eksperimentāli". Fails tiek apstrādāts tikai jūsu datorā un nekur netiek sūtīts.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Importēt'
                    },
                    {
                        type: 'steps',
                        items: [
                            'Iestatījumos → Eksperimentāli ieslēdziet "Imports no CSV / Excel faila" un lejupielādējiet paraugfailu',
                            'Aizpildiet paraugfailu ar saviem datiem (kolonnu secība nav svarīga, svarīgi ir virsraksti)',
                            'Uzskaites saraksta tabulā nospiediet "+" un izvēlieties "Importēt no CSV / Excel faila"',
                            'Izvēlieties failu — rīks parāda, kuras kolonnas atpazina un ko darīs ar katru rindu',
                            'Pārbaudiet priekšskatījumu: katrai rindai ir redzams, vai tā ir derīga un kurai glabājamai vienībai dokuments piesaistīsies',
                            'Nospiediet "Importēt" — rindas tiek veidotas pa vienai, un progress ir redzams'
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Faila Struktūra'
                    },
                    {
                        type: 'paragraph',
                        text: 'Fails ir viena tabula, kurā katrai rindai kolonnā TIPS ir norādīts, kas tā ir: GV (glabājamā vienība) vai DOK (dokuments). Kolonna SAITE norāda, kurai vienībai dokuments pieder.'
                    },
                    {
                        type: 'list',
                        items: [
                            'SAITE tukša — dokuments pieder tuvākajai augstāk esošajai GV rindai',
                            'SAITE ar atslēgu (piem. "A") — dokuments pieder tai jaunajai GV rindai, kurai SAITE ir "A"',
                            'SAITE "GV:12" — dokuments pieder jau esošai vienībai ar GV numuru 12'
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Tā vienā formātā var izveidot tikai vienības, tikai dokumentus jau esošām vienībām, vai vienības kopā ar to dokumentiem. Excel failā tiek lasīta lapa "DATI" (vai pirmā lapa) — pārējās lapas var izmantot piezīmēm.'
                    },
                    {
                        type: 'heading',
                        text: 'Kas Netiek Importēts'
                    },
                    {
                        type: 'list',
                        items: [
                            'GV numuri — tos piešķir sistēma pati, faila secībā',
                            'Datnes (faili) — imports veido tikai aprakstus',
                            'Saistītās glabājamās vienības'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Rīka izveidoto uzskaites saraksta eksportu (XLSX veidlapu) importēt atpakaļ NEVAR — tajā vairākas vērtības ir apvienotas vienā šūnā. Lietojiet paraugfailu.'
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja garumzīmes izskatās sabojātas, saglabājiet failu no Excel kā "CSV UTF-8", nevis kā parasto "CSV". Rīks mēģina atpazīt arī veco kodējumu, bet droši ir saglabāt UTF-8.'
                            }
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
        icon: 'fa-file-alt',
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
                    },
                    {
                        type: 'annotated-screen',
                        title: 'Dokumenta ieraksta forma (Tekstuāls saraksts)',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Jauns ieraksts</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Nosaukums: Iesniegums Nr. 45</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Datums: 12.03.2024</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Reģ. Nr.: 3-4/128</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Valoda: Latviešu</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Pieejamība: Vispārēja</span>
                                    <span class="help-callout-marker">⑤</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.record.title.detail },
                            { marker: '②', text: FIELD_HELP.record.date.detail },
                            { marker: '③', text: FIELD_HELP.record.reg_nr.detail },
                            { marker: '④', text: FIELD_HELP.record.language.detail },
                            { marker: '⑤', text: FIELD_HELP.record.access_restriction.detail },
                        ]
                    },
                    {
                        type: 'annotated-screen',
                        title: 'Mediju ieraksta forma (Foto/Skaņas/Video saraksts)',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Jauns mediju ieraksts — 2. solis: metadati</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Krāsa: Krāsains</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Horizontālā izšķirtspēja: 1920</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Vertikālā izšķirtspēja: 1080</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Ilgums: 00:05:30</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: FIELD_HELP.mediaRecord.color.detail },
                            { marker: '②', text: FIELD_HELP.mediaRecord.horizontal_resolution.detail },
                            { marker: '③', text: FIELD_HELP.mediaRecord.vertical_resolution.detail },
                            { marker: '④', text: FIELD_HELP.mediaRecord.duration.detail },
                        ]
                    }
                ]
            },
            {
                id: 'batch-records',
                title: 'Vairāku Ierakstu Izveide un Rediģēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Tekstuālos elektroniskos ierakstus var izveidot un rediģēt vairākus vienlaikus. Foto, video un skaņas ierakstiem tas nav pieejams — tur vienai glabājamai vienībai ir tieši viens ieraksts.'
                    },
                    {
                        type: 'heading',
                        text: 'Vairāku Ierakstu Izveide'
                    },
                    {
                        type: 'steps',
                        items: [
                            'Ierakstu saraksta galvenē nospiediet "+" un izvēlieties "Izveidot vairākus ierakstus"',
                            'Aizpildiet kopīgos laukus — datums, izveidošanas un nosūtīšanas datums, valoda, lietas nr., pieejamība un citi',
                            'Pievienojiet rindas: ielīmējiet nosaukumu sarakstu (otrā kolonna no Excel kļūst par reģistrācijas numuru), ģenerējiet pēc šablona vai izvēlieties datnes',
                            'Izvēloties datnes, katra datne kļūst par atsevišķu ierakstu — nosaukums tiek ņemts no datnes nosaukuma un datne tiek pievienota ierakstam',
                            'Nospiediet "Izveidot" — ieraksti tiek veidoti pa vienam, un progress ir redzams'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ieraksta datumam jābūt glabājamās vienības datumu robežās. Izveidošanas datums, nosūtīšanas datums, valoda, lietas nr. un pieejamība ir obligāti — bez tiem ierakstu nevar saglabāt.'
                            }
                        ]
                    },
                    {
                        type: 'heading',
                        text: 'Vairāku Ierakstu Rediģēšana'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atzīmējiet ierakstus ar ķeksīšiem',
                            'Galvenē kolonnu pogas vietā parādās zīmuļa poga ar atlasīto skaitu',
                            'Atzīmējiet tikai tos laukus, ko mainīt — pārējie katram ierakstam paliks nemainīti',
                            'Pārskata solī redzams, cik ierakstiem katrs lauks mainīsies un kuri tiks izlaisti kļūdu dēļ'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Nosaukumu un reģistrācijas numuru masveidā mainīt nevar — tie katram ierakstam ir unikāli.'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'csv-import-records',
                title: 'Ierakstu Imports no CSV / Excel (eksperimentāls)',
                content: [
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Imports ir EKSPERIMENTĀLA funkcija un nav rādītājs pārējā rīka kvalitātei. Pēc importa rezultāts obligāti jāpārbauda. Atsaukt nevar.'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Glabājamās vienības dokumentu cilnē var importēt ierakstus no tabulas faila. Visas faila rindas tiek pievienotas tieši šai vienībai, tāpēc kolonnas SAITE un TIPS šeit nav vajadzīgas.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Ieslēdziet funkciju Iestatījumos → Eksperimentāli',
                            'Dokumentu cilnē nospiediet "+" un izvēlieties "Importēt ierakstus no CSV / Excel faila"',
                            'Obligātās kolonnas: NOSAUKUMS, DATUMS, REĢ_NR, IZVEIDOŠANAS_DATUMS, NOSŪTĪŠANAS_DATUMS, LIETAS_NR, VALODA',
                            'Dokumenta datumam jābūt glabājamās vienības datumu robežās',
                            'Ja PIEEJAMĪBA ir "Ierobežota", jānorāda arī IEROBEŽOJUMA_DATUMS; ja "Vispārēja" — tam jābūt tukšam'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Datnes (failus) imports nepievieno — tikai aprakstus. Datnes jāpievieno atsevišķi katram ierakstam vai izmantojot "Izveidot vairākus ierakstus" ar datņu izvēli.'
                            }
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
                            'Nosaukums (obligāts, līdz 500 rakstzīmēm)',
                            'Datums (obligāts)',
                            'Valoda (obligāta)',
                            'Reģistrācijas numurs (nav obligāts)',
                            'Grupa (nav obligāta, līdz 30 rakstzīmēm)',
                            'Nosūtīšanas Datums (nav obligāts)',
                            'Nosūtīšanas Reģ. Nr. (nav obligāts, līdz 30 rakstzīmēm)',
                            'Anotācija (līdz 500 rakstzīmēm)',
                            'Atslēgvārdi',
                            'Piezīmes (līdz 500 rakstzīmēm)',
                            'Tehniskā informācija (līdz 500 rakstzīmēm)'
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
                        text: 'Faila izmēram nav ierobežojuma'
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
                    },
                    {
                        type: 'heading',
                        text: 'Failu Glabāšana Diskā'
                    },
                    {
                        type: 'paragraph',
                        text: 'Augšupielādētie faili tiek kopēti uz projekta direktoriju jūsu datorā. Gala OPEX struktūra ar fonda, uzskaites saraksta un vienības mapēm tiek izveidota tikai OPEX pakotnes ģenerēšanas laikā.'
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Nepārvietojiet un nepārdēvējiet projekta failus manuāli ārpus programmas. Ja faili tiek pārvietoti, pārbaudes skatā tie tiks parādīti kā trūkstoši, un tie būs jāpievieno atkārtoti.'
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
                            'Faila izmēram nav ierobežojuma',
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
        icon: 'fa-check-circle',
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
                id: 'dismiss-warnings',
                title: 'Brīdinājumu Ignorēšana',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Brīdinājumus (dzeltenos) var ignorēt, ja tie ir apzināti un nav jālabo — piemēram, ieraksts bez faila, jo fiziskais oriģināls nav digitalizēts.'
                    },
                    {
                        type: 'list',
                        items: [
                            'Atveriet kļūdu paneli elementam ar brīdinājumiem',
                            'Noklikšķiniet uz ignorēšanas pogas pie atsevišķa brīdinājuma, lai to ignorētu',
                            'Vai izmantojiet "ignorēt visus", lai ignorētu visus elementa brīdinājumus',
                            'Ignorētie brīdinājumi tiek paslēpti, un to skaits parādās kā "N ignorēti"'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ignorētie brīdinājumi tiek saglabāti lokāli un saglabājas starp sesijām. Lai tos atjaunotu, noklikšķiniet uz "Atjaunot ignorētos brīdinājumus" kļūdu panelī.'
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'warning',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Kļūdas (sarkanās) NEVAR ignorēt — tās obligāti jāizlabo pirms OPEX eksportēšanas.'
                            }
                        ]
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
                    },
                    {
                        type: 'heading',
                        text: 'OPEX Pakotnes Ģenerēšanas Progress'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ģenerējot pilnu OPEX pakotni, atveras progresa logs, kas reālā laikā rāda apstrādes gaitu. Logs bloķē darbību, līdz ģenerēšana ir pabeigta vai radusies kļūda.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Progresa logā redzams:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Statistika — pagājušais laiks, apstrādāto failu skaits un kļūdu skaits',
                            'Kopējā progresa josla ar apstrādāto failu skaitu (piemēram, 42 no 120)',
                            'Pašlaik apstrādājamais fails ar pilnu ceļu (US → GV → ieraksts → fails)',
                            'Progress pa katru uzskaites sarakstu atsevišķi',
                            'Pēdējie veiksmīgi apstrādātie faili',
                            'Arhivēšanas (ZIP) progress procentos pēc failu kopēšanas'
                        ]
                    },
                    {
                        type: 'steps',
                        steps: [
                            'Pirms ģenerēšanas tiek veikta validācija — ja ir kļūdas, ģenerēšana netiek sākta un logā parādās izlabojamo kļūdu saraksts',
                            'Faili tiek kopēti uz OPEX struktūru pa vienam (redzams faila ceļš un progress)',
                            'Pēc kopēšanas pakotne tiek arhivēta ZIP formātā',
                            'Pēc pabeigšanas logā parādās kopsavilkums un ZIP faila atrašanās vieta'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Gatavā ZIP pakotne tiek saglabāta projekta direktorijas apakšmapē "opex_export". Logu var aizvērt tikai pēc ģenerēšanas pabeigšanas vai kļūdas — neaizveriet pārlūku, kamēr norit apstrāde.'
                            }
                        ]
                    },
                    {
                        type: 'note',
                        style: 'error',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Ja ģenerēšana neizdodas, logā tiek parādīts, cik failu tika apstrādāti pirms kļūdas, un saraksts ar failiem, kuriem radās problēmas. Izlabojiet norādītos failus un mēģiniet vēlreiz.'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'fond-institution',
        title: 'Fonds un Iestāde',
        icon: 'fa-building',
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
                        type: 'annotated-screen',
                        title: 'Fonda skats (tikai lasāms kopsavilkums)',
                        mockup: `
                            <div class="help-mock-panel">
                                <div class="help-mock-topbar">
                                    <span>Latvijas Valsts arhīvs 1 "Demonstrācijas fonds"</span>
                                    <span class="help-callout-marker">①</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Uzskaites saraksti: 5</span>
                                    <span class="help-callout-marker">②</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>Iepriekšējās fondā importētās GV: 12</span>
                                    <span class="help-callout-marker">③</span>
                                </div>
                                <div class="help-mock-row">
                                    <span>GV šajā nodevumā: 8</span>
                                    <span class="help-callout-marker">④</span>
                                </div>
                            </div>
                        `,
                        callouts: [
                            { marker: '①', text: 'Arhīva nosaukums, fonda numurs un nosaukums — importēti no VVAIS atskaites, nav rediģējami šajā skatā.' },
                            { marker: '②', text: 'Cik uzskaites sarakstu šobrīd pieder šim fondam.' },
                            { marker: '③', text: 'Glabājamās vienības, kas fondā bija jau pirms šī projekta (importētas atskaitē, bet nav šī nodevuma daļa).' },
                            { marker: '④', text: 'Glabājamās vienības, kas izveidotas/pievienotas šajā projektā (šī nodevuma apjoms).' },
                        ]
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
                id: 'fond-signers',
                title: 'Iestādes Parakstītāji',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Lai sagatavotos OPEX eksportēšanai, obligāti jānorāda informācija par dokumentu izveidotāju un parakstītāju. Šī informācija tiek izmantota ģenerējot pieņemšanas-nodošanas aktu.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Detalizēts parakstītāju dialoga un formas apraksts ar piemēriem ir pieejams sadaļā "Projektu Pārvaldība → Institūcijas Parakstītāji". Šī sadaļa apkopo obligātos laukus, to ierobežojumus un izmantojumu.'
                            }
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
        icon: 'fa-compass',
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
            },
            {
                id: 'quick-jump',
                title: 'Ātrā Pārlēkšana (Meklēšana)',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Projekta augšdaļā atrodas ātrās pārlēkšanas meklēšanas lauks, kas ļauj ātri atrast un atvērt jebkuru elementu projektā — uzskaites sarakstu, glabājamo vienību vai dokumentu.'
                    },
                    {
                        type: 'heading',
                        text: 'Kā Lietot'
                    },
                    {
                        type: 'steps',
                        steps: [
                            'Noklikšķiniet uz meklēšanas lauka projekta augšdaļā',
                            'Sāciet rakstīt nosaukumu vai numuru',
                            'Rezultāti tiek filtrēti uzreiz un sagrupēti pēc veida (uzskaites saraksti, glabājamās vienības, dokumenti)',
                            'Noklikšķiniet uz rezultāta (vai nospiediet Enter), lai pārietu tieši uz to'
                        ]
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'Meklēšanas lauka norādē redzams pašreizējais elementu skaits projektā — cik tajā ir uzskaites sarakstu, glabājamo vienību un dokumentu.'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'terminology',
        title: 'Terminoloģija',
        icon: 'fa-book',
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
        icon: 'fa-balance-scale',
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
        icon: 'fa-life-ring',
        sections: [
            {
                id: 'support',
                title: 'Tehniskā Atbalsta',
                content: [
                    {
                        type: 'paragraph',
                        text: 'Ja jums ir jautājumi par OPEX rīka izmantošanu, vispirms pārlūkojiet šo palīdzības sadaļu — meklēšana (Ctrl+K) ļauj ātri atrast vajadzīgo tematu.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Ja atbilde nav atrodama, sazinieties ar savas iestādes arhīva atbildīgo personu vai IT atbalstu, kas uztur šo rīku.'
                    },
                    {
                        type: 'note',
                        style: 'info',
                        content: [
                            {
                                type: 'paragraph',
                                text: 'OPEX rīks darbojas lokāli jūsu datorā. Visi projekta dati un faili tiek glabāti jūsu norādītajā projekta direktorijā.'
                            }
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
                        text: 'Nododiet savus priekšlikumus savas iestādes arhīva atbildīgajai personai vai rīka uzturētājam.'
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
                        text: 'Šī palīdzības sadaļa ir galvenais dokumentācijas avots par OPEX rīka lietošanu. Tā aptver visu darba plūsmu — no projekta izveides līdz OPEX pakotnes ģenerēšanai.'
                    },
                    {
                        type: 'paragraph',
                        text: 'Noderīgākās sadaļas:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Darba Sākšana — ievads un pirmie soļi',
                            'Aprakstīšanas Process — pilna darba plūsma un labākā prakse',
                            'Terminoloģija — biežāk lietoto terminu skaidrojums',
                            'Tastatūras Saīsnes — ātrākai darbībai'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'bug-reports',
        title: 'Kļūdu Paziņojumi',
        icon: 'fa-bug',
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
                            'Nododiet ziņojumu rīka uzturētājam vai iestādes IT atbalstam'
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
                            'Ļoti lieli faili var palēnināt augšupielādi un OPEX pakotnes ģenerēšanu',
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
                                    'Nekavējoties informējiet rīka uzturētāju vai iestādes IT atbalstu',
                                    'Neveiciet nekādas manuālas izmaiņas projekta direktorijā',
                                    'Saglabājiet kļūdas ziņojumu un ekrānuzņēmumu',
                                    'Gaidiet norādījumus pirms turpināt darbu'
                                ]
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        text: 'Kā rīkoties kritiskas kļūdas gadījumā:'
                    },
                    {
                        type: 'list',
                        items: [
                            'Pierakstiet, kādas darbības izraisīja kļūdu, un saglabājiet ekrānuzņēmumu',
                            'Nemainiet projekta direktorijas saturu manuāli — tas var sabojāt datus',
                            'Ja iespējams, izveidojiet projekta direktorijas dublējuma kopiju',
                            'Informējiet rīka uzturētāju vai iestādes IT atbalstu'
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
                    { type: 'paragraph', text: 'Brīdinājumi neietekmē OPEX ģenerēšanu — tie ir informatīvi un kalpo kā kvalitātes kontrole.' },
                    { type: 'note', style: 'info', content: [
                        { type: 'paragraph', text: 'Šie sliekšņi ir tikai brīdinājumi un neierobežo augšupielādi — failu izmēram nav stingra ierobežojuma, un jūs varat augšupielādēt jebkura izmēra failus. Brīdinājumi tikai palīdz pamanīt neparasti lielus vai mazus failus.' }
                    ]}
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
                        ['↑ / ↓', 'Pāriet uz iepriekšējo/nākamo uzskaites sarakstu', 'Uzskaites sarakstu sarakstā'],
                        ['← / →', 'Pāriet uz iepriekšējo/nākamo glabājamo vienību', 'Glabājamās vienības skatā'],
                        ['← / →', 'Pāriet uz iepriekšējo/nākamo ierakstu', 'Ieraksta skatā (rediģējot — saglabā un pāriet)'],
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

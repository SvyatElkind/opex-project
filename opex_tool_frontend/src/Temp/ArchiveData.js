const archiveData = [
  {
    id: 1,
    number: 101,
    createdTime: "2023-01-15T10:00:00Z",
    dateRelates: "2023-01-01",
    records: [
      {
        id: 1,
        name: 'Dokuments A',
        fileType: 'PDF',
        createdBy: 'Lietotājs1',
        annotation: 'Svarīgs dokuments',
        description: 'Šis ir apraksts par Dokumentu A.',
        title: 'Dokuments A Nosaukums',
        createdTime: "2023-01-15T10:30:00Z"
      },
      {
        id: 2,
        name: 'Dokuments B',
        fileType: 'Word',
        createdBy: 'Lietotājs2',
        annotation: 'Konfidenciāls',
        description: 'Šis dokuments apspriež sensitīvu informāciju.',
        title: 'Dokuments B Nosaukums',
        createdTime: "2023-01-16T11:00:00Z"
      }
    ]
  },
  {
    id: 2,
    number: 102,
    createdTime: "2023-02-10T12:00:00Z",
    dateRelates: "2023-02-01",
    records: [
      {
        id: 3,
        name: 'Aizpildāma C',
        fileType: 'Excel',
        createdBy: 'Lietotājs3',
        annotation: '',
        description: 'Datu analīze finanšu gadam.',
        title: 'Aizpildāma C Nosaukums',
        createdTime: "2023-02-10T12:30:00Z"
      }
    ]
  },
  {
    id: 3,
    number: 103,
    createdTime: "2023-03-05T15:00:00Z",
    dateRelates: "2023-03-01",
    records: [
      {
        id: 4,
        name: 'Attēls D',
        fileType: 'JPEG',
        createdBy: 'Lietotājs1',
        annotation: 'Prezentācijai',
        description: 'Attēls, kas saistīts ar projekta prezentāciju.',
        title: 'Attēls D Nosaukums',
        createdTime: "2023-03-05T15:10:00Z"
      }
    ]
  },
  {
    id: 4,
    number: 104,
    createdTime: "2023-04-20T09:00:00Z",
    dateRelates: "2023-04-01",
    records: [
      {
        id: 5,
        name: 'Dokuments E',
        fileType: 'Text',
        createdBy: 'Lietotājs4',
        annotation: 'Svarīga informācija',
        description: 'Dokuments ar būtisku informāciju.',
        title: 'Dokuments E Nosaukums',
        createdTime: "2023-04-20T09:15:00Z"
      }
    ]
  },
  {
    id: 5,
    number: 105,
    createdTime: "2023-05-12T14:00:00Z",
    dateRelates: "2023-05-01",
    records: [
      {
        id: 6,
        name: 'Prezentācija F',
        fileType: 'PowerPoint',
        createdBy: 'Lietotājs5',
        annotation: 'Par projektu',
        description: 'Prezentācija par jaunajiem projektiem.',
        title: 'Prezentācija F Nosaukums',
        createdTime: "2023-05-12T14:30:00Z"
      }
    ]
  },
  {
    id: 6,
    number: 106,
    createdTime: "2023-06-15T11:00:00Z",
    dateRelates: "2023-06-01",
    records: [
      {
        id: 7,
        name: 'Attēls G',
        fileType: 'PNG',
        createdBy: 'Lietotājs6',
        annotation: 'Ilustrācija',
        description: 'Ilustrācija, kas paskaidro procesu.',
        title: 'Attēls G Nosaukums',
        createdTime: "2023-06-15T11:10:00Z"
      }
    ]
  },
  {
    id: 7,
    number: 107,
    createdTime: "2023-07-10T09:00:00Z",
    dateRelates: "2023-07-01",
    records: [
      {
        id: 8,
        name: 'Dokuments H',
        fileType: 'PDF',
        createdBy: 'Lietotājs7',
        annotation: 'Svarīgs pārskats',
        description: 'Dokuments satur svarīgu pārskatu.',
        title: 'Dokuments H Nosaukums',
        createdTime: "2023-07-10T09:15:00Z"
      }
    ]
  },
  {
    id: 8,
    number: 108,
    createdTime: "2023-07-20T13:00:00Z",
    dateRelates: "2023-07-01",
    records: [
      {
        id: 9,
        name: 'Prezentācija I',
        fileType: 'PowerPoint',
        createdBy: 'Lietotājs8',
        annotation: 'Prezentācija par uzņēmumu',
        description: 'Apskatāma uzņēmuma prezentācija.',
        title: 'Prezentācija I Nosaukums',
        createdTime: "2023-07-20T13:10:00Z"
      }
    ]
  },
  {
    id: 9,
    number: 109,
    createdTime: "2023-08-05T08:00:00Z",
    dateRelates: "2023-08-01",
    records: [
      {
        id: 10,
        name: 'Izpētes dokuments J',
        fileType: 'TXT',
        createdBy: 'Lietotājs9',
        annotation: 'Izpētītā informācija',
        description: 'Dokuments par izpēti tika veikts.',
        title: 'Dokuments J Nosaukums',
        createdTime: "2023-08-05T08:15:00Z"
      }
    ]
  },
  {
    id: 10,
    number: 110,
    createdTime: "2023-08-15T14:00:00Z",
    dateRelates: "2023-08-01",
    records: [
      {
        id: 11,
        name: 'Attēls K',
        fileType: 'JPEG',
        createdBy: 'Lietotājs5',
        annotation: 'Ilustrācija par projektu',
        description: 'Attēls, kas ilustrē projekta gaitu.',
        title: 'Attēls K Nosaukums',
        createdTime: "2023-08-15T14:10:00Z"
      }
    ]
  },
  {
    id: 11,
    number: 111,
    createdTime: "2023-09-01T12:00:00Z",
    dateRelates: "2023-09-01",
    records: [
      {
        id: 12,
        name: 'Dokuments L',
        fileType: 'PDF',
        createdBy: 'Lietotājs10',
        annotation: 'Regulārs pārskats',
        description: 'Regulārais pārskats par veikto darbu.',
        title: 'Dokuments L Nosaukums',
        createdTime: "2023-09-01T12:30:00Z"
      }
    ]
  }, 
  {
    id: 12,
    number: 112,
    createdTime: "2023-09-10T10:00:00Z",
    dateRelates: "2023-09-01",
    records: [
      {
        id: 13,
        name: 'Dokuments M',
        fileType: 'Word',
        createdBy: 'Lietotājs11',
        annotation: 'Interesanta annotation: Interesanta informācija',
        description: 'Dokuments, kas satur interesantu informāciju.',
        title: 'Dokuments M Nosaukums',
        createdTime: "2023-09-10T10:30:00Z"
      }
    ]
  },
  {
    id: 13,
    number: 113,
    createdTime: "2023-09-20T16:00:00Z",
    dateRelates: "2023-09-10",
    records: [
      {
        id: 14,
        name: 'Dokuments N',
        fileType: 'Excel',
        createdBy: 'Lietotājs12',
        annotation: '',
        description: 'Datu analīze par projektu.',
        title: 'Dokuments N Nosaukums',
        createdTime: "2023-09-20T16:05:00Z"
      }
    ]
  },
  {
    id: 14,
    number: 114,
    createdTime: "2023-10-01T14:00:00Z",
    dateRelates: "2023-10-01",
    records: [
      {
        id: 15,
        name: 'Prezentācija O',
        fileType: 'PowerPoint',
        createdBy: 'Lietotājs13',
        annotation: 'Par jauniem projektiem',
        description: 'Prezentācija, kas apspriež jaunos projektus.',
        title: 'Prezentācija O Nosaukums',
        createdTime: "2023-10-01T14:15:00Z"
      }
    ]
  },
  {
    id: 15,
    number: 115,
    createdTime: "2023-10-10T10:00:00Z",
    dateRelates: "2023-10-05",
    records: [
      {
        id: 16,
        name: 'Attēls P',
        fileType: 'PNG',
        createdBy: 'Lietotājs14',
        annotation: 'Ilustrācija par produkta dizainu',
        description: 'Attēls, kas attēlo jauno produkta dizainu.',
        title: 'Attēls P Nosaukums',
        createdTime: "2023-10-10T10:05:00Z"
      }
    ]
  },
  {
    id: 16,
    number: 116,
    createdTime: "2023-10-15T09:00:00Z",
    dateRelates: "2023-10-10",
    records: [
      {
        id: 17,
        name: 'Dokuments Q',
        fileType: 'PDF',
        createdBy: 'Lietotājs15',
        annotation: 'Svarīga informācija',
        description: 'Dokuments, kas satur svarīgu informāciju par tirgus pētījumiem.',
        title: 'Dokuments Q Nosaukums',
        createdTime: "2023-10-15T09:15:00Z"
      }
    ]
  },
  {
    id: 17,
    number: 117,
    createdTime: "2023-10-20T11:00:00Z",
    dateRelates: "2023-10-15",
    records: [
      {
        id: 18,
        name: 'Prezentācija R',
        fileType: 'PowerPoint',
        createdBy: 'Lietotājs16',
        annotation: 'Apspriede par tirgus tendencēm',
        description: 'Prezentācija, kas apspriež tirgus tendences.',
        title: 'Prezentācija R Nosaukums',
        createdTime: "2023-10-20T11:15:00Z"
      }
    ]
  },
  {
    id: 18,
    number: 118,
    createdTime: "2023-10-25T13:00:00Z",
    dateRelates: "2023-10-20",
    records: [
      {
        id: 19,
        name: 'Dokuments S',
        fileType: 'TXT',
        createdBy: 'Lietotājs17',
        annotation: 'Projekta kopsavilkums',
        description: 'Dokuments satur projekta kopsavilkumu.',
        title: 'Dokuments S Nosaukums',
        createdTime: "2023-10-25T13:05:00Z"
      }
    ]
  },
  {
    id: 19,
    number: 119,
    createdTime: "2023-10-30T10:00:00Z",
    dateRelates: "2023-10-25",
    records: [
      {
        id: 20,
        name: 'Attēls T',
        fileType: 'JPEG',
        createdBy: 'Lietotājs18',
        annotation: 'Ilustrācija par projektu',
        description: 'Attēls, kas ilustrē projekta pabeigšanu.',
        title: 'Attēls T Nosaukums',
        createdTime: "2023-10-30T10:05:00Z"
      }
    ]
  },
  {
    id: 20,
    number: 120,
    createdTime: "2023-11-01T09:00:00Z",
    dateRelates: "2023-10-31",
    records: [
      {
        id: 21,
        name: 'Dokuments U',
        fileType: 'Word',
        createdBy: 'Lietotājs19',
        annotation: 'Projektu apskats',
        description: 'Dokuments, kas satur projektu apskatu.',
        title: 'Dokuments U Nosaukums',
        createdTime: "2023-11-01T09:10:00Z"
      }
    ]
  }
];

export default archiveData;
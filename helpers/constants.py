"""Module contains constants used in all apps"""

# Database retry parameters
TRIES = 3
DELAY = 1

# Error messages
MSG_E_UNEXPECTED = 'Neparedzētā kļūda'
MSG_E_VALUE_PROVIDED = 'Nepareizā vērtība'
NO_VALUE = 'No value'
MSG_E_EMPTY_FIELDS = 'Nav aizpildīti lauki: {}.'
MSG_E_REDUNDANT_FIELDS = 'Ir saņemti neparedzētie lauki.'
MSG_E_NO_ID = 'Nav norādīts {} instances ID.'
MSG_E_OBJECT_DOES_NOT_EXIST = '{} instance ar doto ID neeksistē.'
MSG_E_OBJECT_NUMBER = 'Nepareizs {} numurs.'

# Serializers
FIELDS = 'fields'

# View error messages
MSG_E_UNPREDICTIBLE_ERROR_OCCURED = "Neparedzētā kļūda. Mēģiniet vēlreiz."
MSG_E_DENIED_ACTION = "Dotais objekts nepieder šim projektam."

# Response keys
ERROR = 'error'
SUCCESS = 'success'

# VVAIS defined values
PHOTO = 'Foto'
AUDIO = 'Skaņas'
TEXT = 'Tekstuāls'
VIDEO = 'Video'
DATABASE = 'Datubāze'

VVAIS_TYPE_LIST = [PHOTO, AUDIO, TEXT, VIDEO, DATABASE]
VVAIS_MEDIA_LIST = ['papīrs', 'elektronisks']
VVAIS_STORAGE_TERM_LIST = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas']

_LVA = 'LVA'
_LVVA = 'LVVA'
_PDVA = 'PDVA'
_KFFDA = 'KFFDA'
_VZVA = 'VZVA'
_LZVA = 'LZVA'
_JZVA = 'JZVA'
_TZVA = 'TZVA'
_CZVA = 'CZVA'
_JEZVA = 'JEZVA'
_AZVA = 'AZVA'
_RZVA = 'RZVA'
_DZVA = 'DZVA'
_ZRA = 'ZRA'
_VAZVA = 'VAZVA'
_SZVA = 'SZVA'

ARCH_ABBREVIATION_LIST = [
    _LVA,
    _LVVA,
    _PDVA,
    _KFFDA,
    _VZVA,
    _LZVA,
    _JZVA,
    _TZVA,
    _CZVA,
    _JEZVA,
    _AZVA,
    _RZVA,
    _DZVA,
    _ZRA,
    _VAZVA,
    _SZVA
]

ARCH_TITLE_DICT = {
    _LVA: 'Latvijas Valsts arhīvs',
    _LVVA: 'Latvijas Valsts vēstures arhīvs',
    _PDVA: 'Personāla dokumentu valsts arhīvs',
    _KFFDA: 'Latvijas Valsts kinofotofonodokumentu arhīvs',
    _VZVA: 'Ventspils zonālais valsts arhīvs',
    _LZVA: 'Liepājas zonālais valsts arhīvs',
    _JZVA: 'Jelgavas zonālais valsts arhīvs',
    _TZVA: 'Tukuma zonālais valsts arhīvs',
    _CZVA: 'Cēsu zonālais valsts arhīvs',
    _JEZVA: 'Jēkabpils zonālais valsts arhīvs',
    _AZVA: 'Alūksnes zonālais valsts arhīvs',
    _RZVA: 'Rēzeknes zonālais valsts arhīvs',
    _DZVA: 'Daugavpils zonālais valsts arhīvs',
    _ZRA: 'Zemgales reģionālais arhīvs',
    _VAZVA: 'Valmieras zonālais valsts arhīvs',
    _SZVA: 'Siguldas zonālais valsts arhīvs'
 }

# Scurity level
ITEM_SECURITY_LEVEL_LIST = [
    'Publisks',
    'Iekšējs',
    'Konfidenciāls',
    'Slepens',
    'Sevišķi slepens'
]
ITEM_RESTRICTION_LIST = [
    'Vispārēja',
    'Ierobežota',
    'Sensitīvi dati'
]

RECORD_FOLDER = 'records'

"""Module contains constants used in all apps"""

# DB retry parameteri
TRIES = 3
DELAY = 1

# Logger messages
UNEXPECTED_ERROR_MSG = 'Unexpected exception occured'
WRONG_VALUE_PROVIDED = 'Nepareizā vērtība'
WRONG_DATA_TYPE = 'Nepareizs datu tips'

# VVAIS klasifikatori
VVAIS_TYPE = ['foto', 'skaņas', 'tekstuāls', 'video', 'datubāze']
VVAIS_MEDIA = ['papīrs', 'elektronisks']
VVAIS_STORAGE_TERM = ['Pastāvīgi glabājamās lietas', 'Ilgstoši glabājamās lietas']

_LVA = 'LVA'
_LVVA = 'LVVA'
_PDVA = 'PDVA'
_LVKFFDA = 'LVKFFDA'
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
    _LVKFFDA,
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
    _LVKFFDA: 'Latvijas Valsts kinofotofonodokumentu arhīvs',
    _VZVA: 'Ventspils zonālais valsts arhīvs',
    _LZVA: 'Liepājas zonālais valsts arhīvs',
    _JZVA: 'Jelgavas zonālais valsts arhīvs',
    _TZVA: 'Tukuma zonālais valsts arhīvs',
    _CZVA: 'Cēsu zonālais valsts arhīvs',
    _JEZVA: 'Jēkabpils zonālais valsts arhīvs',
    _AZVA: 'Alūksnes zonālais valsts arhīvs',
    _RZVA: 'Rēzeknes zonālais valsts arhīvs',
    _DZVA: 'Daugavpils zonālais valsts arhīvs',
    _ZRA: 'Zemgalse reģionālais arhīvs',
    _VAZVA: 'Valmieras zonālais valsts arhīvs',
    _SZVA: 'Siguldas zonālais valsts arhīvs'
 }

# ERROR MESSAGES
NO_VALUE = 'No value'

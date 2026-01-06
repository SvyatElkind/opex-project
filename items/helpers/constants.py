"""Module contains constants used in items app."""

import datetime
from decimal import Decimal


RELATED_ITEM_LIST = 'related_item_list'

# Item class CharFields max length
ITEM_SERIES_CODE_LENGTH = 20
ITEM_TITLE_LENGTH = 1000
ITEM_NOTES_LENGTH = 1000
ITEM_DATE_INDICATOR_LENGTH = 5
ITEM_DATE_NOTE_LENGTH = 1000
ITEM_UNIT_OF_MEASURE_LENGTH = 20
ITEM_ANNOTATION_LENGTH = 2000
ITEM_SISTEMATISATION_LENGTH = 500
ITEM_PHYSICAL_DESCRIPTION_LENGTH = 1000
ITEM_LANGUAGE_LENGTH = 500
ITEM_RESTRICTION_LENGTH = 10
ITEM_RESTRICTION_NOTE_LENGTH = 500
ITEM_SECURITY_LEVEL_LENGTH = 10
ITEM_SECURITY_LEVEL_NOTE_LENGTH = 500
ITEM_COPY_LENGTH = 1000
ITEM_ARCHIVAL_HISTORY_LENGTH = 2000
ITEM_FORMAT_LENGTH = 10
ITEM_COLOR_LENGTH = 10
ITEM_DURATION_LENGTH = 8
ITEM_RESOLUTION_LENGTH = 20

# Item class default field values
DEFAULT_BLANK = ''
ITEM_RESTRICTION_DEFAULT_VALUE = 'Vispārēja'
ITEM_SIZE_DEFAULT_VALUE = Decimal('0.00')
ITEM_LANGUAGE_DEFAULT_VALUE = DEFAULT_BLANK
ITEM_SECURITY_LEVEL_DEFAULT_VALUE = 'Publisks'
ITEM_ANNOTATION_DEFAULT_VALUE = DEFAULT_BLANK
ITEM_UNIT_OD_MEASURE_DEFAULT_VALUE = DEFAULT_BLANK
ITEM_UNIT_OD_MEASURE_DEFAULT_VALUE = DEFAULT_BLANK
ITEM_FORMAT_DEFULT_VALUE = DEFAULT_BLANK
ITEM_COLOR_DEFULT_VALUE = DEFAULT_BLANK
ITEM_DURATION_DEFULT_VALUE = '00:00:00'
ITEM_RESOLUTION_DEFULT_VALUE = DEFAULT_BLANK
ITEM_DATE_DEFAULT_VALUE = datetime.date(2049, 1, 1)
ITEM_DATE_INDICATOR_VALUE = 'day'
ITEM_UTIN_OF_MEASURE = 'Lapas'

# Regular expression
REGEX_SERIES_CODE = r'^(?!0\d*$)(\d{1,2}\.)*\d{1,2}$'
REGEX_DURATION = r'^\d{1,2}:[0-5]\d:[0-5]\d$'

# Validation constants
REQUIERE_ANNOTATION_TYPE = ['Foto', 'Skaņas', 'Video']
REQUIERE_FORMAT_TYPE = ['Foto', 'Skaņas', 'Video']
REQUIERE_DURATION_TYPE =  ['Skaņas', 'Video']
REQUIERE_COLOR_TYPE =  ['Foto', 'Video']
REQUIERE_RESLOLUTION_TYPE = ['Foto', 'Video']
NOT_REQUIERE_LANGUAGE_TYPE = 'Foto'
COLOR_FIELD_VALUES = ['melnbaltā', 'krāsainā']
DATE_INDICATOR_VALUES = ['year', 'month', 'day']
UNIT_OF_MEASURE_VALUES = ['Lapas', 'Dokumenti', 'Glabājamās vienības']

# Error messages
MSG_E_ITEM_EXISTS = 'Glabājamā vienība ar numuru {} jau eksistē.'
MSG_E_ITEM_LIST_SEQUENCE = 'Glabājamo vienību numuri nav secīgi.'
MSG_E_ITEM_NUMBER = 'Glabājamās vienības numurs nav secīgs.'
MSG_E_ITEM_SERIES_CODE = 'Sērijas kods neatbilst prasībām.'
MSG_E_NOT_A_STRING = 'Dotā vērtība nav simbolu virkne.'
MSG_E_LONG_VALUE = 'Vērtība ir garāka par {} simboliem.'
MSG_E_UNIT_OF_MEASURE_VALUE = 'Nepieļaujamā vērtība.'
MSG_E_RESTRICTION_VALUE = 'Nav norādīts ierobežojuma pamatojums un datums.'
MSG_E_SECUTIRY_LEVEL_VALUE = 'Nepareizi norādīta pieejamības vērtība.'
MSG_E_ITEM_SIZE_VALUE_FOR_PAPER = 'Glabājamās vienības apjomam jābūt veselam skaitlim'
MSG_E_ITEM_ANNOTATION_REQUIRED = 'Glabājamās vienības saturs nav aizpildīts.'
MSG_E_ITEM_LANGUAGE_REQUIRED = 'Glabājamās vienības valoda nav norādīta.'
MSG_E_ITEM_DATE_VALUE = 'Glabājamās vienības datums no nevar būt vēlāks par datumau līdz.'
MSG_E_ITEM_DATE_INVENTORY_DATE = 'Glabājamās vienības datums nevar būt vēlāks par uzskaites saraksta beigu datumu.'
MSG_E_ITEM_DATE_VALUE_DEFAULT = 'Glabājamās vienības datoms nav norādīts.'
MSG_E_ITEM_DURATION_VALUE = 'Glabājamās vienības skanēšanas ilgums norādīts nepareizi.'
MSG_E_ITEM_COLOR_REQUIRED = 'Glabājamās vienības krāsa nav norādīta.'
MSG_E_ITEM_FORMAT_REQUIRED = 'Glabājamās vienības formāts nav norādīts.'
MSG_E_ITEM_RESOLUTION_REQUIRED = 'Glabājamās vienības izšķirtspēja nav norādīta.'
MSG_E_ITEM_DURATION_REQUIRED = 'Glabājamās vienības izšķirtspēja nav norādīta.'
MSG_E_ITEM_DOES_NOT_EXIST = 'Glabājamā vienība ar numuru {} neeksistē.'
MSG_E_ITEM_OUT_OF_PROJECT_SCOPE = 'Dotajā projektā norādītā GV neeksistē'
MSG_E_ITEM_SELF_RELATE = 'Glabājamā vienība nevar būt saistīta ar sevi.'
MSG_E_INVENTORY_IS_NOT_UPDATED = 'Uzskaites saraksta dati nav atjaunoti.'
MSG_E_DATE_INDICATOR_VALUE = 'Nepareizi norādīts datuma indikātors'
MSG_E_UNIT_OF_MEASURE_VALUE = 'Nepareizi norādīta apjoma mērvienība'
MSG_E_NO_INVENTORY = 'Uzskaites saraksts ar id {} neeksistē.'
MSG_E_NO_INVENTORY_DATE = 'Uzskaites sarakstam ID.{} nav norādīts sākuma un beigu datums.'
MSG_E_NO_RECORDS_PROVIDED = '{} glabājamai vienībai nav pievienoti dokumenti.'


# Item fields
_SERIES_CODE = 'series_code'
_NUMBER = 'number'
_TITLE = 'title'
_START_DATE = 'start_date'
_END_DATE = 'end_date'
_DATE_INDICATOR = 'date_indicator'
_DATE_NOTE = 'date_note'
_RELATED_ITEM = 'related_item'
_NOTES = 'notes'
_ANNOTATION = 'annotation'
_SISTEMATIZATION = 'sistematisation'
_LANGUAGE = 'language'
_RESTRICTION = 'restriction'
_RESTRICTION_NOTE = 'restriction_note'
_SECURITY_LEVEL = 'security_level'
_SECURITY_LEVEL_NOTE = 'security_level_note'
_COPY = 'copy'
_ARCHIVAL_HISTORY = 'archival_history'
_FORMAT = 'format'
_COLOR = 'color'
_DURATION = 'duration'
_RESOLUTION = 'resolution'

CREATE_ITEM_FIELDS = [
    _SERIES_CODE,
    # _NUMBER,
    _TITLE,
    _START_DATE,
    _END_DATE,
    _DATE_INDICATOR,
    _DATE_NOTE,
    _NOTES,
    _ANNOTATION,
    _SISTEMATIZATION,
    _LANGUAGE,
    _RESTRICTION,
    _RESTRICTION_NOTE,
    _SECURITY_LEVEL,
    _SECURITY_LEVEL_NOTE,
    _COPY,
    _ARCHIVAL_HISTORY,
]

UPDATE_ITEM_FIELDS = [
    _SERIES_CODE,
    _TITLE,
    _START_DATE,
    _END_DATE,
    _DATE_INDICATOR,
    _DATE_NOTE,
    _NOTES,
    _ANNOTATION,
    _SISTEMATIZATION,
    _LANGUAGE,
    _RESTRICTION,
    _RESTRICTION_NOTE,
    _SECURITY_LEVEL,
    _SECURITY_LEVEL_NOTE,
    _COPY,
    _ARCHIVAL_HISTORY,
]

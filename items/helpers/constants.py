"""Module contains constants used in items app."""

import datetime
from decimal import Decimal


RELATED_ITEM = 'related_item'

# Item class CharFields max length
ITEM_SERIES_CODE_LENGTH = 20
ITEM_TITLE_LENGTH = 1000
ITEM_NOTES_LENGTH = 1000
ITEM_DATE_NOTE_LENGTH = 1000
ITEM_UNIT_OF_MEASURE_LENGTH = 20
ITEM_ANNOTATION_LENGTH = 2000
ITEM_SISTEMATISATION_LENGTH = 500
ITEM_PHYSICAL_DESCRIPTION_LENGTH = 1000
ITEM_LANGUAGE_LENGTH = 200
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
DEFAULT_BLANK = '-'
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

# Regular expression
REGEX_SERIES_CODE = r'^(?!0\d*$)(\d{1,2}\.)*\d{1,2}$'
REGEX_DURATION = r'^\d{1,2}:[0-5]\d:[0-5]\d$'

# Validation constants
REQUIERE_ANNOTATION_TYPE = ['foto', 'skaņas', 'video']
REQUIERE_FORMAT_TYPE = ['foto', 'skaņas', 'video']
REQUIERE_DURATION_TYPE =  ['skaņas', 'video']
REQUIERE_COLOR_TYPE =  ['foto', 'video']
REQUIERE_RESLOLUTION_TYPE = ['foto', 'video']
NOT_REQUIERE_LANGUAGE_TYPE = 'foto'
COLOR_FIELD_VALUES = ['melnbaltā', 'krāsainā']

# Error messages
MSG_E_ITEM_EXISTS = 'Glabājamā vienība ar numuru {} jau eksistē.'
MSG_E_ITEM_LIST_SEQUENCE = 'Glabājamo vienību numuri nav secīgi.'
MSG_E_ITEM_NUMBER = 'Glabājamās vienības numurs nav secīgs.'
MSG_E_ITEM_SERIES_CODE = 'Sērijas kods neatbilst prasībām.'
MSG_E_NOT_A_STRING = 'Dotā vērtība nav simbolu virkne.'
MSG_E_LONG_VALUE = 'Vērtība ir garāka par {} simboliem.'
MSG_E_UNIT_OF_MEASURE_VALUE = 'Nepieļaujamā vērtība.'
MSG_E_RESTRICTION_VALUE = 'Nepareizi norādīta ierobežojuma vērtība.'
MSG_E_SECUTIRY_LEVEL_VALUE = 'Nepareizi norādīta pieejamības vērtība.'
MSG_E_ITEM_SIZE_VALUE_FOR_PAPER = 'Glabājamās vienības apjomam jābūt veselam skaitlim'
MSG_E_ITEM_ANNOTATION_REQUIRED = 'Glabājamās vienības saturs nav aizpildīts.'
MSG_E_ITEM_LANGUAGE_REQUIRED = 'Glabājamās vienības valoda nav norādīta.'
MSG_E_ITEM_DATE_VALUE = 'Glabājamās vienības datoms no nevar būt vēlāks par datumau līdz.'
MSG_E_ITEM_DATE_VALUE_DEFAULT = 'Glabājamās vienības datoms nav norādīts.'
MSG_E_ITEM_DURATION_VALUE = 'Glabājamās vienības skanēšanas ilgums norādīts nepareizi.'
MSG_E_ITEM_COLOR_REQUIRED = 'Glabājamās vienības krāsa nav norādīta.'
MSG_E_ITEM_FORMAT_REQUIRED = 'Glabājamās vienības formāts nav norādīts.'
MSG_E_ITEM_RESOLUTION_REQUIRED = 'Glabājamās vienības izšķirtspēja nav norādīta.'
MSG_E_ITEM_DURATION_REQUIRED = 'Glabājamās vienības izšķirtspēja nav norādīta.'
MSG_E_ITEM_DOES_NOT_EXIST = 'Glabājamā vienība ar numuru {} neeksistē.'
MSG_E_ITEM_SELF_RELATE = 'Glabājamā vienība nevar būt saistīta ar sevi.'





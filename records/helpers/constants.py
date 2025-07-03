"""Module contains constants used in records app."""


# Records class CharFields max length
RECORD_TITLE_LENGTH = 500
RECORD_LANGUAGE_LENGTH = 20
RECORD_ANNOTATION_LENGTH = 500
RECORD_KEY_WORDS_LENGTH = 200
RECORD_REG_NR_LENGTH = 30
RECORD_SENT_REG_NR_LENGTH = 30
RECORD_GROUR_LENGTH = 30
RECORD_TYPE_LENGTH = 30
RECORD_NOMENCLATURE_NR_LENGTH = 30
RECORD_NOTES_LENGTH = 500
RECORD_ACCESS_RESTRICTION_NOTES_LENGTH = 30
RECORD_USER_RESTRICTION_NOTES_LENGTH = 30
RECORD_ACCESS_RESTRICTION_LENGTH = 10
RECORD_TECH_INFO_LENGTH = 500

# Records class default values
RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE = 'open'

# Records validation constants
RECORD_ACCESS_RESTRICTION_VALUES = ['open', 'closed']

# Records Error messages
MSG_E_LONG_VALUE = 'Vērtība ir garāka par {} simboliem.'
MSG_E_ACCESS_RESTRICTION_VALUE = 'Nepareizi norādīta pieejamības vērtība.'
MSG_E_ACCESS_RESTRICTION_DATE_VALUE = 'Nav norādīts ierobežojuma datums.'
MSG_E_ACCESS_RESTRICTION__DATE_VALUE_PRESENT = 'Datumu nenorāda, ja ierobežojuma vērtība ir "open".'
MSG_E_NOT_TEXT_RECORD = 'Dokumentam jābūt tekstuālam elektroniskā formā.'
MSG_E_UNKNOWN_CLASS = 'Unknown class: {}.'

# Actions class CharFields max length
ACTION_TASK_LENGTH = 200

# Addresees class CharFields max length
ADDRESSEE_ADDRESSEE_LENGTH = 200

# Length for person and notes fields
PEROSN_LENGTH = 50
NOTES_LENGTH = 200

TEXT = 'Tekstuāls'
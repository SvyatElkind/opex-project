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
RECORD_COLOR_LENGTH = 10
RECORD_DURATION_LENGTH = 8
RECORD_FORMAT_LENGTH = 10
RECORD_RESOLUTION_LENGTH = 20

# Actions class CharFields max length
ACTION_TASK_LENGTH = 200

# Addresees class CharFields max length
ADDRESSEE_ADDRESSEE_LENGTH = 200

# Multiple classes CHarFields max length
PEROSN_LENGTH = 50
NOTES_LENGTH = 200

# Regular expression
REGEX_DURATION = r'^\d{1,2}:[0-5]\d:[0-5]\d$'

# Records class default values
RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE = 'open'

# Records validation constants
RECORD_ACCESS_RESTRICTION_VALUES = ['open', 'closed']

# Records Error messages
MSG_E_LONG_VALUE = 'Vērtība ir garāka par {} simboliem.'
MSG_E_ACCESS_RESTRICTION_VALUE = 'Nepareizi norādīta pieejamības vērtība.'
MSG_E_ACCESS_RESTRICTION_DATE_VALUE = 'Nav norādīts ierobežojuma datums.'
MSG_E_ACCESS_RESTRICTION_DATE_VALUE_PRESENT = 'Datumu nenorāda, ja ierobežojuma vērtība ir "open".'
MSG_E_NOT_TEXT_RECORD = 'Dokumentam jābūt tekstuālam elektroniskā formā.'
MSG_E_UNKNOWN_CLASS = 'Unknown class: {}.'
MSG_E_NO_FILES_PROVIDED = 'Nav norādīti faili.'
MSG_E_ITEM_DURATION_VALUE = 'Glabājamās vienības skanēšanas ilgums norādīts nepareizi.'
MSG_E_NO_FILE = 'Fails ar id {} nav atrasts.'
MSG_E_IS_NOT_TEXT_FILE = 'Nevar dzēst audiovizuālo failu.'
MSG_E_NO_INTEM_ID = 'Nav norādīts glabājamās vienības ID.'
MSG_E_NO_ITEM = 'Glabājamā vienība ar ID {} nav atrasta.'
MSG_E_NOT_MEDIA_ITEM = 'Glabājamās vienības tips nav foto, video, skaņas un/vai veids nav elektroniskā formā.'
MSG_E_NO_MULTIPLE_FILES_ALLOWED = 'Drīkst augšupielādēt tikai vienu failu.'
MSG_E_NO_TYPE_PROVIDED = 'Nav norādīts dokumenta tips.'
MSG_E_DOCUMETN_ALREADY_EXISTS = 'Glabājamai vienībai jau ir izveidots dokuments.'
MSG_E_RECORD_DATE_VALUE = 'Dokumenta datums ir ārpus glabājamās vienības datuma robežām.'
MSG_E_METADATA_NOT_FOUND = 'Metadatu instance nav atrasta'
MSG_E_NO_RECORD = 'Dokuments ar ID {} nav atrasts.'

# Success messages
MSG_FILES_UPLOADED = 'Faili ir augšupielādēti.'
MSG_FILE_DELETED = 'Fails ir izdzēsts'
MSG_RECORD_DELETED = 'Dokuments ir izdzēsts'
MSG_METADATA_DELETED = 'Metadati ir izdzēsti'

# Reused constants
FILES = 'files'
ACTION = 'action'
ADDRESSEE = 'addressee'
VISA = 'visa'
READ_STATUS = 'read_status'
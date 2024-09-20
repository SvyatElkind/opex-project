"""Module contains constants used in project app."""


# Project class CharFields max length
PROJECT_NAME_LENGTH = 20
PROJECT_FOLDER_LENGTH = 100

# Rgular expressions
REGEX_PROJECT_NAME = r'^[\w\-]+$'

# Success messages:
MSG_PROJECT_DELETED = 'Projekts ir dzēsts.'
MSG_REPORT_IMPORTED = "Atskaite ir importēta."

# Response keys:
FOLDER = 'folder'
PROJECT = 'project'

# Error messages
MSG_E_PROJECT_NAME_LENGTH = f'Projekta nosaukums nevar būt garāks par {PROJECT_NAME_LENGTH} simboliem.'
MSG_E_PROJECT_NAME_SYMBOLS = 'Projekta nosaukumā var izmantot burtus, ciparus "_" un "-".'
MSG_E_PROJECT_NAME_UNIQUE = 'Projekts ar doto noasukumu jau eksistē.'
MSG_E_PROJECT_UNIQUE = 'Projekts ar doto nosaukumu jau eksistē.'
MSG_E_PROJECT_NAME_EXISTS = {'name': MSG_E_PROJECT_NAME_UNIQUE}
MSG_E_PROJECT_NAME_NOT_STRING = {'name': 'Projekta nosaukumam jābūt simbolu virknei.'}
MSG_E_ROOT_FOLDER_MISSING = {'folder': 'Dotā mape neeksistē.'}
MSG_E_ROOT_FOLDER_CAN_NOT_CREATE = {'folder': 'Navar izveidot projekta mapi.'}
MSG_E_ROOT_FOLDER_CAN_NOT_RENAME = {'folder': 'Navar pārdēvēt projekta mapi.'}
MSG_E_NO_PROJECT_FOLDER_FOUND = {'folder': 'Projekta mepe neeksistē.'}
MSG_E_FOLDER_EXISTS = {'folder': 'Mepe ar ar šādu nosaukumu jau eksistē.'}
MSG_E_WRONG_FILE_EXTENSION = 'Izvēletā faila paplašinājumam jābūt ".xlsx".'
MSG_E_NO_REPORT = 'Nav importēta VVAIS atskite.'
MSG_E_REPORT_ALREADY_EXIST = 'Atskaite jau ir importēta.'

# Serializers constants
ALLOWED_REPORT_FORMAT = '.xlsx'

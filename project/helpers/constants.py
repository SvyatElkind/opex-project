"""Module contains constants used in project app."""


# Project class CharFields max length
PROJECT_NAME_LENGTH = 20
PROJECT_FOLDER_LENGTH = 100

# Rgular expressions
REGEX_PROJECT_NAME = r'^[\w\-]+$'
REGEX_PROJECT_FOLDER = r'^(?:[a-zA-Z]:\\|/)(?:[^\\/:*?"<>|\r\n]*(?:[\\/:][^\\/:*?"<>|\r\n]*)*)?$'

# Error messages
MSG_E_PROJECT_NAME_LENGTH = f'Projekta nosaukums nevar būt garāks par {PROJECT_NAME_LENGTH} simboliem.'
MSG_E_PROJECT_NAME_SYMBOLS = 'Projekta nosaukumā var izmantot burtus, ciparus "_" un "-".'
MSG_E_PROJECT_NAME_UNIQUE = 'Projekts ar doto noasukumu jau eksistē.'
MSG_E_PROJECT_UNIQUE = 'Projekts ar doto nosaukumu jau eksistē.'
MSG_E_PROJECT_NAME_EXISTS = {'name': MSG_E_PROJECT_NAME_UNIQUE}
MSG_E_ROOT_FOLDER_MISSING = {'folder': 'Dotā mape neeksistē.'}
MSG_E_ROOT_FOLDER_CAN_NOT_CREATE = {'folder': 'Navar izveidot projekta mapi.'}
MSG_E_ROOT_FOLDER_CAN_NOT_RENAME = {'folder': 'Navar pārdēvēt projekta mapi.'}
MSG_E_NO_PROJECT_FOLDER_FOUND = {'folder': 'Projekta mepe neeksistē.'}
MSG_E_FOLDER_EXISTS = {'folder': 'Mepe ar ar šādu nosaukumu jau eksistē.'}

# View respones messages
MSG_E_NO_PROJECT = 'Projekts neeksistē'
pr = {"project": None}
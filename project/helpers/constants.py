"""Module contains constants used in project app."""


# Project class CharFields max length
PROJECT_NAME_LENGTH = 20

# Rgular expressions
REGEX_PROJECT_NAME = r'^[\w\-]+$'

# Error messages
MSG_E_PROJECT_NAME_LENGTH = f'Projekta nosaukums nevar būt garāks par {PROJECT_NAME_LENGTH} simboliem.'
MSG_E_PROJECT_NAME_SYMBOLS = 'Projekta nosaukumā var izmantot burtus, ciparus "_" un "-".'
MSG_E_PROJECT_NAME_UNIQUE = 'Projekts ar doto noasukumu jau eksistē.'
MSG_E_PROJECT_UNIQUE = 'Projekts ar doto nosaukumu jau eksistē.'
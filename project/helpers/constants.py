"""Konstantes kuras tiek izmantotas 'project' aplikācijā"""

PROJECT_EXISTS_MSG = "Projekts ar doto nosaukumu jau eksistē"

# CharFields max length of Project model
PROJECT_NAME_LENGTH = 20

# Rgular expressions
REGEX_PROJECT_NAME = r'^[\w\-]+$'

# Error messages
WRONG_PROJECT_NAME_LENGTH = f'Projekta nosaukums nevar būt garāks par {PROJECT_NAME_LENGTH} simboliem'
WRONG_PROJECT_NAME_SYMBOLS = 'Projekta nosaukumā var izmantot burtus, ciparus "_" un "-".'
WRONG_PROJECT_NAME_UNIQUE = 'Projekts ar doto noasukumu jau eksistē'
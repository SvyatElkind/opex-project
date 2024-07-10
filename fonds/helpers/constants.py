"""Konstantes kuras tiek izmantotas 'fonds' aplikācijā"""

# paziņojumi veidoti modeļu failā
FOND_EXISTS_MSG = 'Fonds ar doto uzskaites kodu jau eksistē'

# CharFields max length of Fond model
FOND_CODE_LENGTH = 30
ARCH_ABBREVIATION_LENGTH = 5
ARCH_TITLE_LENGTH = 100
FOND_TITLE_LENGTH = 500

# Error messages
WRONG_FOND_CODE_LENGTH = f'Fonda uzskaides koda garums nevar pārsniegt {FOND_CODE_LENGTH} simbolus'
WRONG_ARHC_ABBREVIATION_VALUE = 'Dotā arhīva abreviatūra nav pareiza'
WRONG_ARCH_TITLE_VALUE = 'Arhīvs ar doto nosaukumu neeksistē'
WRONG_FOND_TITLE_LENGTH = f'Fonda nosaukums nevar pārsniegt {FOND_TITLE_LENGTH}'

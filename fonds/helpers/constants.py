"""Module contains constants used in fonds app"""


# Fond class CharFields max length 
FOND_CODE_LENGTH = 30
ARCH_ABBREVIATION_LENGTH = 5
ARCH_TITLE_LENGTH = 100
FOND_TITLE_LENGTH = 500

# Error messages
MSG_E_FOND_CODE_LENGTH = f'Fonda uzskaides koda garums nevar pārsniegt simbolu skaitu: {FOND_CODE_LENGTH}.'
MSG_E_FOND_CODE_UNIQUE = 'Fonds ar doto uzskaites kodu jau eksistē.'
MSG_E_ARHC_ABBREVIATION_VALUE = 'Dotā arhīva abreviatūra neeksistē.'
MSG_E_ARCH_TITLE_VALUE = 'Arhīvs ar doto nosaukumu neeksistē.'
MSG_E_FOND_TITLE_LENGTH = f'Fonda nosaukums nevar pārsniegt simbolu skaitu: {FOND_TITLE_LENGTH}.'

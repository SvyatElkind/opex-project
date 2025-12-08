"""Module contains constants used in institutions app."""

# Institution class CharFields max length.
INSTITUTION_NAME_LENGTH = 500
REG_NR_LENGTH = 15
CREATOR_LENGTH = 30
CREATOR_POSITION_LENGTH = 200
SIGNER_LENGTH = 30
SIGHER_POSITION_LENGTH = 200

# Regular expression
REGEX_REG_NR = r'^\d{1,15}$'

# Error messages.
MSG_E_INSTITUTION_NAME_LENGTH = f'Institūcijas nosaukums nevar būt garāks par {INSTITUTION_NAME_LENGTH} burtiem'
MSG_E_CREATOR_LENGTH = f'Izveidotāja vārds un uzvārds nevar būt garāks par {CREATOR_LENGTH} burtiem'
MSG_E_CREATOR_POSITION_LENGTH = f'Izveidotāja amats nevar būt garāks par {CREATOR_POSITION_LENGTH} burtiem'
MSG_E_SIGNER_LENGTH = f'Parakstītāja vārds un uzvārds nevar būt garāks par {SIGNER_LENGTH} burtiem'
MSG_E_SIGNER_POSITION_LENGTH = f'Parakstītāja amats nevar būt garāks par {SIGHER_POSITION_LENGTH} burtiem'
MSG_E_INSTITUTION_NAME_UNEQUE = 'Institūcija ar šo nosaukumu jau eksistē.'
MSG_E_REG_NR_UNIQUE = 'Institūcija ar šo rģistrācijas numuru jau eksistē.'
MSG_E_REG_NR = 'Reģistrācijas numurs var saturēt tikai ciparus un nevar būt garāks par 15 simboliem.'
MSG_E_NO_SIGNER_NAME = 'Nav norādīrs dokumentu parakstītāja vārds, uzvārds.'
MSG_E_NO_SIGNER_POSITION = 'Nav norādīrs dokumentu parakstītāja amats.'
MSG_E_NO_CREATOR_NAME = 'Nav norādīrs dokumentu izveidotāja vārds, uzvārds.'
MSG_E_NO_CREATOR_POSITION = 'Nav norādīrs dokumentu izveidotāja amats.'

# List constants
INSTITUTION_UPDATE_FIELDS = ['creator', 'creator_position', 'signer', 'signer_position']
"""Konstantes kuras tiek izmantotas 'institutions' aplikācijā"""

INSTITUTION_EXISTS_MSG = 'Institūcijā ar šo reģistrācijas numuru vai nosaukumu jau eksistē'

# CharFields max length of Institution model
INSTITUTION_NAME_LENGTH = 500
CREATOR_LENGTH = 30
CREATOR_POSITION_LENGTH = 200
SIGNER_LENGTH = 30
SIGHER_POSITION_LENGTH = 200

# Error messages
WRONG_INSTITUTION_NAME_LENGTH = f'Institūcijas nosaukums nevar būt garāks par {INSTITUTION_NAME_LENGTH} burtiem'
WRONG_CREATOR_LENGTH = f'Izveidotāja vārds un uzvārds nevar būt garāks par {CREATOR_LENGTH} burtiem'
WRONG_CREATOR_POSITION_LENGTH = f'Izveidotāja amats nevar būt garāks par {CREATOR_POSITION_LENGTH} burtiem'
WRONG_SIGNER_LENGTH = f'Parakstītāja vārds un uzvārds nevar būt garāks par {SIGNER_LENGTH} burtiem'
WRONG_SIGNER_POSITION_LENGTH = f'Parakstītāja amats nevar būt garāks par {SIGHER_POSITION_LENGTH} burtiem'
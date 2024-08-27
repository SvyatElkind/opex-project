"""Module contains constants used in inventories app"""

# Inventory class CharFields max length
POSTFIX_MAX_LENGTH = 3
POSTFIX_MIN_LENGTH = 1
TYPE_LENGTH = 20
STORAGE_TERMS_LENGTH = 30

# Inventory number range
INVENTORY_MIN_NUM = 1
INVENTORY_MAX_NUM = 70

# Error messages
MSG_E_INVENTORY_UNIQUE = 'Uzskaites saraksts ar šo numuru jau eksistē.'
MSG_E_INVENTORY_NUMBER = f'Uzskaites saraksta numuram jābut no {INVENTORY_MIN_NUM} līdz {INVENTORY_MAX_NUM}.'
MSG_E_INVENTORY_POSTFIX_LENGTH = f'Uzskaites saraksta numura litera garumam jābūt no {POSTFIX_MIN_LENGTH} līdz {POSTFIX_MAX_LENGTH}.'
MSG_E_INVENTORY_TYPE = 'Ir norādīts nepareizs uzskaites saraksta dokumentu veids.'
MSG_E_INVENTORY_STORAGE_TERM = 'Glabāšanas termiņš ir norādīts nepareizi.'
MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE = 'Uzskates saraksta numuram kopā ar literu jābūt unikālam.'
MSG_E_NEW_INVENTORY_NUMBER_SEQUENCE = 'Jauna uzskaites saraksta numurs nav secīgs.'
MSG_E_FOND_DOES_NOT_EXIST = 'Norādītais fonds neeksistē.'
MSG_E_INVENTORY_NUMBER = 'Nepareizs uzskaites saraksta numurs'
MSG_E_NO_FOND_ID = 'Nav norādīts fonda ID.'
MSG_E_WRONG_DATE = 'Uzskaites saraksts datējums norādīts nepareizi.'

# Success messages
MSG_INVENTORY_DELETED = 'Uzsakites saraksts ir izdzēsts.'

# List constants
INVENTORY_SERIALIZER_FIELDS = [
                'number',
                'type',
                'electronic',
                'start_date',
                'end_date',
                'storage_term'
            ]
INVENTORY_FULL_UPDATE_FIELDS = [
                'type',
                'electronic',
                'start_date',
                'end_date',
                'storage_term'
            ]
INVENTORY_GENERAL_UPDATE_FIELDS = ['start_date', 'end_date']
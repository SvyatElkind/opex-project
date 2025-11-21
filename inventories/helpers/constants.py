"""Module contains constants used in inventories app"""

# Inventory class CharFields max length
POSTFIX_MAX_LENGTH = 3
POSTFIX_MIN_LENGTH = 1
TYPE_LENGTH = 20
STORAGE_TERMS_LENGTH = 30

# Inventory number range
INVENTORY_MIN_NUM = 1
INVENTORY_MAX_NUM = 70

INVENTORY_MEDIA_TYPE = ['Foto', 'Skaņas', 'Video']

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
MSG_E_INVENTORY_ITEM_DATE = 'Uzskaites saraksta beigu datums neiekļauj uzskaites sarakstā esošo glabājamo vienību datumu.'
MSG_E_NO_DATE = 'Lūdzu norādiet datējumu.'
MSG_E_CANT_DELETE_REPORT_INVENTORY = 'Nevar dzēst uzskaites sarakstu no VVAIS atskaites.'
MSG_E_NO_FOND = 'Fonds ar id {} neeksistē.'

# Success messages
MSG_INVENTORY_DELETED = 'Uzsakites saraksts ir izdzēsts.'

# List constants
INVENTORY_CREATE_FIELDS_UI = ['number', 'start_date', 'end_date', 'subfond', 'type', 'electronic', 'storage_term']
INVENTORY_CREATE_FIELDS_VVAIS = ['number', 'postfix', 'type', 'electronic', 'storage_term', 'last_gv', 'total_items']

INVENTORY_UPDATE_FIELDS = ['subfond', 'start_date', 'end_date', 'storage_term']
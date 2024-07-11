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
MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE = 'Uzskates saraksta numuram kopā ar literu jābūt unikālam'
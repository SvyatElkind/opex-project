"""Module contains constants used in inventories app"""

# CharFields max length of Inventory model
POSTFIX_MAX_LENGTH = 3
POSTFIX_MIN_LENGTH = 1
TYPE_LENGTH = 20
STORAGE_TERMS_LENGTH = 30

# Inventory allowed numbers
INVENTORY_MIN_NUM = 1
INVENTORY_MAX_NUM = 70

# Error messages
INVENTORY_EXISTS_MSG = 'Uzskaites saraksts ar šo numuru jau eksistē'
INVENTORY_WRONG_VALUE = 'Nepieļaujama vērtība'
NO_VALUE = 'No value'
INVENTORY_NUMBER_ERROR = f'Uzskaites saraksta numuram jābut no {INVENTORY_MIN_NUM} līdz {INVENTORY_MAX_NUM}'
WRONG_POSTFIX_ERROR = f'Uzskaites saraksta numura litera garumam jābūt no {POSTFIX_MIN_LENGTH} līdz {POSTFIX_MAX_LENGTH}'
WRONG_TYPE_ERROR = 'Ir norādīts nepareizs uzskaites saraksta dokumentu veids'
WRONG_INVENTORY_STORAGE_TERM = 'Glabāšanas termiņš ir norādīts nepareizi'
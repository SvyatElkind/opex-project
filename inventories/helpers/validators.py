"""Module contains validation functions for Inventory class"""


from helpers.constants import VVAIS_STORAGE_TERM_LIST, VVAIS_TYPE_LIST
from inventories.helpers.constants import (
    MSG_E_INVENTORY_POSTFIX_LENGTH,
    MSG_E_INVENTORY_STORAGE_TERM,
    MSG_E_INVENTORY_TYPE
)
from django.core.exceptions import ValidationError

def validate_inventory_postfix(postfix: str):
    """Validate inventory number's postfix
    
    Postfix should be at least with one symbol
    """    
    if len(postfix) < 1:
        raise ValidationError(MSG_E_INVENTORY_POSTFIX_LENGTH)

def validate_inventory_type(type: str):
    """Validate inventory type"""
    if not type in VVAIS_TYPE_LIST:
        raise ValidationError(MSG_E_INVENTORY_TYPE)

def validate_storage_term(storage_term: str):
    """Validate inventory storage term"""
    if not storage_term in VVAIS_STORAGE_TERM_LIST:
        raise ValidationError(MSG_E_INVENTORY_STORAGE_TERM)
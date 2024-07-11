"""Module contains validation functions for Inventory class"""


from helpers.constants import VVAIS_STORAGE_TERM_LIST, VVAIS_TYPE_LIST
from inventories.helpers.constants import (
    MSG_E_INVENTORY_POSTFIX_LENGTH,
    MSG_E_INVENTORY_STORAGE_TERM,
    MSG_E_INVENTORY_TYPE
)
from django.core.exceptions import ValidationError

def validate_inventory_postfix(postfix: str) -> None:
    """Validate inventory number's postfix.
    
    Postfix should be at least with one symbol.

    Args:
        postfix: Inventory postfix.
    
    Raises:
        ValidationError: If postfix length is 0
    """    
    if len(postfix) < 1:
        raise ValidationError(MSG_E_INVENTORY_POSTFIX_LENGTH)

def validate_inventory_type(type: str) -> None:
    """Validate inventory type.
    
    Args:
        type: Inventory type.
        
    Raises:
        ValidationError: If type is not one of allowed values.
    """
    if not type in VVAIS_TYPE_LIST:
        raise ValidationError(MSG_E_INVENTORY_TYPE)

def validate_storage_term(storage_term: str) -> None:
    """Validate inventory storage term.
    
    Args:
        storage_term: Inventory storage_term.
    
    Raises:
        ValidationError: If storage term is not one of allowed values.
    """
    if not storage_term in VVAIS_STORAGE_TERM_LIST:
        raise ValidationError(MSG_E_INVENTORY_STORAGE_TERM)
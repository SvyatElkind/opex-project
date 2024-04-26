"""Module contains validation functions for Inventory class"""

from typing import Tuple, Union
from helpers.constants import VVAIS_STORAGE_TERM, VVAIS_TYPE
from inventories.constants import (
    INVENTORY_WRONG_VALUE,
    NO_VALUE
)

def validate_inventory_number(number: int) -> Union[None, str]:
    """Validate inventory number"""   
    if not isinstance(number, int):
        return INVENTORY_WRONG_VALUE

def validate_inventory_postfix(postfix: str) -> Union[None, str]:
    """Validate inventory number's postfix
    
    Postfix should be string containing only one letter
    """    
    if not (isinstance(postfix, str) and 
            postfix.isalpha() and 
            len(postfix) == 1):
        return INVENTORY_WRONG_VALUE

def validate_inventory_type(type: str) -> Union[None, str]:
    """Validate inventory type"""
    if not type in VVAIS_TYPE:
        return INVENTORY_WRONG_VALUE

def validate_inventory_media(electronic: bool) -> Union[None, str]:
    """Validate inventory media"""
    if not isinstance(electronic, bool):
        return INVENTORY_WRONG_VALUE

def validate_inventory_last_gv(last_gv: int) -> Union[None, str]:
    """Validate inventory last item"""
    if not isinstance(last_gv, int):
        return INVENTORY_WRONG_VALUE

def validate_total_item(total_item: int) -> Union[None, str]:
    """Validate inventory total number of items"""
    if not isinstance(total_item, int):
        return INVENTORY_WRONG_VALUE

def validate_storage_term(storage_term: str) -> Union[None, str]:
    """Validate inventory storage term"""
    if not storage_term in VVAIS_STORAGE_TERM:
        return INVENTORY_WRONG_VALUE

# Dictionary with Inventory fields name as key
# and function name against which field should be checked as value
validation_dict = {'number': validate_inventory_number,
                   'postfix': validate_inventory_postfix, 
                   'type': validate_inventory_type,
                   'electronic': validate_inventory_media,
                   'last_gv': validate_inventory_last_gv,
                   'total_items': validate_total_item,
                   'storage_term': validate_storage_term}


def validate_invenotry(inventory: dict) -> Tuple[bool, dict]:
    """Validate inventory fields values

    Validates this fields: number, type, media, last_gv, storage_term,
      total_items, postfix
    
    Args:
        inventory: Dictionary where key is 'Inventory' class fields.
    
    Returns:
        If validation is successful returns list where first item
        is 'True' and second item is validated dictionary,
        else returns False and error dictionary
    """
    errors = {}
   
    # Run through all validation functions.
    for field, function in validation_dict.items():
        field_value = inventory.get(field, NO_VALUE)

        # Validate if value exists.
        if field_value == NO_VALUE:
            errors[field] = NO_VALUE
            continue

        # Validate value against validation function.
        # Returns None if no errors.
        result = function(field_value)
        if result is not None:
            errors[field] = result
    
    # Check if there is errors.
    if errors:
        return False, errors
    
    validated_inventory = {field:inventory.get(field) for field in validation_dict.keys()}
    return True, validated_inventory
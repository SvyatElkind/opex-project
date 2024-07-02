"""Module contains validation functions for Item class."""

import re
from inspect import signature

from helpers.constants import NO_VALUE
from inventories.models import Inventory
from items.helpers.constants import ITEM_ANNOTATION_LENGTH, ITEM_DATE_NOTE_LENGTH, ITEM_NOTES_LENGTH, ITEM_NUMBER_ERROR_MSG, ITEM_SERIES_CODE_ERROR_MSG, ITEM_SERIES_CODE_LENGTH, ITEM_SISTEMATISATION_LENGTH, ITEM_TITLE_LENGTH, NOT_A_STRING_ERROR_MSG, TOO_LONG_VALUE_ERROR_MSG


def is_consecutive(items: list) -> bool:
    """Check if numbers in the list are consecutive.
    
    Args:
        items: List of numbers.

    Returns:
        True if numbers are consecutive else retrun False.
    """
    # Ensure that all elements are integers.
    if not all(isinstance(number, int) for number in items):
        return False
    
    # Sort the list
    sorted_items = sorted(items)
    
    # Check if the difference between consecutive numbers is 1.
    for number in range(1, len(sorted_items)):
        if sorted_items[number] - sorted_items[number - 1] != 1:
            return False
            
    return True

def check_char_field_length(value, allowed_length) -> None | str:
    """Checks char field length.
    
    Args:
        value: Value to be validated.
        allowed_length: Allowed char field max_length
        
    Returns:
        None if value is valid else returns error message.
    """
   
    if not isinstance(value, str):
        return NOT_A_STRING_ERROR_MSG
    
    if len(value) > allowed_length:
        return TOO_LONG_VALUE_ERROR_MSG.format(allowed_length)

def validate_item_series_code(series_code: str) -> None | str:
    """Validate item series code.

    Args:
        series_code: Series code to be validated.
    
    Returns:
        None if series code is valid else returns error message.
    """
    result =  check_char_field_length(series_code, ITEM_SERIES_CODE_LENGTH)
    if result:
        return result
    
    # Create RegEx matching series code pattern.
    pattern = re.compile(r'^(?!0\d*$)(\d{1,2}\.)+\d{1,2}\.$')

    # Check if series code matches pattern.
    if not bool(pattern.match(series_code)):
        return ITEM_SERIES_CODE_ERROR_MSG

def validate_item_number(number: int, inventory: Inventory) -> None | str:
    """Validate item number.
    
    Args:
        number: Number to be validated.
        inventory: Related inventory object.
    
    Returns:
        None if number is valid else returns error message.
    """
    # Get suppose number.
    first_item_number = inventory.last_gv + 1

    # Check if item number is next number after inventory last_gv.
    if not number == first_item_number:
        return ITEM_NUMBER_ERROR_MSG.format(inventory.number, first_item_number)

def validate_item_title(title: str) -> None | str:
    """Validate item title.

    Args:
        title: Item title.
    
    Returns:
        None if title is valid else returns error message.
    """
    result =  check_char_field_length(title, ITEM_TITLE_LENGTH)
    if result:
        return result

def validate_item_start_date(start_date):
    pass

def validate_item_end_date(end_date):
    pass

def validate_item_date_note(date_note):
    """Validate item date note.

    Args:
        date_note: Item date note to be validated.
    
    Returns:
        None if date note is valid else returns error message.
    """
    result =  check_char_field_length(date_note, ITEM_DATE_NOTE_LENGTH)
    if result:
        return result
    
def validate_item_size(size: int):
    pass
    # TODO Check if item is with decimal part

def validate_item_unit_of_measur(measure: str):
    pass

def validate_item_date(start_date, end_date):
    """Validate item start and end date"""
    if not start_date < end_date:
        return False

def validate_related_item(related_item: dict):
    """Validates dict of related items"""
    pass

def validate_item_notes(notes: str) -> None | str:
    """Validate item notes.

    Args:
        notes: Item notes to be validated.
    
    Returns:
        None if notes is valid else returns error message.
    """
    result =  check_char_field_length(notes, ITEM_NOTES_LENGTH)
    if result:
        return result

def validate_item_annotation(annotation: str) -> None | str:
    """Validate item annotation.

    Args:
        annotation: Item annotation to be validated.
    
    Returns:
        None if annotation is valid else returns error message.
    """
    result =  check_char_field_length(annotation, ITEM_ANNOTATION_LENGTH)
    if result:
        return result

def validate_item_sistematisation(sistematisation: str):
    """Validate item sistematisation.

    Args:
        sistematisation: Item sistematisation to be validated.
    
    Returns:
        None if sistematisation is valid else returns error message.
    """
    result =  check_char_field_length(sistematisation, ITEM_SISTEMATISATION_LENGTH)
    if result:
        return result

def validate_item_physical_description(description: str):
    pass

def validate_item_language(language: str):
    pass

def validate_item_restriction(restriction: str):
    pass

def validate_item_security_level(security_level: str):
    pass

# Below is dictionaries with validation functions for items
# Each dictionary coresponds to specific inventory type and media
# Dictionary contains Item fields name as key
# and function name, against which field should be checked, as value
VALIDATION_DICT_MANDATORY_FIELDS = {
    'item_series_code': validate_item_series_code,
    'item_number': validate_item_number, 
    'item_title': validate_item_title,
    'item_start_date': validate_item_start_date,
    'item_end_date': validate_item_end_date,
    'item_size': validate_item_size,
    'item_unit_of_measur': validate_item_unit_of_measur,
    'item_notes': validate_item_notes,
    'item_language': validate_item_language,
    'item_restriction': validate_item_restriction,
    'item_security_level': validate_item_security_level
}

VALIDATION_DICT_OPTIONAL_FIELDS = {
    'related_item': validate_related_item,
    'item_sistematisation': validate_item_sistematisation
}

VALIDATION_DICT_E_FOTO_FONO_VIDEO_FIELDS = {
    'item_annotation': validate_item_annotation,
    'item_physical_description': validate_item_physical_description,
}

def item_validation_text(item: dict, inventory: Inventory):
    """Validate text documents with paper media"""

    # Create dictionary for errors
    item_errors = {}

    # Run through all validation functions.
    for field, function in VALIDATION_DICT_MANDATORY_FIELDS.items():
        field_value = item.get(field, NO_VALUE)

        # Validate if value exists.
        if field_value == NO_VALUE:
            continue
        
        # Get validation function parameters
        sig = signature(function)

        # Validate value against validation function.
        if len(sig.parameters) > 1:
            # Pass inventory as second parameter if number of mandatory parameters
            # of the function is more than one.
            result = function(field_value, inventory)
        else:
            result = function(field_value)
        
        if result is not None:
            # Add error message
            item_errors[field] = result
    
    if item_errors:
        return False, item_errors
    
    return True, item

def item_validation_e_text(items: list):
    pass

def item_validation_e_foto(items: list):
    pass

def item_validation_e_fono(items: list):
    pass

def item_validation_e_video(items: list):
    pass

def item_validation_e_database(items: list):
    pass

TYPE_SELECTION_DICT = {
    'tekstuāls': item_validation_e_text,
    'foto': item_validation_e_foto,
    'skaņas': item_validation_e_fono,
    'video': item_validation_e_video,
    'datubāze': item_validation_e_database
}

def select_item_validator(item: dict, inventory: Inventory):
    """Select correct item validator.
    
    Selects item validator according to inventory type and media"""

    # Get type and media of inventory list
    inventory_type = inventory.type
    inventory_media = inventory.electronic

    #if not inventory_media:
    validated, result = item_validation_text(item, inventory)
    
    # else:
    #     validation_function = TYPE_SELECTION_DICT[inventory_type]
    #     validated, result = validation_function(items)
    
    if not validated:
        raise ValueError(result)

    return result

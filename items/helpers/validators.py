"""Module contains validation functions for Item class."""


from django.core.exceptions import ValidationError


from helpers.constants import (
    ITEM_RESTRICTION_LIST,
    ITEM_SECURITY_LEVEL_LIST,
    NO_VALUE,
    ERROR
)
from items.helpers.constants import (
    DATE_INDICATOR_VALUES,
    ITEM_DATE_DEFAULT_VALUE,
    ITEM_LANGUAGE_DEFAULT_VALUE,
    ITEM_RESTRICTION_DEFAULT_VALUE,
    MSG_E_DATE_INDICATOR_VALUE,
    MSG_E_ITEM_DATE_INVENTORY_DATE,
    MSG_E_ITEM_DATE_VALUE,
    MSG_E_ITEM_DATE_VALUE_DEFAULT,
    MSG_E_ITEM_DOES_NOT_EXIST,
    MSG_E_ITEM_LANGUAGE_REQUIRED,
    MSG_E_ITEM_NUMBER,
    MSG_E_ITEM_OUT_OF_PROJECT_SCOPE,
    MSG_E_ITEM_SELF_RELATE,
    MSG_E_RESTRICTION_VALUE,
    MSG_E_SECUTIRY_LEVEL_VALUE,
    MSG_E_UNIT_OF_MEASURE_VALUE,
    NOT_REQUIERE_LANGUAGE_TYPE,
    RELATED_ITEM_LIST,
    UNIT_OF_MEASURE_VALUES
)


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


# Field validation functions:
# validate_item_security_level
# validate_item_restriction
# validate_item_date_indicator
# validate_item_unit_of_measure

def validate_item_security_level(security_level: str):
    """Validate item security level.

    This is field validation function.
    
    Args:
        security_level: Item security_level.
    
    Raises:
        ValidationError: If security_level value is not one of allowed values.
    """
    if not security_level in ITEM_SECURITY_LEVEL_LIST:
        raise ValidationError(MSG_E_SECUTIRY_LEVEL_VALUE)
    

def validate_item_restriction(restriction: str) -> None:
    """Validate item restriction.

    This is field validation function.
    
    Args:
        restriction: Item restriction.
    
    Raises:
        ValidationError: If restriction value is not one of allowed values.
    """
    if not restriction in ITEM_RESTRICTION_LIST:
        raise ValidationError(MSG_E_RESTRICTION_VALUE)


def validate_item_date_indicator(indicator: str) -> None:
    """Validate if date indicator is acceptable value.

    This is field validation function.

    Args:
        indicator: Item date indicator.
    """
    if not indicator in DATE_INDICATOR_VALUES:
        raise ValidationError(MSG_E_DATE_INDICATOR_VALUE)
    

def validate_item_unit_of_measure(unti_of_measure: str) -> None:
    """Validate if unit of measure is acceptable value.

    This is field validation function.

    Args:
        unti_of_measure: unti_of_measure indicator.
    """
    if not unti_of_measure in UNIT_OF_MEASURE_VALUES:
        raise ValidationError(MSG_E_UNIT_OF_MEASURE_VALUE)
        

def validate_related_item(related_items: list[int], item) -> None:
    """Validate related items.
    
    Args:
        related_items: list of related item id.
        item: Item instance to which related objects should refere to.
        
    Raises:
        ValidationError: If related items contains errors."""
    # Check if item id exists in given inventory.
    for id in related_items:
        
        # Check if item is relating to self
        if id == item.id:
            raise ValidationError({RELATED_ITEM_LIST: MSG_E_ITEM_SELF_RELATE}) 

        if not type(item).objects.filter(id=id).exists():
            raise ValidationError({RELATED_ITEM_LIST: MSG_E_ITEM_DOES_NOT_EXIST.format(id)})
        
        related_item = type(item).objects.select_related('inventory__fond__institution__project').get(id=id)
        
        if not related_item.inventory.fond.institution.project.id == item.inventory.fond.institution.project.id:
            raise ValidationError({RELATED_ITEM_LIST: MSG_E_ITEM_OUT_OF_PROJECT_SCOPE})
        

# ---------------------------------------------------------------------
# Below are validation functions used in clean() method

def validate_item_number(item) -> None | str:
    """Validate item number.
    
    Args:
        item: Item instance.
    
    Returns:
        None if number is valid else returns error message.
    """
    # Get suppose number.
    new_item_number = item.inventory.last_gv + 1
 
    # Check if item number is next number after inventory last_gv.
    if not item.number == new_item_number:
        raise ValidationError({ERROR: MSG_E_ITEM_NUMBER})
    

def validate_item_date(item) -> None | str:
    """Validate item start and end date.
    
    Start date can't be bigger then end date.
    Date can't be default date.
    
    Args:
        item: Item instance.
    
    Returns:
        None if no error else return error message."""
    # Check if item start date is not after end date.
    if item.start_date > item.end_date:
        return MSG_E_ITEM_DATE_VALUE
    
    # Check if item date is not default value.
    if item.start_date == ITEM_DATE_DEFAULT_VALUE \
        or item.end_date == ITEM_DATE_DEFAULT_VALUE:
        return MSG_E_ITEM_DATE_VALUE_DEFAULT
    
    # Check if item date is not after inventory end date.
    if item.inventory.end_date < item.end_date:
        return MSG_E_ITEM_DATE_INVENTORY_DATE   

def validate_item_language(item) -> None | str:
    """Validate item language.
    
    Language should be mentioned if invenotry type is other then foto.

    Args:
        item: Item instance.
    
    Returns:
        None if no errors else return error message.
    """
    if not item.inventory.type == NOT_REQUIERE_LANGUAGE_TYPE \
        and item.language == ITEM_LANGUAGE_DEFAULT_VALUE:
        return MSG_E_ITEM_LANGUAGE_REQUIRED


def validate_item_restriction_note(item) -> None | str:
    """Validate item restriction note.

    Item restriction note should not be empty when restriction is
    diferent from default value.
    
    Args:
        item: Item instance.
    
    Returns:
       None if no errors else error message.
    """
    if not item.restriction == ITEM_RESTRICTION_DEFAULT_VALUE \
       and not item.restriction_note:
        return MSG_E_RESTRICTION_VALUE
    

# Below is dictionarie with item validation functions.
# Dictionary contains Item fields name as keys
# and function name, against which field should be checked, as value
VALIDATION_DICT_FIELDS_FUNCTION = {
    'start_date': validate_item_date,
    'language': validate_item_language,
    'restriction_note': validate_item_restriction_note
}

def item_validators(item) -> None:
    """This function collects all vallidation errors.
    
    Args:
        item: Item instance to be validated.
        
    Raises:
        ValidationError: If item is with errors."""

    # Create dictionary for errors
    item_errors = {}

    # Run through all validation functions.
    for field, function in VALIDATION_DICT_FIELDS_FUNCTION.items():
        field_value = getattr(item, field, NO_VALUE)

        # There is no value
        if field_value == NO_VALUE:
            continue

        result = function(item)
        
        if result:
            # Add error message
            item_errors[field] = result
    
    # Check if item has errors.
    if item_errors:
        raise ValidationError(item_errors)
    
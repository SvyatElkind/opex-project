"""Module contains validation functions for Item class."""


from django.core.exceptions import ValidationError


from helpers.constants import (
    ITEM_RESTRICTION_LIST,
    ITEM_SECURITY_LEVEL_LIST,
    NO_VALUE,
    UNIT_OF_MEASURE_E,
    UNIT_OF_MEASURE_P
)
from items.helpers.constants import (
    COLOR_FIELD_VALUES,
    ITEM_ANNOTATION_DEFAULT_VALUE,
    ITEM_DATE_DEFAULT_VALUE,
    ITEM_DURATION_DEFULT_VALUE,
    ITEM_FORMAT_DEFULT_VALUE,
    ITEM_LANGUAGE_DEFAULT_VALUE,
    ITEM_RESOLUTION_DEFULT_VALUE,
    ITEM_RESTRICTION_DEFAULT_VALUE,
    MSG_E_ITEM_ANNOTATION_REQUIRED,
    MSG_E_ITEM_COLOR_REQUIRED,
    MSG_E_ITEM_DATE_VALUE,
    MSG_E_ITEM_DATE_VALUE_DEFAULT,
    MSG_E_ITEM_DOES_NOT_EXIST,
    MSG_E_ITEM_DURATION_REQUIRED,
    MSG_E_ITEM_FORMAT_REQUIRED,
    MSG_E_ITEM_LANGUAGE_REQUIRED,
    MSG_E_ITEM_NUMBER,
    MSG_E_ITEM_RESOLUTION_REQUIRED,
    MSG_E_ITEM_SELF_RELATE,
    MSG_E_ITEM_SIZE_VALUE_FOR_PAPER,
    MSG_E_RESTRICTION_VALUE,
    MSG_E_SECUTIRY_LEVEL_VALUE,
    MSG_E_UNIT_OF_MEASURE_VALUE,
    NOT_REQUIERE_LANGUAGE_TYPE,
    RELATED_ITEM,
    REQUIERE_ANNOTATION_TYPE,
    REQUIERE_COLOR_TYPE,
    REQUIERE_DURATION_TYPE,
    REQUIERE_FORMAT_TYPE,
    REQUIERE_RESLOLUTION_TYPE
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


def validate_related_item(related_items: list[int], item) -> None:
    """Validate related items.
    
    Args:
        related_items: list of related item id.
        item: Item instance to which related objects should refere to.
        
    Raises:
        ValidationError: If related items contains errors."""
    # Check if item id exists in given inventory.
    for id in related_items:
        if not item.inventory.items.filter(id=id).exists():
            raise ValidationError({RELATED_ITEM: MSG_E_ITEM_DOES_NOT_EXIST.format(id)}) 
        
        # Check if item is relating to self
        if id == item.id:
            raise ValidationError({RELATED_ITEM: MSG_E_ITEM_SELF_RELATE}) 

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
        return MSG_E_ITEM_NUMBER
    

def validate_item_date(item) -> None | str:
    """Validate item start and end date.
    
    Start date can't be bigger then end date.
    Date can't be default date.
    
    Args:
        item: Item instance.
    
    Returns:
        None if no error else return error message."""
    if not item.start_date < item.end_date:
        return MSG_E_ITEM_DATE_VALUE
    
    if item.start_date == ITEM_DATE_DEFAULT_VALUE \
        or item.end_date == ITEM_DATE_DEFAULT_VALUE:
        return MSG_E_ITEM_DATE_VALUE_DEFAULT


def validate_item_size(item) -> None | str:
    """Validate item size according to invenotry type and media.
    
    Args:
        item: Item instance.
    
    Returns:
        None if item size is correct else returns error message.
    """
    if not item.inventory.electronic:
        # Convert number to string
        number_str = str(item.item_size)
        # Split on the decimal point
        _, fractional_part = number_str.split('.') 
        # TODO check if at this point i can pass number that is longer then 5 digits
        # Check if fractional part has any non-zero digit
        if any(char != '0' for char in fractional_part):
            return MSG_E_ITEM_SIZE_VALUE_FOR_PAPER


def validate_item_unit_of_measure(item) -> None | str:
    """Validate unit of measure according to inventory media.
    
    Args:
        item: Item instance.

    Returns:
        None if measure is valide else returns error message.
    """
    if item.inventory.electronic and not item.unit_of_measure in UNIT_OF_MEASURE_E:
        return MSG_E_UNIT_OF_MEASURE_VALUE
    elif not item.inventory.electronic and not item.unit_of_measure in UNIT_OF_MEASURE_P:
        return MSG_E_UNIT_OF_MEASURE_VALUE
        

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
    

def validate_item_annotation(item) -> None | str:
    """Validate item annotaion.
    
    Annotation is required for specific inventory type.
    
    Args:
        item: Item instance.
    
    Returns:
        None if item annotation is correct else returns error message.
    """
    if item.inventory.type in REQUIERE_ANNOTATION_TYPE \
        and item.annotation == ITEM_ANNOTATION_DEFAULT_VALUE:
        return MSG_E_ITEM_ANNOTATION_REQUIRED


def validate_item_color(item) -> None | str:
    """Validate item color.

    Color is required for specific inventory type.
    
    Args:
        item: Item instance.
    
    Returns:
        Error message if item color is not one of allowed values
        else returns None.
    """
    if item.inventory.type in REQUIERE_COLOR_TYPE \
        and not item.color in COLOR_FIELD_VALUES:
        return MSG_E_ITEM_COLOR_REQUIRED


def validate_item_format(item) -> None | str:
    """Validate item format.
    
    Format required for specific inventory type.

    Args:
        item: Item instance.
    
    Returns:
        Error message if format is not provided else returns None.
    """
    if item.inventory.type in REQUIERE_FORMAT_TYPE \
        and item.format == ITEM_FORMAT_DEFULT_VALUE:    
        return MSG_E_ITEM_FORMAT_REQUIRED


def validate_item_resolution(item) -> None | str:
    """Validate item resolution.
    
    Resolution required for specific inventory type.

    Args:
        item: Item instance.
    
    Returns:
        Error message if resolution is not provided else returns None.
    """
    if item.inventory.type in REQUIERE_RESLOLUTION_TYPE \
        and item.resolution == ITEM_RESOLUTION_DEFULT_VALUE:
        return MSG_E_ITEM_RESOLUTION_REQUIRED


def validate_item_duration(item) -> None | str:
    """Validate item duration
    
    Duration required for specific inventory type.

    Args:
        item: Item instance.
    
    Returns:
        Error message if duration is not provided else returns None.
    """
    if item.inventory.type in REQUIERE_DURATION_TYPE \
        and item.duration == ITEM_DURATION_DEFULT_VALUE:
        return MSG_E_ITEM_DURATION_REQUIRED


# Below is dictionarie with item validation functions.
# Dictionary contains Item fields name as keys
# and function name, against which field should be checked, as value
VALIDATION_DICT_FIELDS_FUNCTION = {
    'number': validate_item_number,
    'start_date': validate_item_date,
    'size': validate_item_size,
    'unit_of_measur': validate_item_unit_of_measure,
    'language': validate_item_language,
    'restriction_note': validate_item_restriction_note,
    'item_annotation': validate_item_annotation,
    'color': validate_item_color,
    'format': validate_item_format,
    'resolution': validate_item_resolution,
    'duration': validate_item_duration,
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
        print(field)

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
    
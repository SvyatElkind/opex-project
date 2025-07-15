"""Module contains validation functions for Record class."""

from django.core.exceptions import ValidationError

from helpers.constants import NO_VALUE
from records.helpers.constants import MSG_E_ACCESS_RESTRICTION__DATE_VALUE_PRESENT, MSG_E_ACCESS_RESTRICTION_DATE_VALUE, MSG_E_ACCESS_RESTRICTION_VALUE, RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE, RECORD_ACCESS_RESTRICTION_VALUES



# Field validation functions
# validate_record_access_restriciton

def validate_record_access_restriciton(access_restriction: str):
    """Validate record access_restriction.

    This is field validation function.
    
    Args:
        access_restriction: Record access restriction.
    
    Raises:
        ValidationError: If access_restriciton value is not one of allowed values.
    """
    if not access_restriction in RECORD_ACCESS_RESTRICTION_VALUES:
        raise ValidationError(MSG_E_ACCESS_RESTRICTION_VALUE)

# ---------------------------------------------------------------------
# Below are validation functions used in clean() method

def validate_access_restriction_date(record) -> None | str:
    """Validate record_restriction_date.
    
    Record restriction date should be provided 
    when access restriction equals to closed
    
    Args:
        record: Record instance.
    
    Returns:
        None if no error else return error message."""
    # Check if access_restriction is closed and date is not provided.
    # In this case date should be provided.
    if not record.access_restriction == RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE \
        and record.access_restriction_date == None:
        return MSG_E_ACCESS_RESTRICTION_DATE_VALUE
    # Check when restriction is open and date is provided.
    # In this case date should not be provided.
    if record.access_restriction == RECORD_ACCESS_RESTRICTION_DEFAULT_VALUE \
        and record.access_restriction_date != None:
        return MSG_E_ACCESS_RESTRICTION__DATE_VALUE_PRESENT



# Below is dictionarie with record validation functions.
# Dictionary contains Record fields name as keys
# and function name, against which field should be checked, as value
VALIDATION_DICT_FIELDS_FUNCTION = {
    'access_restriction_date': validate_access_restriction_date,
}

def record_validators(record) -> None:
    """This function collects all vallidation errors.
    
    Args:
        record: Record instance to be validated.
        
    Raises:
        ValidationError: If record is with errors."""

    # Create dictionary for errors
    record_errors = {}

    # Run through all validation functions.
    for field, function in VALIDATION_DICT_FIELDS_FUNCTION.items():
        field_value = getattr(record, field, NO_VALUE)

        # There is no value
        if field_value == NO_VALUE:
            continue

        result = function(record)
        
        if result:
            # Add error message
            record_errors[field] = result
    
    # Check if item has errors.
    if record_errors:
        raise ValidationError(record_errors)
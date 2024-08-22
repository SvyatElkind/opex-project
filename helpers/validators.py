"""Module for validators used in all apps."""

from rest_framework import serializers
from django.db.models import Max

from helpers.constants import (
    FIELDS,
    MSG_E_DATA_TYPE,
    MSG_E_EMPTY_FIELDS,
    MSG_E_OBJECT_DOES_NOT_EXIST,
    MSG_E_OBJECT_NUMBER,
    MSG_E_REDUNDANT_FIELDS,
    MSG_E_NO_ID
)

def validate_mandatory_fields(initial_fields: list, validation_fields: list) -> None:
    """Checks if in api body are only mandatory fields.
    
    Args:
        initial_fields: Provided fields in API request.
        validation_fields: Mandatory fields in API request.
        
    Raises:
        ValidationError: If there is extra or not all fields provided.
    """
    # Check if there is exra fields provided.
    extra_fields = set(initial_fields).difference(validation_fields)
    if extra_fields:
        raise serializers.ValidationError({FIELDS: MSG_E_REDUNDANT_FIELDS})

    # Check if all reauired fields ar provided
    missing_fields = set(validation_fields).difference(initial_fields)
    if missing_fields:
        raise serializers.ValidationError({FIELDS: MSG_E_EMPTY_FIELDS.format(', '.join(missing_fields))})


def validate_if_parent_exists(parent_model: type, id: str) -> type:
    """Validate if object with id exists parent_model.
    
    Args:
        parent_model: Model where object with given id should exist.
        id: target object id number.
    
    Raises:
        ValidationError: If id is not provided
            or object with provided id does not exist.
    """ 
    if id == None:
        raise serializers.ValidationError(MSG_E_NO_ID.format(parent_model.__name__))
    try:
        int(id)
    except ValueError:
        raise serializers.ValidationError(MSG_E_NO_ID.format(parent_model.__name__))  
          
    if not parent_model.objects.filter(id=id).exists():
        raise serializers.ValidationError(MSG_E_OBJECT_DOES_NOT_EXIST.format(parent_model.__name__))
    
    return parent_model.objects.get(id=id)

def validate_objects_number(target_model: type, number: int, filter_field: str, filter_value: int):
    """Checks if object with given number can be created.
    
    Args:
        target_model: Model through which object should be created.
        number: number to validate.
        filter_field: related parent id field.
        filter_value: related parent id.
    
    Raises:
        ValidationError if any errors appears during validation.
    """
    if not isinstance(number, int):
        raise serializers.ValidationError(MSG_E_DATA_TYPE)
    
    # Combine filed with value to pass it to filter
    filter_kwargs = {filter_field: filter_value}

    # Get last objects number.
    last_number = target_model.objects.filter(**filter_kwargs).aggregate(Max('number'))['number__max']     
    if not isinstance(last_number, int):
        if not number == 1:
            raise serializers.ValidationError(MSG_E_OBJECT_NUMBER.format(target_model.__name__))

    elif not last_number + 1 == number:
        raise serializers.ValidationError(MSG_E_OBJECT_NUMBER.format(target_model.__name__))
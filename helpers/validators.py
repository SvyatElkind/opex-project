"""Module for validators used in all apps."""

from rest_framework import serializers

from helpers.constants import (
    FIELDS,
    MSG_E_EMPTY_FIELDS,
    MSG_E_OBJECT_DOES_NOT_EXIST,
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

    # Check if all required fields ar provided
    missing_fields = set(validation_fields).difference(initial_fields)
    if missing_fields:
        raise serializers.ValidationError({FIELDS: MSG_E_EMPTY_FIELDS.format(', '.join(missing_fields))})


def validate_if_parent_exists(parent_model: type, id: str) -> type:
    """Validate if object with id exists in parent_model.
    
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
        raise serializers.ValidationError(MSG_E_OBJECT_DOES_NOT_EXIST.format(parent_model.__name__, id))
    
    return parent_model.objects.get(id=id)

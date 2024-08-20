"""Module for validators used in all apps."""

from rest_framework import serializers

from helpers.constants import (
    FIELDS,
    MSG_E_EMPTY_FIELDS,
    MSG_E_REDUNDANT_FIELDS
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
    
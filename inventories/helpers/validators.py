"""Module contains validation functions for Inventory class"""


from django.db.models import Max
from rest_framework import serializers

from fonds.models import Fond
from helpers.constants import MSG_E_OBJECT_NUMBER, VVAIS_STORAGE_TERM_LIST, VVAIS_TYPE_LIST
from inventories.helpers.constants import (
    MSG_E_FOND_DOES_NOT_EXIST,
    MSG_E_INVENTORY_ITEM_DATE,
    MSG_E_INVENTORY_POSTFIX_LENGTH,
    MSG_E_INVENTORY_STORAGE_TERM,
    MSG_E_INVENTORY_TYPE,
    MSG_E_NO_FOND_ID,
    MSG_E_WRONG_DATE
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


# Below are serializer level validators
# --------------------------------------
def validate_if_fond_exists(fond_id: str) -> None:
    """Validate if fond_id is provided and fond exists.
    
    This is serializer validation.
    
    Args:
        fond_id: Fond id number.
    
    Raises:
        ValidationError: If fond id is not provided
            or fond with provided id does not exist.
    """ 
    if fond_id == None:
        raise serializers.ValidationError(MSG_E_NO_FOND_ID)
    try:
        int(fond_id)
    except ValueError:
        raise serializers.ValidationError(MSG_E_NO_FOND_ID)  
          
    if not Fond.objects.filter(id=fond_id).exists():
        raise serializers.ValidationError(MSG_E_FOND_DOES_NOT_EXIST)
    

def validate_inventory_date(start_date, end_date) -> None:
    """Validate year of start and end date.

    This is serializer validation.
    
    Args:
        start_date: Inventory start date.
        end_date: Inventory end date.
    
    Raises:
        ValidationError: If year of start date is 
            bigger then year of end date.
    """    
    if start_date > end_date:
        raise serializers.ValidationError(MSG_E_WRONG_DATE)

def validate_inventory_item_date(inventory, end_date):
    """Validate if inventory end date includes oldest item end date.
    
    Args:
        inventory: Inventory instance.
        end_date: New invenotry end date.
    
        Raises:
            ValidateionError: If inventory end date is before oldes item end date.
    """
    if inventory.items.exists():
        oldest_item_end_date = inventory.items.all().order_by('-end_date').first().end_date
        if end_date < oldest_item_end_date:
            raise ValidationError(MSG_E_INVENTORY_ITEM_DATE)
    
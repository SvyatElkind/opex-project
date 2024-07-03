"""Module contains 'items' app models"""

import logging
from typing import Union

from django.db import models, OperationalError
from retry import retry

from helpers.constants import DELAY, TRIES, UNEXPECTED_ERROR_MSG
from inventories.models import Inventory
from items.helpers.constants import (
    ITEM_ANNOTATION_LENGTH,
    ITEM_ANNOTATION_LENGTH,
    ITEM_ARCHIVAL_HISTORY_LENGTH,
    ITEM_COPY_LENGTH, ITEM_DATE_NOTE_LENGTH,
    ITEM_EXISTS_ERROR_MSG,
    ITEM_LANGUAGE_LENGTH,
    ITEM_LIST_ERROR_MSG,
    ITEM_NOTES_LENGTH,
    ITEM_PHYSICAL_DESCRIPTION_LENGTH,
    ITEM_RESTRICTION_LENGTH,
    ITEM_SECURITY_LEVEL_LENGTH,
    ITEM_SERIES_CODE_LENGTH,
    ITEM_SISTEMATISATION_LENGTH,
    ITEM_TITLE_LENGTH,
    ITEM_UNIT_OF_MEASURE_LENGTH
)
from items.helpers.validators import (
    is_consecutive,
    select_item_validator,
    validate_item_number
)


logger = logging.getLogger(__name__)

class Item(models.Model):
    """Represents 'items' table in database"""
    item_series_code = models.CharField(max_length=ITEM_SERIES_CODE_LENGTH)
    item_number = models.IntegerField(blank=False)
    item_title = models.CharField(max_length=ITEM_TITLE_LENGTH)
    item_start_date = models.DateField()
    item_end_date = models.DateField()
    item_date_note = models.CharField(max_length=ITEM_DATE_NOTE_LENGTH)
    item_size = models.IntegerField()
    item_unit_of_measure = models.CharField(max_length=ITEM_UNIT_OF_MEASURE_LENGTH)
    related_item = models.ManyToManyField("self", symmetrical=False, related_name="related_items")
    item_notes = models.CharField(max_length=ITEM_NOTES_LENGTH)
    item_annotation = models.CharField(max_length=ITEM_ANNOTATION_LENGTH)
    item_sistematisation = models.CharField(max_length=ITEM_SISTEMATISATION_LENGTH)
    item_physical_description = models.CharField(max_length=ITEM_PHYSICAL_DESCRIPTION_LENGTH)
    item_language = models.CharField(max_length=ITEM_LANGUAGE_LENGTH)
    item_restriction = models.CharField(max_length=ITEM_RESTRICTION_LENGTH)
    item_security_level = models.CharField(max_length=ITEM_SECURITY_LEVEL_LENGTH)
    item_copy = models.CharField(max_length=ITEM_COPY_LENGTH)
    item_archival_history = models.CharField(max_length=ITEM_ARCHIVAL_HISTORY_LENGTH)
    inventory = models.ForeignKey(Inventory, related_name='items', on_delete=models.CASCADE)
    

    class Meta:
        db_table = 'items'

    def __str__(self):
        return f'{self.inventory.number}_{self.item_number}, {self.item_title}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_item_from_structure(items: list, inventory: Inventory) -> bool:
        """Create items from given list.
        
        Args:
            items: List with item numbers.
            inventory: Related inventory object.

        Returns:
            True if items are created,
            else returns ValueError or Exception
            with error message as first argument.
        """
        # Check if numbers in items are consecutive
        if not is_consecutive(items):
            raise ValueError(ITEM_LIST_ERROR_MSG)

        for item in sorted(items):
            result = validate_item_number(item, inventory)
            if result:
                raise ValueError(ITEM_EXISTS_ERROR_MSG.format(item))
            
            # Create an item
            try:
                item = Item.objects.create(item_number=item)
                # Update inventory fields related to items count and sequence
                inventory.update_inventory_gv_count()
            except:
                logger.error(UNEXPECTED_ERROR_MSG, exc_info=True)
                raise Exception(UNEXPECTED_ERROR_MSG)
        
        return True
        
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_item(item: dict, inventory: Inventory) -> 'Item':
        """Create new item
        
        Args:
            item: Dictionary with item fields as keys and its values
            inventory: Related inventroy object
        
        Returns:
            Item instance if new item created, 
            else returns ValueError with error message as first argument.
        """

        try:
            select_item_validator(item, inventory)
        except ValueError as ex:
            raise ex
        

        new_item = Item.objects.create(inventory=inventory, **item)
        new_item.save()
        return new_item

        




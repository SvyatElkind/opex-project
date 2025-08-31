"""Module contains 'items' app models."""


import logging
from typing import Union

from django.db import models, OperationalError
from django.core.validators import (
    RegexValidator,
    MaxLengthValidator,
)
from django.core.exceptions import ValidationError
from retry import retry

from helpers.constants import DELAY, TRIES
from inventories.models import Inventory
from items.helpers.constants import (
    ITEM_ANNOTATION_LENGTH,
    ITEM_ANNOTATION_LENGTH,
    ITEM_ARCHIVAL_HISTORY_LENGTH,
    ITEM_COPY_LENGTH,
    ITEM_DATE_INDICATOR_LENGTH,
    ITEM_DATE_INDICATOR_VALUE, ITEM_DATE_NOTE_LENGTH,
    ITEM_RESTRICTION_NOTE_LENGTH,
    ITEM_SECURITY_LEVEL_DEFAULT_VALUE,
    ITEM_SECURITY_LEVEL_NOTE_LENGTH,
    ITEM_LANGUAGE_LENGTH,
    ITEM_NOTES_LENGTH,
    ITEM_RESTRICTION_LENGTH,
    ITEM_SECURITY_LEVEL_LENGTH,
    ITEM_SERIES_CODE_LENGTH,
    ITEM_SISTEMATISATION_LENGTH,
    ITEM_TITLE_LENGTH,
    ITEM_RESTRICTION_DEFAULT_VALUE,
    ITEM_UNIT_OF_MEASURE_LENGTH,
    ITEM_UTIN_OF_MEASURE,
    MSG_E_ITEM_SERIES_CODE,
    MSG_E_LONG_VALUE,
    REGEX_SERIES_CODE,
    RELATED_ITEM_LIST,
)
from items.helpers.validators import (
    item_validators,
    validate_item_date_indicator,
    validate_item_number,
    validate_item_restriction,
    validate_item_security_level,
    validate_item_unit_of_measure,
    validate_related_item,
)


logger = logging.getLogger(__name__)


class Item(models.Model):
    """Represents 'items' table in database."""
    series_code = models.CharField(
        max_length=ITEM_SERIES_CODE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(ITEM_SERIES_CODE_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_SERIES_CODE_LENGTH)),
            RegexValidator(REGEX_SERIES_CODE, MSG_E_ITEM_SERIES_CODE)
        ]
    )
    number = models.PositiveSmallIntegerField(blank=False)
    title = models.CharField(
        max_length=ITEM_TITLE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(ITEM_TITLE_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_TITLE_LENGTH))
            ]
        )
    start_date = models.DateField(blank=False, null=False)
    end_date = models.DateField(blank=False, null=False)
    date_indicator = models.CharField(
        max_length=ITEM_DATE_INDICATOR_LENGTH,
        blank=False,
        default=ITEM_DATE_INDICATOR_VALUE,
        validators=[
            validate_item_date_indicator
        ]
    )
    date_note = models.CharField(
        max_length=ITEM_DATE_NOTE_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_DATE_NOTE_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_DATE_NOTE_LENGTH))
        ]
    )
    size = models.PositiveSmallIntegerField(blank=True, default=0)
    unit_of_measure = models.CharField(
        max_length=ITEM_UNIT_OF_MEASURE_LENGTH,
        blank=False,
        default=ITEM_UTIN_OF_MEASURE,
        validators=[
            validate_item_unit_of_measure
        ]
    )
    related_item = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=True,
        related_name="related_items"
    )
    notes = models.CharField(
        max_length=ITEM_NOTES_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_NOTES_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_NOTES_LENGTH))
        ]
        )
    annotation = models.CharField(
        max_length=ITEM_ANNOTATION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_ANNOTATION_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_ANNOTATION_LENGTH))
        ]
    )
    sistematisation = models.CharField(
        max_length=ITEM_SISTEMATISATION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_SISTEMATISATION_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_SISTEMATISATION_LENGTH))
        ]
    )
    language = models.CharField(
        max_length=ITEM_LANGUAGE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(ITEM_LANGUAGE_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_LANGUAGE_LENGTH))
        ]
    )
    restriction = models.CharField(
        max_length=ITEM_RESTRICTION_LENGTH,
        blank=True,
        default=ITEM_RESTRICTION_DEFAULT_VALUE,
        validators=[
            MaxLengthValidator(ITEM_RESTRICTION_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_RESTRICTION_LENGTH)),
            validate_item_restriction
        ]
    )
    restriction_note = models.CharField(
        max_length=ITEM_RESTRICTION_NOTE_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_RESTRICTION_NOTE_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_RESTRICTION_NOTE_LENGTH)),
        ]
    )
    security_level = models.CharField(
        max_length=ITEM_SECURITY_LEVEL_LENGTH,
        blank=True,
        default=ITEM_SECURITY_LEVEL_DEFAULT_VALUE,
        validators=[
            MaxLengthValidator(ITEM_SECURITY_LEVEL_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_SECURITY_LEVEL_LENGTH)),
            validate_item_security_level
        ]
    )
    security_level_note = models.CharField(
        max_length=ITEM_SECURITY_LEVEL_NOTE_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_SECURITY_LEVEL_NOTE_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_SECURITY_LEVEL_NOTE_LENGTH)),
        ]
    )
    copy = models.CharField(
        max_length=ITEM_COPY_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_COPY_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_COPY_LENGTH)),
        ]
    )
    archival_history = models.CharField(
        max_length=ITEM_ARCHIVAL_HISTORY_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(ITEM_ARCHIVAL_HISTORY_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_ARCHIVAL_HISTORY_LENGTH)),
        ]
    )
    # Related inventory object
    inventory = models.ForeignKey(Inventory, related_name='items', on_delete=models.CASCADE)
    

    class Meta:
        db_table = 'items'
        constraints = [
            models.UniqueConstraint(
                fields=['number', 'inventory'],
                name='unique_item_inventory_number'
            )
        ]

    def __str__(self):
        return f'{self.inventory.number}_{self.number}, {self.title}'
    
    def clean(self):
        """Extend clean method with additional validations"""
        super().clean()  # Call the parent class's clean method to perform default validation.

        # Custom validation logic.
        if not self.id:
            try:
                validate_item_number(self)
            except ValidationError as ex:
                raise ex
            
        try:
            item_validators(self)
        except ValidationError as ex:
            raise ex
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_item(item_dict: dict, inventory: Inventory) -> 'Item':
        """Create new item.
        
        Args:
            item_dict: Dictionary with item fields as keys and its values.
            inventory: Related inventroy object.
        
        Returns:
            Item instance if new item created.
        
        Raises:
            ValidationError with error message as first argument if item is not created
        """
        # Exctract related items from dictionary.
        related_items = item_dict.pop(RELATED_ITEM_LIST, None)

        try:
            item = Item(inventory=inventory, **item_dict)
            item.full_clean()
            item.save()
            # Update inventory fields related to items count and sequence
            inventory.update_inventory_item_count()
        except ValidationError as ex:
            raise ex
        item.update_related_items(related_items)
        
        return item
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_item(self, item_dict: dict):
        """Update item.
        
        Args:
            data: Dictionary with new values."""
        # Exctract related items from dictionary.
        related_items = item_dict.pop(RELATED_ITEM_LIST, None)
        try:
            # Get new value.
            for field, value in item_dict.items():
                # Check if field exists and can be updated.
                if hasattr(self, field):
                    setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
        self.update_related_items(related_items)

        return self

    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_related_items(self, related_items: Union[list[int], None]) -> None:
        """Update related items to given item.
        
        Raises:
            ValidationError: If can't add related items."""
        # Validate related items.
        if not related_items:
            return None
        
        try:
            validate_related_item(related_items, self)
        except ValidationError as ex:
            raise ex
        
        new_set = set(related_items)
        curent_related_item = self.related_item.values_list('id', flat=True)
        if curent_related_item:
            curent_set = set(curent_related_item)
        
            # Items to delete.
            to_delete = curent_set - new_set

            # Delete related items.
            self.related_item.remove(*to_delete)

            # Items to add.
            to_add = new_set - curent_set
        else:
            # Items to add when there is no curent relations.
            to_add = new_set
            
        # Add related items
        self.related_item.add(*to_add)

    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def delete_item(self):
        """Delete item."""
        deleted_item_number = self.number
        inventory = self.inventory
        self.delete()
        # Renumber all items greater then deleted item number 
        Item.objects.filter(number__gt=deleted_item_number).update(number=models.F('number') - 1)
        inventory.update_inventory_item_count(delete=True)


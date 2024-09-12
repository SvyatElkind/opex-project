"""Module contains 'items' app models."""


import logging
from typing import Union

from django.db import models, OperationalError
from django.db.models import Q
from django.core.validators import (
    RegexValidator,
    MaxLengthValidator,
)
from django.core.exceptions import ValidationError
from retry import retry

from helpers.constants import DELAY, TRIES
from inventories.models import Inventory
from items.helpers.constants import (
    ITEM_ANNOTATION_DEFAULT_VALUE,
    ITEM_ANNOTATION_LENGTH,
    ITEM_ANNOTATION_LENGTH,
    ITEM_ARCHIVAL_HISTORY_LENGTH,
    ITEM_COLOR_DEFULT_VALUE,
    ITEM_COLOR_LENGTH,
    ITEM_COPY_LENGTH,
    ITEM_DATE_DEFAULT_VALUE,
    ITEM_DATE_INDICATOR_LENGTH,
    ITEM_DATE_INDICATOR_VALUE, ITEM_DATE_NOTE_LENGTH,
    ITEM_DURATION_DEFULT_VALUE,
    ITEM_DURATION_LENGTH,
    ITEM_FORMAT_DEFULT_VALUE,
    ITEM_FORMAT_LENGTH,
    ITEM_LANGUAGE_DEFAULT_VALUE,
    ITEM_RESOLUTION_DEFULT_VALUE,
    ITEM_RESOLUTION_LENGTH,
    ITEM_RESTRICTION_NOTE_LENGTH,
    ITEM_SECURITY_LEVEL_DEFAULT_VALUE,
    ITEM_SECURITY_LEVEL_NOTE_LENGTH,
    ITEM_SIZE_DEFAULT_VALUE,
    ITEM_LANGUAGE_LENGTH,
    ITEM_NOTES_LENGTH,
    ITEM_RESTRICTION_LENGTH,
    ITEM_SECURITY_LEVEL_LENGTH,
    ITEM_SERIES_CODE_LENGTH,
    ITEM_SISTEMATISATION_LENGTH,
    ITEM_TITLE_LENGTH,
    ITEM_UNIT_OD_MEASURE_DEFAULT_VALUE,
    ITEM_UNIT_OF_MEASURE_LENGTH,
    ITEM_RESTRICTION_DEFAULT_VALUE,
    MSG_E_ITEM_DURATION_VALUE,
    MSG_E_ITEM_LIST_SEQUENCE,
    MSG_E_ITEM_SERIES_CODE,
    MSG_E_LONG_VALUE,
    REGEX_DURATION,
    REGEX_SERIES_CODE,
    RELATED_ITEM,
    UPDATE_FIELDS_BY_INVENTORY_TYPE
)
from items.helpers.validators import (
    is_consecutive,
    item_validators,
    validate_item_date_indicator,
    validate_item_number,
    validate_item_restriction,
    validate_item_security_level,
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
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
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
        # default=ITEM_ANNOTATION_DEFAULT_VALUE,
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
        # default=ITEM_LANGUAGE_DEFAULT_VALUE,
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

    # Fields that forms physical description
    format = models.CharField(
        max_length=ITEM_FORMAT_LENGTH,
        blank=True,
        # default=ITEM_FORMAT_DEFULT_VALUE,
        validators=[
            MaxLengthValidator(ITEM_FORMAT_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_FORMAT_LENGTH)),
        ]
    )
    color = models.CharField(
        max_length=ITEM_COLOR_LENGTH,
        blank=True,
        # default=ITEM_COLOR_DEFULT_VALUE,
        validators=[
            MaxLengthValidator(ITEM_COLOR_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_COLOR_LENGTH)),
        ]
    )
    duration = models.CharField(
        max_length=ITEM_DURATION_LENGTH,
        blank=True,
        # default=ITEM_DURATION_DEFULT_VALUE,
        validators=[
            MaxLengthValidator(ITEM_DURATION_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_DURATION_LENGTH)),
            RegexValidator(REGEX_DURATION, MSG_E_ITEM_DURATION_VALUE)
        ]
    )
    resolution = models.CharField(
        max_length=ITEM_RESOLUTION_LENGTH,
        blank=True,
        # default=ITEM_RESOLUTION_DEFULT_VALUE,
        validators=[
            MaxLengthValidator(ITEM_RESOLUTION_LENGTH,
                               MSG_E_LONG_VALUE.format(ITEM_RESOLUTION_LENGTH)),
        ]
    )
    # Related inventory object
    inventory = models.ForeignKey(Inventory, related_name='items', on_delete=models.CASCADE)
    

    class Meta:
        db_table = 'items'

    def __str__(self):
        return f'{self.inventory.number}_{self.number}, {self.title}'
    
    def clean(self):
        """Extend clean method with additional validations"""
        super().clean()  # Call the parent class's clean method to perform default validation.

        # Custom validation logic.
        try:
            item_validators(self)
        except ValidationError as ex:
            raise ex
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_item(item_dict: dict, inventory: Inventory) -> 'Item':
        """Create new item
        
        Args:
            item: Dictionary with item fields as keys and its values
            inventory: Related inventroy object
        
        Returns:
            Item instance if new item created, 
            else returns ValueError with error message as first argument.
        """
        # Delete all fields that are empty
        item_dict = {field: value for field, value in item_dict.items() if value}

        # Exctract related items from dictionary.
        related_items = item_dict.pop(RELATED_ITEM, None)

        # update_fields = UPDATE_FIELDS_BY_INVENTORY_TYPE[inventory.type]

        # TODO does this part is executed in validations?
        # for field in update_fields:
        #     if not item_dict.get(field):
        #         raise ValidationError("lauks {} ir obligāts.")

        try:
            item = Item(inventory=inventory, **item_dict)
            item.full_clean()
            item.save()
            # Update inventory fields related to items count and sequence
            inventory.update_inventory_gv_count()
        except ValidationError as ex:
            raise ex
        
        item.add_related_items(related_items)
        
        return item


    def add_related_items(self, related_items: Union[list[int], None]) -> None:
        """Add related items to given item.
        
        Raises:
            ValidationError: If can't add related items."""
        # Validate related items.
        if related_items:
            try:
                validate_related_item(related_items, self)
            except ValidationError as ex:
                raise ex
            
            # Add related items
            self.related_item.add(*related_items)

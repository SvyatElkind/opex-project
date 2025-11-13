"""Module contains 'inventories' app models."""


import logging

from django.db import models, OperationalError
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
    MaxLengthValidator
)
from django.core.exceptions import ValidationError
from retry import retry

from fonds.models import Fond
from helpers.constants import ERROR, TRIES, DELAY
from inventories.helpers.constants import (
    INVENTORY_CREATE_FIELDS_UI,
    INVENTORY_CREATE_FIELDS_VVAIS,
    INVENTORY_UPDATE_FIELDS,
    MSG_E_CANT_DELETE_REPORT_INVENTORY,
    MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE,
    INVENTORY_MAX_NUM,
    INVENTORY_MIN_NUM,
    MSG_E_INVENTORY_NUMBER,
    POSTFIX_MAX_LENGTH,
    MSG_E_INVENTORY_POSTFIX_LENGTH,
    STORAGE_TERMS_LENGTH,
    TYPE_LENGTH
)
from inventories.helpers.validators import (
    validate_inventory_item_date,
    validate_inventory_number,
    validate_inventory_postfix,
    validate_inventory_type,
    validate_storage_term
)


logger = logging.getLogger(__name__)


class Inventory(models.Model):
    """Represents 'inventory_lists' table in database."""
    number = models.PositiveSmallIntegerField(
        blank=False,
        validators=[
            MinValueValidator(INVENTORY_MIN_NUM, MSG_E_INVENTORY_NUMBER),
            MaxValueValidator(INVENTORY_MAX_NUM, MSG_E_INVENTORY_NUMBER)
        ]
    )
    postfix = models.CharField(
        max_length=POSTFIX_MAX_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(POSTFIX_MAX_LENGTH, MSG_E_INVENTORY_POSTFIX_LENGTH),
            validate_inventory_postfix
        ]
    )
    subfond = models.PositiveSmallIntegerField(blank=True, default=0)
    type = models.CharField(
        max_length=TYPE_LENGTH,
        blank=False,
        validators=[
            validate_inventory_type
        ]
    )
    electronic = models.BooleanField(blank=True, default=True)
    last_gv = models.PositiveSmallIntegerField(blank=True, default=0)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    storage_term = models.CharField(
        max_length=STORAGE_TERMS_LENGTH,
        blank=False,
        validators=[
            validate_storage_term
        ]
    )
    items_per_period = models.PositiveSmallIntegerField(blank=True, default=0)
    total_items = models.PositiveSmallIntegerField(blank=True, default=0)
    from_report = models.BooleanField(blank=True, default=False)
    fond = models.ForeignKey(Fond, related_name='inventories', on_delete=models.CASCADE)

    class Meta:
        db_table = 'inventory_lists'
        constraints = [
            models.UniqueConstraint(
                fields=['fond', 'number', 'postfix'],
                name='unique_number_postfix', 
                violation_error_message=MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE) #TODO Bug in Django
        ]

    def __str__(self):
        return f'{self.fond}, {self.number}.US'
    
    def clean(self):
        """Extend clean method with additional validations"""
        super().clean()  # Call the parent class's clean method to perform default validation.

        # Custom validation logic.

        # Validate only when creating new object.
        if not self.id:
            try:
                validate_inventory_number(self)
            except ValidationError as ex:
                raise ex

    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_inventory(inventory_dict: dict, fond: Fond, vvais: bool = False) -> 'Inventory':
        """Create new inventory list.

        Function is used to create inventory eather from VVAIS report or from UI.

        Args:
            inventory_dict: Dictionary with inventroy fields as keys and its values.
            fond: Related fond instance.
            vvais: Indicates source is VVAIS report. False indicates that source is UI.
    
        Returns:
            Inventory instance.
        
        Raises:
            ValidationError: If there is validation errors.
            ValueError: If invenotry dictionary contains unacceptable data types.
        """
        # Get right filed list.
        fields = INVENTORY_CREATE_FIELDS_VVAIS if vvais else INVENTORY_CREATE_FIELDS_UI

        try:
            # Create inventory instance.
            inventory = Inventory(fond=fond)

            # Assigne values to invenotry instance fields. 
            for field in fields:
                if field in inventory_dict:
                    setattr(inventory, field, inventory_dict[field])

            # Check if inventory is from VVAIS report.
            if vvais:
                inventory.from_report = True

            # Validate and save.
            inventory.full_clean()
            inventory.save()
        except ValidationError as ex:
            raise ex
        
        return inventory
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_inventory_item_count(self, delete=False):
        """Updates inventory gv number related count.
        
        Add or extract 1 to/from last_gv, items_per_period and total items
        when new Item is created.
        """
        if delete:
            self.last_gv -= 1
            self.items_per_period -= 1
            self.total_items -= 1
        else:
            self.last_gv += 1
            self.items_per_period += 1
            self.total_items += 1
        self.save()
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update(self, data: dict):
        """Update inventory fields.
        
        Args:
            data: Dictionary with new values.
        """
        
        # Check if invetnory new end date includes its oldes item end date.
        inventory_new_end_date = data.get('end_date')
        if inventory_new_end_date:
            validate_inventory_item_date(self, inventory_new_end_date)
        try:
            # Get new value.
            for field, value in data.items():
                # Check if field exists and can be updated.
                if field in INVENTORY_UPDATE_FIELDS and hasattr(self, field):
                    setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex

        return self
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def delete_inventory(self):
        """Deletes inventory.
        
        Only invneotries that are not in report can be deleted.
        """
        # Check inventory origin.
        if self.from_report:
            raise ValidationError({ERROR: MSG_E_CANT_DELETE_REPORT_INVENTORY})

        # Save invenotry number before deletion.
        # This is needed to renumber all inventories after deletion.
        deleted_inventory_number = self.number
        self.delete()
        try:
            # Renumber all inventoris greater then deleted invntory number.
            Inventory.objects.filter(number__gt=deleted_inventory_number).update(number=models.F('number') - 1)
        except Exception as ex:
            raise ex


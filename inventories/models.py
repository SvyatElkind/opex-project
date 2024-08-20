"""Module contains 'inventories' app models."""

import logging

from django.db import IntegrityError, models, OperationalError
from django.db.models import Max
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
    MaxLengthValidator
)
from django.core.exceptions import ValidationError
from retry import retry

from fonds.models import Fond
from helpers.constants import MSG_E_UNEXPECTED, TRIES, DELAY, MSG_E_DATA_TYPE
from inventories.helpers.constants import (
    INVENTORY_FULL_UPDATE_FIELDS,
    INVENTORY_GENERAL_UPDATE_FIELDS,
    MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE,
    INVENTORY_MAX_NUM,
    INVENTORY_MIN_NUM,
    MSG_E_INVENTORY_NUMBER,
    MSG_E_NEW_INVENTORY_NUMBER_SEQUENCE,
    POSTFIX_MAX_LENGTH,
    MSG_E_INVENTORY_POSTFIX_LENGTH,
    STORAGE_TERMS_LENGTH,
    TYPE_LENGTH
)
from inventories.helpers.validators import (
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
    type = models.CharField(
        max_length=TYPE_LENGTH,
        blank=False,
        validators=[
            validate_inventory_type
        ]
        )
    electronic = models.BooleanField(default=False)
    last_gv = models.PositiveSmallIntegerField(default=0)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    storage_term = models.CharField(
        max_length=STORAGE_TERMS_LENGTH,
        blank=False,
        validators=[
            validate_storage_term
        ]
        )
    items_per_period = models.PositiveSmallIntegerField(default=0)
    total_items = models.PositiveSmallIntegerField(default=0)
    allow_full_field_update = models.BooleanField(default=False)
    fond = models.ForeignKey(Fond, related_name='inventories', on_delete=models.CASCADE)

    class Meta:
        db_table = 'inventory_lists'
        constraints = [
            models.UniqueConstraint(
                fields=['number', 'postfix'],
                name='unique_number_postfix',
                violation_error_message=MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE) #TODO Bug in Django
        ]

    def __str__(self):
        return f'{self.fond}, {self.number}.US'
    

    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_inventory_from_vvais(inventory: dict, fond: Fond) -> 'Inventory':
        """Create new inventory list from VVAIS report.

        Args:
            inventory: Dictionary with inventroy fields as keys and its values.
            fond: Fond instance.
    
        Returns:
            Inventory instance if new inventory created.
        
        Raises:
            ValidationError: If there is validation errors.
            ValueError: If invenotry dictionary contains unacceptable data types.
        """
        try:
            inventory_object = Inventory(fond=fond, **inventory)
            inventory_object.full_clean()
            inventory_object.save()
        except ValidationError as ex:
            raise ex
        except ValueError:
            raise ValueError(MSG_E_DATA_TYPE)
        except:
            raise Exception(MSG_E_UNEXPECTED)
        
        return inventory_object

    @staticmethod
    def add_inventory_from_structure(number: int, fond: Fond) -> 'Inventory':
        """Add new inventory from folder structure.
        
        Method is used solely for invenotries which are not in the database and
        exists in import folder structure.

        Args:
            number: Number of new inventory list.
            fond: Related fond instance.
        
        Returns:
            Inventory instance if new inventory created.
        
        Raises:
            ValidationError: If there is validation errors.
            IntegrityError: If inventory with same number and prefix exists.
        """
        # Get last inventory number.
        last_number = Inventory.objects.filter(fond_id=fond.id).aggregate(Max('number'))['number__max']     
        if not isinstance(last_number, int):
            if not number == 1:
                raise ValidationError(MSG_E_NEW_INVENTORY_NUMBER_SEQUENCE)
        try:
            inventory_object = Inventory.objects.create(number=number,
                                                        fond=fond,
                                                        allow_full_field_update=True)
        except IntegrityError:
            raise IntegrityError(MSG_E_INVENTORY_NUMBER_POSTFIX_UNIQUE)
        
        return inventory_object

    @staticmethod
    def add_inventory(inventory_dict: dict, fond: Fond) -> 'Inventory':
        """Add inventory from UI.
        
        Args:
            inventory_dict: Dict with inventory data. Allowed fields are in serializer.
            fond: Related Fond instance.
        
        Returns:
            New Inventory instance.
        
        Raises:
            ValidationError: If invneotry has validation errors.
        """
        try:
            inventory = Inventory(fond=fond, **inventory_dict)
            inventory.full_clean()
            inventory.save()
        except ValidationError as ex:
            raise ex
        
        return inventory
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_inventory_gv_count(self):
        """Updates inventory gv number related count.
        
        Add +1 to last_gv, items_per_period and total items
        when new Item is created.
        """
        self.last_gv += 1
        self.items_per_period += 1
        self.total_items += 1
        self.save()
    
    def update(self, data: dict):
        
        # This part allows to check which fields can be updated.
        # Full update is allowed once only for inventories form structure.
        if self.allow_full_field_update:
            update_field = INVENTORY_FULL_UPDATE_FIELDS
        else:
            update_field = INVENTORY_GENERAL_UPDATE_FIELDS

        try:
            # Get new value.
            for field, value in data.items():
                # Check if field exists and can be updated.
                if field in update_field and hasattr(self, field):
                    setattr(self, field, value)
            self.full_clean()
            self.save()
        except:
            raise ValidationError(MSG_E_UNEXPECTED)
        # As full update is allowed only once and only for inventories
        # that was uploaded throug structure, change status of this field to false.
        if self.allow_full_field_update:
            self.change_allow_full_field_update_status()

        return self
    
    def delete_inventory(self):
        """Deletes inventory.
        
        Only invneotries that are not in report can be deleted.
        """

        self.delete()
        # TODO delete related document files
    
    def change_allow_full_field_update_status(self):
        """Changes status of allow_full_field_update to False."""
        self.allow_full_field_update = False
        self.save()
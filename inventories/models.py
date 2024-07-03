"""Module contains 'inventories' app models"""

import logging

from django.db import IntegrityError, models, OperationalError
from retry import retry

from fonds.models import Fond
from helpers.constants import TRIES, DELAY
from inventories.helpers.constants import (
    INVENTORY_EXISTS_MSG,
    POSTFIX_LENGTH,
    STORAGE_TERMS_LENGTH,
    TYPE_LENGTH
)
from inventories.helpers.validators import validate_invenotry

logger = logging.getLogger(__name__)


class Inventory(models.Model):
    """Represents 'inventory_lists' table in database."""
    number = models.IntegerField(blank=False)
    postfix = models.CharField(max_length=POSTFIX_LENGTH, blank=True)
    type = models.CharField(max_length=TYPE_LENGTH, blank=True)
    electronic = models.BooleanField(default=False)
    last_gv = models.IntegerField(default=0)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    storage_term = models.CharField(max_length=STORAGE_TERMS_LENGTH, blank=True)
    items_per_period = models.IntegerField(default=0)
    total_items = models.IntegerField(default=0)
    fond = models.ForeignKey(Fond, related_name='inventories', on_delete=models.CASCADE)

    class Meta:
        db_table = 'inventory_lists'
    
    def __str__(self):
        return f'{self.fond}, {self.number}.US'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def invenorty_exists(number, postfix=None) -> bool:
        """Checks if inventory with the same number already exists.
        
        Args:
            number: Inventory number.
            postfix: Inventory postfix.
        
        Returns:
            True if inventory exists, else returns False.
        """
        inventory = Inventory.objects.filter(number=number).first()
        if inventory and inventory.postfix == postfix:
            return True
        return False


    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_inventory_from_vvais(inventory: dict, fond: Fond) -> 'Inventory':
        """Create new inventory list from VVAIS report.
        
        Args:
            inventory: Dictionary with inventroy fields as keys and its values.
            
        Returns:
            Inventory instance if new inventory created, 
        
        Raises:
            IntegrityError: If inventory with given number and postfix exists.
            ValueError: If invenotry dictionary contains unacceptable values.
        """
        # Checks if inventory with the same number already exists.
        postfix = inventory.get('postfix', None)
        if Inventory.invenorty_exists(inventory['number'], postfix):
            raise IntegrityError(INVENTORY_EXISTS_MSG)

        # Get validated invenotry
        try:
            validated_inventory = validate_invenotry(inventory)
        except ValueError as ex:
            raise ex
        
        # Create inventory from dictionary if validation succeed
        inventory_object = Inventory(fond=fond, **validated_inventory)
        inventory_object.save()
        return inventory_object
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_inventory_gv_count(self):
        """Updates inventory gv number related count.
        
        Add +1 to last_gv, items_per_period and total items.
        """
        self.last_gv += 1
        self.items_per_period += 1
        self.total_items += 1
        self.save()        

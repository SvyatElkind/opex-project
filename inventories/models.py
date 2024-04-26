"""Module contains inventories app models"""

import logging
from typing import Union

from django.db import models, OperationalError
from retry import retry

from fonds.models import Fond
from helpers.constants import TRIES, DELAY
from inventories.constants import INVENTORY_EXISTS_MSG
from inventories.helpers.validators import validate_invenotry

logger = logging.getLogger(__name__)


class Inventory(models.Model):
    """Represents 'inventory_lists' table in database."""
    number = models.IntegerField(blank=False)
    postfix = models.CharField(max_length=3, blank=True)
    type = models.CharField(max_length=20, blank=True)
    electronic = models.BooleanField(default=False)
    last_gv = models.IntegerField(default=0)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    storage_term = models.CharField(max_length=20, blank=True)
    items_per_period = models.IntegerField(blank=True, null=True)
    total_items = models.IntegerField(blank=True, null=True)
    fond = models.ForeignKey(Fond, on_delete=models.CASCADE)

    class Meta:
        db_table = 'inventory_lists'
    
    def __str__(self):
        return f'{self.fond}, {self.number}.US'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_inventory_from_vvais(inventory: dict, fond: Fond) -> Union[dict, 'Inventory']:
        """Create new inventory list from VVAIS report.
        
        Args:
            inventory: Dictionary with inventroy fields as keys
              and its values
            
        Returns:
            Inventory instance if new inventory list created, 
            else returns list where first value is False and 
            second is error messages.
        """
        # Checks if inventory with the same number already exists.
        inventory_exists = Inventory.objects.filter(number=inventory['number']).exists()
        if inventory_exists:
            return {'inventory': INVENTORY_EXISTS_MSG}

        # Get validated invenotry
        vlidated, result = validate_invenotry(inventory)

        # Return errors dictionary in validation failed
        if not vlidated:
            return result
        
        # Create inventory wrom dictionary if validation succeed
        inventory_object = Inventory(fond=fond, **result)
        inventory_object.save()
        return inventory_object


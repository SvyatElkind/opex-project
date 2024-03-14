"""Modulī atrodas 'inventories' aplikācijas modeļi."""

import logging
from typing import Union

from django.db import models, OperationalError
from retry import retry

from fonds.models import Fond
from helpers.constants import TRIES, DELAY, USEXPECTED_ERROR_MSG

logger = logging.getLogger(__name__)


class Inventory(models.Model):
    """Atspoguļo 'inventory_lists' tabulu datubāzē."""
    number = models.IntegerField(blank=False)
    number_postfix = models.CharField(max_length=3)
    type = models.CharField(max_length=20)
    electronic = models.BooleanField(default=False)
    last_gv = models.CharField(max_length=8)
    start_date = models.DateField()
    end_date = models.DateField()
    storage_term = models.CharField(max_length=20)
    items_per_period = models.IntegerField()
    total_items = models.IntegerField()
    fond = models.ForeignKey(Fond, on_delete=models.CASCADE)

    class Meta:
        db_table = 'inventory_lists'
    
    def __str__(self):
        return f'{self.fond}, {self.number}.US'
    
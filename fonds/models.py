"""Module contains 'fonds' app models"""

import logging

from django.db import models, OperationalError
from retry import retry

from fonds.constants import FOND_EXISTS_MSG
from helpers.constants import DELAY, TRIES, UNEXPECTED_ERROR_MSG, WRONG_VALUE_PROVIDED
from institutions.models import Institution

logger = logging.getLogger(__name__)

class Fond(models.Model):
    """Represents 'fonds' table in database"""
    fond_code = models.CharField(max_length=30, unique=True, blank=False)
    arch_abbreviation = models.CharField(max_length=5, blank=False)
    arch_title = models.CharField(max_length=100, blank=False)
    fond_number = models.IntegerField(blank=False)
    fond_title = models.CharField(max_length=500, blank=False)
    subfond = models.BooleanField(default=False)

    institution = models.OneToOneField(
        Institution,
        on_delete=models.CASCADE,
        related_name='fond',
    )

    class Meta:
        db_table = 'fonds'

    def __str__(self):
        return f'{self.fond_code}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_fond(
        fond_code: str,
        arch_abbreviation: str,
        arch_title: str,
        fond_number: int,
        fond_title: str,
        subfond: bool,
        institution: Institution) -> 'Fond':
        """Create new fond from VVAIS report.
        
        Args:
            fond_code: Fond code.
            arch_abbreviation: Archive abbreviation.
            arch_title: Archive title.
            fond_number: Fond number.
            fond_title: Fonda title.
            subfond: Subfond indicator. 
            institution: Related Institution instance.

        Returns:
            Fond instance if new fond created, 
            else returns message with worning
        """
        # Check if fond with given fond code already exists
        fond_exists = Fond.objects.filter(fond_code=fond_code).exists()
        if fond_exists:
            raise ValueError(FOND_EXISTS_MSG)
     
        # Create new fond
        try:
            fond = Fond.objects.create(fond_code=fond_code,
                                arch_abbreviation=arch_abbreviation,
                                arch_title=arch_title,
                                fond_number=fond_number,
                                fond_title=fond_title,
                                subfond=subfond,
                                institution=institution)
    
        except ValueError:
            logger.error(WRONG_VALUE_PROVIDED, exc_info=True)
            raise ValueError(WRONG_VALUE_PROVIDED)
        except:
            logger.error(UNEXPECTED_ERROR_MSG, exc_info=True)
            raise ValueError(UNEXPECTED_ERROR_MSG)
        
        return fond
        
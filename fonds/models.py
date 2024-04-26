"""Modulī atrodas 'fonds' aplikācijas modeļi"""

import logging
from typing import Union

from django.db import models, OperationalError
from retry import retry

from fonds.constants import FOND_EXISTS_MSG
from helpers.constants import DELAY, TRIES, UNEXPECTED_ERROR_MSG, WRONG_VALUE_PROVIDED
from institutions.models import Institution

logger = logging.getLogger(__name__)

class Fond(models.Model):
    """Atspoguļo 'fonds' tabulu datubāzē"""
    fond_code = models.CharField(max_length=30, unique=True, blank=False)
    arch_abbreviation = models.CharField(max_length=5, blank=False)
    arch_title = models.CharField(max_length=100, blank=False)
    fond_number = models.IntegerField(blank=False)
    fond_title = models.CharField(max_length=500, blank=False)
    subfond = models.BooleanField(default=False)

    institution = models.OneToOneField(
        Institution,
        on_delete=models.CASCADE,
        primary_key=True,
    )

    class Meta:
        db_table = 'fonds'

    def __str__(self):
        # TODO Pievienot apakšfondu
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
        institution: Institution) -> Union[str, 'Fond']:
        """Izveido jaunu fondu.
        
        Args:
            fond_code: Fonda uzskaites kods.
            arch_abbreviation: Arhīva abreviatūra.
            arch_title: Arhīva pilns nosaukums.
            fond_number: Fonda numurs.
            fond_title: Fonda nosaukums.
            subfond: Apakšfonda indikātors. 
            institution: Institūcijas instance kurai piesaista fondu.

        Returns:
            Fond instance if new fond created, 
            else returns message with worning
        """
        # Pārbauda vai fonds ar doto uzskaites kodu eksistē
        fond_exists = Fond.objects.filter(fond_code=fond_code).exists()
        if fond_exists:
            return FOND_EXISTS_MSG
     
        # Izveido jaunu fondu
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
            return WRONG_VALUE_PROVIDED
        except:
            logger.error(UNEXPECTED_ERROR_MSG, exc_info=True)
            return UNEXPECTED_ERROR_MSG
        
        return fond
        
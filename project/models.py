import logging

from django.db import models, OperationalError
from django.utils import timezone
from retry import retry

from helpers.constants import TRIES, DELAY
from project.constants import (
    WRONG_PROJECT_NAME,
    PROJECT_EXISTS,
    USEXPECTED_ERROR_MSG
)

logger = logging.getLogger(__name__)


class Project(models.Model):
    """Atspoguļo 'projects' tabulu datubāzē"""
    name = models.CharField(max_length=50, blank=False, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    validated = models.BooleanField(default=False)

    class Meta:
        db_table = 'projects'

    def __str__(self):
        return f'{self.name}'
    
    @staticmethod 
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_project(name: str) -> str | None:
        """Izveido jaunu projektu
        
        Args:
            name: Projekta nosaukums.
        """
        # Pārbauda projekta nosaukuma simbolus
        if not name.isalnum():
            return WRONG_PROJECT_NAME
        
        # Pārbauda vai projekts ar doto nosaukumu eksistē
        project = Project.objects.filter(name=name).exists()
        if project:
            return PROJECT_EXISTS

        try:
            Project.objects.create(name=name)
        except:
            logger.error(USEXPECTED_ERROR_MSG, exc_info=True)
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def is_validated(self) -> bool:
        """Pārbauda vai projekts ir validēts"""
        return self.validated
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def validate(self) -> None:
        """Validē projektu"""
        pass

        






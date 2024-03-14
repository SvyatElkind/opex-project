"""Modulī atrodas 'project' aplikācijas modeļi"""

import logging
from typing import Union

from django.db import models, OperationalError
from django.utils import timezone
from retry import retry

from helpers.constants import TRIES, DELAY, USEXPECTED_ERROR_MSG
from project.constants import PROJECT_EXISTS_MSG

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
    def add_project(name: str) -> Union[str, 'Project']:
        """Izveido jaunu projektu
        
        Args:
            name: Projekta nosaukums.

        Returns:
            Project instance if new project created, 
            else returns message with worning
        """
        # Pārbauda vai projekts ar doto nosaukumu eksistē
        project_exists = Project.objects.filter(name=name).exists()
        if project_exists:
            return PROJECT_EXISTS_MSG

        try:
            project = Project.objects.create(name=name)
        except:
            logger.error(USEXPECTED_ERROR_MSG, exc_info=True)
        
        return project
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def is_validated(self) -> bool:
        """Pārbauda vai projekts ir validēts"""
        return self.validated

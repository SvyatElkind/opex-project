"""Modulī atrodas 'institutions' aplikācijas modeļi."""

import logging
from typing import Union

from django.db import models, OperationalError
from retry import retry

from project.models import Project
from helpers.constants import TRIES, DELAY, USEXPECTED_ERROR_MSG
from institutions.constants import INSTITUTION_EXISTS_MSG

logger = logging.getLogger(__name__)


class Institution(models.Model):
    """Atspoguļo 'institutions' tabulu datubāzē."""
    reg_nr = models.IntegerField(blank=False, unique=True)
    name = models.CharField(max_length=200, blank=False, unique=True)
    creator = models.CharField(max_length=30)
    creator_position = models.CharField(max_length=200)
    signer = models.CharField(max_length=30)
    signer_position = models.CharField(max_length=200)

    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        primary_key=True,
    )

    class Meta:
        db_table = 'institutions'
    
    def __str__(self):
        return f'{self.name}, {self.reg_nr}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_institution(reg_nr: int,
                        name: str,
                        project: Project) -> Union[str, 'Institution']:
        """Izveido jaunu institūciju.
        
        Args:
            reg_nr: Institūcijas reģistrācijas numurs.
            name: Institūcijas nosaukums.
            project: Projekta instance kuram piesaista institūciju.

        Returns:
            Institution instance if new institution created, 
            else returns message with worning
        """
        # Pārbauda vai institūcija jau eksistē
        inst_reg = Institution.objects.filter(reg_nr=reg_nr).exists()
        inst_name = Institution.objects.filter(name=name).exists()

        if inst_reg or inst_name:
            return INSTITUTION_EXISTS_MSG
        
        # Iegust projekta instantci kuru piesaista institūcijai
        project_obj = Project.objects.get(id=project)

        try:
            Institution.objects.create(reg_nr=reg_nr, name=name, project=project_obj)
        except:
            logger.error(USEXPECTED_ERROR_MSG)

    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def bulk_update(inst_id: int, new_data: dict) -> None:
        """Atjauno institūcijas datus.

        Atjauno datus izņemot lauku 'reg_nr' un 'name'
        
        Args:
            new_data: Vārdnīca ar jauniem datiem
        """
        # TODO Exclude reg_nr and name
        Institution.objects.filter(id=inst_id).update(**new_data)

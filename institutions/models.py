"""Module contains 'institutions' app models"""

import logging

from django.db import IntegrityError, models, OperationalError
from retry import retry

from project.models import Project
from helpers.constants import (
    TRIES,
    DELAY,
    UNEXPECTED_ERROR_MSG,
    WRONG_VALUE_PROVIDED
)
from institutions.helpers.constants import (
    CREATOR_LENGTH,
    CREATOR_POSITION_LENGTH,
    INSTITUTION_EXISTS_MSG,
    INSTITUTION_NAME_LENGTH,
    SIGHER_POSITION_LENGTH,
    SIGNER_LENGTH
)

logger = logging.getLogger(__name__)


class Institution(models.Model):
    """Represents 'institutions' table in database"""
    reg_nr = models.IntegerField(blank=False, unique=True)
    name = models.CharField(max_length=INSTITUTION_NAME_LENGTH, blank=False, unique=True)
    creator = models.CharField(max_length=CREATOR_LENGTH)
    creator_position = models.CharField(max_length=CREATOR_POSITION_LENGTH)
    signer = models.CharField(max_length=SIGNER_LENGTH)
    signer_position = models.CharField(max_length=SIGHER_POSITION_LENGTH)

    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='institution',
    )

    class Meta:
        db_table = 'institutions'
    
    def __str__(self):
        return f'{self.name}, {self.reg_nr}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_institution(reg_nr: int,
                        name: str,
                        project: Project) -> 'Institution':
        """Create new institution.
        
        Args:
            reg_nr: Institution registration number.
            name: Name of institution.
            project: Related Project instance.

        Returns:
            Institution instance if new institution created.

        Raises:
            IntegrityError: If institution with given name or reg_nr exists.
            ValueError: If institution fields contains unacceptable values.
        """
        # Checks if institution already exists
        inst_reg = Institution.objects.filter(reg_nr=reg_nr).exists()
        inst_name = Institution.objects.filter(name=name).exists()

        if inst_reg or inst_name:
            raise IntegrityError(INSTITUTION_EXISTS_MSG)

        try:
            institution = Institution.objects.create(reg_nr=reg_nr,
                                                     name=name,
                                                     project=project)
        except ValueError:
            logger.error(WRONG_VALUE_PROVIDED, exc_info=True)
            raise ValueError(WRONG_VALUE_PROVIDED)
        except:
            logger.error(UNEXPECTED_ERROR_MSG, exc_info=True)
            raise ValueError(UNEXPECTED_ERROR_MSG)
        
        return institution

    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def bulk_update(inst_id: int, new_data: dict) -> None:
        """Update institution object.

        Function doesn't update 'reg_nr' un 'name' fields of Institution instance.
        
        Args:
            new_data: Dictionary with new values.
        """
        
        Institution.objects.filter(id=inst_id).update(**new_data)

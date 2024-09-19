"""Module contains 'institutions' app models."""

import logging

from django.db import models, OperationalError
from django.core.validators import MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from retry import retry

from project.models import Project
from helpers.constants import (
    TRIES,
    DELAY,
    MSG_E_UNEXPECTED,
    MSG_E_DATA_TYPE
)
from institutions.helpers.constants import (
    CREATOR_LENGTH,
    CREATOR_POSITION_LENGTH,
    INSTITUTION_NAME_LENGTH,
    INSTITUTION_UPDATE_FIELDS,
    MSG_E_REG_NR,
    REG_NR_LENGTH,
    REGEX_REG_NR,
    SIGHER_POSITION_LENGTH,
    SIGNER_LENGTH,
    MSG_E_CREATOR_LENGTH,
    MSG_E_CREATOR_POSITION_LENGTH,
    MSG_E_INSTITUTION_NAME_LENGTH,
    MSG_E_INSTITUTION_NAME_UNEQUE,
    MSG_E_REG_NR_UNIQUE,
    MSG_E_SIGNER_LENGTH,
    MSG_E_SIGNER_POSITION_LENGTH
)

logger = logging.getLogger(__name__)


class Institution(models.Model):
    """Represents 'institutions' table in database."""
    reg_nr = models.CharField(
        max_length=REG_NR_LENGTH,
        blank=False,
        unique=True,
        error_messages={
            'unique': MSG_E_REG_NR_UNIQUE
        },
        validators=[
            RegexValidator(REGEX_REG_NR, MSG_E_REG_NR)
        ]
    )
    name = models.CharField(
        max_length=INSTITUTION_NAME_LENGTH,
        blank=False,
        unique=True,
        validators=[
            MaxLengthValidator(INSTITUTION_NAME_LENGTH, MSG_E_INSTITUTION_NAME_LENGTH)
        ],
        error_messages={
            'unique': MSG_E_INSTITUTION_NAME_UNEQUE
        }
    )
    creator = models.CharField(
        max_length=CREATOR_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(CREATOR_LENGTH, MSG_E_CREATOR_LENGTH),
        ]
    )
    creator_position = models.CharField(
        max_length=CREATOR_POSITION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(CREATOR_POSITION_LENGTH, MSG_E_CREATOR_POSITION_LENGTH)
        ]
    )
    signer = models.CharField(
        max_length=SIGNER_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(SIGNER_LENGTH, MSG_E_SIGNER_LENGTH)
        ]
    )
    signer_position = models.CharField(
        max_length=SIGHER_POSITION_LENGTH,
        blank=True,
        validators=[
            MaxLengthValidator(SIGHER_POSITION_LENGTH, MSG_E_SIGNER_POSITION_LENGTH)
        ]
    )

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
            ValidationError: If there was validation errors.
        """
        try:
            institution = Institution(reg_nr=reg_nr, name=name, project=project)
            institution.full_clean()
            institution.save()
        except ValidationError as ex:
            raise ex
        
        return institution

    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update(self, data: dict) -> 'Institution':
        """Update institution object.

        Args:
            data: Dictionary with new values.

        Raises:
            ValidationError: If any errors appear.
        """
        try:
            # Get new value.
            for field, value in data.items():
                if field in INSTITUTION_UPDATE_FIELDS and hasattr(self, field):
                    setattr(self, field, value)
            self.full_clean()
            self.save()
        except ValidationError as ex:
            raise ex
                
        return self
    
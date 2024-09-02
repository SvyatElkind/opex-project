"""Module contains 'fonds' app models"""

import logging

from django.db import models, OperationalError
from django.core.validators import MaxLengthValidator
from django.core.exceptions import ValidationError
from retry import retry

from fonds.helpers.constants import (
    ARCH_ABBREVIATION_LENGTH,
    ARCH_TITLE_LENGTH,
    FOND_CODE_LENGTH,
    FOND_TITLE_LENGTH,
    MSG_E_FOND_CODE_LENGTH,
    MSG_E_FOND_CODE_UNIQUE,
    MSG_E_FOND_TITLE_LENGTH
)
from fonds.helpers.validators import validate_arch_abbreviation_value, validate_arch_title
from helpers.constants import (
    DELAY,
    MSG_E_DATA_TYPE,
    TRIES,
    MSG_E_UNEXPECTED,
)
from institutions.models import Institution


logger = logging.getLogger(__name__)

class Fond(models.Model):
    """Represents 'fonds' table in database"""
    fond_code = models.CharField(
        max_length=FOND_CODE_LENGTH,
        unique=True,
        blank=False,
        validators=[MaxLengthValidator(FOND_CODE_LENGTH, MSG_E_FOND_CODE_LENGTH)],
        error_messages={
            'unique': MSG_E_FOND_CODE_UNIQUE
        }
        
    )
    arch_abbreviation = models.CharField(
        max_length=ARCH_ABBREVIATION_LENGTH,
        blank=False,
        validators=[validate_arch_abbreviation_value]
        )
    arch_title = models.CharField(max_length=ARCH_TITLE_LENGTH, blank=False)
    fond_number = models.PositiveSmallIntegerField(blank=False)
    fond_title = models.CharField(
        max_length=FOND_TITLE_LENGTH,
        blank=False,
        validators=[
            MaxLengthValidator(FOND_TITLE_LENGTH, MSG_E_FOND_TITLE_LENGTH)
        ]
    )
    institution = models.OneToOneField(
        Institution,
        on_delete=models.CASCADE,
        related_name='fond',
    )

    class Meta:
        db_table = 'fonds'

    def __str__(self):
        return f'{self.fond_code}'
    
    def clean(self):
        """Extend clean method with additional validations"""
        super().clean()  # Call the parent class's clean method to perform default validation.

        # Custom validation logic for the combined fields.
        # Validate arch_title as it is dependent from arch_abbreviation.
        try:
            validate_arch_title(self.arch_abbreviation, self.arch_title)
        except ValidationError as ex:
            raise ex
        
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_fond(
        fond_code: str,
        arch_abbreviation: str,
        arch_title: str,
        fond_number: int,
        fond_title: str,
        institution: Institution) -> 'Fond':
        """Create new fond from VVAIS report.
        
        Args:
            fond_code: Fond code.
            arch_abbreviation: Archive abbreviation.
            arch_title: Archive title.
            fond_number: Fond number.
            fond_title: Fonda title.
            institution: Related Institution instance.

        Returns:
            Fond instance if new fond created.
        
        Raises:
            ValidationError: If there was validation errors.
            ValueError: If fond fields contains unacceptable values.
        
        """     
        try:
            fond = Fond(fond_code=fond_code,
                        arch_abbreviation=arch_abbreviation,
                        arch_title=arch_title,
                        fond_number=fond_number,
                        fond_title=fond_title,
                        institution=institution
                    )
            fond.full_clean()
            fond.save()
        except ValidationError as ex:
            raise ex
        except ValueError:
            raise ValueError(MSG_E_DATA_TYPE)
        except:
            raise Exception(MSG_E_UNEXPECTED)
        
        return fond
        
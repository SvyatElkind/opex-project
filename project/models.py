"""Module contains Project app models"""

import logging

from django.db import models, OperationalError
from django.utils import timezone
from django.core.validators import MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from retry import retry

from helpers.constants import (
    TRIES,
    DELAY,
    MSG_E_DATA_TYPE,
)
from project.helpers.constants import ( 
    PROJECT_NAME_LENGTH,
    REGEX_PROJECT_NAME,
    WRONG_PROJECT_NAME_LENGTH,
    WRONG_PROJECT_NAME_SYMBOLS,
    WRONG_PROJECT_NAME_UNIQUE
)
from helpers.response_composer import compose_all_project_data

logger = logging.getLogger(__name__)


class Project(models.Model):
    """Represents 'projects' table in database"""
    name = models.CharField(
        max_length=PROJECT_NAME_LENGTH,
        blank=False,
        unique=True,
        validators=[
            MaxLengthValidator(PROJECT_NAME_LENGTH, WRONG_PROJECT_NAME_LENGTH),
            RegexValidator(REGEX_PROJECT_NAME, WRONG_PROJECT_NAME_SYMBOLS)
        ],
        error_messages={
            'unique': WRONG_PROJECT_NAME_UNIQUE
        }        
    )
    created_at = models.DateTimeField(default=timezone.now)
    validated = models.BooleanField(default=False)

    class Meta:
        db_table = 'projects'

    def __str__(self):
        return f'{self.name}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_project(name: str) -> 'Project':
        """Create new project
        
        Args:
            name: Project name.

        Returns:
            Project instance if new project created.
        
        Raises:
            ValidationError: If there is validation errors.
            ValueError: If invenotry dictionary contains unacceptable data types.
        """

        try:
            project = Project(name=name)
            project.full_clean()
            project.save()  
        except ValidationError as ex:
            raise ex
        except ValueError:
            raise ValueError(MSG_E_DATA_TYPE)
        
        return project
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def is_validated(self) -> bool:
        """Check if project is validated"""
        return self.validated
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def change_validation_status(self):
        """Change status of validation from False to True"""
        self.validated = True
        self.save()
        
    @staticmethod
    def get_all_projects():
        """Get all projects.
        
        Returns:
            QuerySet with all projects"""
        return Project.objects.all()

    @staticmethod
    def get_project_related_data(id):
        """Get all data related to specific project.
        
        Includes date from related database tables"""
        # Get project.
        project = Project.objects.filter(id=id).first()
        
        # Return project if project does not exist.
        if not project:
            return project
        
        # Compose json for response.
        data = compose_all_project_data(project)
        return data
    
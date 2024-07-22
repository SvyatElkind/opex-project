"""Module contains Project app models."""

import logging
import os
import shutil
# import os

from django.db import models, OperationalError
from django.utils import timezone
from django.core.validators import MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from retry import retry

from helpers.constants import (
    TRIES,
    DELAY
)
from project.helpers.constants import ( 
    MSG_E_FOLDER_EXISTS,
    MSG_E_NO_PROJECT_FOLDER_FOUND,
    MSG_E_ROOT_FOLDER_CAN_NOT_CREATE,
    MSG_E_ROOT_FOLDER_MISSING,
    MSG_E_ROOT_FOLDER_CAN_NOT_RENAME,
    PROJECT_FOLDER_LENGTH,
    PROJECT_NAME_LENGTH,
    REGEX_PROJECT_NAME,
    MSG_E_PROJECT_NAME_LENGTH,
    MSG_E_PROJECT_NAME_SYMBOLS,
    MSG_E_PROJECT_NAME_UNIQUE
)

logger = logging.getLogger(__name__)


class Project(models.Model):
    """Represents 'projects' table in database"""
    name = models.CharField(
        max_length=PROJECT_NAME_LENGTH,
        blank=False,
        unique=True,
        validators=[
            MaxLengthValidator(PROJECT_NAME_LENGTH, MSG_E_PROJECT_NAME_LENGTH),
            RegexValidator(REGEX_PROJECT_NAME, MSG_E_PROJECT_NAME_SYMBOLS)
        ],
        error_messages={
            'unique': MSG_E_PROJECT_NAME_UNIQUE,
            'required': 'ŠIs lauks'
        }        
    )
    created_at = models.DateTimeField(default=timezone.now)
    folder = models.CharField(
        max_length=PROJECT_FOLDER_LENGTH,
        blank=False,
        unique=True
    )
    validated = models.BooleanField(default=False)

    class Meta:
        db_table = 'projects'

    def __str__(self):
        return f'{self.name}'
    
    def get_project_data(self):
        """Get project's all data."""
        data = self.objects.select_related('institution__fond'). \
                prefetch_related('institution__fond__inventories__items')
        return data
        
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_project(name: str, root_folder: str) -> 'Project':
        """Create new project.

        Adds new enrty in database and creates folder for project where all related files will be stored.
        
        Args:
            name: Project name.
            root_folder: Root folder path where project folder will be created.

        Returns:
            Project instance if new project created.
        
        Raises:
            ValidationError: If there is validation errors.
        """
        # Check if given root folder is a directory
        if not os.path.isdir(root_folder):
            raise ValidationError(MSG_E_ROOT_FOLDER_MISSING)
       
        # Create project
        try:
            project = Project(name=name)
            project.full_clean() 
        except ValidationError as ex:
            raise ex
        
        # Try to create project folder
        try:
            path = os.path.join(root_folder, name)
            os.mkdir(path)
        except OSError:
            if os.path.isdir(path):
                raise ValidationError(MSG_E_FOLDER_EXISTS)
            else:
                raise ValidationError(MSG_E_ROOT_FOLDER_CAN_NOT_CREATE)
        
        project.folder = path
        project.save()
        
        return project

    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def update_project(self, name: str) -> 'Project':
        """Update project with new name.

        Related folder name also will be renamed.
        
        Args:
            name: New name.

        Returns:
            Project instance with new name.
        
        Raises:
            ValidationError: If there is validation errors.
        """
        if self.name == name:
            return self 

        # Get root path of project folder
        root_path = os.path.dirname(self.folder)
        # Create new path of project folder with new name
        new_path = os.path.join(root_path, name)

        # Rename project name
        try:
            self.name = name
            self.full_clean()
        except ValidationError as ex:
            raise ex
        
        # Change name of project folder
        try:
            os.rename(self.folder, new_path)
        except OSError:
            if not os.path.isdir(self.folder):
                raise ValidationError(MSG_E_NO_PROJECT_FOLDER_FOUND)
            elif os.path.isdir(new_path):
                raise ValidationError(MSG_E_FOLDER_EXISTS)
            else:
                raise ValidationError(MSG_E_ROOT_FOLDER_CAN_NOT_RENAME)

        # Change project folder path
        self.folder = new_path
        self.save()

        return self

    def delete_project(self):
        """Delete specific project and all related data.
        
        Atgs:
            id: Project id.
        """
        shutil.rmtree(self.folder)
        self.delete()
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def is_validated(self) -> bool:
        """Check if project is validated."""
        return self.validated
    
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def change_validation_status(self):
        """Change status of validation from False to True."""
        self.validated = True
        self.save()

    
"""Module contains Project app models."""

import logging
import os
import shutil


from django.db import models, OperationalError
from django.utils import timezone
from django.core.validators import MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from retry import retry

from fonds.helpers.constants import FOND_TITLE_LENGTH
from helpers.constants import (TRIES, DELAY)
from institutions.helpers.constants import (
    INSTITUTION_NAME_LENGTH,
    MSG_E_REG_NR,
    REG_NR_LENGTH,
    REGEX_REG_NR
)
from inventories.helpers.constants import STORAGE_TERMS_LENGTH, TYPE_LENGTH
from project.helpers.constants import ( 
    MSG_E_FOLDER_EXISTS,
    MSG_E_NO_PROJECT_FOLDER_FOUND,
    MSG_E_PROJECT_NAME_NOT_STRING,
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
    """Represents 'projects' table in database."""
    name = models.CharField(
        max_length=PROJECT_NAME_LENGTH,
        blank=False,
        unique=True,
        validators=[
            MaxLengthValidator(PROJECT_NAME_LENGTH, MSG_E_PROJECT_NAME_LENGTH),
            RegexValidator(REGEX_PROJECT_NAME, MSG_E_PROJECT_NAME_SYMBOLS)
        ],
        error_messages={
            'unique': MSG_E_PROJECT_NAME_UNIQUE
        }        
    )
    created_at = models.DateTimeField(default=timezone.now)
    folder = models.CharField(
        max_length=PROJECT_FOLDER_LENGTH,
        blank=False,
        unique=True
    )
    validated = models.BooleanField(default=False)
    report_status = models.BooleanField(default=False)

    class Meta:
        db_table = 'projects'

    def __str__(self):
        return f'{self.name}'
    
    def get_project_data(self):
        """Get project's all data."""
        data = Project.objects.select_related('institution__fond'). \
                prefetch_related('institution__fond__inventories__items').get(id=self.id)
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
        # Check if given root folder is a directory.
        if not os.path.isdir(root_folder):
            raise ValidationError(MSG_E_ROOT_FOLDER_MISSING)
        
        # Check name type.
        if not isinstance(name, str):
            try:
                name = str(name)
            except TypeError:
                raise ValidationError(MSG_E_PROJECT_NAME_NOT_STRING)

        # Create project
        try:
            project = Project(name=name, folder='_') # Temporarly create folder placeholder name.
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

    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def delete_project(self):
        """Delete specific project and all related files."""
        if os.path.exists(self.folder):
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

    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def change_report_status(self):
        """Change report status to True.
        
        Status should be changed when report from VVAIS is imported.
        """
        self.report_status = True
        self.save()
              

class Report(models.Model):
    """Represents 'report' table in database.
    
    This table contains information of initial report from VVAIS
    and is need for validation purposes.
    """
    institution = models.CharField(
        max_length=INSTITUTION_NAME_LENGTH,
        blank=False
    )
    institution_reg_nr = models.CharField(
        max_length=REG_NR_LENGTH,
        blank=False,
        validators=[
            RegexValidator(REGEX_REG_NR, MSG_E_REG_NR)
        ]
    )
    inventory_list = models.CharField(max_length=30, blank=False)
    fond_title = models.CharField(
        max_length=FOND_TITLE_LENGTH,
        blank=False
    )
    type = models.CharField(max_length=TYPE_LENGTH, blank=False)
    electronic = models.BooleanField(blank=False)
    last_gv = models.PositiveSmallIntegerField(blank=False)
    total_items = models.PositiveSmallIntegerField(blank=False)
    storage_term = models.CharField(
        max_length=STORAGE_TERMS_LENGTH,
        blank=False
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='reports',
    )

    class Meta:
        db_table = 'report'

    def __str__(self):
        return f'{self.inventory_list}'
    
    @staticmethod
    @retry(OperationalError, tries=TRIES, delay=DELAY, logger=logger)
    def add_report(report_dict: dict, project: Project) -> bool:
        """Add report from VVAIS.
        
        Args:
            report_dict: Dict with report data.
            project: Project instance.

        Returns:
            True if report successfully added.

        Raises:
            ValidationError: If any vlaidation error occures.
        """
        try:
            report = Report(project=project, **report_dict)
            report.full_clean()
            report.save()
        except ValidationError as ex:
            raise ex
        
        return True
        
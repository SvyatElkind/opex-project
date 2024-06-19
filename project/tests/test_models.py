"""Module contains tests for project.models"""

from unittest.mock import patch
from django.test import TestCase
from parameterized import parameterized

from helpers.constants import UNEXPECTED_ERROR_MSG, WRONG_VALUE_PROVIDED
from project.constants import PROJECT_EXISTS_MSG
from project.models import Project

class ProjectModelTest(TestCase):
    """Class for testing the Project model"""

    PROJECT_NAME = 'test'

    @classmethod
    def setUpTestData(cls):
        cls.project = Project.objects.create(name=cls.PROJECT_NAME)

    @parameterized.expand([
        'name',
        'created_at',
        'validated',
    ])
    def test_model_labels(self, field_name: str):
        """Test labels of all fields

        Args:
            field_name: Project model field name
        """
        field_label = Project._meta.get_field(field_name).verbose_name
        # Replace as field label doesn't have underscore.
        field_name = field_name.replace('_', ' ')
        self.assertEqual(field_label, field_name)
    
    def test_project_str(self):
        """Test project object __str__ method"""
        self.assertEqual(str(self.project), self.PROJECT_NAME)
      
    def test_is_validated(self):
        """Test 'is_vlaidated' method"""   
        self.assertFalse(self.project.is_validated())

    def test_change_validation_status(self):
        """Test 'change_validation_status' method"""    
        self.project.change_validation_status()
        self.assertTrue(self.project.is_validated())

    def test_add_project(self):
        """Test 'add_project' method"""
        project_name = 'new_project'
        project = Project.add_project(project_name)
        self.assertEqual(project.name, project_name) # type: ignore
    
    def test_add_project_when_exists(self):
        """Test 'add_project' method when project with given name already exists"""
        project = Project.add_project(self.PROJECT_NAME)
        self.assertEqual(project, PROJECT_EXISTS_MSG)
    
    def test_add_project_when_wrong_type(self):
        """Test 'add_project' method when wrong type provided"""
        project = Project.add_project(1) # type: ignore
        self.assertEqual(project, WRONG_VALUE_PROVIDED)
    
    def test_add_project_when_long_name(self):
        """Test 'add_project' method when too long name"""
        # Create long name for project
        project_name = 51 * 'a'
        project = Project.add_project(project_name)
        self.assertEqual(project, WRONG_VALUE_PROVIDED)
    
    @patch('project.models.Project.objects.create')
    def test_add_project_unexpected_error(self, mock_create):
        """Test 'add_project' method when unexpected error occures"""
        # Create side effect
        mock_create.side_effect = Exception
        project = Project.add_project('new_project')
        self.assertEqual(project, UNEXPECTED_ERROR_MSG)

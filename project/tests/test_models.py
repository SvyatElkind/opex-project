"""Module contains tests for project.models"""

import os
import shutil
import tempfile

from django.test import TestCase
from django.core.exceptions import ValidationError
from parameterized import parameterized

from project.models import Project


class ProjectModelTest(TestCase):
    """Class for testing the Project model"""

    PROJECT_NAME = 'test'

    @classmethod
    def setUpTestData(cls):
        # objects.create bypasses full_clean, so a placeholder folder is fine here.
        cls.project = Project.objects.create(
            name=cls.PROJECT_NAME,
            folder='_test_folder'
        )

    def setUp(self):
        # add_project actually creates a directory on disk, so give it a real
        # temporary root folder and clean it up afterwards.
        self.root_folder = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.root_folder, ignore_errors=True)

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
        """Test 'is_validated' method"""
        self.assertFalse(self.project.is_validated())

    def test_change_validation_status(self):
        """Test 'change_validation_status' method"""
        self.project.change_validation_status()
        self.assertTrue(self.project.is_validated())

    def test_add_project(self):
        """Test 'add_project' creates the entry and its folder on disk"""
        project_name = 'new_project'
        project = Project.add_project(project_name, self.root_folder)
        self.assertEqual(project.name, project_name)
        self.assertTrue(
            os.path.isdir(os.path.join(self.root_folder, project_name))
        )

    def test_add_project_when_root_folder_missing(self):
        """'add_project' raises when the root folder does not exist"""
        missing = os.path.join(self.root_folder, 'does_not_exist')
        with self.assertRaises(ValidationError):
            Project.add_project('any_name', missing)

    def test_add_project_when_exists(self):
        """'add_project' raises when a project with the given name exists"""
        with self.assertRaises(ValidationError):
            Project.add_project(self.PROJECT_NAME, self.root_folder)

    def test_add_project_when_long_name(self):
        """'add_project' raises when the name exceeds the max length"""
        long_name = 21 * 'a'
        with self.assertRaises(ValidationError):
            Project.add_project(long_name, self.root_folder)

    def test_add_project_when_invalid_symbols(self):
        """'add_project' raises when the name contains disallowed characters

        Guards the rule that only latin letters (no diacritics), digits, '_'
        and '-' are allowed - see Lietotaju_Pieteikumi/001.
        """
        with self.assertRaises(ValidationError):
            Project.add_project('Piejūra', self.root_folder)

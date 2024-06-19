"""Module contains tests for institutions.models"""

from unittest.mock import patch
from django.test import TestCase
from parameterized import parameterized

from helpers.constants import UNEXPECTED_ERROR_MSG, WRONG_VALUE_PROVIDED
from institutions.constants import INSTITUTION_EXISTS_MSG
from institutions.models import Institution
from project.models import Project
from test_helpers.test_constants import TEST_INSTITUTION_NAME, TEST_REG_NR
from test_helpers.test_helpers import set_up_data_for_institution_model_test

INST_NAME = 'test'
INST_REG_NR = 1
PROJECT_NAME = 'new'

class InstitutionModelTest(TestCase):
    """Class for testing Institution model"""

    @classmethod
    def setUpTestData(cls):
        cls.project, cls.institution = set_up_data_for_institution_model_test()

    @parameterized.expand([
        'reg_nr',
        'name',
        'creator',
        'creator_position',
        'signer',
        'signer_position',
        'project'
    ])
    def test_model_labels(self, field_name: str):
        """Test labels of all fields
        
        Args:
            field_name: Institution model field name
        """
        field_label = Institution._meta.get_field(field_name).verbose_name
        # Replace as field label doesn't have underscore.
        field_name = field_name.replace("_", " ")
        self.assertEqual(field_label, field_name)

    def test_institution_str(self):
        """Test institution __str__ method"""
        # Create institution
        self.assertEqual(str(self.institution), f'{self.institution.name}, {self.institution.reg_nr}')

    def test_add_institution_1(self):
        """Test add_institution method.
        
        Test when institution with given name already exists"""
        result = Institution.add_institution(INST_REG_NR, TEST_INSTITUTION_NAME, self.project)
        self.assertEqual(result, INSTITUTION_EXISTS_MSG)

    def test_add_institution_2(self):
        """Test add_institution method.
        
        Test when institution with given reg_id already exists"""
        result = Institution.add_institution(TEST_REG_NR, INST_NAME, self.project)
        self.assertEqual(result, INSTITUTION_EXISTS_MSG)
    
    def test_add_institution_3(self):
        """Test add_institution method.
        
        Test when institution is created"""
        project = Project.add_project(PROJECT_NAME)
        result = Institution.add_institution(INST_REG_NR, INST_NAME, project)
        self.assertIsInstance(result, Institution)

        # Get newly created institution from database and check it's fields.
        institution_from_db = Institution.objects.get(name=INST_NAME)

        self.assertEqual(institution_from_db.name, INST_NAME)
        self.assertEqual(institution_from_db.reg_nr, INST_REG_NR)
        self.assertEqual(institution_from_db.creator, '')
        self.assertEqual(institution_from_db.creator_position, '')
        self.assertEqual(institution_from_db.signer, '')
        self.assertEqual(institution_from_db.signer_position, '')
    
    @patch('institutions.models.Institution.objects.create')
    def test_add_institution_4(self, mock_create):
        """Test add_institution method.
        
        Test when ValueError occured. 
        """
        mock_create.side_effect = ValueError
        project = Project.add_project(PROJECT_NAME)
        institution = Institution.add_institution(INST_REG_NR, INST_NAME, project)
        self.assertEqual(institution, WRONG_VALUE_PROVIDED)
    
    @patch('institutions.models.Institution.objects.create')
    def test_add_institution_5(self, mock_create):
        """Test add_institution method.
        
        Test when Exception occured.
        """
        mock_create.side_effect = Exception
        project = Project.add_project(PROJECT_NAME)
        institution = Institution.add_institution(INST_REG_NR, INST_NAME, project)
        self.assertEqual(institution, UNEXPECTED_ERROR_MSG)


    
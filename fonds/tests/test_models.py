"""Module contains tests for fonds.models"""

from unittest.mock import patch
from django.test import TestCase
from parameterized import parameterized

from fonds.helpers.constants import FOND_EXISTS_MSG
from fonds.models import Fond
from helpers.constants import UNEXPECTED_ERROR_MSG, WRONG_VALUE_PROVIDED
from test_helpers.test_constants import (
    TEST_ARCH_ABBREVIATION, 
    TEST_ARCH_TITLE, 
    TEST_FOND_CODE,
    TEST_FOND_NUMBER, 
    TEST_FOND_TITLE, 
    TEST_SUBFOND
)
from test_helpers.test_helpers import get_test_fond


class FondModelTest(TestCase):
    """Class for testing Fond model"""

    @parameterized.expand([
        'fond_code',
        'arch_abbreviation',
        'arch_title',
        'fond_number',
        'fond_title',
        'subfond',
        'institution'
    ])
    def test_model_labels(self, field_name: str):
        """Test labels of all fields
        
        Args:
            field_name: Fond model field name
        """
        field_label = Fond._meta.get_field(field_name).verbose_name
        # Replace as field label doesn't have underscore.
        field_name = field_name.replace("_", " ")
        self.assertEqual(field_label, field_name)

    def test_fond_str(self):
        """Test Fond __str__ method."""
        fond = get_test_fond()
        self.assertEqual(str(fond), f'{fond.fond_code}')
    
    def test_add_fond_1(self):
        """Test add_fond method
        
        When fond is successfully created
        """
        fond = get_test_fond()
        # Get created fond from database
        fond = Fond.objects.get(fond_code=TEST_FOND_CODE)

        # Test created fond
        self.assertEqual(TEST_FOND_CODE, fond.fond_code)
        self.assertEqual(TEST_ARCH_ABBREVIATION, fond.arch_abbreviation)
        self.assertEqual(TEST_ARCH_TITLE, fond.arch_title)
        self.assertEqual(TEST_FOND_NUMBER, fond.fond_number)
        self.assertEqual(TEST_FOND_TITLE, fond.fond_title)
        self.assertEqual(TEST_SUBFOND, fond.subfond)


    def test_add_fond_2(self):
        """Test add_fond method
        
        When fond already exists
        """
        # Create test fond
        get_test_fond()
        # Create fond with the same fond code
        result = get_test_fond()
        self.assertEqual(result, FOND_EXISTS_MSG)
    
    @patch('fonds.models.Fond.objects.create')
    def test_add_fond_3(self, mock_create):
        """Test add_fond method
        
        When ValueError occured
        """
        mock_create.side_effect = ValueError
        fond = get_test_fond()
        self.assertEqual(fond, WRONG_VALUE_PROVIDED)

    @patch('fonds.models.Fond.objects.create')
    def test_add_fond_4(self, mock_create):
        """Test add_fond method
        
        When ValueError occured
        """
        mock_create.side_effect = Exception
        fond = get_test_fond()
        self.assertEqual(fond, UNEXPECTED_ERROR_MSG)




"""Module contains tests for invenotry.models"""

from django.test import TestCase
from unittest.mock import patch, MagicMock
from parameterized import parameterized

from fonds.models import Fond
from institutions.models import Institution
from inventories.constants import INVENTORY_EXISTS_MSG
from inventories.models import Inventory
from project.models import Project

INVENTORY_LIST = {
    'number': 2,
    'postfix': 'a',
    'type': 'foto',
    'electronic': True,
    'last_gv': 55,
    'total_items': 60,
    'storage_term': 'Pastāvīgi glabājamās lietas'
}

class InventoryModelTest(TestCase):
    """Class for testing the Inventory model"""

    @classmethod
    def setUpTestData(cls):
        cls.project = Project.add_project('First1')
        cls.institution = Institution.add_institution(1, 'q', project=cls.project)
        cls.fond = Fond.add_fond('1', 
                            'LNA', 
                            'Valsts arhivs', 
                            400, 
                            'Valsts mezi', 
                            False, 
                            cls.institution)

    @parameterized.expand([
        'number',
        'postfix',
        'type',
        'electronic',
        'last_gv',
        'start_date',
        'end_date',
        'storage_term',
        'items_per_period',
        'total_items',
        'fond'
    ])
    def test_model_labels(self, field_name: str):
        """Test labels of all fields

        Args:
            field_name: Inventory model field name
        """
        field_label = Inventory._meta.get_field(field_name).verbose_name
        # Replace as field label doesn't have underscore.
        field_name = field_name.replace("_", " ")
        self.assertEqual(field_label, field_name)

    def test_inventory_str(self):
        """Test inventory object __str__ method"""
        # Create inventory
        result = Inventory.add_inventory_from_vvais(INVENTORY_LIST, fond=self.fond)
        self.assertEqual(str(result), f'{result.fond}, {result.number}.US')

    @patch('inventories.models.Inventory.objects.filter')
    def test_invenotry_from_vvais_error_1(self, mock_filter):
        """Test add_inventory_from_vvais method
        
        When inventory with same number already exists"""
        # Mock the queryset returned by filter().
        mock_queryset = MagicMock()
        mock_filter.return_value = mock_queryset

        # Mock the return value of exists() on the queryset.
        mock_queryset.exists.return_value = True
        result = Inventory.add_inventory_from_vvais(INVENTORY_LIST, 'fond_replacement')
        self.assertEqual(result['inventory'], INVENTORY_EXISTS_MSG)
    
    @patch('inventories.models.validate_invenotry')
    def test_invenotry_from_vvais_error_2(self, mock_validate_inventory):
        """Test add_inventory_from_vvais method
        
        When inventory contains unacceptable values"""
        # Mock the return value of validate_inventory().
        mock_validate_inventory.return_value = False, 'test'

        result = Inventory.add_inventory_from_vvais(INVENTORY_LIST, 'fond_replacement')
        self.assertEqual(result, 'test')

    def test_invenotry_from_vvais(self):
        """Test add_inventory_from_vvais method
        
        When inventory is created"""
        # Create inventory.
        result = Inventory.add_inventory_from_vvais(INVENTORY_LIST, fond=self.fond)
        self.assertIsInstance(result, Inventory)
        
        # Get newly created invenotry from database and check it's fields.
        inventory_from_db = Inventory.objects.get(number=result.number)

        self.assertEqual(INVENTORY_LIST['number'], inventory_from_db.number)
        self.assertEqual(INVENTORY_LIST['postfix'], inventory_from_db.postfix)
        self.assertEqual(INVENTORY_LIST['type'], inventory_from_db.type)
        self.assertEqual(INVENTORY_LIST['electronic'], inventory_from_db.electronic)
        self.assertEqual(INVENTORY_LIST['last_gv'], inventory_from_db.last_gv)
        self.assertEqual(INVENTORY_LIST['total_items'], inventory_from_db.total_items)
        self.assertEqual(INVENTORY_LIST['storage_term'], inventory_from_db.storage_term)
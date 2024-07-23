"""Module contains helper functions for tests."""

from django.core.exceptions import ValidationError

from fonds.models import Fond
from institutions.models import Institution
from inventories.models import Inventory
from items.models import Item
from project.models import Project
from test_helpers.test_constants import (
    TEST_PROJECT_NAME,
    TEST_REG_NR,
    TEST_INSTITUTION_NAME,
    TEST_FOND_CODE,
    TEST_ARCH_ABBREVIATION,
    TEST_ARCH_TITLE,
    TEST_FOND_NUMBER,
    TEST_FOND_TITLE, 
    TEST_SUBFOND
)


def test_project():
    """Create test project.
    
    Returns:
        Project instance.
    """
    return Project.add_project(TEST_PROJECT_NAME, "C:\\Users\\svjatoslavsmatvejevs\\test")


def test_institution(project: Project):
    """Create test institution.
    
    Returns:
        Institutions instance.
    """
    return Institution.add_institution(TEST_REG_NR,
                                       TEST_INSTITUTION_NAME,
                                       project)


def test_fond(institution: Institution):
    """Create test fond.
    
    Returns:
        Fond instance.
    """
    return Fond.add_fond(TEST_FOND_CODE, 
                        TEST_ARCH_ABBREVIATION, 
                        TEST_ARCH_TITLE, 
                        TEST_FOND_NUMBER, 
                        TEST_FOND_TITLE, 
                        TEST_SUBFOND, 
                        institution)

def test_inventory(fond):
    INVENTORY_LIST = {
        'number': 2,
        'postfix': 'a',
        'type': 'tekstuāls',
        'electronic': True,
        'last_gv': 55,
        'total_items': 60,
        'storage_term': 'Pastāvīgi glabājamās lietas'
    }
    invenotry = Inventory.add_inventory_from_vvais(INVENTORY_LIST, fond)
    return invenotry

def create_test_items(inventory):
    items = {
            "series_code": "1.2",
            "number": 56,
            "title": "Sarakstes dokumenti",
            "start_date": "2012-01-01",
            "end_date": "2012-01-30",
            "size": 50.5,
            "unit_of_measure": "MB",
            "notes": "manas piezīmes",
            "language": "latviešu, vācu",
            "restriction": "Vispārēja",
            "security_level": "Publisks",
            'annotation': "test",
            "color": 'melnbaltā',
            'related_item': [1]
            }
        
    try:
        items = Item.add_item(items, inventory)
        return items
    except ValueError as ex:
        print(ex.args[0])

def create_test_items_from_structure(inventory):
    items = [56, 57, 58]
    try:
        new_items = list(Item.add_item_from_structure(items, inventory))
    except ValidationError as ex:
        raise ex
    except Exception as ex:
        raise ex
    
    return new_items

def set_up_data_for_inventory_model_test():
    project = test_project()
    institution = test_institution(project)
    fond = test_fond(institution)
    return project, institution, fond


def set_up_data_for_institution_model_test():
    project = test_project()
    institution = test_institution(project)
    return project, institution

def get_test_fond():
    project = test_project()
    institution = test_institution(project)
    fond = test_fond(institution)
    return fond

def get_till_items():
    project, institution, fond = set_up_data_for_inventory_model_test()
    inventory = test_inventory(fond)
    items = create_test_items(inventory)

    return items
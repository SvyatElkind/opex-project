"""Module contains helper functions for tests"""


from fonds.models import Fond
from institutions.models import Institution
from project.models import Project
from test_helpers.test_constants import *


def test_project():
    """Create test project.
    
    Returns:
        Project instance.
    """
    return Project.add_project(TEST_PROJECT_NAME)


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

def set_up_data_for_inventory_model_test():
    project = test_project()
    institution = test_institution(project)
    fond = test_fond(institution)
    return project, institution, fond


def set_up_data_for_institution_model_test():
    project = test_project()
    institution = test_institution(project)
    return project, institution
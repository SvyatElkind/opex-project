#from project.models import Project
import os
import re
#import mimetypes
import openpyxl
from institutions.models import Institution
from fonds.models import Fond
from inventories.models import Inventory
from django.core.exceptions import ValidationError
from helpers.constants import ARCH_TITLE_DICT

def parse_fond_code(fond_code_string):
    """ Splits a Fond code string into elements and returns a dictionary with the elements.
    
    Args:
        fond_code_string (str): fond code string

    Returns:
        variables (dict): dictionary with the elements ('country', 'archive', 'branch', 'fond','inventory', 'item','record')
        e.g.
        LV_LNA_KFFDA_100_1_1_1 is split into:
        {'country': 'LV', 'archive': 'LNA', 'branch': 'KFFDA', 'fond': '100', 'inventory': '1', 'item': '1', 'record': '1'}
        
        None if the syntax is incorrect or there are less than 3 elements in the string
    
    Raises:
        None
    
    """      
    elements = fond_code_string.strip().split('_')
    variable_names = ['country', 'archive', 'branch', 'fond', 'inventory', 'item', 'record']
    variables = {}
    if len(elements) > 3:
        # Assign the first four variables
        for i, name in enumerate(variable_names[:4]):
            variables[name] = elements[i]
    if elements[3].lower().startswith('f'):
        return variables
    return None


def split_number_from_postfix(s):
    """ Splits a string containing a number at the beginning and returns the number and the rest of the string.
        Useful for splitting an inventory number from its postfix e.g. 45-a
    
    Args:
        s (str): string containing a number at the beginning

    Returns:
        number (int): number at the beginning of the string
        string (str): rest of the string
        
        Original string if there is no number at the beginning
    
    Raises:
        None
    
    """
    # This regex matches the sequence of digits at the beginning of the string
    match = re.match(r"(\d+)(.*)", s)
    
    if match:
        # group(1) is the sequence of digits, group(2) is the rest of the string
        return int(match.group(1)), match.group(2)
    else:
        # If there's no match, return the original string and an empty string
        return s, ''

    
def translate_arch_title(title_abbr):
    """ Translates an archive title abbreviation to a title.
    
    Args:
        title_abbr (str): archive title abbreviation

    Returns:
        title (str): archive full title
    
    Raises:
        None
    
    """    

    return ARCH_TITLE_DICT.get(title_abbr, "Nav norādīts")

def split_fond_number(fond_number_with_F):
    """ Splits a string containing a fond number with prefix F or AF
    
    Args:
        fond_number_with_F: string containing a fond number with prefix F or AF e.g. F56778

    Returns:
        fond_number (int)
        False if fond number does not contain prefix F or AF
    
    Raises:
        None
    
    """
    if fond_number_with_F.lower().startswith('f'):
        return int(fond_number_with_F[1:])
    elif fond_number_with_F.lower().startswith('af'):
        return int(fond_number_with_F[2:])
    return False

def validate_report_file(xlsx_data):
    """ Reads and validates the VVAIS inventory report file.
    
    Args:
        xlsx_data: file data as received from VVAIS.

    Returns:
        True if the file is valid, False otherwise.
    
    Raises:
        ValidationError: If there was validation errors in the data or the headers of the xlsx file.
        
    
    """     
    # Define the correct headers sequence
    correct_headers = ['institution','institution_reg_nr','inventory_list','fond_title','type','electronic','last_gv','total_items','storage_term']

    # Load the workbook and select the active sheet
    #raise ValidationError("Atskaite norādītajā ceļā nav atrasta")
    workbook = openpyxl.load_workbook(filename=xlsx_data)
    sheet = workbook.active

    # Get the number of rows
    num_rows = sheet.max_row
    if(num_rows)>1:
        # Check if the first row is empty
        first_row = list(sheet.iter_rows(min_row=1, max_row=1, values_only=True))[0]
        if all(cell is None for cell in first_row):
            # Delete first row if empty
            sheet.delete_rows(1)

        first_row = list(sheet.iter_rows(min_row=1, max_row=1, values_only=True))[0]
        # Check if the headers are correct
        if list(first_row) != correct_headers:
            raise ValidationError("Kļūda atskaites galvenē.")
            
        data_rows=list(sheet.iter_rows(min_row=2, max_row=50, values_only=True))
        if len(data_rows)>0:
            if all(cell is not None for cell in data_rows[0]):
                #Atskaitē ir vismaz viena aizpildīta datu rinda.
                return True
            else: 
                raise ValidationError("Kļūda vai nepilnības atskaites datos.")
    return False


def import_report_file(xlsx_data, project):
    """ Imports VVAIS inventory file data into given project.
    
    Args:
        xlsx_data: file data as received from VVAIS.
        project: project object to import the data into.

    Returns:
        None
    
    Raises:
        ValidationError: If there was validation errors in the data or the headers of the xlsx file.
        
    
    """      
    if validate_report_file(xlsx_data):
        workbook = openpyxl.load_workbook(filename=xlsx_data)
        sheet = workbook.active

        first_row = list(sheet.iter_rows(min_row=1, max_row=1, values_only=True))[0]
        if all(cell is None for cell in first_row):
            sheet.delete_rows(1)
        first_row = list(sheet.iter_rows(min_row=1, max_row=1, values_only=True))[0]
        data_rows=list(sheet.iter_rows(min_row=2, max_row=500, values_only=True))
        
        # Reading institution and fond information from the first data row
        if len(data_rows)>0:
            if all(cell is not None for cell in data_rows[0]):
                institution_name    = data_rows[0][first_row.index('institution')]
                institution_reg_nr  = data_rows[0][first_row.index('institution_reg_nr')]   
                fond_title           = data_rows[0][first_row.index('fond_title')]
                
                # Creating institution from the first data row
                institution_obj=Institution.add_institution(institution_reg_nr,institution_name,project)
                
               
                fond_code_values     = parse_fond_code(data_rows[0][first_row.index('inventory_list')])
                #print (fond_code_values) #check parsed values
                
                # Put together fond code string
                fond_code=fond_code_values.get('country', '')+"_"+fond_code_values.get('archive', '')+"_"+fond_code_values.get('branch', '')+"_"+fond_code_values.get('fond', '')
                
                fond_number_with_F = fond_code_values.get('fond', '')
                fond_number=split_fond_number(fond_number_with_F)
                
                arch_abbreviation = fond_code_values.get('branch', '')
                arch_title=translate_arch_title(arch_abbreviation)
                
                # Creating fond from the first data row
                fond_obj=Fond.add_fond(fond_code,arch_abbreviation,arch_title,fond_number, fond_title, institution_obj)
                                
                #inventory_number = fond_code_values.get('inventory', '')
            
            # Read all inventory lists and create entries in DB
            
            for data_row in data_rows:
                if all(cell is not None for cell in data_row):
                    inventory_dict={}
                    fond_code_values                    =   parse_fond_code(data_row[first_row.index('inventory_list')])
                                    
                    inv_nr,inv_postfix=split_number_from_postfix(fond_code_values['inventory'])
                    inventory_dict['number']            = int(inv_nr)
                    inventory_dict['postfix']            = inv_postfix
                    inventory_dict['type']              =   data_row[first_row.index('type')]
                  
                    if data_row[first_row.index('electronic')]:
                        inventory_dict['electronic']    =   True
                    else:
                        inventory_dict['electronic']    =   False
                        
                    inventory_dict['last_gv']           =   data_row[first_row.index('last_gv')]
                    inventory_dict['total_items']       =   data_row[first_row.index('total_items')]
                    inventory_dict['storage_term']      =   data_row[first_row.index('storage_term')]
                    try:
                        Inventory.add_inventory(inventory_dict=inventory_dict, fond=fond_obj, vvais=True)
                    except (ValidationError, ValueError, Exception) as ex:
                        institution_obj.delete()
                        raise ex
            project.change_report_status()   
            



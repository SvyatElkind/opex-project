import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OPEXXMLProcessor:
    """ Class to process OPEX XML templates and populate them with data.
    """
    def __init__(self, template_path: Union[str, Path]):
        self.template_path = Path(template_path)
        self.tree = None
        self.root = None
        self.field_mappings = self._initialize_field_mappings()

    def _initialize_field_mappings(self) -> Dict:
        """Initialize comprehensive field mappings"""
        return {
            # Basic OPEX properties
            'opex_properties': {
                'title': './/Properties/Title',
                'description': './/Properties/Description',
                'security_descriptor': './/Properties/SecurityDescriptor'
            },

            # Transfer section  
            'transfer': {
                'fixity_sha1': ('.//Transfer/Fixities/Fixity[@type="SHA-1"]', 'value')
            },

            # EAD Control section
            'control': {
                'record_id': './/ead/control/recordid',
                'title_proper': './/ead/control/filedesc/titlestmt/titleproper',
                'agency_code': './/ead/control/maintenanceagency/agencycode',
                'agency_name': './/ead/control/maintenanceagency/agencyname',
                'standard_date': ('.//ead/control/localcontrol/datesingle', 'standarddate'),
                'event_datetime': ('.//ead/control/maintenancehistory/maintenanceevent/eventdatetime', 'standarddatetime'),
                'agent': './/ead/control/maintenancehistory/maintenanceevent/agent'
            },

            # Archival description
            'archival_desc': {
                'unit_title': './/ead/archdesc/did/unittitle',
                'unit_id': './/ead/archdesc/did/unitid',
                'abstract': './/ead/archdesc/did/abstract[@label="Anotācija"]',
                'did_note': './/ead/archdesc/did/didnote'
            },

            # Unit dates with specific labels
            'unit_dates': {
                'document_date': ('.//ead/archdesc/did/unitdate[@label="Dokumenta datums"]', 'normal'),
                'preparation_date': ('.//ead/archdesc/did/unitdate[@label="Sagatavošanas datums"]', 'normal'),
                'sending_date': ('.//ead/archdesc/did/unitdate[@label="Nosūtīšanas datums"]', 'normal')
            },

            # Person names
            'persons': {
                'author': './/ead/archdesc/did/origination/persname[@relator="author"]',
                'creator': './/ead/archdesc/did/origination/persname[@relator="creator"]',
                'signer': './/ead/archdesc/did/origination/persname[@relator="signer"]'
            },

            # Physical descriptions
            'physical_desc': {
                'quantities': './/ead/archdesc/did/physdescset/physdescstructured/quantity',
                'unit_types': './/ead/archdesc/did/physdescset/physdescstructured/unittype'
            },

            # DAO identifiers
            'dao': {
                'dao_identifiers': ('.//ead/archdesc/did/daoset/dao', 'identifier')
            },

            # Content sections
            'content': {
                'access_restrict': './/ead/archdesc/accessrestrict/p',
                'use_restrict': './/ead/archdesc/userestrict/p',
                'phys_tech': './/ead/archdesc/phystech/p'
            },

            # Lists and tables
            'lists': {
                'list_items': './/ead/archdesc/odd/list/item'
            },

            'tables': {
                'table_t1_entries': './/ead/archdesc/odd/table[@id="t1"]/tgroup/tbody/row/entry',
                'table_t2_entries': './/ead/archdesc/odd/table[@id="t2"]/tgroup/tbody/row/entry',
                'table_t3_entries': './/ead/archdesc/odd/table[@id="t3"]/tgroup/tbody/row/entry'
            }
        }

    def load_template(self) -> bool:
        """Load XML template with comprehensive error handling"""
        try:
            if not self.template_path.exists():
                logger.error(f"Template file does not exist: {self.template_path}")
                return False

            self.tree = ET.parse(str(self.template_path))
            self.root = self.tree.getroot()
            logger.info(f"Successfully loaded template: {self.template_path}")
            return True

        except ET.ParseError as e:
            logger.error(f"XML parsing error in {self.template_path}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error loading template: {e}")
            return False

    def set_element_text(self, xpath: str, value: Union[str, int, float, None]) -> bool:
        """Safely set element text content"""
        try:
            element = self.root.find(xpath)
            if element is not None:
                element.text = str(value) if value is not None else ""
                return True
            else:
                logger.debug(f"Element not found: {xpath}")
                return False
        except Exception as e:
            logger.warning(f"Error setting text for {xpath}: {e}")
            return False

    def set_element_attribute(self, xpath: str, attr_name: str, value: Union[str, int, float, None]) -> bool:
        """Safely set element attribute"""
        try:
            element = self.root.find(xpath)
            if element is not None:
                element.set(attr_name, str(value) if value is not None else "")
                return True
            else:
                logger.debug(f"Element not found for attribute: {xpath}")
                return False
        except Exception as e:
            logger.warning(f"Error setting attribute {attr_name} for {xpath}: {e}")
            return False

    def set_elements_by_index(self, xpath: str, values: List[Union[str, int, float]], 
                             is_attribute: bool = False, attr_name: str = None) -> int:
        """Set multiple elements by index"""
        try:
            elements = self.root.findall(xpath)
            success_count = 0

            for i, value in enumerate(values):
                if i < len(elements):
                    if is_attribute and attr_name:
                        elements[i].set(attr_name, str(value) if value is not None else "")
                    else:
                        elements[i].text = str(value) if value is not None else ""
                    success_count += 1

            return success_count
        except Exception as e:
            logger.warning(f"Error setting multiple elements for {xpath}: {e}")
            return 0

    def populate_from_dict(self, data: Dict) -> Tuple[int, List[str]]:
        """
        Populate XML from dictionary data

        Args:
            data: Dictionary containing field values

        Returns:
            Tuple of (success_count, error_messages)
        """
        if not self.tree and not self.load_template():
            return 0, ["Failed to load template"]

        success_count = 0
        errors = []

        try:
            # 1. OPEX Properties
            for field_key in ['title', 'description', 'security_descriptor']:
                if field_key in data:
                    if self.set_element_text(self.field_mappings['opex_properties'][field_key], data[field_key]):
                        success_count += 1

            # 2. Transfer section
            if 'fixity_sha1' in data:
                xpath, attr = self.field_mappings['transfer']['fixity_sha1']
                if self.set_element_attribute(xpath, attr, data['fixity_sha1']):
                    success_count += 1

            # 3. Control section text fields
            control_text_fields = ['record_id', 'title_proper', 'agency_code', 'agency_name', 'agent']
            for field in control_text_fields:
                if field in data:
                    if self.set_element_text(self.field_mappings['control'][field], data[field]):
                        success_count += 1

            # 4. Control section attributes
            control_attr_fields = [('standard_date', 'standarddate'), ('event_datetime', 'standarddatetime')]
            for field, attr in control_attr_fields:
                if field in data:
                    xpath, attr_name = self.field_mappings['control'][field]
                    if self.set_element_attribute(xpath, attr_name, data[field]):
                        success_count += 1

            # 5. Archival description
            for field in ['unit_title', 'unit_id', 'abstract', 'did_note']:
                if field in data:
                    if self.set_element_text(self.field_mappings['archival_desc'][field], data[field]):
                        success_count += 1

            # 6. Unit dates (set both attribute and text)
            for date_field in ['document_date', 'preparation_date', 'sending_date']:
                if date_field in data:
                    xpath, attr = self.field_mappings['unit_dates'][date_field]
                    if self.set_element_attribute(xpath, attr, data[date_field]):
                        success_count += 1
                    if self.set_element_text(xpath, data[date_field]):
                        pass  # Don't double count

            # 7. Person names
            for person_role in ['author', 'creator', 'signer']:
                field_name = f'{person_role}_name'
                if field_name in data:
                    if self.set_element_text(self.field_mappings['persons'][person_role], data[field_name]):
                        success_count += 1

            # 8. Physical descriptions (arrays)
            for phys_field in ['quantities', 'unit_types']:
                if phys_field in data and isinstance(data[phys_field], list):
                    success_count += self.set_elements_by_index(
                        self.field_mappings['physical_desc'][phys_field], 
                        data[phys_field]
                    )

            # 9. DAO identifiers
            if 'dao_identifiers' in data and isinstance(data['dao_identifiers'], list):
                xpath, attr = self.field_mappings['dao']['dao_identifiers']
                success_count += self.set_elements_by_index(
                    xpath, data['dao_identifiers'], is_attribute=True, attr_name=attr
                )

            # 10. Content sections
            for content_field in ['access_restrict', 'use_restrict', 'phys_tech']:
                if content_field in data:
                    if self.set_element_text(self.field_mappings['content'][content_field], data[content_field]):
                        success_count += 1

            # 11. List items
            if 'list_items' in data and isinstance(data['list_items'], list):
                success_count += self.set_elements_by_index(
                    self.field_mappings['lists']['list_items'], 
                    data['list_items']
                )

            # 12. Table entries
            for table_key in ['table_t1_data', 'table_t2_data', 'table_t3_data']:
                if table_key in data and isinstance(data[table_key], list):
                    mapping_key = table_key.replace('_data', '_entries')
                    success_count += self.set_elements_by_index(
                        self.field_mappings['tables'][mapping_key],
                        data[table_key]
                    )

        except Exception as e:
            error_msg = f"Error during population: {e}"
            errors.append(error_msg)
            logger.error(error_msg)

        return success_count, errors

    def populate_from_arrays(self, field_names: List[str], field_values: List[Union[str, int, float]]) -> Tuple[int, List[str]]:
        """
        Populate XML from parallel arrays

        Args:
            field_names: List of field names
            field_values: List of corresponding values

        Returns:
            Tuple of (success_count, error_messages)
        """
        if len(field_names) != len(field_values):
            return 0, ["Field names and values arrays must have the same length"]

        data_dict = dict(zip(field_names, field_values))
        return self.populate_from_dict(data_dict)

    def save(self, output_path: Union[str, Path], pretty_print: bool = True) -> bool:
        """
        Save XML to file

        Args:
            output_path: Path where to save the XML
            pretty_print: Whether to format XML with proper indentation

        Returns:
            True if successful, False otherwise
        """
        try:
            output_path = Path(output_path)

            # Create output directory if it doesn't exist
            output_path.parent.mkdir(parents=True, exist_ok=True)

            if pretty_print:
                self._indent_xml(self.root)

            self.tree.write(str(output_path), encoding='utf-8', xml_declaration=True)
            logger.info(f"Successfully saved XML to: {output_path}")
            return True

        except Exception as e:
            logger.error(f"Error saving XML to {output_path}: {e}")
            return False

    def _indent_xml(self, elem, level=0):
        """Add proper indentation to XML"""
        i = "\n" + level * "    "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = i + "    "
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
            for child in elem:
                self._indent_xml(child, level + 1)
            if not child.tail or not child.tail.strip():
                child.tail = i
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = i

    def validate_populated_fields(self) -> Tuple[List[str], List[str]]:
        """
        Validate which fields have been populated

        Returns:
            Tuple of (populated_fields, empty_fields)
        """
        populated = []
        empty = []

        # Check all known field mappings
        all_mappings = [
            ('opex_properties', False),
            ('archival_desc', False), 
            ('persons', False),
            ('content', False)
        ]

        try:
            for mapping_group, is_attr in all_mappings:
                for field_name, xpath in self.field_mappings[mapping_group].items():
                    if isinstance(xpath, tuple):
                        xpath = xpath[0]  # Handle attribute mappings

                    element = self.root.find(xpath)
                    if element is not None and element.text and element.text.strip():
                        populated.append(f"{mapping_group}.{field_name}")
                    else:
                        empty.append(f"{mapping_group}.{field_name}")

        except Exception as e:
            logger.warning(f"Error during validation: {e}")

        return populated, empty

def batch_process_opex(template_path: Union[str, Path], datasets: List[Dict], 
                      output_dir: Union[str, Path] = "output", 
                      output_prefix: str = "processed") -> List[Dict]:
    """
    Process multiple datasets in batch

    Args:
        template_path: Path to OPEX template
        datasets: List of data dictionaries
        output_dir: Directory for output files
        output_prefix: Prefix for output filenames

    Returns:
        List of processing results
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []

    for i, dataset in enumerate(datasets, 1):
        try:
            processor = OPEXXMLProcessor(template_path)
            success_count, errors = processor.populate_from_dict(dataset)

            output_file = output_dir / f"{output_prefix}_{i:03d}.xml"
            save_success = processor.save(output_file)

            populated, empty = processor.validate_populated_fields()

            results.append({
                'dataset_num': i,
                'success_count': success_count,
                'error_count': len(errors),
                'errors': errors,
                'output_file': str(output_file),
                'save_success': save_success,
                'populated_fields': len(populated),
                'empty_fields': len(empty)
            })

        except Exception as e:
            results.append({
                'dataset_num': i,
                'error': str(e),
                'success_count': 0,
                'save_success': False
            })

    return results

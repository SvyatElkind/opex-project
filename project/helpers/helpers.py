"""Module contains different helper functions for project app."""

from helpers.constants import ITEM_RESTRICTION_LIST, ITEM_SECURITY_LEVEL_LIST, VVAIS_STORAGE_TERM_LIST, VVAIS_TYPE_LIST
from items.helpers.constants import DATE_INDICATOR_VALUES, UNIT_OF_MEASURE_VALUES
from records.helpers.constants import RECORD_ACCESS_RESTRICTION_VALUES


def get_allowed_values() -> dict:
    """Provides dictionary of allowed variables in frontend input fields.
    
    Returns:
        Dictionary of allowed variables."""
    inventory = {}
    inventory['type'] = VVAIS_TYPE_LIST
    inventory['storage_term'] = VVAIS_STORAGE_TERM_LIST

    item = {}
    item['date_indicator'] = DATE_INDICATOR_VALUES
    item['unit_of_measure'] = UNIT_OF_MEASURE_VALUES
    item['restriction'] = ITEM_RESTRICTION_LIST
    item['security_level'] = ITEM_SECURITY_LEVEL_LIST

    record = {}
    record['access_restriction'] = RECORD_ACCESS_RESTRICTION_VALUES


    allowed_values = {'inventory': inventory, 'item': item, 'record': record}
    return allowed_values
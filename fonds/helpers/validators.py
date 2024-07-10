"""Module contains validation functions for Fond class"""


from django.core.exceptions import ValidationError

from fonds.helpers.constants import (
    MSG_E_ARCH_TITLE_VALUE,
    MSG_E_ARHC_ABBREVIATION_VALUE
)
from helpers.constants import ARCH_ABBREVIATION_LIST, ARCH_TITLE_DICT


def validate_arch_abbreviation_value(value: str):
    """Validate arhcive abbreviation value"""
    if not value in ARCH_ABBREVIATION_LIST:
        raise ValidationError(MSG_E_ARHC_ABBREVIATION_VALUE)
    

def validate_arch_title(arch_abbr: str, arch_title: str) -> None | str:
    """Validate if archive title coresponds to arch abbreviation
    
    Returns:
        None if no validation error, else returns error message"""
    if not arch_title == ARCH_TITLE_DICT.get(arch_abbr):
        return MSG_E_ARCH_TITLE_VALUE
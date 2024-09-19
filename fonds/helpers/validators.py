"""Module contains validation functions for Fond model."""


from django.core.exceptions import ValidationError

from fonds.helpers.constants import (
    MSG_E_ARCH_TITLE_VALUE,
    MSG_E_ARHC_ABBREVIATION_VALUE
)
from helpers.constants import ARCH_ABBREVIATION_LIST, ARCH_TITLE_DICT


def validate_arch_abbreviation_value(arch_abbr: str) -> None:
    """Validate arhcive abbreviation value.
    
    Args:
        arch_abbr: Fond archive abbreviation.
        
    Raises:
        VallidationError: If archive abbreviation is not one of allowed values.
    """
    if not arch_abbr in ARCH_ABBREVIATION_LIST:
        raise ValidationError(MSG_E_ARHC_ABBREVIATION_VALUE)
    

def validate_arch_title(arch_abbr: str, arch_title: str) -> None | str:
    """Validate if archive title coresponds to arch abbreviation.

    Args:
        arch_abbr: Fond archive abbreviation.
        arch_title: Fond archive title.
    
    Returns:
        None if no validation error, else returns error message.
    """
    if not arch_title == ARCH_TITLE_DICT.get(arch_abbr):
        raise ValidationError({'arch_title': MSG_E_ARCH_TITLE_VALUE})
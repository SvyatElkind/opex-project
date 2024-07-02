"""Module contains Records app models"""

import logging

from django.db import models, OperationalError
from retry import retry


logger = logging.getLogger(__name__)

class Record(models.Model):
    pass
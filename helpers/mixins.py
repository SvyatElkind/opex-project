"""This module contains mixins for validation and response handling in views."""


from typing import Union   

from django.http import Http404
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

from helpers.constants import ERROR, MSG_E_DENIED_ACTION, MSG_E_OBJECT_DOES_NOT_EXIST
from fonds.models import Fond
from institutions.models import Institution
from inventories.models import Inventory
from items.models import Item
from records.models import (
    Action,
    Addressee, 
    AudioRecord, 
    PhotoRecord, 
    ReadStatus, 
    Record, 
    VideoRecord, 
    Visa
)


class ProjectRelationMixin:
    """Mixin for validating that objects are in the scope of the project."""

    def get_validated_object(
            self,
            project_id: int, 
            model: type, 
            object_id: int
            ) -> Union[
                Institution,
                Fond, 
                Inventory, 
                Item, 
                Record, 
                PhotoRecord, 
                VideoRecord, 
                AudioRecord,
                Action,
                Addressee,
                Visa,
                ReadStatus]:
        """Get specific model instance and check if it is in the scope of the project.
        
        Args:
            project_id: Project id.
            model: Model class from which instance will be created.
            object_id: Object id.
        
        Returns:
            Model instance if exists and valid.
            
        Raises:
            Http404: if object does not exist.
            ValidationError: if object is out of project scope."""

        # Get provided model instance
        instance = model.objects.filter(id=object_id).first()
        if not instance:
            raise ValidationError(MSG_E_OBJECT_DOES_NOT_EXIST.format(model.__name__, object_id))
            
        
        # Validate if instance is in the scope of project
        try:
            self.validate_project_id(project_id, instance)
        except ValidationError as ex:
            raise ex

        return instance

    def validate_project_id(
            self,
            project_id: int,
            instance: Union[Institution,
                            Fond, 
                            Inventory, 
                            Item, 
                            Record, 
                            PhotoRecord, 
                            VideoRecord, 
                            AudioRecord,
                            Action,
                            Addressee,
                            Visa,
                            ReadStatus]
                            ) -> None:
        """Validate if instance is in the scope of the project.
        
        Args:
            project_id: Project id.
            instance: Instance that should be validated.
        
        Raises:
            ValidationError: if object is out of the scope."""
        if isinstance(instance, Institution):
            instance_related_project_id = instance.project.id
        if isinstance(instance, Fond):
            instance_related_project_id = instance.institution.project.id
        if isinstance(instance, Inventory):
            instance_related_project_id = instance.fond.institution.project.id 
        if isinstance(instance, Item):
            instance_related_project_id = instance.inventory.fond.institution.project.id
        if isinstance(instance, Record):
            instance_related_project_id = instance.item.inventory.fond.institution.project.id
        if isinstance(instance, PhotoRecord):
            instance_related_project_id = instance.item.inventory.fond.institution.project.id
        if isinstance(instance, VideoRecord):
            instance_related_project_id = instance.item.inventory.fond.institution.project.id
        if isinstance(instance, AudioRecord):
            instance_related_project_id = instance.item.inventory.fond.institution.project.id
        if isinstance(instance, Action):
            instance_related_project_id = instance.record.item.inventory.fond.institution.project.id  
        if isinstance(instance, Addressee):
            instance_related_project_id = instance.record.item.inventory.fond.institution.project.id  
        if isinstance(instance, Visa):
            instance_related_project_id = instance.record.item.inventory.fond.institution.project.id   
        if isinstance(instance, ReadStatus):
            instance_related_project_id = instance.record.item.inventory.fond.institution.project.id
            

        if not project_id == instance_related_project_id:
            raise ValidationError({ERROR: MSG_E_DENIED_ACTION})


class ResponseMixin:
    """Class response generation."""
   
    def response(self, data, status_code: int) -> Response:
        """Method creates response for view functions.

        Args:
            data (dict): Data to be returned in response.
            status_code: HTTP status code.
        
        Returns:
            Response object."""
        responses = {
            200: status.HTTP_200_OK,
            201: status.HTTP_201_CREATED,
            204: status.HTTP_204_NO_CONTENT,
            400: status.HTTP_400_BAD_REQUEST,
        }
        return Response(data, responses.get(status_code))
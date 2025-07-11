
from typing import Union   

from django.http import Http404
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

from helpers.constants import ERROR, MSG_E_DENIED_ACTION
from fonds.models import Fond
from institutions.models import Institution
from inventories.models import Inventory
from items.models import Item
from records.models import AudioRecord, PhotoRecord, Record, VideoRecord


class ProjectRelationMixin:

    def get_validated_object(self, project_id: int, model: type, object_id: int):
        """Get specific model instance that exists and are in the project scope.
        
        Args:
            project_id: project id provided in url.
            model: Model class from which instance will be created.
            object_id: object id provided in url.
        
        Returns:
            Model instance if exists and valid.
            
        Raises:
            Http404: if object does not exist.
            ValidationError: if object is out of project scope."""

        try:
            instance = get_object_or_404(model, id=object_id)
        except Http404 as ex:
            raise ex
        
        try:
            self.validate_project_id(project_id, instance)
        except ValidationError as ex:
            raise ex

        return instance

    def validate_project_id(self,
                            project_id: int,
                            instance: Union[Institution, Fond, Inventory, Item]):
        """Validate if instance is in project scope.
        
        Args:
            project_id: Project id against which instance should be compared.
            instance: Instance that should be validated.
        
        Raises:
            ValidationError: if object is out of project scope."""
        # TODO optimase sql querys
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
            

        if not project_id == instance_related_project_id:
            raise ValidationError({ERROR: MSG_E_DENIED_ACTION})


class ResponseMixin:
    """Class for different responses."""
    
    def create_response(self, data, status_code):
        """Returns Response object based data and status code."""
        return Response(data=data, status=status_code)
    
    def response(self, data, status_code) -> Response:
        """Method creates response for view functions.
        
        Returns:
            Response object."""
        responses = {
            200: status.HTTP_200_OK,
            201: status.HTTP_201_CREATED,
            204: status.HTTP_204_NO_CONTENT,
            400: status.HTTP_400_BAD_REQUEST,
        }
        return self.create_response(data, responses.get(status_code))
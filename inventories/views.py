"""Module contains api views for inventory app."""

from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS

from helpers.mixins import ProjectRelationMixin, ResponseMixin
from inventories.helpers.constants import MSG_INVENTORY_DELETED
from inventories.models import Inventory
from inventories.serializers import InventorySerializer


class AddInventoryAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for new inventory."""
    serializer_class = InventorySerializer

    def post(self, request, project_id):
        """Create new inventory."""
        fond_id = request.query_params.get('fond_id')
        serializer = self.serializer_class(data=request.data,
                                           context={'fond_id': fond_id, 'request': request})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                 return self.response(ex.args[0], 400)
            except Exception:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
            
            return self.response(serializer.data, 201)
        
        return self.response(serializer.errors, 400)


class InventoryAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for specific inventory."""
    serializer_class = InventorySerializer 

    def put(self, request, project_id, inventory_id):
        """Update inventory."""
        try:
            inventory = self.get_validated_object(project_id, Inventory, inventory_id)        
        except ValidationError as ex:
            return self.response(ex.args[0], 400) 
        
        # Get serializer
        serializer = self.serializer_class(inventory, data=request.data)

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            
            return self.response(serializer.data, 200)

        return self.response(serializer.errors, 400)


    def delete(self, request, project_id, inventory_id):
        """Delete inventory."""
        try:
            inventory = self.get_validated_object(project_id, Inventory, inventory_id)        
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        try:
            inventory.delete_inventory()
        except Exception as ex:
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

        return self.response({SUCCESS: MSG_INVENTORY_DELETED}, 200)


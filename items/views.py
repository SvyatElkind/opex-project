"""Module contains api views for item app."""

from django.core.exceptions import ValidationError
from rest_framework.views import APIView

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS

from helpers.mixins import ProjectRelationMixin, ResponseMixin
from items.models import Item
from items.serializers import ItemSerializer, UpdateItemSerializer

class AddItemAPIView(ResponseMixin, APIView):
    """API view creating item."""
    serializer_class = ItemSerializer

    def post(self, request, project_id):
        """Create new item."""
        inventory_id = request.query_params.get('inventory_id')
        serializer = self.serializer_class(data=request.data,
                                           context={'inventory_id': inventory_id, 'request': request})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
            
            return self.response(serializer.data, 201)
        
        return self.response(serializer.errors, 400)


class ItemAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API View for specific item."""
    serializer_class = UpdateItemSerializer

    def put(self, request, project_id, item_id):
        """Update item."""
        try:
            item = self.get_validated_object(project_id, Item, item_id)        
        except ValidationError as ex:
            return self.response(ex.args[0], 400) 

        serializer = self.serializer_class(item,
                                           data=request.data,
                                           context={'item': item})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                 return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
            
            return self.response(serializer.data, 200)
        
        return self.response(serializer.errors, 400)
    
    def delete(self, request, project_id, item_id):
        """Delete item."""
        try:
            item = self.get_validated_object(project_id, Item, item_id)        
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        try:
            item.delete_item()
        except Exception as ex:
            return self.response(ex.args[0], 400)
        
        return self.response({SUCCESS: 'Item deleted'}, 200)


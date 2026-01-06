"""Module contains api views for item app."""
import logging

from django.core.exceptions import ValidationError
from django.http import Http404
from rest_framework.views import APIView

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from helpers.mixins import ProjectRelationMixin, ResponseMixin
from inventories.models import Inventory
from items.helpers.constants import MSG_E_NO_INVENTORY_DATE
from items.models import Item
from items.serializers import ItemSerializer, UpdateItemSerializer


logger = logging.getLogger(__name__)


class AddItemAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view creating item."""
    serializer_class = ItemSerializer

    def post(self, request, project_id):
        """Create new item."""
        inventory_id = request.query_params.get('inventory_id')

        # Validations
        try:
            inventory = self.get_validated_object(project_id, Inventory, inventory_id)
        except ValidationError as ex:
            logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
            return self.response(ex.args[0], 400)
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

        # Check if inventory has start and end date
        if not (inventory.start_date and inventory.end_date):
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_INVENTORY_DATE.format(inventory.id)}')
            return self.response({ERROR: MSG_E_NO_INVENTORY_DATE.format(inventory.id)}, 400)

        serializer = self.serializer_class(data=request.data,
                                           context={'inventory': inventory, 'request': request})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
                return self.response(ex.args[0], 400)
            except Exception as ex:
                logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
            
            return self.response(serializer.data, 201)

        logger.warning(f'{self.__class__.__name__}: {serializer.errors}')
        return self.response(serializer.errors, 400)


class ItemAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API View for specific item."""
    serializer_class = UpdateItemSerializer

    def put(self, request, project_id, item_id):
        """Update item."""
        try:
            item = self.get_validated_object(project_id, Item, item_id)        
        except ValidationError as ex:
            logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
            return self.response(ex.args[0], 400)
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

        serializer = self.serializer_class(item,
                                           data=request.data,
                                           context={'item': item})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
                return self.response(ex.args[0], 400)
            except Exception as ex:
                logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
            
            return self.response(serializer.data, 200)
        
        logger.warning(f'{self.__class__.__name__}: {serializer.errors}')
        return self.response(serializer.errors, 400)
    
    def delete(self, request, project_id, item_id):
        """Delete item."""
        try:
            item = self.get_validated_object(project_id, Item, item_id)        
        except ValidationError as ex:
            logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
            return self.response(ex.args[0], 400)
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
        
        try:
            print(f'delete_item: {item.number}')
            item.delete_item()
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response(ex.args[0], 400)
        
        return self.response({SUCCESS: 'Item deleted'}, 200)


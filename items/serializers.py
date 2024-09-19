"""Module for Items view serializers."""


from rest_framework import serializers

from helpers.validators import validate_if_parent_exists
from inventories.models import Inventory
from items.helpers.constants import (
    MSG_E_ITEM_ANNOTATION_REQUIRED,
    REQUIERE_ANNOTATION_TYPE,
    CREATE_ITEM_FIELDS,
    UPDATE_ITEM_FIELDS
)
from items.models import Item


class InventorySerializer(serializers.ModelSerializer):
    class Meta():
        model = Inventory
        fields = ['id']


class ItemSerializer(serializers.ModelSerializer):
    """Serializer is used for text item."""

    inventory = InventorySerializer(read_only=True)
    related_items = serializers.SerializerMethodField(read_only=True)
    related_item_list = serializers.ListField(required=False) # Field for related item id.
    
    def get_related_items(self, obj):
        """Get related items."""
        return obj.related_item.values_list('id', flat=True)

    class Meta:
        model = Item
        fields = CREATE_ITEM_FIELDS + ['inventory', 'related_item_list', 'related_items']
    
    def validate(self, attrs):
        inventory_id = self.context['inventory_id']
        # Validate provided inventory id.
        inventory = validate_if_parent_exists(Inventory, inventory_id) # TODO optimise this part

        # Check anotation field for media item
        annotation = attrs.get('annotation')
        if inventory.type in REQUIERE_ANNOTATION_TYPE and not annotation:
            raise serializers.ValidationError(MSG_E_ITEM_ANNOTATION_REQUIRED)

        return super().validate(attrs)

    def create(self, validated_data):
        # Get inventory.
        inventory = Inventory.objects.get(id=self.context['inventory_id'])
        # Create item
        item = Item.add_item(validated_data, inventory)
        return item

class UpdateItemSerializer(serializers.ModelSerializer):
    """Serializer is used for Item update."""

    inventory = InventorySerializer(read_only=True)
    related_items = serializers.SerializerMethodField(read_only=True)
    related_item_list = serializers.ListField(required=False)
    number = serializers.IntegerField(read_only=True)
    
    def get_related_items(self, obj):
        """Get related items."""
        return obj.related_item.values_list('id', flat=True)

    class Meta:
        model = Item
        fields = UPDATE_ITEM_FIELDS + ['number', 'inventory', 'related_item_list', 'related_items']
    
    def validate(self, attrs):
        item = self.context.get('item')
        inventory = item.inventory
        
        # Check anotation field for media item
        annotation = attrs.get('annotation')
        if inventory.type in REQUIERE_ANNOTATION_TYPE and not annotation:
            raise serializers.ValidationError(MSG_E_ITEM_ANNOTATION_REQUIRED)
        return super().validate(attrs)
    
    def update(self, instance, validated_data):
        """Updates entry in item table."""
        instance.update_item(validated_data)
        return instance
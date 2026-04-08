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


class ItemSerializer(serializers.ModelSerializer):
    """Serializer is used for text item."""

    related_items = serializers.SerializerMethodField(read_only=True)
    related_item_list = serializers.ListField(required=False) # Field for related item id.
    number = serializers.IntegerField(read_only=True)

    def get_related_items(self, obj):
        """Get related items."""
        return obj.related_item.values_list('id', flat=True)

    class Meta:
        model = Item
        fields = CREATE_ITEM_FIELDS + ['related_item_list', 'related_items', 'number']
    
    def validate(self, attrs):
        inventory = self.context['inventory']

        # Check anotation field for media item
        annotation = attrs.get('annotation')
        if inventory.type in REQUIERE_ANNOTATION_TYPE and not annotation:
            raise serializers.ValidationError(MSG_E_ITEM_ANNOTATION_REQUIRED)

        return super().validate(attrs)

    def create(self, validated_data):
        # Get inventory.
        inventory = self.context['inventory']
        # Create item.
        item = Item.add_item(validated_data, inventory)
        return item

class UpdateItemSerializer(serializers.ModelSerializer):
    """Serializer is used for Item update."""

    related_items = serializers.SerializerMethodField(read_only=True)
    related_item_list = serializers.ListField(required=False)
    number = serializers.IntegerField(read_only=True)
    size = serializers.IntegerField(required=False)
    unit_of_measure = serializers.CharField(required=False)
    
    def get_related_items(self, obj):
        """Get related items."""
        return obj.related_item.values_list('id', flat=True)

    class Meta:
        model = Item
        fields = UPDATE_ITEM_FIELDS + ['number', 'related_item_list', 'related_items', 'size', 'unit_of_measure']
    
    def validate(self, attrs):
        item = self.context.get('item')
        inventory = item.inventory
        print(f'serializer_validate: {item.number}')
        
        # Check anotation field for media item
        annotation = attrs.get('annotation')
        if inventory.type in REQUIERE_ANNOTATION_TYPE and not annotation:
            raise serializers.ValidationError(MSG_E_ITEM_ANNOTATION_REQUIRED)
        return super().validate(attrs)
    
    def update(self, instance, validated_data):
        """Updates entry in item table."""
        print(f'serializer_update: {instance.number}')
        instance.update_item(validated_data)
        print(f'serializer_update_after: {instance.number}')
        return instance
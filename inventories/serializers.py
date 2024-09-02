"""Module for Invnetory view serializers."""

from rest_framework import serializers

from fonds.models import Fond
from inventories.helpers.validators import validate_if_fond_exists, validate_inventory_date
from inventories.models import Inventory

class FondSerializer(serializers.ModelSerializer):

    class Meta():
        model = Fond
        fields = ['id']

class InventorySerializer(serializers.ModelSerializer):
    """Serializer is used for Inventory model."""

    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    fond = FondSerializer(read_only=True)
    
    class Meta:
        model = Inventory
        fields = '__all__'

    def validate(self, attrs):

        request = self.context.get('request')
        # Additional validation for 'POST' method
        if request and request.method == 'POST': 
            # Get fond_id
            fond_id = self.context['fond_id']
            
            # Validate provided fond id
            validate_if_fond_exists(fond_id)

        # Validate inventory start and end date.
        validate_inventory_date(attrs['start_date'], attrs['end_date'])
        
        return super().validate(attrs)

    def create(self, validated_data):
        """Creates new entry in inventory table."""
        # Get fond.
        fond = Fond.objects.get(id=self.context['fond_id'])
        # Create inventory.
        invnetory = Inventory.add_inventory(validated_data, fond)

        return invnetory

    def update(self, instance, validated_data):
        """Updates entry in inventory table.
        
        Args:
            instance: Inventory instance.
        """
        instance.update(validated_data)

        return instance
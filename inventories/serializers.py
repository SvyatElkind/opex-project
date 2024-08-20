"""Module for Invnetory view serializers."""

from django.db.models import Max
from rest_framework import serializers

from fonds.models import Fond
from helpers.constants import MSG_E_DATA_TYPE
from helpers.validators import validate_mandatory_fields
from inventories.helpers.constants import INVENTORY_FULL_UPDATE_FIELDS, INVENTORY_SERIALIZER_FIELDS, MSG_E_INVENTORY_NUMBER
from inventories.helpers.validators import validate_if_fond_exists, validate_inventory_date
from inventories.models import Inventory

class FondSerializer(serializers.ModelSerializer):
    class Meta():
        model = Fond
        fields = ['id']

class InventorySerializer(serializers.ModelSerializer):
    """Serializer is used for Inventory model."""

    fond = FondSerializer(read_only=True)

    # Required fields for validation.
    validation_fields = INVENTORY_SERIALIZER_FIELDS

    class Meta:
        model = Inventory
        exclude = ['postfix']

    def validate(self, attrs):

        # Check all if mandatory fields are provided.
        validate_mandatory_fields(self.initial_data.keys(), self.validation_fields)

        request = self.context.get('request')
        # Additional validation for 'POST' method
        if request and request.method == 'POST': 
            # Get fond_id
            fond_id = self.context['fond_id']
            
            # Validate provided fond id
            validate_if_fond_exists(fond_id)
        
            # ----------------------
            # Validate inventory number 
            number = attrs['number']

            if not isinstance(number, int):
                raise serializers.ValidationError(MSG_E_DATA_TYPE)
            
            # Get last inventory number.
            last_number = Inventory.objects.filter(fond_id=self.context['fond_id']).aggregate(Max('number'))['number__max']     
            if not isinstance(last_number, int):
                if not number == 1:
                    raise serializers.ValidationError(MSG_E_INVENTORY_NUMBER)

            elif not last_number + 1 == number:
                raise serializers.ValidationError(MSG_E_INVENTORY_NUMBER)
            # ------------------------


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
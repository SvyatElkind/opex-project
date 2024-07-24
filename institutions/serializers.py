""""Model contains serializers for institutios views"""


from django.core.exceptions import ValidationError
from rest_framework import serializers

from institutions.helpers.constants import FIELDS, MSG_E_EMPTY_FIELDS, MSG_E_REDUNDANT_FIELDS
from institutions.models import Institution


class InstitutionSerializer(serializers.ModelSerializer):
    """Serializer is used to to validate and update institution instance."""
    
    # Required fields for validation.
    update_fields = ['creator', 'creator_position', 'signer', 'signer_position']
    
    class Meta:
        model = Institution
        fields = '__all__'

    def validate(self, attrs):
        # Check if there is exra fields provided.
        extra_fields = set(self.initial_data.keys()).difference(self.update_fields)
        if extra_fields:
            raise serializers.ValidationError({FIELDS: MSG_E_REDUNDANT_FIELDS})
        
        # Check if all reauired fields ar provided
        missing_fields = set(self.update_fields).difference((self.initial_data.keys()))
        if missing_fields:
            raise serializers.ValidationError({FIELDS: MSG_E_EMPTY_FIELDS.format(', '.join(missing_fields))})
        
        return super().validate(attrs)

    def update(self, institution, validated_data):
        """Updates entry in institution table.
        
        Args:
            institution: Institution instance.
        """
        institution.update(validated_data)
        return institution

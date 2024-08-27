""""Model contains serializers for institutios views"""


from django.core.exceptions import ValidationError
from rest_framework import serializers

from helpers.constants import FIELDS, MSG_E_EMPTY_FIELDS, MSG_E_REDUNDANT_FIELDS
from helpers.validators import validate_mandatory_fields
from institutions.helpers.constants import INSTITUTION_UPDATE_FIELDS
from institutions.models import Institution


class InstitutionSerializer(serializers.ModelSerializer):
    """Serializer is used to to validate and update institution instance."""
    
    # Required fields for validation.
    validation_fields = INSTITUTION_UPDATE_FIELDS
    
    class Meta:
        model = Institution
        fields = '__all__'

    def validate(self, attrs):
        # Check all if mandatory fields are provided.
        validate_mandatory_fields(self.initial_data.keys(), self.validation_fields)

        return super().validate(attrs)

    def update(self, institution, validated_data):
        """Updates entry in institution table.
        
        Args:
            institution: Institution instance.
        """
        institution.update(validated_data)
        return institution

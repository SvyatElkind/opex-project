""""Model contains serializers for project views"""
import os
from rest_framework import serializers
from django.db.models import Max

from fonds.models import Fond
from institutions.models import Institution
from inventories.models import Inventory
from items.models import Item
from project.helpers.constants import (
    ALLOWED_FILE_FORMAT,
    MSG_E_ROOT_FOLDER_MISSING,
    MSG_E_WRONG_FILE_EXTENSION
)
from project.models import Project


class AllItemSerializer(serializers.ModelSerializer):
    """Serializer is used when specific project data is collected."""
    class Meta:
        model = Item
        fields = '__all__'


class AllInventorySerializer(serializers.ModelSerializer):
    """Serializer is used when specific project data is collected."""
    items = AllItemSerializer(many=True)

    class Meta:
        model = Inventory
        fields = '__all__'


class AllFondSerializer(serializers.ModelSerializer):
    """Serializer is used when specific project data is collected."""
    inventories = AllInventorySerializer(many=True)
    last_us_number = serializers.SerializerMethodField()

    def get_last_us_number(self, obj):
        """Get last US number in the fond."""
        return Inventory.objects.filter(fond_id=obj.id).aggregate(Max('number'))['number__max'] 

    class Meta:
        model = Fond
        fields = '__all__'
        

class AllInstitutionSerializer(serializers.ModelSerializer):
    """Serializer is used when specific project data is collected."""
    fond = AllFondSerializer()

    class Meta:
        model = Institution
        fields = '__all__'


class SpecificProjectSerializer(serializers.ModelSerializer):
    """Serializer is used when specific project data is collected."""
    institution = AllInstitutionSerializer()
    
    class Meta:
        model = Project
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer is used when working only with project model."""
    class Meta:
        model = Project
        fields = '__all__'

    def create(self, validated_data):
        """Creates new entry in project table"""
        name = validated_data.get('name')
        root_folder = validated_data.get('folder')
        instance = Project.add_project(name, root_folder)
        return instance
    
    def update(self, project, validated_data):
        """Updates entry in project table.
        
        Args:
            project: Project instance.
        """
        project.update_project(validated_data.get('name'))
        return project

class VVAISReportFileSerializer(serializers.Serializer):
    """Serializer is used to validate VVAIS Report file."""
    file = serializers.FileField(max_length=None, allow_empty_file=False)

    def validate_file(self, value):

        file_extension = os.path.splitext(value.name)[1]
        
        if not file_extension.lower() == ALLOWED_FILE_FORMAT:
            raise serializers.ValidationError(MSG_E_WRONG_FILE_EXTENSION)
        return value

class DataFromStructureSerializer(serializers.Serializer):
    """Serializer used to validate folder path."""
    folder = serializers.CharField(allow_blank=False)

    def validate_folder(self, value):
        if not os.path.isdir(value):
            raise serializers.ValidationError(MSG_E_ROOT_FOLDER_MISSING)
        return value
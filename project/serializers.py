""""Model contains serializers for project views"""
from rest_framework import serializers

from fonds.models import Fond
from institutions.models import Institution
from inventories.models import Inventory
from items.models import Item
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


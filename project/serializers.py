""""Model contains serializers for project views."""


import os

from rest_framework import serializers
from django.db.models import Max

from fonds.models import Fond
from institutions.models import Institution
from inventories.models import Inventory
from items.models import Item
from project.helpers.constants import (
    ALLOWED_REPORT_FORMAT,
    MSG_E_WRONG_FILE_EXTENSION
)
from project.models import Project
from records.models import Action, Addressee, AudioRecord, File, PhotoRecord, ReadStatus, Record, VideoRecord, Visa


class FileSerializer(serializers.ModelSerializer):
    """Get File data.
    
    Serializer is used when specific project data is collected."""
    class Meta:
        model = File
        exclude = ['path']


class ActionSerializer(serializers.ModelSerializer):
    """Get Action data.
    
    Serializer is used when specific project data is collected."""
    class Meta:
        model = Action
        fields = '__all__'


class AddresseeSerializer(serializers.ModelSerializer):
    """Get Addressee data.
    
    Serializer is used when specific project data is collected."""
    class Meta:
        model = Addressee
        fields = '__all__'


class VisaSerializer(serializers.ModelSerializer):
    """Get Visa data.
    
    Serializer is used when specific project data is collected."""
    class Meta:
        model = Visa
        fields = '__all__'


class ReadStatusSerializer(serializers.ModelSerializer):
    """Get Read Status data.
    
    Serializer is used when specific project data is collected."""
    class Meta:
        model = ReadStatus
        fields = '__all__'


class RecordSerializer(serializers.ModelSerializer):
    """Get Record data.
    
    Serializer is used when specific project data is collected."""
    actions = ActionSerializer(many=True)
    addressees = AddresseeSerializer(many=True)
    visas = VisaSerializer(many=True)
    read_status = ReadStatusSerializer(many=True)
    files = FileSerializer(many=True)

    class Meta:
        model = Record
        fields = '__all__'


class PhotoRecordSerializer(serializers.ModelSerializer):
    """Get Photo Record data.
    
    Serializer is used when specific project data is collected."""
    files = FileSerializer(many=True)

    class Meta:
        model = PhotoRecord
        fields = '__all__'


class VideoRecordSerializer(serializers.ModelSerializer):
    """Get Video Record data.
    
    Serializer is used when specific project data is collected."""
    files = FileSerializer(many=True)

    class Meta:
        model = VideoRecord
        fields = '__all__'


class AudioRecordSerializer(serializers.ModelSerializer):
    """Get Audio Record data.
    
    Serializer is used when specific project data is collected."""
    files = FileSerializer(many=True)

    class Meta:
        model = AudioRecord
        fields = '__all__'


class ItemSerializer(serializers.ModelSerializer):
    """Get Items data.

    Serializer is used when specific project data is collected."""
    records = RecordSerializer(many=True)
    photo_records = PhotoRecordSerializer(many=True)
    video_records = VideoRecordSerializer(many=True)
    audio_records = AudioRecordSerializer(many=True)

    class Meta:
        model = Item
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):
    """Get Inventory data.
    
    Serializer is used when specific project data is collected."""
    items = ItemSerializer(many=True)

    class Meta:
        model = Inventory
        fields = '__all__'


class FondSerializer(serializers.ModelSerializer):
    """Get Fond data.
    
    Serializer is used when specific project data is collected."""
    inventories = InventorySerializer(many=True)
    last_us_number = serializers.SerializerMethodField()

    def get_last_us_number(self, obj):
        """Get last US number in the fond."""
        return Inventory.objects.filter(fond_id=obj.id).aggregate(Max('number'))['number__max'] 

    class Meta:
        model = Fond
        fields = '__all__'
        

class InstitutionSerializer(serializers.ModelSerializer):
    """Get Institution data.
    
    Serializer is used when specific project data is collected."""
    fond = FondSerializer()

    class Meta:
        model = Institution
        fields = '__all__'


class SpecificProjectSerializer(serializers.ModelSerializer):
    """Get Project data.
    
    Serializer is used when specific project data is collected."""
    institution = InstitutionSerializer()
    
    class Meta:
        model = Project
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer is used when working only with project model."""
    class Meta:
        model = Project
        fields = '__all__'

    def create(self, validated_data):
        """Creates new entry in project table."""
        name = validated_data.get('name')
        root_folder = validated_data.get('folder')
        instance = Project.add_project(name, root_folder)
        return instance
    
    def update(self, project, validated_data):
        """Updates entry in project table."""
        project.update_project(validated_data.get('name'))
        return project


class VVAISReportFileSerializer(serializers.Serializer):
    """Serializer is used to validate VVAIS Report file."""
    file = serializers.FileField(max_length=None, allow_empty_file=False)

    def validate_file(self, value):

        file_extension = os.path.splitext(value.name)[1]
        
        if not file_extension.lower() == ALLOWED_REPORT_FORMAT:
            raise serializers.ValidationError(MSG_E_WRONG_FILE_EXTENSION)
        return value

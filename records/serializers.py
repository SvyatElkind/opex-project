"""Module for Record view serializers."""


from rest_framework import serializers

from helpers.constants import AUDIO, PHOTO, VIDEO
from items.models import Item
from records.helpers.constants import (
    ACTION,
    ADDRESSEE,
    READ_STATUS,
    VISA
)
from records.models import (
    Action,
    Addressee,
    AudioRecord,
    PhotoRecord,
    ReadStatus,
    Record,
    VideoRecord,
    Visa
)


class RecordSerializer(serializers.ModelSerializer):
    """Serializer is used for record."""

    class Meta:
        model = Record
        exclude = ('item',)
    
    def create(self, validated_data):
        # Get item instance.
        item = self.context['item']
        # Create record.
        record = Record.add_record(validated_data, item)
        return record
    

class UpdateRecordSerializer(serializers.ModelSerializer):
    """Serializer is used for record update."""

    class Meta:
        model = Record
        exclude = ('item',)
    
    def update(self, instance, validated_data):
        # Update record.
        instance.update_record(validated_data)
        return instance
    

class ActionSerializer(serializers.ModelSerializer):
    """Serializer is used for action."""

    class Meta:
        model = Action
        exclude = ('record',)

    def create(self, validated_data):
        # Get record instance.
        record = self.context['record']
        # Create metadata.
        metadata = Action.add_metadata(record, validated_data)
        return metadata
    
    
class UpdateActionSerializer(serializers.ModelSerializer):
    """Serializer is used for action."""

    class Meta:
        model = Action
        exclude = ('record',)


class AddresseeSerializer(serializers.ModelSerializer):
    """Serializer is used for addressee."""

    class Meta:
        model = Addressee
        exclude = ('record',)
    
    def create(self, validated_data):
        # Get record instance.
        record = self.context['record']
        # Create metadata.
        metadata = Addressee.add_metadata(record, validated_data)
        return metadata


class UpdateAddresseeSerializer(serializers.ModelSerializer):
    """Serializer is used for addressee."""

    class Meta:
        model = Addressee
        exclude = ('record',)


class VisaSerializer(serializers.ModelSerializer):
    """Serializer is used for visa."""

    class Meta:
        model = Visa
        exclude = ('record',)
    
    def create(self, validated_data):
        # Get record instance.
        record = self.context['record']
        # Create metadata.
        metadata = Visa.add_metadata(record, validated_data)
        return metadata


class UpdateVisaSerializer(serializers.ModelSerializer):
    """Serializer is used for visa."""

    class Meta:
        model = Visa
        exclude = ('record',)


class ReadStatusSerializer(serializers.ModelSerializer):
    """Serializer is used for read status."""

    class Meta:
        model = ReadStatus
        exclude = ('record',)
    
    def create(self, validated_data):
        # Get record instance.
        record = self.context['record']
        # Create metadata.
        metadata = ReadStatus.add_metadata(record, validated_data)
        return metadata


class UpdateReadStatusSerializer(serializers.ModelSerializer):
    """Serializer is used for read status."""

    class Meta:
        model = ReadStatus
        exclude = ('record',)
    

class RecordMetadataSerializer(serializers.Serializer):
    """Serializer to collect all additional metadata of a record."""

    actions = ActionSerializer(many=True, read_only=True)
    addressees = AddresseeSerializer(many=True, read_only=True)
    visas = VisaSerializer(many=True, read_only=True)
    read_statuses = ReadStatusSerializer(many=True, read_only=True)

    class Meta:
        fields = ('actions', 'addressees', 'visas', 'read_statuses')

    def to_representation(self, instance):
        return {
            'actions': ActionSerializer(instance.actions.all(), many=True).data,
            'addressees': AddresseeSerializer(instance.addressees.all(), many=True).data,
            'visas': VisaSerializer(instance.visas.all(), many=True).data,
            'read_statuses': ReadStatusSerializer(instance.read_status.all(), many=True).data,
        }
  

class PhotoRecordSerializer(serializers.ModelSerializer):
    """Serializer for PhotoRecord."""
    color = serializers.CharField(allow_blank=False)
    horizontal_resolution = serializers.IntegerField(required=True)
    vertical_resolution = serializers.IntegerField(required=True)

    class Meta:
        model = PhotoRecord
        exclude = ('item',)
    

class VideoRecordSerializer(serializers.ModelSerializer):
    """Serializer for VideoRecord."""
    color = serializers.CharField(allow_blank=False)
    duration = serializers.CharField(allow_blank=False)
    horizontal_resolution = serializers.IntegerField(required=True)
    vertical_resolution = serializers.IntegerField(required=True)
    

    class Meta:
        model = VideoRecord
        exclude = ('item',)
    

class AudioRecordSerializer(serializers.ModelSerializer):
    """Serializer for AudioRecord."""
    duration = serializers.CharField(allow_blank=False)

    class Meta:
        model = AudioRecord
        exclude = ('item',)


ADDITIONAIL_METADATA_MAP = {
        ACTION: ActionSerializer,
        ADDRESSEE: AddresseeSerializer,
        VISA: VisaSerializer,
        READ_STATUS: ReadStatusSerializer
    }

UPDATE_ADDITIONAL_METADATA_MAP = {
        ACTION: UpdateActionSerializer,
        ADDRESSEE: UpdateAddresseeSerializer,
        VISA: UpdateVisaSerializer,
        READ_STATUS: UpdateReadStatusSerializer
    }

MEDIA_RECORD_SERIALIZER_MAP = {
        PHOTO: PhotoRecordSerializer,
        VIDEO: VideoRecordSerializer,
        AUDIO: AudioRecordSerializer
    }
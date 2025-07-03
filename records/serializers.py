"""Module for Record view serializers."""


from rest_framework import serializers

from helpers.validators import validate_if_parent_exists
from items.models import Item
from records.helpers.constants import MSG_E_NOT_TEXT_RECORD, TEXT
from records.models import Action, Addressee, ReadStatus, Record, Visa


class RecordSerializer(serializers.ModelSerializer):
    """Serializer is used for record."""

    class Meta:
        model = Record
        exclude = ('item',)
    
    def validate(self, attrs):
        item_id = self.context['item_id']
        # Validate provided item id.
        item = validate_if_parent_exists(Item, item_id)

        # Check if item related inventory is type is for text and electronic is True.
        if not (item.inventory.type == TEXT and item.inventory.electronic):
            raise serializers.ValidationError(MSG_E_NOT_TEXT_RECORD)
        return super().validate(attrs)
    
    def create(self, validated_data):
        # Get item instance.
        item = Item.objects.get(id=self.context['item_id'])
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

    def validate(self, attrs):
        record_id = self.context['record_id']
        # Validate provided record id.
        record = validate_if_parent_exists(Record, record_id)

        return super().validate(attrs)
    
    def create(self, validated_data):
        # Get record instance.
        record = Record.objects.get(id=self.context['record_id'])
        # Get metadata class name.
        model_class_name = self.context['class']
        # Create metadata.
        metadata = record.add_metadata(model_class_name, validated_data)
        return metadata
    
    
class UpdateActionSerializer(serializers.ModelSerializer):
    """Serializer is used for action."""

    class Meta:
        model = Action
        exclude = ('record',)

    def update(self, instance, validated_data):
        # Update action.
        instance.update_action(validated_data)
        return instance


class AddresseeSerializer(serializers.ModelSerializer):
    """Serializer is used for addressee."""

    class Meta:
        model = Addressee
        exclude = ('record',)

    def validate(self, attrs):
        record_id = self.context['record_id']
        # Validate provided record id.
        record = validate_if_parent_exists(Record, record_id)

        return super().validate(attrs)
    
    def create(self, validated_data):
        # Get record instance.
        record = Record.objects.get(id=self.context['record_id'])
        # Get metadata class name.
        model_class_name = self.context['class']
        # Create metadata.
        metadata = record.add_metadata(model_class_name, validated_data)
        return metadata


class UpdateAddresseeSerializer(serializers.ModelSerializer):
    """Serializer is used for addressee."""

    class Meta:
        model = Addressee
        exclude = ('record',)
    
    def update(self, instance, validated_data):
        # Update addressee.
        instance.update_addressee(validated_data)
        return instance


class VisaSerializer(serializers.ModelSerializer):
    """Serializer is used for visa."""

    class Meta:
        model = Visa
        exclude = ('record',)
    
    def validate(self, attrs):
        record_id = self.context['record_id']
        # Validate provided record id.
        record = validate_if_parent_exists(Record, record_id)

        return super().validate(attrs)
    
    def create(self, validated_data):
        # Get record instance.
        record = Record.objects.get(id=self.context['record_id'])
        # Get metadata class name.
        model_class_name = self.context['class']
        # Create metadata.
        metadata = record.add_metadata(model_class_name, validated_data)
        return metadata


class UpdateVisaSerializer(serializers.ModelSerializer):
    """Serializer is used for visa."""

    class Meta:
        model = Visa
        exclude = ('record',)

    def update(self, instance, validated_data):
        # Update visa.
        instance.update_visa(validated_data)
        return instance


class ReadStatusSerializer(serializers.ModelSerializer):
    """Serializer is used for read status."""

    class Meta:
        model = ReadStatus
        exclude = ('record',)
    
    def validate(self, attrs):
        record_id = self.context['record_id']
        # Validate provided record id.
        record = validate_if_parent_exists(Record, record_id)

        return super().validate(attrs)
    
    def create(self, validated_data):
        # Get record instance.
        record = Record.objects.get(id=self.context['record_id'])
        # Get metadata class name.
        model_class_name = self.context['class']
        # Create metadata.
        metadata = record.add_metadata(model_class_name, validated_data)
        return metadata


class UpdateReadStatusSerializer(serializers.ModelSerializer):
    """Serializer is used for read status."""

    class Meta:
        model = ReadStatus
        exclude = ('record',)

    def update(self, instance, validated_data):
        # Update read status.
        instance.update_read_status(validated_data)
        return instance
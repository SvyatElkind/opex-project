"""Module contains api views for records app."""
from django.core.exceptions import ValidationError
from rest_framework.views import APIView

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from helpers.mixins import ProjectRelationMixin, ResponseMixin
from records.helpers.constants import MSG_E_UNKNOWN_CLASS
from records.serializers import (
    ActionSerializer,
    AddresseeSerializer,
    ReadStatusSerializer,
    RecordSerializer,
    UpdateActionSerializer,
    UpdateAddresseeSerializer,
    UpdateReadStatusSerializer,
    UpdateRecordSerializer,
    UpdateVisaSerializer,
    VisaSerializer,
    RecordMetadataSerializer
)
from records.models import Action, Addressee, Record, Visa, ReadStatus


class AddRecordAPIView(ResponseMixin, APIView):
    """API view creating record."""
    serializer_class = RecordSerializer

    def post(self, request, project_id):
        """Create new record."""
        item_id = request.query_params.get('item_id')
        # Validate item electronic
        serializer = self.serializer_class(data=request.data,
                                           context={'item_id': item_id})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

            return self.response(serializer.data, 201)

        return self.response(serializer.errors, 400)
    

class RecordAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for specific record."""
    serializer_class = UpdateRecordSerializer

    def put(self, request, project_id, record_id):
        """Update record."""
        try:
            record = self.get_validated_object(project_id, Record, record_id)        
        except ValidationError as ex:
            return self.response(ex.args[0], 400) 

        serializer = self.serializer_class(record,
                                           data=request.data,
                                           context={'record': record})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                 return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

            return self.response(serializer.data, 200)

        return self.response(serializer.errors, 400)
    
    def delete(self, request, project_id, record_id):
        """Delete record."""
        try:
            record = self.get_validated_object(project_id, Record, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        try:
            record.delete_record()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: 'Record deleted successfully'}, 200)


class AddMetadataAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """
    API view to create Action, Addressee, Visa, or ReadStatus instance
    using add_metadata() in records.models.

    """
    serializer_map = {
        'action': ActionSerializer,
        'addressee': AddresseeSerializer,
        'visa': VisaSerializer,
        'read_status': ReadStatusSerializer
    }


    def post(self, request, project_id, record_id):
        """Create metadata instance for a record."""
        # Get metadata class name.
        model_class_name = request.query_params.get('class')
        serializer_class = self.serializer_map.get(model_class_name)
        if not serializer_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)

        try:
            record = self.get_validated_object(project_id, Record, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        serializer = serializer_class(data=request.data, context={'record_id': record_id, 
                                                                  'class': model_class_name})

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

            return self.response(serializer.data, 201)

        return self.response(serializer.errors, 400)

class MetadataAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for specific metadata."""
    serializer_map = {
        'action': UpdateActionSerializer,
        'addressee': UpdateAddresseeSerializer,
        'visa': UpdateVisaSerializer,
        'read_status': UpdateReadStatusSerializer
    }

    model_class_map = {
            'action': Action,
            'addressee': Addressee,
            'visa': Visa,
            'read_status': ReadStatus
            }

    def put(self, request, project_id, record_id):
        """Update metadata instance."""
        print(1)
        model_class_name = request.query_params.get('class')
        serializer_class = self.serializer_map.get(model_class_name)
        if not serializer_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)

        metadata_id = request.query_params.get('id')
        try:
            model_class = self.model_class_map.get(model_class_name)
            if not model_class:
                return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)
            metadata_instance = model_class.objects.get(id=metadata_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        serializer = serializer_class(metadata_instance,
                                      data=request.data)

        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

            return self.response(serializer.data, 200)

        return self.response(serializer.errors, 400)
    
    def delete(self, request, project_id, record_id):
        """Delete metadata instance."""
        model_class_name = request.query_params.get('class')
        metadata_id = request.query_params.get('id')
        try:
            model_class = self.model_class_map.get(model_class_name)
            if not model_class:
                return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)
            metadata_instance = model_class.objects.get(id=metadata_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        try:
            metadata_instance.delete()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: 'Metadata deleted successfully'}, 200)

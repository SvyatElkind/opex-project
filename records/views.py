"""Module contains api views for records app."""
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from helpers.mixins import ProjectRelationMixin, ResponseMixin
from inventories.helpers.constants import INVENTORY_MEDIA_TYPE
from items.models import Item
from project.models import Project
from records.helpers.constants import MSG_E_NO_FILES_PROVIDED, MSG_E_UNKNOWN_CLASS, MSG_FILES_UPLOADED
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
from records.models import Action, Addressee, AudioRecord, File, PhotoRecord, Record, VideoRecord, Visa, ReadStatus
import os


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

    def get(self, request, project_id, record_id):
        """Get additional metadata of specific record."""
        try:
            record = self.get_validated_object(project_id, Record, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        serializer = RecordMetadataSerializer(record)

        return self.response(serializer.data, 200)

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
            record.delete()
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


class MultipleFileUploadAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for uploading multiple files using MultiPartParser."""
    parser_classes = [MultiPartParser]

    def post(self, request, project_id, record_id):
        """Handle multiple file uploads."""

        # Expects files in 'files' key of request.FILES.
        files = request.FILES.getlist('files')
        if not files:
            return self.response({ERROR: MSG_E_NO_FILES_PROVIDED}, 400)

        # Get validated record object.
        try:
            record = self.get_validated_object(project_id, Record, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        project = Project.objects.get(id=project_id)
        project_folder = project.folder

        File.add_files(files, record, project_folder)

        return self.response({SUCCESS: MSG_FILES_UPLOADED}, 201)

class FileDeleteAPIView(ResponseMixin, APIView):
    """API view for deleting a file from a record."""

    def delete(self, request, project_id, file_id):
        """Delete a file from the record."""

        file = File.objects.filter(id=file_id).first()
        if not file:
            return self.response({ERROR: 'File not found.'}, 404)

        try:
            file.delete()
        except FileNotFoundError:
            return self.response({ERROR: f'File "{file.id}" not found.'}, 404)
        except Exception as ex:
            return self.response({ERROR: str(ex)}, 400)

        return self.response({SUCCESS: f'File "{file.original_name}" deleted successfully.'}, 200)
    
class MediaFileUploadAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for creating media record and uploading media file."""
    parser_classes = [MultiPartParser]

    media_type_map = {
        'Foto': PhotoRecord,
        'Video': VideoRecord,
        'Audio': AudioRecord
    }

    def post(self, request, project_id):
        """Handle media file uploads."""
        item_id = request.query_params.get('item_id')
        item = Item.objects.get(id=item_id)
        if not (item.inventory.type in INVENTORY_MEDIA_TYPE and item.inventory.electronic):
            return self.response({ERROR: 'GV tips nav foto, video, skaņas un/vai elektroniskā formā '}, 400)
        
        if item.inventory.type == 'Foto':
            if item.photo_records.exists():
                return self.response({ERROR: 'Item already has a photo record.'}, 400)
        # elif item.inventory.type == 'Video':
        #     if item.video_records.exists():
        #         return self.response({ERROR: 'Item already has a video record.'}, 400)

        # Expects files in 'files' key of request.FILES.
        # Only one file is allowed to be uploaded at a time.
        files = request.FILES.getlist('files')
        if not files:
            return self.response({ERROR: MSG_E_NO_FILES_PROVIDED}, 400)
        if len(files) > 1:
            return self.response({ERROR: 'Only one file can be uploaded'}, 400)
        
        # Get media record class 
        media_class = self.media_type_map.get(item.inventory.type)
        if not media_class:
            return self.response({ERROR: 'GV tips nav foto, video, skaņas'}, 400)

        project = Project.objects.get(id=project_id)
        project_folder = project.folder

        # Create media record and add file to it
        try:
            media_class.add_record(files[0], project_folder, item)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: MSG_FILES_UPLOADED}, 201)

class MediaRecordAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    

    def delete(self, request, project_id, record_id):
        """Delete record."""
        try:
            record = self.get_validated_object(project_id, PhotoRecord, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        try:
            record.delete()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: 'Record deleted successfully'}, 200)

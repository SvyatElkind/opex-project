"""Module contains api views for records app."""


from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from helpers.mixins import ProjectRelationMixin, ResponseMixin
from items.models import Item
from project.models import Project
from records.helpers.constants import (
    FILES,
    MSG_E_IS_NOT_TEXT_FILE,
    MSG_E_METADATA_NOT_FOUND,
    MSG_E_NO_FILE,
    MSG_E_NO_FILES_PROVIDED,
    MSG_E_NO_INTEM_ID,
    MSG_E_NO_ITEM,
    MSG_E_NO_MULTIPLE_FILES_ALLOWED,
    MSG_E_NO_TYPE_PROVIDED,
    MSG_E_UNKNOWN_CLASS,
    MSG_FILE_DELETED,
    MSG_FILES_UPLOADED,
    MSG_METADATA_DELETED,
    MSG_RECORD_DELETED
)
from records.helpers.validators import validate_if_is_media_type, validate_if_record_exists, validate_if_text_type_and_electronic
from records.serializers import (
    MEDIA_RECORD_SERIALIZER_MAP,
    RecordSerializer,
    UpdateRecordSerializer,
    RecordMetadataSerializer,
    ADDITIONAIL_METADATA_MAP,
    UPDATE_ADDITIONAL_METADATA_MAP,
)
from records.models import (
    File,
    Record,
    MEDIA_CLASS_MAP,
    METADATA_CLASS_MAP,
)


class AddRecordAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view creating record."""
    serializer_class = RecordSerializer

    def post(self, request, project_id):
        """Create new record."""
        # Get item id from query params.
        item_id = request.query_params.get('item_id')
        
        # Validations
        try:
            item = self.get_validated_object(project_id, Item, item_id)
            validate_if_text_type_and_electronic(item)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        # Serializer 
        serializer = self.serializer_class(data=request.data,
                                           context={'item': item})

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
        """Delete record."""
        try:
            record = self.get_validated_object(project_id, Record, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        try:
            record.delete()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: MSG_RECORD_DELETED}, 200)


class AddMetadataAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view to create Action, Addressee, Visa, or ReadStatus instance"""
    def post(self, request, project_id, record_id):
        """Create metadata instance for a record."""
        # Get metadata class name.
        model_class_name = request.query_params.get('class')
        serializer_class = ADDITIONAIL_METADATA_MAP.get(model_class_name)
        if not serializer_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)

        try:
            record = self.get_validated_object(project_id, Record, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        serializer = serializer_class(
            data=request.data,
            context={'record': record}
            )

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

    def put(self, request, project_id, record_id):
        """Update metadata instance."""
        # Get parameters
        model_class_name = request.query_params.get('class')
        metadata_id = request.query_params.get('id')

        # Get serializer class and model class
        serializer_class = UPDATE_ADDITIONAL_METADATA_MAP.get(model_class_name)
        if not serializer_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)

        model_class = METADATA_CLASS_MAP.get(model_class_name)
        if not model_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)
        
        # Validate if metadata instance exists
        metadata_instance = model_class.objects.filter(id=metadata_id).first()
        if not metadata_instance:
            return self.response({ERROR: MSG_E_METADATA_NOT_FOUND}, 400)
        
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
        # Get parameters
        model_class_name = request.query_params.get('class')
        metadata_id = request.query_params.get('id')

        model_class = METADATA_CLASS_MAP.get(model_class_name)
        if not model_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS.format(model_class_name)}, 400)
        
        # Validate if metadata instance exists
        metadata_instance = model_class.objects.filter(id=metadata_id).first()
        if not metadata_instance:
            return self.response({ERROR: MSG_E_METADATA_NOT_FOUND}, 400)

        try:
            metadata_instance.delete()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: MSG_METADATA_DELETED}, 200)


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

        try:
            File.add_files(files, record, project_folder)
        except Exception as ex:
            return self.response({ERROR: ex.args[0]}, 400)

        return self.response({SUCCESS: MSG_FILES_UPLOADED}, 201)


class FileDeleteAPIView(ResponseMixin, APIView):
    """API view for deleting a file from a record.
    
    Only text inventory related files can be deleted."""

    def delete(self, request, project_id, file_id):
        """Delete a file from the record."""
        
        # Validate if there is a file and if it is related to inventory with type 'Tekstuāls'.
        # Delition of media files heppens during media record deletion.
        file = File.objects.filter(id=file_id).first()
        if not file:
            return self.response({ERROR: MSG_E_NO_FILE.format(file_id)}, 400)
        if not file.record:
            return self.response({ERROR: MSG_E_IS_NOT_TEXT_FILE}, 400)

        try:
            file.delete()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: MSG_FILE_DELETED}, 200)
    

class AddMediaRecordAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API view for creating media record.
    
    Media record is always created with a file upload."""
    parser_classes = [MultiPartParser]

    def post(self, request, project_id):
        """Handles creation of media record."""

        # Get item instance to assign media record to it.
        item_id = request.query_params.get('item_id')
        if not item_id:
            return self.response({ERROR: MSG_E_NO_INTEM_ID}, 400)
        
        item = Item.objects.filter(id=item_id).first()
        if not item:
            return self.response({ERROR: MSG_E_NO_ITEM.format(item_id)}, 400)
        
        # Validations
        try:
            item_type = validate_if_is_media_type(item)
            validate_if_record_exists(item)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        # Expects files in 'files' key of request.FILES.
        # Only one file is allowed to be uploaded at a time.
        file = request.FILES.getlist(FILES)
        if not file:
            return self.response({ERROR: MSG_E_NO_FILES_PROVIDED}, 400)
        if len(file) > 1:
            return self.response({ERROR: MSG_E_NO_MULTIPLE_FILES_ALLOWED}, 400)
        
        # Get media record class 
        media_class = MEDIA_CLASS_MAP.get(item_type)

        project = Project.objects.get(id=project_id)
        project_folder = project.folder

        # Create media record and add file to it
        try:
            media_record = media_class.add_record(file, project_folder, item)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        # Get proper serializer class for media record
        serializer_class = MEDIA_RECORD_SERIALIZER_MAP.get(item_type)
        serializer = serializer_class(media_record)

        return self.response(serializer.data, 201)


class MediaRecordAPIView(ProjectRelationMixin, ResponseMixin, APIView):
    """API View for specific media record."""

    def put(self, request, project_id, record_id):
        """Update media record."""

        record_type = request.query_params.get('type')
        if not record_type:
            return self.response({ERROR: MSG_E_NO_TYPE_PROVIDED}, 400)
        
        record_class = MEDIA_CLASS_MAP.get(record_type)
        if not record_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS}, 400)
        
        try:
            media_record = self.get_validated_object(project_id, record_class, record_id)        
        except ValidationError as ex:
            return self.response(ex.args[0], 400)

        serializer_class = MEDIA_RECORD_SERIALIZER_MAP.get(record_type)

        serializer = serializer_class(media_record, data=request.data)

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
        """Delete record.
        
        Only media records can be deleted through this view."""

        record_type = request.query_params.get('type')
        if not record_type:
            return self.response({ERROR: MSG_E_NO_TYPE_PROVIDED}, 400)
        
        record_class = MEDIA_CLASS_MAP.get(record_type)
        if not record_class:
            return self.response({ERROR: MSG_E_UNKNOWN_CLASS}, 400)
        
        try:
            record = self.get_validated_object(project_id, record_class, record_id)
        except ValidationError as ex:
            return self.response(ex.args[0], 400)
        
        try:
            record.delete()
        except Exception as ex:
            return self.response(ex.args[0], 400)

        return self.response({SUCCESS: MSG_RECORD_DELETED}, 200)

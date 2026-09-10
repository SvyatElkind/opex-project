"""Module contains api views for project app."""

import logging
import threading

from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser
from django.http import JsonResponse

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, MSG_E_VALUE_PROVIDED, SUCCESS
from helpers.local_imports import import_report_file
from helpers.mixins import ResponseMixin
from project.helpers.constants import (
    MSG_E_NO_PROJECT,
    MSG_E_NO_SPECIFIC_PROJECT,
    MSG_INVENTORIES_EXPORTED,
    MSG_PROJECT_DELETED,
    MSG_REPORT_IMPORTED,
    PROJECT
)
from project.helpers.helpers import get_allowed_values
from project.helpers.helpers_export import export_inventories_to_docx, export_inventories_to_xlsx, export_project_to_opex
from project.serializers import (
    SpecificProjectSerializer,
    ProjectSerializer,
    VVAISReportFileSerializer
)
from version import APP_VERSION
from .models import Project


logger = logging.getLogger(__name__)


class SpecificProjectAPIView(ResponseMixin, APIView):
    """API view to get all data of specific project."""

    def get(self, request, project_id):
        """Get all data related to specific project."""
        
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
        
        try:
            data = project.get_project_data()
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
        
        serializer = SpecificProjectSerializer(data)

        return self.response(serializer.data, 200)

    def put(self, request, project_id):
        """Update existing project."""

        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
        
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        
        if serializer.is_valid():

            try:
                serializer.save()
            except ValidationError as ex:
                logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
                return self.response(ex.args[0], 400)
            except Exception as ex:
                logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
    
            return self.response(serializer.data, 200)
        
        logger.warning(f'{self.__class__.__name__}: {serializer.errors}')
        return self.response(serializer.errors, 400)

    def delete(self, request, project_id):
        """Delete specific project and all related data."""
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
        
        try:
            project.delete_project()
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

        return self.response({SUCCESS: MSG_PROJECT_DELETED}, 200)


class ProjectAPIView(ResponseMixin, APIView):
    """API view for creating new project and get the list of existing projects."""
    serializer_class = ProjectSerializer

    def get(self, request):
        """Get all projects."""
        projects = Project.objects.all()
        
        if not projects:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_PROJECT}')
            return self.response({PROJECT: None}, 204)
        
        serializer = self.serializer_class(projects, many=True)

        return self.response(serializer.data, 200)

# class AppVersion()

    def post(self, request):
        """Create new project."""
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            
            try:
                serializer.save()
            except ValidationError as ex:
                logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
                return self.response(ex.args[0], 400)
            except Exception as ex:
                logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

            return self.response(serializer.data, 201)
        
        logger.warning(f'{self.__class__.__name__}: {serializer.errors}')
        return self.response(serializer.errors, 400)


class AddReportToProjectAPIView(ResponseMixin, APIView):
    """API view for adding data from VVAIS Report."""
    serializer_class = VVAISReportFileSerializer
    parser_classes = [FileUploadParser]

    @csrf_exempt
    def post(self, request, project_id):
        """Add report from VVAIS."""
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
      
        serializer = self.serializer_class(data={'file': request.data['file']})

        if serializer.is_valid():
            try:
                import_report_file(request.data['file'], project)
            except ValidationError as ex:
                logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
                return self.response(ex.args[0], 400)
            except Exception as ex:
                logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
               
            return self.response({SUCCESS: MSG_REPORT_IMPORTED}, 200)

        logger.warning(f'{self.__class__.__name__}: {serializer.errors}')
        return self.response(serializer.errors, 400)
    

class ExportInventoryListAPIView(ResponseMixin, APIView):
    """API view for exporting inventory list of project."""

    def get(self, request, project_id):
        """Export inventory list of specific project.
        
        Export criteria:
        For all records: if Item is created in specific inventory list.
        For electronic records: if document with attached file is created for specific Item.
        """
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
        
        try:
            result = export_inventories_to_xlsx(project.id)
        except ValidationError as ex:
            logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
            return self.response(ex.args[0], 400)
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
        
        return self.response({SUCCESS: result}, 200)


class ExportAcceptanceReportAPIView(ResponseMixin, APIView):
    """API view for exporting acceptance report of project."""

    def get(self, request, project_id):
        """Export acceptance report of specific project.
        
        For analoge/paper and electronic records will be generated
        separate reports.
        """

        # Check if project exists
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
        
        # Check if report about electronic or analoge/paper records
        # Get item instance to assign media record to it.
        electronic = request.query_params.get('electronic')

        if electronic == 'true':
            electronic = True
        elif electronic == 'false':
            electronic = False

        if not isinstance(electronic, bool):
            logger.warning(f'{self.__class__.__name__}: {MSG_E_VALUE_PROVIDED}')
            return self.response({ERROR: MSG_E_VALUE_PROVIDED}, 400)

        try:
            result = export_inventories_to_docx(project.id, electronic)
        except ValidationError as ex:
            logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
            return self.response(ex.args[0], 400)
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
        
        return self.response({SUCCESS: result}, 200)


class ExportOpexAPIView(ResponseMixin, APIView):
    """API view for exporting OPEX package of project."""

    def get(self, request, project_id):
        """Export OPEX package of specific project."""
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.warning(f'{self.__class__.__name__}: {MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}')
            return self.response({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, 204)
        
        # Check if opex should be created for long term records.
        long_term = request.query_params.get('long')

        if long_term == 'true':
            long_term = True
        elif long_term == 'false':
            long_term = False

        try:
            thread = threading.Thread(target=export_project_to_opex, args=(project.id, long_term))
            thread.start()
        except ValidationError as ex:
            logger.warning(f'{self.__class__.__name__}: {ex.args[0]}')
            return self.response(ex.args[0], 400)
        except Exception as ex:
            logger.error(f'{self.__class__.__name__}: {ex}', exc_info=True)
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
        
        return self.response({SUCCESS: 'Started'}, 200)
    # TODO return corupted file ID
        

class ConstantValuesAPIView(APIView):
    """Provides allowed variables for different input fields"""

    def get(self, request):
        """Get allowed variables"""
        values = get_allowed_values()
        return JsonResponse(values, status=200)


class AppVersionAPIView(APIView):
    """Provides information about App version"""

    def get(self, request):
        """Get App Version"""
        return JsonResponse(APP_VERSION, status=200)

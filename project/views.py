"""Module contains api views for project app."""


from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from helpers.local_imports import import_report_file
from helpers.mixins import ResponseMixin
from project.helpers.constants import (
    MSG_PROJECT_DELETED,
    MSG_REPORT_IMPORTED,
    PROJECT
)
from project.serializers import (
    SpecificProjectSerializer,
    ProjectSerializer,
    VVAISReportFileSerializer
)

from .models import Project


class SpecificProjectAPIView(ResponseMixin, APIView):
    """API view to get all data of specific project."""

    def get(self, request, project_id):
        """Get all data related to specific project."""
        
        project = get_object_or_404(Project, id=project_id)
        
        try:
            data = project.get_project_data()
        except Exception as ex:
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
        
        serializer = SpecificProjectSerializer(data)

        return self.response(serializer.data, 200)

    def put(self, request, project_id):
        """Update existing project."""
        project = get_object_or_404(Project, id=project_id)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        
        if serializer.is_valid():

            try:
                serializer.save()
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
    
            return self.response(serializer.data, 200)
        
        return self.response(serializer.errors, 400)

    def delete(self, request, project_id):
        """Delete specific project and all related data."""
        project = get_object_or_404(Project, id=project_id)
        
        try:
            project.delete_project()
        except Exception as ex:
            return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

        return self.response({SUCCESS: MSG_PROJECT_DELETED}, 200)

class ProjectAPIView(ResponseMixin, APIView):
    """API view for creating new project and get the list of existing projects."""
    serializer_class = ProjectSerializer

    def get(self, request):
        """Get all projects."""
        projects = Project.objects.all()
        
        if not projects:
            return self.response({PROJECT: None}, 204)
        
        serializer = self.serializer_class(projects, many=True)

        return self.response(serializer.data, 200)

    def post(self, request):
        """Create new project."""
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            
            try:
                serializer.save()
            except ValidationError as ex:
                 return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)

            return self.response(serializer.data, 201)
        
        return self.response(serializer.errors, 400)


class AddReportToProjectAPIView(ResponseMixin, APIView):
    """API view for adding data from VVAIS Report."""
    serializer_class = VVAISReportFileSerializer
    parser_classes = [FileUploadParser]

    @csrf_exempt
    def post(self, request, project_id):
        """Add report from VVAIS."""
        project = get_object_or_404(Project, id=project_id)
      
        serializer = self.serializer_class(data={'file': request.data['file']})

        if serializer.is_valid():
            try:
                import_report_file(request.data['file'], project)
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
            except Exception as ex:
                return self.response({ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, 400)
               
            return self.response({SUCCESS: MSG_REPORT_IMPORTED}, 200)

        return self.response(serializer.errors, 400)
    
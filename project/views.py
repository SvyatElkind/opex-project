"""Module contains api views for project app."""


from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from helpers.local_imports import import_report_file
from helpers.mixins import ResponseMixin
from project.helpers.constants import (
    MSG_E_REPORT_ALREADY_EXIST,
    MSG_E_STRUCTURE_ALREADY_IMPORTED,
    MSG_E_STRUCTURE_DOES_NOT_EXIST,
    MSG_PROJECT_DELETED,
    MSG_REPORT_IMPORTED,
    PROJECT,
    MSG_E_NO_REPORT,
    MSG_E_NO_STRUCTURE
)
from project.serializers import (
    DataFromStructureSerializer,
    SpecificProjectSerializer,
    ProjectSerializer,
    VVAISReportFileSerializer
)

from .models import Project


class SpecificProjectAPIView(ResponseMixin, APIView):
    """API view to get all data of specific project"""

    def get(self, request, project_id):
        """Get all data related to specific project."""
        
        project = get_object_or_404(Project, id=project_id)

        # Check project status
        if not project.report_status:
            return self.response({ERROR: MSG_E_NO_REPORT}, 400)
        
        if project.structure_exists and not project.structure_status:
            return self.response({ERROR: MSG_E_NO_STRUCTURE}, 400)
        
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
        
        # Return validation errors
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
    """API view for post, put and delete methods."""
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

    def post(self, request, project_id):
        """Add report from VVAIS to the project."""
        project = get_object_or_404(Project, id=project_id)

        # Check if report is already uploaded.
        if project.report_status:
             return self.response({ERROR: MSG_E_REPORT_ALREADY_EXIST}, 400)
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            try:
                import_report_file(request.FILES['file'].file, project)
            except ValidationError as ex:
                return self.response(ex.args[0], 400)
               
            return self.response({SUCCESS: MSG_REPORT_IMPORTED}, 200)

        return self.response(serializer.errors, 400)

class AddDataFromStructure(ResponseMixin, APIView):
    """API view for adding data from folder structure."""
    serializer_class = DataFromStructureSerializer

    def post(self, request, project_id):
        """Add report from VVAIS to the project."""
        project = get_object_or_404(Project, id=project_id)

        if not project.structure_exists:
            return self.response({ERROR: MSG_E_STRUCTURE_DOES_NOT_EXIST}, 400)
        elif project.structure_status:
            return self.response({ERROR: MSG_E_STRUCTURE_ALREADY_IMPORTED}, 400)
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            #TODO add function that will process report file
            folder = serializer.validated_data.get('folder')
            print(folder)
            return self.response({'success': ''}, 200)
            
        return self.response(serializer.errors, 400)
    

class StructureExistsAPIView(ResponseMixin, APIView):
    """API view indicates that user will not import data from structure."""
    def put(self, request, project_id):
        project = Project.objects.get(id=project_id)
        # project = get_object_or_404(Project, project_id)
        project.change_structure_exists()

        return self.response({'success': 'No structure'}, 200)


class ReportAPIView(APIView):
    """API view for report indicator."""
    def put(self, request, project_id):
        project = Project.objects.get(id=project_id)
        project.change_report_status()
        
        return Response(data={'success': 'Report added'}, status=status.HTTP_200_OK)


class StructureAPIView(APIView):
    """API view for report indicator."""
    def put(self, request, project_id):
        project = Project.objects.get(id=project_id)
        project.change_structure_status()

        return Response(data={'success': 'Structure added'}, status=status.HTTP_200_OK)
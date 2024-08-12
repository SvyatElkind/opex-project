"""Module contains api views for project app."""


from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from helpers.constants import ERROR, MSG_E_UNPREDICTIBLE_ERROR_OCCURED, SUCCESS
from project.helpers.constants import (
    MSG_E_REPORT_ALREADY_EXIST,
    MSG_E_STRUCTURE_ALREADY_IMPORTED,
    MSG_E_STRUCTURE_DOES_NOT_EXIST,
    MSG_PROJECT_DELETED,
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


class SpecificProjectAPIView(APIView):
    """API view to get all data of specific project"""

    def get(self, request, project_id):
        """Get all data related to specific project."""
        
        project = get_object_or_404(Project, id=project_id)

        # Check project status
        if not project.report_status:
            return Response(data={ERROR: MSG_E_NO_REPORT}, status=status.HTTP_400_BAD_REQUEST)
        
        if project.structure_exists and not project.structure_status:
            return Response(data={ERROR: MSG_E_NO_STRUCTURE}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = project.get_project_data()
        except Exception as ex:
            return Response(data={ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SpecificProjectSerializer(data)
        return Response(data = serializer.data, status=status.HTTP_200_OK)

    def put(self, request, project_id):
        """Update existing project."""
        project = get_object_or_404(Project, id=project_id)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        
        if serializer.is_valid():

            try:
                serializer.save()
            except ValidationError as ex:
                return Response(data=ex.args[0], status=status.HTTP_400_BAD_REQUEST)
            except Exception as ex:
                return Response(data={ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, status=status.HTTP_400_BAD_REQUEST)
    
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        
        # Return validation errors
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id):
        """Delete specific project and all related data."""
        project = get_object_or_404(Project, id=project_id)
        
        try:
            project.delete_project()
        except Exception as ex:
            return Response(data={ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={SUCCESS: MSG_PROJECT_DELETED}, status=status.HTTP_200_OK)

class ProjectAPIView(APIView):
    """API view for post, put and delete methods."""
    serializer_class = ProjectSerializer

    def get(self, request):
        """Get all projects."""
        projects = Project.objects.all()
        
        if not projects:
            return Response(data = {PROJECT: None}, status=status.HTTP_204_NO_CONTENT)
        
        serializer = self.serializer_class(projects, many=True)
        return Response(data = serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create new project."""
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            
            try:
                serializer.save()
            except ValidationError as ex:
                 return Response(data=ex.args[0], status=status.HTTP_400_BAD_REQUEST)
            except Exception as ex:
                return Response(data={ERROR: MSG_E_UNPREDICTIBLE_ERROR_OCCURED}, status=status.HTTP_400_BAD_REQUEST)

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddDataToProjectAPIView(APIView):
    """API view for adding data from VVAIS Report."""
    serializer_class = VVAISReportFileSerializer

    def post(self, request, project_id):
        """Add report from VVAIS to the project."""
        project = get_object_or_404(Project, id=project_id)

        if project.report_status:
             return Response(data={ERROR: MSG_E_REPORT_ALREADY_EXIST}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            #TODO add function that will process report file
            return Response(data='Is a file', status=status.HTTP_200_OK)

        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddDataFromStructure(APIView):
    """API view for adding data from folder structure."""
    serializer_class = DataFromStructureSerializer

    def post(self, request, project_id):
        """Add report from VVAIS to the project."""
        project = get_object_or_404(Project, id=project_id)

        if not project.structure_exists:
            return Response(data={ERROR: MSG_E_STRUCTURE_DOES_NOT_EXIST}, status=status.HTTP_400_BAD_REQUEST)
        elif project.structure_status:
            return Response(data={ERROR: MSG_E_STRUCTURE_ALREADY_IMPORTED}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            #TODO add function that will process report file
            folder = serializer.validated_data.get('folder')
            print(folder)
            return Response(data={'success': ''}, status=status.HTTP_200_OK)
            
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from project.helpers.constants import MSG_E_NO_PROJECT
from project.serializers import (
    SpecificProjectSerializer,
    ProjectSerializer
)

from .models import Project


class SpecificProjectAPIView(APIView):
    """API view to get all data of specific project"""

    def get(self, request, project_id):
        """Get all data related to specific project."""
        project = get_object_or_404(Project, id=project_id)
        try:
            data = project.get_project_data()
        except Exception as ex:
            return Response(data=ex.args[0], status=status.HTTP_400_BAD_REQUEST)
        # serialize project data
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
            else:
                return Response(data=serializer.data, status=status.HTTP_200_OK)
        
        # Return validation errors
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id):
        """Delete specific project and all related data."""
        project = get_object_or_404(Project, id=project_id)
        project.delete_project()
        return Response(data={"success": "Projekts ir dzēsts"}, status=status.HTTP_200_OK)

class ProjectAPIView(APIView):
    """API view for post, put and delete methods."""
    serializer_class = ProjectSerializer

    def get(self, request):
        """Get all projects."""
        projects = Project.objects.all()
        if not projects:
            return Response(data = {"project": None}, status=status.HTTP_204_NO_CONTENT)
        serializer = self.serializer_class(projects, many=True)
        return Response(data = serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """View for create new project."""
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as ex:
                 return Response(data=ex.args[0], status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
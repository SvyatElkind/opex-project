from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from project.serializers import ProjectSerializer

from .models import Project

class ProjectAPIView(APIView):
    """API View for requests related to all projects"""
    serializer_class = ProjectSerializer

    def get(self, request):
        """Get all projects"""
        projects = Project.get_all_projects()
        if not projects:
            return Response(data = {"error": "There is no projects"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.serializer_class(projects, many=True)
        return Response(data = serializer.data, status=status.HTTP_200_OK)

class SpecificProjectAPIView(APIView):
    """API View for requests related to specific project"""
    serializer_class= ProjectSerializer

    def get(self, request, project_id):
        data = Project.get_project_related_data(project_id)
        if not data:
            return Response(data = {"error": "There is no projects"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data = data, status=status.HTTP_200_OK)

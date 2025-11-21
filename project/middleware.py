"""Module for project level middleware."""
import logging

from django.http import JsonResponse

from helpers.constants import ERROR
from project.helpers.constants import MSG_E_NO_SPECIFIC_PROJECT, MSG_E_NO_REPORT, MSG_E_REPORT_ALREADY_EXIST
from project.models import Project


logger = logging.getLogger(__name__)


class CheckProjectStatusMiddleware():
    """Middleware checks if report from VVAIS is uploaded after project is created."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response
        
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Allow access url without any status checks.
        if request.path == '/api/v1/project/' or \
           request.path == '/api/v1/values/':
            return None
        
        project_id = view_kwargs.get('project_id')
        
        project = Project.objects.filter(id=project_id).first()
        if not project:
            logger.error(f"Project with ID {project_id} not found.")
            return JsonResponse({ERROR: MSG_E_NO_SPECIFIC_PROJECT.format(project_id)}, status=400)
        # Check project report status.
        if not project.report_status:
            # Allow access url if report is not uploaded.
            if request.path in [f'/api/v1/project/{project_id}/add_report/']:
                return None
            # Allow delete project if report is not uploaded.
            if request.method == 'DELETE' and request.path == f'/api/v1/project/{project_id}/':
                return None
            else:
                logger.error(f"Report for project {project_id} is not uploaded.")
                return JsonResponse({ERROR: MSG_E_NO_REPORT}, status=400)
        else:
            # Don't allow access url when report is uploaded.
            if request.path in [f'/api/v1/project/{project_id}/add_report/']:
                logger.error(f"Report for project {project_id} already exists.")
                return JsonResponse({ERROR: MSG_E_REPORT_ALREADY_EXIST}, status=400)
        
        return None
"""Module for project level middlevare."""

from logging import ERROR
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from project.helpers.constants import MSG_E_NO_REPORT, MSG_E_REPORT_ALREADY_EXIST
from project.models import Project


class CheckProjectStatusMiddleware():
    """Middleware checks if report from VVAIS is uploaded after project is created."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response
        

    def process_view(self, request, view_func, view_args, view_kwargs):

        project_id = view_kwargs.get('project_id')
        
        project = get_object_or_404(Project, id=project_id)
        # Check project report status.
        if not project.report_status:
            # Allow access url if report is not uploaded.
            if request.path in [f'/api/v1/project/{project_id}/add_report/',
                                f'/api/v1/project/{project_id}/report/']: # delete last url for production
                return None
            # Allow delete project if  report is not uploaded.
            if request.method == 'DELETE' and request.path == f'/api/v1/project/{project_id}/':
                return None
            else:
                return JsonResponse({ERROR: MSG_E_NO_REPORT}, status=400)
        else:
            # Don't allow access url when report is uploaded.
            if request.path in [f'/api/v1/project/{project_id}/add_report/',
                                f'/api/v1/project/{project_id}/report/']: # delete last url for production
                return JsonResponse({ERROR: MSG_E_REPORT_ALREADY_EXIST}, status=400)
        
        return None
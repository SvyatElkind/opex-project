from django.urls import path

from .views import (
    AddDataFromStructure,
    ReportAPIView,
    SpecificProjectAPIView,
    ProjectAPIView,
    AddReportToProjectAPIView,
    StructureAPIView,
    StructureExistsAPIView,
)


app_name = 'projects'

urlpatterns =  [
    path('project/', ProjectAPIView.as_view()),
    path('project/<int:project_id>/', SpecificProjectAPIView.as_view()),
    path('project/<int:project_id>/add_report/', AddReportToProjectAPIView.as_view()),
    path('project/<int:project_id>/add_data/', AddDataFromStructure.as_view()),
]
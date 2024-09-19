from django.urls import path

from .views import (
    ReportAPIView,
    SpecificProjectAPIView,
    ProjectAPIView,
    AddReportToProjectAPIView,
)


app_name = 'projects'

urlpatterns =  [
    path('project/', ProjectAPIView.as_view()),
    path('project/<int:project_id>/', SpecificProjectAPIView.as_view()),
    path('project/<int:project_id>/add_report/', AddReportToProjectAPIView.as_view(), name='add_report')
]
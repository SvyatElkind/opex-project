from django.urls import path

from .views import (
    AppVersionAPIView,
    ConstantValuesAPIView,
    ExportAcceptanceReportAPIView,
    ExportInventoryListAPIView,
    ExportOpexAPIView,
    SpecificProjectAPIView,
    ProjectAPIView,
    AddReportToProjectAPIView,
)


app_name = 'projects'

urlpatterns =  [
    path('project/', ProjectAPIView.as_view()),
    path('project/<int:project_id>/', SpecificProjectAPIView.as_view()),
    path('project/<int:project_id>/add_report/', AddReportToProjectAPIView.as_view(), name='add_report'),
    path('values/', ConstantValuesAPIView.as_view()),
    path('version/', AppVersionAPIView.as_view()),
    path('project/<int:project_id>/export/inventories/', ExportInventoryListAPIView.as_view()),
    path('project/<int:project_id>/export/acceptance_report/', ExportAcceptanceReportAPIView.as_view()),
    path('project/<int:project_id>/export/opex_package/', ExportOpexAPIView.as_view()),
]
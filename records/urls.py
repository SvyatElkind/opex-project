from django.urls import path

from .views import (
    AddMetadataAPIView,
    AddRecordAPIView,
    MetadataAPIView,
    RecordAPIView
)

app_name = 'records'

urlpatterns =  [
    path('project/<int:project_id>/record/', AddRecordAPIView.as_view()),
    path('project/<int:project_id>/record/<int:record_id>/', RecordAPIView.as_view()),
    path('project/<int:project_id>/record/<int:record_id>/additional_metadata/', AddMetadataAPIView.as_view()),
    path('project/<int:project_id>/record/<int:record_id>/additional_metadata/methods/', MetadataAPIView.as_view()),
]
from django.urls import path

from .views import (
    AddMetadataAPIView,
    AddRecordAPIView,
    FileDeleteAPIView,
    MediaFileUploadAPIView,
    MediaRecordAPIView,
    MetadataAPIView,
    MultipleFileUploadAPIView,
    RecordAPIView,

)

app_name = 'records'

urlpatterns =  [
    path('project/<int:project_id>/record/', AddRecordAPIView.as_view()),
    path('project/<int:project_id>/record/<int:record_id>/', RecordAPIView.as_view()),
    path('project/<int:project_id>/record/<int:record_id>/additional_metadata/', AddMetadataAPIView.as_view()),
    path('project/<int:project_id>/record/<int:record_id>/additional_metadata/methods/', MetadataAPIView.as_view()),
   
    path('project/<int:project_id>/record/<int:record_id>/multiple_files/', MultipleFileUploadAPIView.as_view()), 
    path('project/<int:project_id>/file/<int:file_id>/', FileDeleteAPIView.as_view()),

    path('project/<int:project_id>/media_record/', AddMediaRecordAPIView.as_view()),
    path('project/<int:project_id>/media_record/<int:record_id>/', MediaRecordAPIView.as_view()),
]
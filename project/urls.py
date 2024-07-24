from django.urls import path

from .views import (
    SpecificProjectAPIView,
    ProjectAPIView,
    AddDataToProjectAPIView,
)


app_name = 'projects'

urlpatterns =  [
    path('project/', ProjectAPIView.as_view()),
    path('project/<int:project_id>/', SpecificProjectAPIView.as_view()),
    path('project/<int:project_id>/add_report/', AddDataToProjectAPIView.as_view()),
]
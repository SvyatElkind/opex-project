from django.urls import path

from .views import ProjectAPIView, SpecificProjectAPIView


app_name = 'projects'

urlpatterns =  [
    path('projects/', ProjectAPIView.as_view()),
    path('projects/<int:project_id>/', SpecificProjectAPIView.as_view())
]
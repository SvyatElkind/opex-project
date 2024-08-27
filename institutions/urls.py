from django.urls import path

from .views import InstitutionAPIView


app_name = 'institutions'

urlpatterns =  [
    path('project/<int:project_id>/institution/<int:institution_id>/', InstitutionAPIView.as_view()),
]
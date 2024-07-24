from django.urls import path

from .views import InstitutionAPIView


app_name = 'institutions'

urlpatterns =  [
    path('institution/<int:institution_id>/', InstitutionAPIView.as_view()),
]
from django.urls import path

from .views import (
    AddItemAPIView,
    ItemAPIView
)

app_name = 'items'

urlpatterns =  [
    path('project/<int:project_id>/item/', AddItemAPIView.as_view()),
    path('project/<int:project_id>/item/<int:item_id>/', ItemAPIView.as_view())
]
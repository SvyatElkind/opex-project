from django.urls import path

from .views import (
    InventoryAPIView,
    AddInventoryAPIView
)

app_name = 'inventories'

urlpatterns =  [
    path('project/<int:project_id>/inventory/', AddInventoryAPIView.as_view()),
    path('project/<int:project_id>/inventory/<int:inventory_id>/', InventoryAPIView.as_view())
]
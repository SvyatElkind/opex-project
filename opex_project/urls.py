from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('project.urls')),
    path('api/v1/', include('institutions.urls')),
    path('api/v1/', include('inventories.urls')),
    path('api/v1/', include('items.urls')),
]

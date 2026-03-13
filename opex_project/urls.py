from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

# API routes
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('project.urls')),
    path('api/v1/', include('institutions.urls')),
    path('api/v1/', include('inventories.urls')),
    path('api/v1/', include('items.urls')),
    path('api/v1/', include('records.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# Serve React app for all non-API routes (MUST be last)
urlpatterns += [
    re_path(r'^(?!api/|admin/).*$', TemplateView.as_view(template_name='index.html')),
]

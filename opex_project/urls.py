from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static

# API routes
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('project.urls')),
    path('api/v1/', include('institutions.urls')),
    path('api/v1/', include('inventories.urls')),
    path('api/v1/', include('items.urls')),
    path('api/v1/', include('records.urls'))
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# Serve test files from build/files/ (for DevAdmin QuickCreate)
urlpatterns += [
    path(r'^files/(?P<path>.*)$', serve, {
        'document_root': settings.REACT_BUILD_DIR / 'files'
    }),
]

# Serve React help page
urlpatterns += [
    path(r'^help\.html$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'help.html'
    }),
]

# Serve React app for all non-API routes (MUST be last)
urlpatterns += [
    path(r'^(?!api/|admin/|files/|help\.html).*$', TemplateView.as_view(template_name='index.html')),
]

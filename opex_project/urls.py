from django.contrib import admin
from django.urls import path, include, re_path
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
    path('api/v1/', include('records.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# Serve test files from build/files/ (for DevAdmin QuickCreate)
urlpatterns += [
    re_path(r'^files/(?P<path>.*)$', serve, {
        'document_root': settings.REACT_BUILD_DIR / 'files'
    }),
]

# Serve the import example files from build/examples/ (downloaded from the
# Settings > Eksperimentāli tab and from the CSV/Excel import popup).
# Without this they fall through to the catch-all below and the browser saves
# index.html under an .xlsx/.csv name — they only worked under `npm start`.
urlpatterns += [
    re_path(r'^examples/(?P<path>.*)$', serve, {
        'document_root': settings.REACT_BUILD_DIR / 'examples'
    }),
]

# Serve React help page
urlpatterns += [
    re_path(r'^help\.html$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'help.html'
    }),
]

# Serve React app for all non-API routes (MUST be last)
urlpatterns += [
    re_path(r'^(?!api/|admin/|files/|examples/|help\.html).*$', TemplateView.as_view(template_name='index.html')),
]

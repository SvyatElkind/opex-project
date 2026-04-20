from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/opex_progress/', consumers.OPEXProgressConsumer.as_asgi()),
]

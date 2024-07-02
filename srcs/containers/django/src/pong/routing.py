# pong/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/monitor/', consumers.GameConsumer.as_asgi()),
    # Add more WebSocket URL patterns as needed
]

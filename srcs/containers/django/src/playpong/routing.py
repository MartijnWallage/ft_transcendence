
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chatsocket/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/pingpongsocket/$', consumers.PingpongConsumer.as_asgi()),
    # Add more WebSocket URL patterns as needed
]


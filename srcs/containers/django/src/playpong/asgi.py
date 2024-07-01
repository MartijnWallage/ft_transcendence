"""
ASGI config for pong project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack
import pong.routing  # Correct import statement

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playpong.settings')
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(

            pong.routing.websocket_urlpatterns
        
    ),
})




# import os

# from django.core.asgi import get_asgi_application
# import socketio

# from game_module.socketio_server import sio

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# django_asgi_app = get_asgi_application()
# application = socketio.ASGIApp(sio, django_asgi_app)

# django_asgi_app = get_asgi_application()

# # Initialize your Socket.IO server
# sio = socketio.Server(async_mode='asgi')

# # Define your Django ASGI application
# django_application = get_asgi_application()

# # Define the ASGI application combining Django and Socket.IO
# application = socketio.ASGIApp(sio, django_application)

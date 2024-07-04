"""
ASGI config for pong project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from playpong.routing import websocket_urlpatterns  # Import the websocket_urlpatterns


# Django loads database configuration, static files settings, etc.)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mywebsite.settings')

# ProtocolTypeRouter is class provided by Django Channels
# that allows you to specify how different types of protocols (HTTP, WebSocket, etc.) should be handled.
application = ProtocolTypeRouter({
    
    # Get the ASGI application for handling traditional HTTP requests in Django
    "http": get_asgi_application(),
    
    # AllowedHostsOriginValidator: Ensures WebSocket connections 
    # are only allowed from specified hosts for security reasons
    "websocket": AllowedHostsOriginValidator(
        
        # AuthMiddlewareStack: Adds authentication middleware 
        # to handle authentication for WebSocket connections
        AuthMiddlewareStack(
            
            # websocket_urlpatterns should be imported from your application's routing.py
            URLRouter(websocket_urlpatterns) 
        )
    ),
})

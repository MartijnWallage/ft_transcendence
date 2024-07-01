from django.urls import path
from . import views

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from playpong import routing

# urlpatterns = [
#     path('hello/', views.play_pong),
# ]

urlpatterns = [
    path('', views.home, name='home'),
    path('pong/', views.play_pong, name='play_pong'),
    path('home/', views.home, name='home'),
    path('sign-up/', views.sign_up, name='sign_up'),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(routing.websocket_urlpatterns),
})

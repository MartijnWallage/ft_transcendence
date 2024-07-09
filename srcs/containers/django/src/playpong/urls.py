from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'players', views.PlayerViewSet, basename='players')

urlpatterns = [
    path('', views.home, name='home'),
    path('pong/', views.play_pong, name='play_pong'),
    path('home/', views.home, name='home'),
    path('sign-up/', views.sign_up, name='sign_up'),
    path('api/', include(router.urls)),  
]


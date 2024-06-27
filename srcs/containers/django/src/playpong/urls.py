from django.urls import path
from . import views

#from .views import GameStartAPIView, PlayerMoveAPIView, GameStateAPIView


# urlpatterns = [
#     path('hello/', views.play_pong),
# ]

urlpatterns = [
    path('', views.home, name='home'),
    path('pong/', views.play_pong, name='play_pong'),
    path('home/', views.home, name='home'),
    path('sign-up/', views.sign_up, name='sign_up'),
    path('api/game/start-remote/', views.start_remote_game, name='start_remote_game'),
    #path('api/game/<int:game_id>/move/', PlayerMoveAPIView.as_view(), name='player-move'),
    #path('api/game/<int:game_id>/state/', GameStateAPIView.as_view(), name='game-state'),
]

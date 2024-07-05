from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
	path('api/home/', views.home_view, name='api_home'),
	path('api/pong/', views.pong_view, name='api_pong'),
	path('api/login/', views.login_view, name='api_login'),
	path('api/sign_up/', views.sign_up_view, name='api_sign_up'),
	path('api/end_game/', views.end_game_view, name='api_end_game'),
	path('api/game_mode/', views.game_mode_view, name='api_game_mode'),
	path('api/tournament/', views.tournament_view, name='api_tournament'),
	path('api/play_against/', views.play_against_view, name='api_play_against'),
]

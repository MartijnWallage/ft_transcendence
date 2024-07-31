from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('view/index/', views.index, name='index1'),
	path('api/home/', views.home_view, name='api_home'),
	path('api/logout/', views.logout_view, name='logout'),
	path('api/game_mode/', views.game_mode_view, name='api_game_mode'),

	path('api/tournament/', views.tournament_view, name='api_tournament'),

	path('api/two_player/', views.two_player_view, name='api_two_player'),
	path('api/two_player_local/', views.two_player_local_view, name='api_two_player_local'),
	path('api/two_player_online/', views.two_player_online_view, name='api_two_player_online'),

	path('api/pong/', views.pong, name='api_pong'),
    
	# pages for login and registration
	path('api/register_user/', views.load_page_reg, name='load_page'),
	path('api/login_user/', views.load_page, name='load_page_login'),
    path('api/register/', views.register, name='api-register'),
    path('api/login/', views.login, name='api-login'),
	# path('api/pong_solo/', views.pong_solo_view, name='api_pong_solo'),
	# path('api/pong_tournament/', views.pong_tournament_view, name='api_pong_tournament'),
	# path('api/pong_two_player_local/', views.pong_two_player_local_view, name='api_pong_two_player_local'),
	# path('api/pong_two_player_online/', views.pong_two_player_online_view, name='api_pong_two_player_online'),

]

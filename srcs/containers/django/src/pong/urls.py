from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('api/home/', views.home_view, name='api_home'),
	path('api/dashboard/', views.dashboard_view, name='api_dashboard'),
	path('api/dashboard_score/', views.score_view, name='api_score'),

	path('api/game_mode/', views.game_mode_view, name='api_game_mode'),
	path('api/settings/', views.settings_view, name='api_settings'),

	path('api/tournament/', views.tournament_view, name='api_tournament'),

	path('api/two_player/', views.two_player_view, name='api_two_player'),
	path('api/two_player_local/', views.two_player_local_view, name='api_two_player_local'),
	path('api/two_player_online/', views.two_player_online_view, name='api_two_player_online'),

	path('api/pong/', views.pong, name='api_pong'),
	path('api/tournament_score/', views.tournament_score, name='api_tournament_score'),
	path('api/create_tournament/', views.create_tournament, name='create_tournament'),
	path('api/add_participant_to_tournament/', views.add_participant_to_tournament, name='add_participant_to_tournament'),
	path('api/create_match_in_tournament/', views.create_match_in_tournament, name='create_match_in_tournament'),
	path('api/contract_address/', views.get_contract_address, name='get_contract_address'),
	path('api/register_matches/', views.register_matches, name='register_matches'),
	path('api/match_history/', views.match_history, name='match_history'),
	path('api/create_match/', views.create_match, name='create_match'),
	path('api/create_player/', views.create_player, name='create_player'),
	path('api/user_matches/', views.user_matches, name='user_matches'),
 	path('api/get_logged_in_user/', views.get_logged_in_user, name='get_logged_in_user'),
    path('api/user_tournaments/', views.user_tournaments, name='user_tournaments'),

	path('api/register_user/', views.load_page_reg, name='load_page'),
	path('api/login_user/', views.load_page, name='load_page_login'),
    path('api/register/', views.register, name='api-register'),
    path('api/login/', views.login, name='api-login'),
    path('api/userinfo/', views.userinfo_view, name='userinfo'),
    path('api/update-profile/', views.update_profile, name='updateprofile'),
    path('api/update-password/', views.change_password, name='updatepassword'),
    path('api/update-profile-page/', views.load_page_update, name='userinfo_profile'),
    path('api/update-password-page/', views.load_password_update, name='userinfo_password'),
	path('api/logout/', views.logout_view, name='logout'),
    

	path('api/handle-friend-request/', views.accept_friend, name='friendrequest'),
    path('api/add-friend/', views.add_friend, name='add_friend'),
    path('api/list-friends/', views.list_friends, name='list_friends'),
	path('api/friend-requests/', views.friend_requests, name='friend_requests'),
	path('api/suggested-friends/', views.suggested_friends, name='suggested_friends'),
	path('api/all-users/', views.all_users, name='all_users'),
	# path('api/pong_solo/', views.pong_solo_view, name='api_pong_solo'),
	# path('api/pong_tournament/', views.pong_tournament_view, name='api_pong_tournament'),
	# path('api/pong_two_player_local/', views.pong_two_player_local_view, name='api_pong_two_player_local'),
	# path('api/pong_two_player_online/', views.pong_two_player_online_view, name='api_pong_two_player_online'),
]

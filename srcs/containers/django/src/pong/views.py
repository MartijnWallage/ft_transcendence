# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth import login, logout, authenticate
from django.http import JsonResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view

def index(request):
	return render(request, 'main/base.html')

@api_view(['GET'])
def home_view(request):
	data = {
		'content': render_to_string("main/home.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def login_view(request):
	data = {
		'content': render_to_string("main/login.html", request=request)
	}
	# if request.method == 'POST':
	# 	form = RegisterForm(request.POST)
	# 	if form.is_valid():
	# 		user = form.save()
	# 		login(request, user)
	# 		return JsonResponse({'success': True, 'redirect_url': '/pong'})
	# 	else:
	# 		errors = form.errors.as_json()
	# 		return JsonResponse({'success': False, 'errors': errors})
	# else:
	# 	form = RegisterForm()
	# # Return form data as JSON if requested via AJAX
	# return JsonResponse({'html': render_to_string('registration/sign_up.html', {'form': form}, request=request)})
	return JsonResponse(data)

@api_view(['GET'])	
def game_mode_view(request):
	data = {
		'content': render_to_string("main/game_mode.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def two_player_view(request):
	data = {
		'content': render_to_string("main/two_player.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def two_player_local_view(request):
	data = {
		'content': render_to_string("main/two_player_local.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def two_player_online_view(request):
	data = {
		'content': render_to_string("main/two_player_online.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def tournament_view(request):
	data = {
		'content': render_to_string("main/tournament.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def pong(request):
	data = {
		'content': render_to_string("main/pong.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def tournament_score(request):
	data = {
		'content': render_to_string("main/tournament_score.html", request=request)
	}
	return JsonResponse(data)

# @api_view(['GET'])
# def pong_solo_view(request):
# 	data = {
# 		'content': render_to_string("main/pong_solo.html", request=request)
# 	}
# 	return JsonResponse(data)

# @api_view(['GET'])
# def pong_tournament_view(request):
# 	data = {
# 		'content': render_to_string("main/pong_tournament.html", request=request)
# 	}
# 	return JsonResponse(data)

# @api_view(['GET'])
# def pong_two_player_local_view(request):
# 	data = {
# 		'content': render_to_string("main/pong_two_player_local.html", request=request)
# 	}
# 	return JsonResponse(data)

# @api_view(['GET'])
# def pong_two_player_online_view(request):
# 	data = {
# 		'content': render_to_string("main/pong_two_player_online.html", request=request)
# 	}
# 	return JsonResponse(data)

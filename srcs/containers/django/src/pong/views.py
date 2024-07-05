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
import logging #for debugging messages

logger = logging.getLogger(__name__)

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
			'content': render_to_string("registration/login.html", request=request)
		}
		return JsonResponse(data)

@api_view(['GET'])
def sign_up_view(request):
	if request.method == 'POST':
		form = RegisterForm(request.POST)
		if form.is_valid():
			user = form.save()
			login(request, user)
			return JsonResponse({'success': True, 'redirect_url': '/pong'})
		else:
			errors = form.errors.as_json()
			return JsonResponse({'success': False, 'errors': errors})
	else:
		form = RegisterForm()
	# Return form data as JSON if requested via AJAX
	return JsonResponse({'html': render_to_string('registration/sign_up.html', {'form': form}, request=request)})

@api_view(['GET'])	
def game_mode_view(request):
	data = {
		'content': render_to_string("main/game_mode.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def tournament_view(request):
	data = {
		'content': render_to_string("main/tournament.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def play_against_view(request):
	data = {
		'content': render_to_string("main/play_against.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def pong_view(request):
	# context = {
	# 	'is_logged_in': request.user.is_authenticated
	# }
	# return render(request, 'main/pong.html', context)
	data = {
		'content': render_to_string("main/pong.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def end_game_view(request):
	data = {
		'content': render_to_string("main/end_game.html", request=request)
	}
	return JsonResponse(data)



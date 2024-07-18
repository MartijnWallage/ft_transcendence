# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect, get_object_or_404
from .forms import RegisterForm
from django.contrib.auth import login, logout, authenticate
from django.http import JsonResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Player, Tournament
import json


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
	tournament = get_object_or_404(Tournament)
	html_content = render_to_string("main/tournament_score.html", {'tournament': tournament}, request=request)
	data = {
		'content': html_content
	}
	return JsonResponse(data)

import traceback

@csrf_exempt
@api_view(['POST'])
def add_participant(request):
    try:
        data = json.loads(request.body)
        player_name = data.get('player_name')
        tournament_id = data.get('tournament_id')

        if not player_name or not tournament_id:
            raise ValueError("Player name and tournament ID are required")

        # Retrieve or create the player
        player, created = Player.objects.get_or_create(name=player_name)
        
        # Retrieve the tournament
        tournament = Tournament.objects.get(id=tournament_id)
        
        # Add player to the tournament
        tournament.players.add(player)
        tournament.save()

        return JsonResponse({'status': 'success'})
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()  # This will print the traceback to the console
        return JsonResponse({'status': 'error', 'message': error_message}, status=500)


@api_view(['POST'])
def create_tournament(request):
	try:
		data = json.loads(request.body)
		name = data.get('name')
		date = data.get('date')

		# Create the tournament
		# tournament = Tournament.objects.create(date=date)
		tournament = Tournament.objects.create(name=name, date=date)


		return JsonResponse({'status': 'success', 'tournament_id': tournament.id})
	except Exception as e:
		error_message = str(e)
		traceback.print_exc()
		return JsonResponse({'status': 'error', 'message': error_message}, status=500)
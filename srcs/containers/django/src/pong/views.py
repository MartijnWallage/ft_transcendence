# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect
from .forms import LoginForm, RegisterForm
from django.contrib.auth import login as django_login
from django.http import JsonResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view
from .serializers import RegisterSerializer

def index(request):
	return render(request, 'main/base.html')

@api_view(['GET'])
def home_view(request):
	data = {
		'content': render_to_string("main/home.html", request=request)
	}
	return JsonResponse(data)

@api_view(['GET'])
def load_page(request, page):
    if page == 'login':
        form = LoginForm()
        content = render_to_string('partials/login_form.html', {'form': form}, request)
    elif page == 'register':
        form = RegisterForm()
        content = render_to_string('partials/register_form.html', {'form': form}, request)
    else:
        # Handle other pages
        content = render_to_string('main/home.html', {}, request)
    return JsonResponse({'content': content})

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return JsonResponse({'status': 'success'}, status=201)
    return JsonResponse(serializer.errors, status=400)

@api_view(['POST'])
def login(request):
    form = LoginForm(data=request.data)
    if form.is_valid():
        user = form.get_user()
        django_login(request, user)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)


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

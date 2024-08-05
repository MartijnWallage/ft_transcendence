# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect
from .forms import LoginForm, RegisterForm
from django.contrib.auth import authenticate, logout, login as django_login
from django.http import JsonResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view
from .serializers import RegisterSerializer
from django.views.decorators.csrf import csrf_exempt
# disable csrf protection temproraily

def index(request):
    return render(request, 'main/base.html')

@api_view(['GET'])
def home_view(request):
    # Collect user information and login status
    user_info = None
    if request.user.is_authenticated:
        user_info = {
            'username': request.user.username,
            'email': request.user.email
        }
    
    data = {
        'is_logged_in': request.user.is_authenticated,
        'user_info': user_info,
        'content': render_to_string("main/home.html", request=request)
    }
    return JsonResponse(data)

@api_view(['GET'])
def load_page(request):
    print("login form serving")
    form = LoginForm()
    content = render_to_string('partials/login_form.html', {'form': form}, request)
    return JsonResponse({'content': content})

@api_view(['GET'])
def load_page_reg(request):
    print("Register form serving")
    form = RegisterForm()
    content = render_to_string('partials/register_form.html', {'form': form}, request)
    return JsonResponse({'content': content})

# @csrf_exempt
@api_view(['POST'])
def register(request):
    print("this post method only is called for register request")
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        django_login(request, user)
        return JsonResponse({'status': 'success'}, status=201)
    return JsonResponse(serializer.errors, status=400)

# @csrf_exempt
@api_view(['POST'])
def login(request):
    print("this post method only is called for login request")
    form = LoginForm(data=request.data)
    if form.is_valid():
        user = form.get_user()
        django_login(request, user)
        print("login worked")
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    print("this post method only is called for logout request")
    logout(request)
    return JsonResponse({'status': 'success'})

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

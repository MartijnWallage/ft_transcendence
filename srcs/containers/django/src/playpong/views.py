# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth import login, logout, authenticate


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .serializers import PlayerSerializer

# def play_pong(request):
#     return render(request, 'main/pong.html')

def play_pong(request):
    context = {
        'is_logged_in': request.user.is_authenticated
    }
    return render(request, 'main/pong.html', context)

def home(request):
    return render(request, "main/home.html")

def sign_up(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/pong')
    else:
        form = RegisterForm()
    
    return render(request, 'registration/sign_up.html', {"form": form})


class PlayerViewSet(viewsets.ViewSet):
    def list(self, request):
        # Assuming you want to return fixed data for player1 and player2
        player1 = {'y': 200, 'dy': 0, 'score': 0}
        player2 = {'y': 200, 'dy': 0, 'score': 0}
        
        # Serialize player data using PlayerSerializer
        data = {
            'player1': PlayerSerializer(player1).data,
            'player2': PlayerSerializer(player2).data
        }

        return Response(data)
    

@api_view(['GET'])
def get_players_data(request):
    player1 = {'y': 200, 'dy': 0, 'score': 0}
    player2 = {'y': 200, 'dy': 0, 'score': 0}
    data = {
        'player1': player1,
        'player2': player2
    }
    return Response(data)



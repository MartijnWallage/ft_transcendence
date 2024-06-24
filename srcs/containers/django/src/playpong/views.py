from django.shortcuts import render
from django.http import HttpResponse

def play_pong(request):
    return render(request, 'Pong.html')

# Create your views here.

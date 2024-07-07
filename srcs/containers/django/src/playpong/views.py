# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth import login, logout, authenticate

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

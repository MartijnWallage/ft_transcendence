from django.urls import path
from . import views

# urlpatterns = [
#     path('hello/', views.play_pong),
# ]

urlpatterns = [
    path('', views.home, name='home'),
    path('pong/', views.play_pong, name='pong'),
    path('home/', views.home, name='home'),
    path('sign-up/', views.sign_up, name='sign_up'),
]

# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth import login, logout, authenticate

from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

#rest_framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

#Using JWT Authentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# from .models import Game  # Assuming you have a Game model defined
# from .serializers import GameSerializer  # Assuming you have a GameSerializer defined


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




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_remote_game(request):
    data = request.data
    game_id = data.get('gameId')
    session_token = data.get('sessionToken')

    # Your logic to validate sessionToken and perform actions
    if valid_session_token(session_token):
        game_session = {
            'player1Name': 'Player 1',  # Example data
            'player2Name': 'Remote Player',
            'gameMode': 'remoteuser-vs-remoteuser',
            # Add other initial game state data as needed
        }
        return JsonResponse({'success': True, 'gameState': game_session})

    return JsonResponse({'success': False, 'message': 'Invalid session token'}, status=400)

def valid_session_token(session_token):
    # Example validation logic (replace with your implementation)
    # Here you can verify the session token against your database or cache
    # Return True if valid, False otherwise
    return True  # Replace with actual validation logic






class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        # Your authentication logic to verify credentials and get user
        user = authenticate(username=request.data['username'], password=request.data['password'])

        if user:
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

            # Return tokens as JSON response
            return Response(tokens, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@require_POST
def start_remote_game(request):
    # Extract data from POST request
    data = json.loads(request.body.decode('utf-8'))
    player1_name = data.get('player1Name', '')
    player2_name = data.get('player2Name', '')
    
    # Start the remote game session (your logic here)
    # This might involve creating a game session, generating a game ID, etc.
    # For simplicity, let's assume a basic response
    game_mode = 'remoteuser-vs-remoteuser'
    game_data = {
        'player1Name': player1_name,
        'player2Name': player2_name,
        'gameMode': game_mode,
        # Add other initial game state data as needed
    }

    # Return initial game state as JSON response
    return JsonResponse(game_data)


@require_POST
def join_remote_game(request):
    data = json.loads(request.body.decode('utf-8'))
    game_id = data.get('gameId', '')
    session_token = data.get('sessionToken', '')

    # Validate game ID or session token (pseudo-code)
    if valid_game_session(game_id, session_token):
        # Add remote player to the game session
        game_session = get_game_session_by_id(game_id)
        game_session['remotePlayer'] = 'Remote Player'  # Example

        # Save updated game session state
        update_game_session(game_session)

        # Return success response with updated game state
        return JsonResponse({
            'success': True,
            'message': 'Remote player joined successfully',
            'gameState': game_session  # Return updated game session state to frontend
        })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Invalid game ID or session token'
        }, status=400)



# # API endpoint for controlling player actions (e.g., paddle movements)
# class PlayerMoveAPIView(APIView):
#     def post(self, request, game_id, format=None):
#         # Retrieve the game object
#         try:
#             game = Game.objects.get(pk=game_id)
#         except Game.DoesNotExist:
#             return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Perform player action (e.g., move paddle)
#         # Example: Assuming `move_direction` is passed in the request data
#         move_direction = request.data.get('move_direction', None)
#         if move_direction:
#             # Implement your logic to move the paddle
#             # For example, modify game state or call methods on the Game model
            
#             # Here is a hypothetical example:
#             # game.move_player_paddle(move_direction)

#             # Save the updated game state (if applicable)
#             game.save()

#         # Serialize the updated game state
#         serializer = GameSerializer(game)

#         return Response(serializer.data)

# # API endpoint for retrieving and updating game state
# class GameStateAPIView(APIView):
#     def get(self, request, game_id, format=None):
#         # Retrieve the game object
#         try:
#             game = Game.objects.get(pk=game_id)
#         except Game.DoesNotExist:
#             return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Serialize the game state
#         serializer = GameSerializer(game)

#         return Response(serializer.data)

#     def put(self, request, game_id, format=None):
#         # Retrieve the game object
#         try:
#             game = Game.objects.get(pk=game_id)
#         except Game.DoesNotExist:
#             return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Update game state based on request data (e.g., update ball position, scores, etc.)
#         # Example: Update ball position
#         new_ball_position = request.data.get('ball_position', None)
#         if new_ball_position:
#             # Implement your logic to update game state
#             # For example, update game attributes or call methods on the Game model
#             game.ball_position = new_ball_position

#             # Save the updated game state
#             game.save()

#         # Serialize the updated game state
#         serializer = GameSerializer(game)

#         return Response(serializer.data)
    
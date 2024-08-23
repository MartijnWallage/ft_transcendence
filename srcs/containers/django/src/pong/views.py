# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect, get_object_or_404
from .forms import RegisterForm, LoginForm, UpdateUserForm, CustomPasswordChangeForm
from django.contrib.auth import login as django_login, logout, authenticate
from django.http import JsonResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from web3 import Web3
from web3.middleware import geth_poa_middleware
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .serializers import RegisterSerializer, UpdateUserSerializer, ChangePasswordSerializer
from .models import Player, Tournament, Match, UserProfile
import json
from django.db.models import Max, Q
from rest_framework.response import Response

@login_required
def userinfo_view(request):
    user_info = {
        'username': request.user.username,
        'email': request.user.email,
        'avatar_url': None
    }
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        user_info['avatar_url'] = user_profile.avatar.url if user_profile.avatar else None
        print("this is avatar url:   ")
        print(user_info["avatar_url"])
    except UserProfile.DoesNotExist:
        print('user doesnot exists')
        pass

    return JsonResponse({
        'user_info': user_info,
        'is_logged_in': request.user.is_authenticated
    })


def index(request):
    config_data = {
        'private_key': settings.PRIVATE_KEY,
        'alchemy_api_key': settings.ALCHEMY_API_KEY,
        'smart_contract_address': settings.SMART_CONTRACT_ADDRESS
    }
    return render(request, 'main/base.html', config_data)


@api_view(['GET'])
def home_view(request):
    data = {
        'content': render_to_string("main/home.html", request=request)
    }
    return JsonResponse(data)

@api_view(['GET'])
def dashboard_view(request):
    data = {
        'content': render_to_string("partials/dashboard.html", request=request)
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

@api_view(['GET'])
def load_page_update(request):
    print("Update user form serving")
    form = UpdateUserForm(initial={'username': request.user.username, 'email': request.user.email})
    content = render_to_string('partials/update_profile.html', {'form': form}, request)
    return JsonResponse({'content': content})


@api_view(['GET'])
def load_password_update(request):
    print("Update user form serving")
    form = CustomPasswordChangeForm(user=request.user)
    content = render_to_string('partials/update_password.html', {'form': form}, request)
    return JsonResponse({'content': content})

# @csrf_exempt
@api_view(['POST'])
def register(request):
    print("this post method only is called for register request")
    serializer = RegisterSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.save()
        # Create a Player instance associated with the new User
        Player.objects.create(name=user.username, user=user)
        print("user created: ", user)
        django_login(request, user)
        return JsonResponse({'status': 'success'}, status=201)
    return JsonResponse(serializer.errors, status=400)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@login_required
def update_profile(request):
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse(serializer.errors, status=400)


@api_view(['POST'])
@login_required
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'status': 'success'})
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

@api_view(['GET'])
def match_history(request):
    data = {
        'content': render_to_string("main/match_history.html", request=request)
    }
    return JsonResponse(data)


@api_view(['GET'])
def tournament_score(request):
    highest_tournament = Tournament.objects.aggregate(Max('id'))['id__max']
    if highest_tournament is None:
        # Handle the case where there are no tournaments in the database
        html_content = render_to_string("main/tournament_score.html", {'tournament': None}, request=request)
    else:
        tournament = get_object_or_404(Tournament, id=highest_tournament)
        html_content = render_to_string("main/tournament_score.html", {'tournament': tournament}, request=request)
    
    data = {
        'content': html_content
    }
    return JsonResponse(data)
import traceback

# Register tournament on blockchain

@api_view(['GET'])
def get_contract_address(request):
    contract_address = settings.SMART_CONTRACT_ADDRESS
    return JsonResponse({'contract_address': contract_address})


@api_view(['POST'])
def register_matches(request):
    data = request.data
    tournament_id = data.get('tournament_id')
    print('tournament_id:', tournament_id)
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        matches = tournament.match.all()
        match_data = [{
            'player1': match.player1.name,
            'player2': match.player2.name,
            'score1': match.player1_score,	
            'score2': match.player2_score,
            'timestamp': match.timestamp
        } for match in matches]
    except Tournament.DoesNotExist:
        return Response({'success': False, 'error': 'Tournament not found'}, status=404)
    
    # Setup Web3 and contract
    alchemy_url = f"https://eth-sepolia.g.alchemy.com/v2/{settings.ALCHEMY_API_KEY}"
    web3 = Web3(Web3.HTTPProvider(alchemy_url))
    web3.middleware_onion.inject(geth_poa_middleware, layer=0)
    contract_abi = [{"inputs":[{"internalType":"uint256","name":"_matchId","type":"uint256"}],"name":"getMatch","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMatchCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"matches","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct PongTournament.Match[]","name":"_matches","type":"tuple[]"}],"name":"recordMatches","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    contract_address = settings.SMART_CONTRACT_ADDRESS
    contract = web3.eth.contract(address=contract_address, abi=contract_abi)

    private_key = settings.PRIVATE_KEY
    account = web3.eth.account.from_key(private_key)
    web3.eth.defaultAccount = account.address

    try:
        # Sign transaction
        tx = contract.functions.recordMatches(match_data).build_transaction({
            'from': account.address,
            'gas': 3000000,  # or any estimate
            'gasPrice': web3.eth.gas_price,
            'nonce': web3.eth.get_transaction_count(account.address),
        })
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)

        # Send transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

        # Wait for the transaction receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        # Store the transaction hash in the database
        tournament.transaction_hash = receipt.transactionHash.hex()
        tournament.save()

        # Update the tournament with the transaction hash
        return Response({'success': True, 'tx_hash': receipt.transactionHash.hex()})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)



# Register tournament on database

@api_view(['POST'])
def add_participant_to_tournament(request):
    try:
        data = request.data
        tournament_id = data.get('tournament_id')
        player_name = data.get('player_name')

        if not player_name or not tournament_id:
            raise ValueError("Player name and tournament ID are required")

        # Retrieve or create the player
        player, created = Player.objects.get_or_create(name=player_name)
        
        # Retrieve the tournament
        tournament = Tournament.objects.get(id=tournament_id)
        
        # Add player to the tournament
        tournament.players.add(player)
        tournament.save()

        return Response({'status': 'success'})
    
    except Player.DoesNotExist:
        return Response({'status': 'error', 'message': 'Player not found.'}, status=404)
    except Tournament.DoesNotExist:
        return Response({'status': 'error', 'message': 'Tournament not found.'}, status=404)
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()  # This will print the traceback to the console
        return Response({'status': 'error', 'message': error_message}, status=500)

@api_view(['POST'])
def create_tournament(request):
    try:
        data = request.data
        date = data.get('date')
        hash = data.get('transaction_hash')  # Optional field

        # Create the tournament
        # tournament = Tournament.objects.create(date=date)
        tournament = Tournament.objects.create(date=date, transaction_hash=hash)

        
        return Response({'status': 'success', 'tournament_id': tournament.id})
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()
        return Response({'status': 'error', 'message': error_message}, status=500)

@api_view(['POST'])
def create_match_in_tournament(request):
    try:
        data = request.data
        tournament_id = data.get('tournament_id')
        player1_score = data.get('player1_score')
        player2_score = data.get('player2_score')
        timestamp = data.get('timestamp')
        mode = data.get('mode')

        # Retrieve the tournament
        tournament = Tournament.objects.get(id=tournament_id)

        # Retrieve the players
        try:
            player1, created1 = Player.objects.get_or_create(name=data.get('player1'))
        except Player.DoesNotExist:
            return JsonResponse({'error': f'Player {player1} does not exist'}, status=400)

        try:
            player2, created2 = Player.objects.get_or_create(name=data.get('player2'))
        except Player.DoesNotExist:
            return JsonResponse({'error': f'Player {player2} does not exist'}, status=400)

        # Create the match
        match = Match.objects.create(player1=player1, player2=player2, player1_score=player1_score, player2_score=player2_score, timestamp=timestamp, mode=mode)

        # Add match to the tournament
        tournament.match.add(match)
        tournament.save()

        return JsonResponse({'status': 'success', 'tournament_id': tournament.id})
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': error_message}, status=500)


# Register matches on database

@api_view(['POST'])
def create_player(request):
    try:
        data = request.data
        player_name = data.get('player_name')

        if not player_name:
            raise ValueError("Player name is required")

        # Retrieve or create the player
        player, created = Player.objects.get_or_create(name=player_name)

        return Response({'status': 'success', 'player_id': player.id})
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()  # This will print the traceback to the console
        return Response({'status': 'error', 'message': error_message}, status=500)


@api_view(['POST'])
def create_match(request):
    try:
        data = request.data
        player1_score = data.get('player1_score')
        player2_score = data.get('player2_score')
        timestamp = data.get('timestamp')
        mode = data.get('mode')

        # Retrieve or create players
        player1, created1 = Player.objects.get_or_create(name=data.get('player1'))
        player2, created2 = Player.objects.get_or_create(name=data.get('player2'))

        # Create the match
        match = Match.objects.create(
            player1=player1,
            player2=player2,
            player1_score=player1_score,
            player2_score=player2_score,
            timestamp=timestamp,
            mode=mode
        )

        return Response({'status': 'success', 'match_id': match.id})
    
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()
        return Response({'status': 'error', 'message': error_message}, status=500)


# retrieve user matches    

@api_view(['GET'])
def get_logged_in_user(request):
    return Response({'username': request.user.username})

def get_user_matches(username, mode):
    try:
        # Retrieve the Player instance associated with the given username
        player = Player.objects.get(name=username)
        print("player: ", player)


        # Retrieve all matches where the given player is either player1 or player2 and with the given mode
        print(Q(player1=player))
        print(Q(player2=player))
        print(Q(mode=mode))
        matches = Match.objects.filter(
            (Q(player1=player) | Q(player2=player)) & Q(mode=mode)
        )
        print("matches: ", matches)
        return matches
    
    except Player.DoesNotExist:
        # Handle the case where the player does not exist
        return None

@api_view(['POST'])
def user_matches(request):
    username = request.data.get('username')
    mode = request.data.get('mode')
    
    # Make sure username and mode are provided
    if not username or not mode:
        return Response({'error': 'Username and mode are required.'}, status=400)
    
    matches = get_user_matches(username, mode)
    if matches is None:
        return Response({'error': 'Player not found'}, status=404)
    
    # Serialize the matches if you want to return them in a JSON response
    matches_data = [
        {
            'player1': match.player1.name,
            'player2': match.player2.name,
            'player1_score': match.player1_score,
            'player2_score': match.player2_score,
            'timestamp': match.timestamp,
            'mode': match.mode,
        }
        for match in matches
    ]
    print("matches_data: ", matches_data)

    return Response({'matches': matches_data}, status=200)

# retrieve user tournaments

def get_user_tournaments(username):
    try:
        # Retrieve the Player instance associated with the given username
        player = Player.objects.get(name=username)
        print("Player:", player)

        # Retrieve all tournaments where the given player is a participant
        tournaments = Tournament.objects.filter(players=player).prefetch_related('match')
        print("Tournaments:", tournaments)

        return tournaments
    
    except Player.DoesNotExist:
        # Handle the case where the player does not exist
        return None

@api_view(['POST'])
def user_tournaments(request):
    username = request.data.get('username')
    
    # Ensure the username is provided
    if not username:
        return Response({'error': 'Username is required.'}, status=400)
    
    tournaments = get_user_tournaments(username)
    if tournaments is None:
        return Response({'error': 'Player not found'}, status=404)

    # Serialize the tournaments and their match details
    tournaments_data = [
        {
            'date': tournament.date.strftime('%Y-%m-%d %H:%M:%S'),
            'transaction_hash': tournament.transaction_hash,
            'matches': [
                {
                    'player1': match.player1.name,
                    'player2': match.player2.name,
                    'player1_score': match.player1_score,
                    'player2_score': match.player2_score,
                    'timestamp': match.timestamp,
                    'mode': match.mode,
                }
                for match in tournament.match.all()
            ],
        }
        for tournament in tournaments
    ]
    
    print("Tournaments Data:", tournaments_data)
    return Response({'tournaments': tournaments_data}, status=200)
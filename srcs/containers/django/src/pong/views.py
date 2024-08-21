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
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .serializers import RegisterSerializer, UpdateUserSerializer, ChangePasswordSerializer, FriendShipSerializer, UserProfileSerializer
from .models import Player, Tournament, Match, UserProfile, Friendship
from django.db.models import Q
import json


@api_view(['GET'])
@login_required
def suggested_friends(request):
    all_users = User.objects.exclude(id=request.user.id)
    friend_ids = Friendship.objects.filter(
        Q(user=request.user) | Q(friend=request.user),
        accepted=True
    ).values_list('user', 'friend')
    friends_ids = set([user_id for sublist in friend_ids for user_id in sublist])
    suggested_users = all_users.exclude(id__in=friends_ids)  
    serializer = UserProfileSerializer(UserProfile.objects.filter(user__in=suggested_users), many=True)
    return JsonResponse({"suggested_friends": serializer.data})

@api_view(['POST'])
@login_required
def add_friend(request):
    print(request.data)
    friend_username = request.data.get('friend_username')
    print('add friend method called with friend', friend_username)
    try:
        friend = User.objects.get(username=friend_username)
        print('friend', friend)
        if friend == request.user:
            return JsonResponse({"status": "error", "message": "You cannot add yourself as friend!"}, status=400)

        friendship, created = Friendship.objects.get_or_create(user=request.user, friend=friend)

        if created:
            return JsonResponse({"status": "success", "message": "Friend request sent"})
        else:
            if friendship.accepted:
                return JsonResponse({"status": "error", "message": "You are already friends"}, status=400)
            else:
                return JsonResponse({"status": "error", "message": "Friendship already exists"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"}, status=400)



@api_view(['GET'])
@login_required
def list_friends(request):
    friendships = Friendship.objects.filter(
        (Q(user=request.user) | Q(friend=request.user)) & Q(accepted=True)
    )
    
    serializer = FriendShipSerializer(friendships, many=True)
    print(serializer.data)
    
    friends_list = []
    seen_usernames = set()
    for item in serializer.data:
        if item['user_username'] == request.user.username:
            friend_profile = item['friend_profile']
        else:
            friend_profile = item['user_profile']
        
        if friend_profile['username'] != request.user.username:
            if friend_profile['username'] not in seen_usernames:
                friends_list.append({
                    'username': friend_profile['username'],
                    'avatar': friend_profile['avatar'],
                    'online_status': friend_profile['online_status']
                })
                seen_usernames.add(friend_profile['username'])
    return JsonResponse({"friends": friends_list})

@api_view(['POST'])
@login_required
def accept_friend(request):

    friend_username = request.data.get('friend_username')
    requesting_user = User.objects.get(username=friend_username)
    action = request.data.get('action')

    try:
        friendship = Friendship.objects.get(user=requesting_user, friend=request.user)
        if action == "accept":
            if friendship.accepted:
                return JsonResponse({"status": "error", "message": "Friendship already exists"}, status=400)
            friendship.accepted = True
            friendship.save()
            return JsonResponse({"status": "success", "message": "Friend request accepted"})
        elif action == "reject":
            friendship.delete()
            return JsonResponse({"status": "success", "message": "Friend request deleted"})
    except Friendship.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Friend request doesn't exists"}, status=400)


@api_view(['GET'])
@login_required
def friend_requests(request):
    # Retrieve all pending friend requests where the current user is the friend
    requests = Friendship.objects.filter(friend=request.user, accepted=False)
    print('requests', requests)
    pending_requests = [request for request in requests]

    print('pending requests', pending_requests)

    # Serialize the requests
    serializer = UserProfileSerializer(UserProfile.objects.filter(user__in=[r.user for r in pending_requests]), many=True)

    return JsonResponse({"requests": serializer.data})


@login_required
@login_required()
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
@login_required(login_url='/api/login_user/')
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
@login_required(login_url='/api/login_user/')
def load_page_update(request):
    print("Update user form serving")
    form = UpdateUserForm(initial={'username': request.user.username, 'email': request.user.email})
    content = render_to_string('partials/update_profile.html', {'form': form}, request)
    return JsonResponse({'content': content})


@api_view(['GET'])
@login_required(login_url='/api/login_user/')
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
        django_login(request, user)
        return JsonResponse({'status': 'success'}, status=201)
    return JsonResponse(serializer.errors, status=400)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@login_required(login_url='/api/login_user/')
def update_profile(request):
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse(serializer.errors, status=400)


@api_view(['POST'])
@login_required(login_url='/api/login_user/')
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

# @login_required(login_url='/api/login_user/')
@api_view(['GET'])	
def game_mode_view(request):
    data = {
        'content': render_to_string("main/game_mode.html", request=request)
    }
    return JsonResponse(data)

@login_required(login_url='/api/login_user/')
@api_view(['GET'])
def two_player_view(request):
    data = {
        'content': render_to_string("main/two_player.html", request=request)
    }
    return JsonResponse(data)

@login_required(login_url='/api/login_user/')
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

@login_required(login_url='/api/login_user/')
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

from django.db.models import Max


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

@csrf_exempt
@api_view(['POST'])
def add_participant(request):
    try:
        data = json.loads(request.body)
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

        return JsonResponse({'status': 'success'})
    
    except Player.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Player not found.'}, status=404)
    except Tournament.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Tournament not found.'}, status=404)
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()  # This will print the traceback to the console
        return JsonResponse({'status': 'error', 'message': error_message}, status=500)


@api_view(['POST'])
def create_tournament(request):
    try:
        data = json.loads(request.body)
        date = data.get('date')
        hash = data.get('transaction_hash')  # Optional field

        # Create the tournament
        # tournament = Tournament.objects.create(date=date)
        tournament = Tournament.objects.create(date=date, transaction_hash=hash)

        
        return JsonResponse({'status': 'success', 'tournament_id': tournament.id})
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': error_message}, status=500)
    
@api_view(['POST'])
def create_match(request):
    try:
        data = json.loads(request.body)
        tournament_id = data.get('tournament_id')
        player1_score = data.get('player1_score')
        player2_score = data.get('player2_score')
        timestamp = data.get('timestamp')

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
        match = Match.objects.create(player1=player1, player2=player2, player1_score=player1_score, player2_score=player2_score, timestamp=timestamp)

        # Add match to the tournament
        tournament.match.add(match)
        tournament.save()

        return JsonResponse({'status': 'success', 'tournament_id': tournament.id})
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': error_message}, status=500)
    

@api_view(['GET'])
def get_contract_address(request):
    contract_address = settings.SMART_CONTRACT_ADDRESS
    return JsonResponse({'contract_address': contract_address})


@api_view(['POST'])
def register_matches(request):
    data = json.loads(request.body)
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
        return JsonResponse({'success': False, 'error': 'Tournament not found'}, status=404)
    
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
        return JsonResponse({'success': True, 'tx_hash': receipt.transactionHash.hex()})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
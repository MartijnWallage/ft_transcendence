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
import json
from django.db.models import Max, Q, F
from rest_framework.response import Response


@api_view(['GET'])
@login_required
def all_users(request):
    all_users = UserProfile.objects.all()

    serializer = UserProfileSerializer(all_users, many=True)
    # print(serializer.data)
    return JsonResponse({"suggested_friends": serializer.data})


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
    friend_username = request.data.get('friend_username')
    print('add friend method called with friend', friend_username)
    try:
        friend = User.objects.get(username=friend_username)
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
    print('list friend called')
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
    print('accepting friend request')
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
    requests = Friendship.objects.filter(friend=request.user, accepted=False)
    pending_requests = [request for request in requests]

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
        user_info['avatar_url'] = user_profile.avatar.url if user_profile.avatar else '/static/images/guest.png'
        print("this is avatar url:   ", user_info["avatar_url"])
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
def settings_view(request):
    data = {
        'content': render_to_string("partials/settings.html", request=request)
    }
    return JsonResponse(data)


@api_view(['GET'])
def dashboard_view(request):
    # username_to_check = request.user.username
    # # if not username:
    # #     return JsonResponse({"status": "error", "message": "D Username is required"}, status=400)
    # username = User.objects.get(username=username_to_check).username
    # matches = get_user_matches(username, None)
    # if matches is None:
    #     return JsonResponse({"status": "error", "message": "D Player not found"}, status=404)

    # total_matches = matches['total_matches']
    # won_matches = matches['won_matches']
    # lost_matches = matches['lost_matches']

    # # Pass statistics to the template
    # data = {
    #     'content': render_to_string("partials/dashboard.html", {
    #         'total_matches': total_matches,
    #         'won_matches': won_matches,
    #         'lost_matches': lost_matches
    #     }, request=request)
    # }
    data = {
        'content': render_to_string("partials/dashboard.html", request=request)
    }
    return JsonResponse(data)

@api_view(['GET'])
def score_view(request):
    username_to_check = request.user.username
    username = User.objects.get(username=username_to_check).username
    matches = get_user_matches(username, None)
    if matches is None:
        return JsonResponse({"status": "error", "message": "D Player not found"}, status=404)

    total_matches = matches['total_matches']
    won_matches = matches['won_matches']
    lost_matches = matches['lost_matches']

    data = {
        'total_matches': total_matches,
        'won_matches': won_matches,
        'lost_matches': lost_matches
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
        # Create a Player instance associated with the new User
        username = user.username
        Player.objects.create(name=username, user_profile=user)
        print("user created: ", user)
        django_login(request, user)
        return JsonResponse({'status': 'success', 'username': username}, status=201)
    return JsonResponse(serializer.errors, status=400)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@login_required(login_url='/api/login_user/')
def update_profile(request):
    print('update profile called')
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse(serializer.errors, status=400)


@api_view(['POST'])
@login_required(login_url='/api/login_user/')
def change_password(request):
    print('change password called')
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse(serializer.errors, status=400)


# @csrf_exempt
@api_view(['POST'])
def login(request):
    form = LoginForm(data=request.data)
    if form.is_valid():
        user = form.get_user()
        django_login(request, user)
        print("login worked", user)
        return JsonResponse({'status': 'success', 'username': user.username})
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
    username = request.user.username
    data = {
        'content': render_to_string("main/two_player_local.html", context={'username': username}, request=request)
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
    return Response({'contract_address': contract_address})


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
        return Response({'success': False, 'error': 'Tournament not found'})
    
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

    # Check if the account has enough balance to cover the gas fees
    try:
        # Estimate gas
        estimated_gas_limit = contract.functions.recordMatches(match_data).estimate_gas({
            'from': account.address,
        })
    except Exception as e:
        print(f"Error estimating gas: {str(e)}")
        return Response({'success': False, 'error': 'Error estimating gas'})

    estimated_gas_price = web3.eth.gas_price
    required_balance = estimated_gas_limit * estimated_gas_price
    current_balance = web3.eth.get_balance(account.address)
    print(f"Current balance: {current_balance}, required balance: {required_balance}")

    if current_balance < required_balance:
        return Response({'success': False, 'error': 'Insufficient funds'})

    try:
        # Sign transaction
        tx = contract.functions.recordMatches(match_data).build_transaction({
            'from': account.address,
            'gas': estimated_gas_limit,  # or any estimate
            'gasPrice': web3.eth.gas_price,
            'nonce': web3.eth.get_transaction_count(account.address),
        })
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)

        # Send transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"Transaction sent, hash: {tx_hash.hex()}")

        # Wait for the transaction receipt
        try:
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=60 )  # Increased timeout
            print(f"Transaction receipt received: {receipt.transactionHash.hex()}")
        except TimeoutError:
            print("Transaction timed out")
            return Response({'success': False, 'error': 'Transaction timed out'})

        # Store the transaction hash in the database
        tournament.transaction_hash = receipt.transactionHash.hex()
        tournament.save()
        print(f"Transaction hash saved in database for tournament {tournament_id}")

        # Update the tournament with the transaction hash
        return Response({'success': True, 'tx_hash': receipt.transactionHash.hex()})
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return Response({'success': False, 'error': str(e)})



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
        # player_name = request.user.username
        player_name = data.get('player_name')

        # player_profile = User.objects.get(username=player_name)

        if not player_name:
            raise ValueError("Player name is required")

        # Retrieve or create the player
        # player, created = Player.objects.get_or_create(user_profile=player_profile)
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
        # player1_data = data.get('player1')
        # player2_data = data.get('player2')
        player1_score = data.get('player1_score')
        player2_score = data.get('player2_score')
        timestamp = data.get('timestamp')
        mode = data.get('mode')
        # Helper function to retrieve or create a player
        # def get_or_create_player(player_data):
        #     # Attempt to find a user by the username
        #     try:
        #         user = User.objects.get(username=player_data)
        #         player, created = Player.objects.get_or_create(user_profile=user)
        #     except User.DoesNotExist:
        #         # If no user exists, create a player by name
        #         player, created = Player.objects.get_or_create(name=player_data)
        #     return player

        # # Retrieve or create players for player1 and player2
        # player1 = get_or_create_player(player1_data)
        # player2 = get_or_create_player(player2_data)
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

        player = Player.objects.get(name=username)

        if mode is None:
            matches = Match.objects.filter(
                (Q(player1=player) | Q(player2=player))
            )
        else:
            matches = Match.objects.filter(
                (Q(player1=player) | Q(player2=player)) & Q(mode=mode)
            )

        total_matches = matches.count()

        won_matches = matches.filter(
            (Q(player1=player) & Q(player1_score__gt=F('player2_score'))) |
            (Q(player2=player) & Q(player2_score__gt=F('player1_score')))
        ).count()

        lost_matches = total_matches - won_matches

        return {
            'matches': matches,
            'total_matches': total_matches,
            'won_matches': won_matches,
            'lost_matches': lost_matches
        }
    except Player.DoesNotExist:
        return {
            'matches': [],
            'total_matches': 0,
            'won_matches': 0,
            'lost_matches': 0
        }

@api_view(['POST'])
def user_matches(request):
    username = request.data.get('username')
    mode = request.data.get('mode')
    
    if not username or not mode:
        return Response({'error': 'Username and mode are required.'}, status=400)
    
    result = get_user_matches(username, mode)
    matches = result.get('matches', [])
    
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


def get_user_tournaments(username):
    try:
        player = Player.objects.get(name=username)
        print("Player:", player)

        tournaments = Tournament.objects.filter(players=player).prefetch_related('match')
        print("Tournaments:", tournaments)

        return tournaments
    
    except Player.DoesNotExist:
        return None

@api_view(['POST'])
def user_tournaments(request):
    username = request.data.get('username')
    
    if not username:
        return Response({'error': 'Username is required.'}, status=400)
    
    tournaments = get_user_tournaments(username)
    if tournaments is None:
        tournaments = []

    tournaments_data = [
        {
            'date': tournament.date,
            'transaction_hash': tournament.transaction_hash,
            'id' : tournament.id,
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
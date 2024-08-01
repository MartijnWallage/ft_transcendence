# from django.shortcuts import render
# from django.http import HttpResponse

# def play_pong(request):
#     return render(request, 'Pong.html')

# # Create your views here.

from django.shortcuts import render, redirect, get_object_or_404
from .forms import RegisterForm
from django.contrib.auth import login, logout, authenticate
from django.http import JsonResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view
from django.conf import settings


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Player, Tournament, Match
import json


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

from django.db.models import Max


@api_view(['GET'])
def tournament_score(request):
	highest_tournament = Tournament.objects.aggregate(Max('id'))['id__max']
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


		# Retrieve the tournament
		tournament = Tournament.objects.get(id=tournament_id)

		# Retrieve the players
		# player1 = Player.objects.get(name=data.get('player1'))
		# player2 = Player.objects.get(name=data.get('player2'))
		try:
			player1 = Player.objects.get(name=data.get('player1'))
		except Player.DoesNotExist:
			return JsonResponse({'error': f'Player {player1} does not exist'}, status=400)

		try:
			player2 = Player.objects.get(name=data.get('player2'))
		except Player.DoesNotExist:
			return JsonResponse({'error': f'Player {player2} does not exist'}, status=400)


		# Create the match
		match = Match.objects.create(player1=player1, player2=player2, player1_score=player1_score, player2_score=player2_score)

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

from web3 import Web3
from web3.middleware import geth_poa_middleware

@api_view(['POST'])
def register_matches(request):
	data = json.loads(request.body)
	matches = data.get('matches', [])
	tournament_id = data.get('tournament_id')

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

	# Sign transaction
	tx = contract.functions.recordMatches(matches).build_transaction({
		'from': account.address,
		'gas': 2000000,  # or any estimate
		'gasPrice': web3.eth.gas_price,
		'nonce': web3.eth.get_transaction_count(account.address),
	})
	signed_tx = web3.eth.account.sign_transaction(tx, private_key)

	# Send transaction
	tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

	# Wait for the transaction receipt
	receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

	# Update the tournament with the transaction hash
	try:
		tournament = Tournament.objects.get(id=tournament_id)
		tournament.transaction_hash = receipt.transactionHash.hex()
		tournament.save()
		return JsonResponse({'success': True, 'tx_hash': receipt.transactionHash.hex()})
	except Tournament.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'Tournament not found'})
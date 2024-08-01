import { Player } from './Player.js';
import { Match } from './Match.js';

class Tournament {

	constructor(game) {
		this.game = game;
		this.players = [];
		this.matchResult = [];
		this.tournamentId = null;
	}

	async start() {
		const game = this.game;

		if (this.players.length < 2) {
			var error2 = document.getElementById('error2');
			error2.style.display = 'block'; 
			return;
		}
		console.log('Starting tournament... with players:', this.players);

		try {
			await loadPage('pong');
			let currentPlayers = [this.players[0], this.players[1]];
			for (let index = 1; index < this.players.length; index++) {
				game.match = new Match(game, currentPlayers);
				await game.match.play();
				while (game.match.score.winner === null) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
				console.log('Match winner:', game.match.score.winner);
				console.log('Match Result:', game.match.score.result);
				
				let matchResult = { player1: currentPlayers[0].name, player2: currentPlayers[1].name, player1Score: game.match.score.result[0], player2Score: game.match.score.result[1], timestamp: game.match.timestamp };

				this.matchResult.push(matchResult);

				if (index + 1 < this.players.length) {
					const loser = game.match.score.winner === 0 ? 1 : 0;
					currentPlayers[loser] = this.players[index + 1];
					console.log(`New player names after match ${index}: ${currentPlayers[0].name} vs ${currentPlayers[1].name}`);
				}
			}

			this.endTournament();
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}

	addPlayer() {
		const playerName = document.getElementById('playerNameInput').value.trim();
		console.log(playerName);
		var error = document.getElementById('error');
		if (playerName === '') {
			error.style.display = 'block'; 
			return;
		}
		else {
			error.style.display = 'none'; 
		}
		const newPlayer = new Player(playerName);
		this.players.push(newPlayer);
		this.displayPlayers();
		document.getElementById('playerNameInput').value = '';
	}

	displayPlayers() {
		const game = this.game;
	
		const playerListDiv = document.getElementById('playerList');
		playerListDiv.innerHTML = ''; // Clear existing list
		this.players.forEach(player => {
			let index = this.players.indexOf(player) + 1;
			let name = player.name;
			const playerElement = document.createElement('p');
			playerElement.textContent = `Player ${index}: ${name}`;
			playerListDiv.appendChild(playerElement);
		});
	}

	// Tournament Score Database

	getCurrentDateISO() {
		const now = new Date();
		return now.toISOString();  // Format ISO 8601
	}
	
	async addParticipant(playerName, tournamentId) {
		console.log('Adding participant:', playerName);
		$.ajax({
			url: '/api/add_participant/',
			type: 'POST',
	
			data: JSON.stringify({
				'tournament_id': tournamentId,
				'player_name': playerName
			}),
	
			contentType: 'application/json; charset=utf-8',
	
			dataType: 'json',
	
			success: function(response) {
				console.log('Participant added:', response);
			},
	
			error: function(error) {
				console.log('Error addParicipant:', error);
			}
	
		});
	}
	
	async createTournament() {
		console.log('Creating tournament...');
		const currentDate = this.getCurrentDateISO();
		console.log('Current Date:', currentDate);
	
		return new Promise((resolve, reject) => {
			$.ajax({
				url: '/api/create_tournament/',
				type: 'POST',
				data: JSON.stringify({
					'date': currentDate,
					'transaction_hash' : null
				}),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
	
				success: function(response) {
					console.log('Tournament created successfully:', response);
					if (response && response.tournament_id) {
						console.log('Tournament ID:', response.tournament_id);
						resolve(response.tournament_id);
					} else {
						console.log('Tournament ID not found in the response.');
						resolve(null);
					}
				},
				error: function(error) {
					console.error('Error creating tournament:', error);
					reject(error);
				}
			});
		});
	}
	
	async createMatch(tournamentId, matchResult) {
		console.log('Creating Match...');
		$.ajax({
			url: '/api/create_match/',
			type: 'POST',
			data: JSON.stringify({
				'tournament_id': tournamentId,
				'player1' : matchResult.player1,
				'player2' : matchResult.player2,
				'player1_score' : matchResult.player1Score,
				'player2_score' : matchResult.player2Score,
			}),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
	
			success: function(response) {
				console.log('Match created successfully:', response);
			},
			error: function(error) {
				console.error('Error creating match:', error);
			}
		});
	}

	// Tournament End

	async endTournament() {
		const game = this.game;
		const score = game.match.score.result;

		alert("Tournament Ended!");

		// scoreBoardTournament();

		// Example usage:
		
		try {
			this.tournamentId = await this.createTournament();

			for (const player of this.players) {
				await this.addParticipant(player.name, this.tournamentId);
			}

			console.log('Match Result:', this.matchResult);

			for (let index = 0; index < this.matchResult.length; index++) {
				const currentMatchResult = this.matchResult[index];
				console.log('Match:', index, ': ', currentMatchResult);
				await this.createMatch(this.tournamentId, currentMatchResult);
			}

		} catch (error) {
			console.error('Error ending tournament:', error);
		}

		this.players = [];
	}

	// Blockchain

	async registerMatches() {
		console.log('Match Result:', this.matchResult);
		console.log('Tournament ID:', this.tournamentId);
		const matches = this.matchResult.map(match => ({
			player1: match.player1,
			player2: match.player2,
			score1: match.player1Score,
			score2: match.player2Score,
			timestamp: match.timestamp || Date.now()
		}));
		console.log('Matches:', matches);
		try {
			// Send the match data to the server
			const response = await fetch('/api/register_matches/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken() // Include CSRF token for security
				},
				body: JSON.stringify({ matches, tournament_id: this.tournamentId })
			});
	
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
	
			const result = await response.json();
			console.log('Server response:', result);
	
			if (result.success) {
				const txHash = result.tx_hash;
				const etherscanUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
				alert(`Matches registered successfully! Transaction Hash: ${txHash}`);
	
				document.getElementById('transaction-info').innerHTML = 
					`Transaction Hash: <a href="${etherscanUrl}" target="_blank">${txHash}</a>`;
			} else {
				alert('Error registering matches: ' + result.error);
			}
		} catch (error) {
			console.error(error);
			alert('Error registering matches.');
		}
	}
	
	// Helper function to get CSRF token for security
	getCSRFToken() {
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				if (cookie.substring(0, 10) === 'csrftoken=') {
					cookieValue = decodeURIComponent(cookie.substring(10));
					break;
				}
			}
		}
		return cookieValue;
	}
}

export { Tournament };
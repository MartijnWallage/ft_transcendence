import { Player } from './Player.js';
import { Match } from './Match.js';
import { displayDiv, HTMLToDiv, notDisplayDiv } from '../utils.js';
import { getCookie } from '../utils.js';
class Tournament {

	constructor(game) {
		this.players = [];
		this.game = game;
		this.matchResult = [];
		this.tournamentId = null;
		this.winner = null;
	}

    async initializeTournament() {
        try {
            const playerName = await this.game.stats.fetchLoggedInUser();
            const newPlayer = new Player(playerName);
            this.players.push(newPlayer);
			this.displayPlayers();
        } catch (error) {
            console.error('Error initializing tournament:', error);
        }
    }

	async start() {
		const game = this.game;

		game.audio.playSound(game.audio.select_2);
		if (this.players.length < 2) {
			displayDiv('error2');
			return;
		}
		console.log('Starting tournament... with players:', this.players);

		try {
			await loadPage('pong');
			let currentPlayers = [this.players[0], this.players[1]];
			for (let index = 1; index < this.players.length; index++) {
				game.match = new Match(game, currentPlayers);
				await game.match.play(game);
				while (game.match && game.match.score.winner === null) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
                if (!game.match) {
                    return ;
                }
				console.log('Match winner:', game.match.score.winner);
				console.log('Match Result:', game.match.score.result);
				
				let matchResult = { player1: currentPlayers[0].name, player2: currentPlayers[1].name, player1Score: game.match.score.result[0], player2Score: game.match.score.result[1], timestamp: game.match.timestamp };

				this.matchResult.push(matchResult);
				while (this.game.readyForNextMatch === false) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
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

	async addPlayer() {
		this.game.audio.playSound(this.game.audio.select_1);
		const playerName = document.getElementById('playerNameInput').value.trim();
		console.log(playerName);
		if (playerName === '') {
			displayDiv('error');
			return;
		}
		else {
			notDisplayDiv('error');
		}
		const newPlayer = new Player(playerName);
		this.players.push(newPlayer);
		this.displayPlayers();
		document.getElementById('playerNameInput').value = '';
	}

	async displayPlayers() {
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
	
	async addParticipantInTournament(playerName, tournamentId) {
		console.log('Adding participant:', playerName);
	
		try {
			const response = await fetch('/api/add_participant_to_tournament/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'), // Include CSRF token
				},
				body: JSON.stringify({
					tournament_id: tournamentId,
					player_name: playerName,
				}),
			});
	
			if (!response.ok) {
				throw new Error(`Error adding participant: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log('Participant added:', data);
	
		} catch (error) {
			console.error('Error addParticipant:', error);
		}
	}
	
	
	async createTournament() {
		console.log('Creating tournament...');
		const currentDate = Date.now();
		console.log('Current Date:', currentDate);
	
		try {
			const response = await fetch('/api/create_tournament/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'), // Include CSRF token
				},
				body: JSON.stringify({
					date: currentDate,
					transaction_hash: null,
				}),
			});
	
			if (!response.ok) {
				throw new Error(`Error creating tournament: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log('Tournament created successfully:', data);
			if (data && data.tournament_id) {
				console.log('Tournament ID:', data.tournament_id);
				return data.tournament_id;
			} else {
				console.log('Tournament ID not found in the response.');
				return null;
			}
	
		} catch (error) {
			console.error('Error creating tournament:', error);
			throw error;
		}
	}
	
	
	async createMatchInTournament(tournamentId, matchResult, mode) {
		console.log('Creating Match...');
	
		try {
			const response = await fetch('/api/create_match_in_tournament/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'), // Include CSRF token
				},
				body: JSON.stringify({
					tournament_id: tournamentId,
					player1: matchResult.player1,
					player2: matchResult.player2,
					player1_score: matchResult.player1Score,
					player2_score: matchResult.player2Score,
					timestamp: matchResult.timestamp,
					mode: mode,
				}),
			});
	
			if (!response.ok) {
				throw new Error(`Error creating match: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log('Match created successfully:', data);
	
		} catch (error) {
			console.error('Error creating match:', error);
		}
	}
	

	getWinner() {
		const lastMatch = this.matchResult[this.matchResult.length - 1];
		return lastMatch.player1Score > lastMatch.player2Score ? lastMatch.player1 : lastMatch.player2;
	}

	// Tournament End

	async endTournament() {
		const game = this.game;
		this.winner = this.getWinner();
		const score = game.match.score.result;

		HTMLToDiv(`Tournament winner`, 'announcement-l1');
		HTMLToDiv(`is`, 'announcement-mid');
		HTMLToDiv(`${this.winner} !`, 'announcement-l2');
		notDisplayDiv('js-next-game-btn');
		displayDiv('js-score-btn');
		
		try {
			this.tournamentId = await this.createTournament();

			for (let player of this.players) {
				await this.game.createPlayer(player.name);
				await this.addParticipantInTournament(player.name, this.tournamentId);
			}

			console.log('Match Result:', this.matchResult);

			for (let index = 0; index < this.matchResult.length; index++) {
				const currentMatchResult = this.matchResult[index];
				console.log('Match:', index, ': ', currentMatchResult);
				await this.createMatchInTournament(this.tournamentId, currentMatchResult, 'tournament');
			}

		} catch (error) {
			console.error('Error ending tournament:', error);
		}

		this.players = [];
	}

}

export { Tournament };
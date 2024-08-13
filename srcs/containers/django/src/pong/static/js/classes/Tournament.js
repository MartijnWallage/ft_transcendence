import { Player } from './Player.js';
import { Match } from './Match.js';
// import { Remote } from './Remote.js';


class Tournament {

	constructor(game, remote) {
		this.game = game;
		this.remote = remote; // Add this line to store the Remote instance
		this.matchResult = [];
		this.tournamentId = null;
		this.maxPlayers = 1; // Allow only 1 remote player per webpage
        this.isRemotePlayerAdded = false; // Track if a remote player has been added
		this.players = [];
		this.connection = null; // Initialize WebSocket connection
	}

	async checkPlayerCount() {
		return new Promise((resolve, reject) => {
			console.log('Checking player count:', this.players);
		
			// // Log players and their properties
			// this.players.forEach((player, index) => {
			// 	console.log(`Player ${index}:`, player);
			// 	console.log(`Player ${index} isRemote:`, player.isRemote);
			// 	console.log(`Player ${index} connection:`, player.connection);
			// 	console.log(`Player ${index} connection.connection:`, player.connection?.connection);
			// });
			
			const remotePlayer = this.players.find(player => player.isRemote);
			
			// console.log('1. remotePlayer:', remotePlayer);
			// if (remotePlayer) {
			// 	console.log('2. remotePlayer.connection:', remotePlayer.connection);
			// 	if (remotePlayer.connection) {
			// 		console.log('3. remotePlayer.connection.connection:', remotePlayer.connection.connection);
			// 	}
			// }
	
			if (remotePlayer && remotePlayer.connection && remotePlayer.connection.connection) {
				// Set up a one-time listener for the WebSocket message
				const onMessageHandler = (event) => {
					const message = JSON.parse(event.data);
	
					if (message.type === 'player_count') {
						const playerCount = message.count;
						console.log('Number of players received:', playerCount);
	
						// Check if there are enough players
						if (playerCount < 2) {
							resolve({
								success: false,
								message: 'At least 2 players are required to start the tournament.',
							});
						} else {
							resolve({ 
								success: true,
								playerCount // Include playerCount here
							});
						}
	
						// Clean up the event listener
						remotePlayer.connection.connection.removeEventListener('message', onMessageHandler);
					} else {
						console.log(`Unknown message type received: ${message.type}`);
						reject(new Error('Unexpected message type received.'));
					}
				};
	
				// Attach the listener and send the request
				remotePlayer.connection.connection.addEventListener('message', onMessageHandler);
				remotePlayer.connection.connection.send(JSON.stringify({ type: 'get_player_count' }));
			} else {
				resolve({
					success: false,
					message: 'WebSocket connection is not established or no remote player found.',
				});
			}
		});
	}
	
	

	async start() {
		const game = this.game;
		
		// Request the server to check player count
		const response = await this.checkPlayerCount();
		if (!response.success) {
			const error2 = document.getElementById('error2');
			error2.textContent = response.message;
			error2.style.display = 'block';
			return;
		}
	
		// console.log('Starting tournament... with players:', this.players);

		//from server side
		console.log('response.playerCount', response.playerCount);
		//from client side
		console.log('this.players.length', this.players.length);

		// console.log('response.players', response.players);



		// Instead of checking local player count, we use the player count received from the server
		if (response.playerCount < 2) {
			console.error("Not enough players to start the tournament.");
			return;
		}

		

		// console.log('this.players.length', this.players.length);

		let currentPlayers = [this.players[0], this.players[1]];

		try {
			// Load the game page only after all players are ready
			await loadPage('pong');
			console.log('loadPage');
			
			for (let index = 0; index < this.players.length; index++) {
				console.log('before game.match.play');
				game.match = new Match(game, currentPlayers);
				console.log('after game.match.play');

				await game.match.playRemote();
				console.log('game.match.play');


				// Wait for match results
				while (game.match.score.winner === null) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
				console.log('Match winner:', game.match.score.winner);
				console.log('Match Result:', game.match.score.result);
	
				let matchResult = { 
					player1: currentPlayers[0].name, 
					player2: currentPlayers[1].name, 
					player1Score: game.match.score.result[0], 
					player2Score: game.match.score.result[1], 
					timestamp: game.match.timestamp 
				};
	
				this.matchResult.push(matchResult);
	
				if (index + 1 < this.players.length) {
					const loser = game.match.score.winner === 0 ? 1 : 0;
					currentPlayers[loser] = this.players[index + 1];
					console.log(`New player names after match ${index}: ${currentPlayers[0].name} vs ${currentPlayers[1].name}`);
				}
			}
	
			// Ensure that match results are available before ending the tournament
			if (this.matchResult.length > 0) {
				this.endTournament(); // Call endTournament only if match results are available
			}
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}
	


	

	async addPlayer() {
		const playerName = document.getElementById('playerNameInput').value.trim();
		const error = document.getElementById('error');
	
		if (playerName === '') {
			error.textContent = 'Please enter a valid name';
			error.style.display = 'block'; 
			return;
		}
		error.style.display = 'none'; 
	
		if (this.isRemotePlayerAdded && this.players.length > 0) {
			// Validate player name with the server if a remote player has already been added
			try {
				const isValid = await this.validatePlayerNameWithServer(playerName);
				if (!isValid) {
					error.textContent = 'Player name is already taken or invalid';
					error.style.display = 'block'; 
					return;
				}
				error.style.display = 'none'; 
			} catch (error) {
				console.error('Error validating player name:', error);
				return;
			}
		}
	
		const newPlayer = new Player(playerName, true); 
		this.players.push(newPlayer);
		this.isRemotePlayerAdded = true;
	
		this.displayPlayers();
		document.getElementById('js-add-player-btn').style.display = 'none';
		document.getElementById('playerNameInput').style.display = 'none';
	
		// Wait for WebSocket connection to be established
		await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust timeout as needed
	}

	// Function to validate player name with the server
	async validatePlayerNameWithServer(playerName) {
		return new Promise((resolve, reject) => {
			// Assuming you have a WebSocket connection `this.connection`
			if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
				console.error('WebSocket is not connected or not open.');
				reject('WebSocket is not connected');
				return;
			}

			// Create a message to validate the player name
			const validationMessage = JSON.stringify({ type: 'validate_player', name: playerName });
			console.log('Sending validation message:', validationMessage);
        	this.connection.send(validationMessage);
			// Set up an event listener for the response
			const handleResponse = (event) => {
				const message = JSON.parse(event.data);
				if (message.type === 'validation_response') {
					resolve(message.valid);
					this.connection.removeEventListener('message', handleResponse);
				}
			};
			this.connection.addEventListener('message', handleResponse);
			

			// Send the validation message
			this.connection.send(validationMessage);
		});
	}

	displayPlayers() {
		const playerListDiv = document.getElementById('playerList');
		playerListDiv.innerHTML = ''; // Clear existing list

		// this.players.forEach(player => {
        //     const playerElement = document.createElement('div');
        //     playerElement.textContent = player.name;
        //     playerListElement.appendChild(playerElement);
        // });
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
				'timestamp' : matchResult.timestamp
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

	async endTournament() {
		const game = this.game;
	
		// Check if there's a match and if it has a score before accessing it
		if (game.match && game.match.score) {
			const score = game.match.score.result;
			console.log("Final Match Score:", score);
		} else {
			console.warn("No match or score available.");
		}
	
		alert("Tournament Ended!");
	
		try {
			this.tournamentId = await this.createTournament();
	
			for (let player of this.players) {
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

	// Tournament End

	// async endTournament() {
	// 	const game = this.game;
	// 	const score = game.match.score.result;

	// 	alert("Tournament Ended!");
		
	// 	try {
	// 		this.tournamentId = await this.createTournament();

	// 		for (let player of this.players) {
	// 			await this.addParticipant(player.name, this.tournamentId);
	// 		}

	// 		console.log('Match Result:', this.matchResult);

	// 		for (let index = 0; index < this.matchResult.length; index++) {
	// 			const currentMatchResult = this.matchResult[index];
	// 			console.log('Match:', index, ': ', currentMatchResult);
	// 			await this.createMatch(this.tournamentId, currentMatchResult);
	// 		}

	// 	} catch (error) {
	// 		console.error('Error ending tournament:', error);
	// 	}

	// 	this.players = [];
	// }

}

export { Tournament };
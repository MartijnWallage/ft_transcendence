import { Player } from './Player.js';
import { Match } from './Match.js';

class Tournament {
	constructor(game) {
		this.game = game;
		this.matchResult = [];
		this.tournamentId = null;
		this.maxPlayers = 2; // Allow 2 players for the tournament
		this.players = [];
		this.connection = null; // Initialize WebSocket connection
		this.currentPlayerName = null; // Initialize currentPlayerName
        this.startTournamentHandler = this.startTournamentHandler.bind(this);
		this.playerCount = 0;
		this.tournament = null; // Initialize tournament variable
		this.connectToServer();
		this.playerNameSet = false; 
	}

	connectToServer() {
        const serverUrl = 'wss://10.15.203.3:8443/ws/pingpongsocket/';
		console.log(`Attempting to connect to ${serverUrl}`);
        this.connection = new WebSocket(serverUrl);

        this.connection.onopen = () => {
            console.log('WebSocket is connected.');
        };

        this.connection.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(`Received message from server:`, event.data);
            this.handleServerMessage(message);
        };

        this.connection.onerror = (error) => {
            console.error(`${this.name} WebSocket error:`, error);
        };

        this.connection.onclose = () => {
            console.log(`${this.name} disconnected from server`);
        };
    }

	handleServerMessage(data) {
        switch (data.type) {
            case 'player_connected':
                this.handlePlayerConnected(data.players);
                break;

            case 'player_disconnected':
                this.handlePlayerDisconnected(data.players);
                break;
            
            case 'start_tournament':
                this.startremoteGame();
                break;

			// case 'player_count':  // New case for player_count
			// 	this.handlePlayerCount(data.count);
			// 	break;

            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    }


    startremoteGame() {
        // Ensure `this.game` is initialized
        if (!this.game) {
            console.error('Game is not initialized.');
            return;
        }
    
        // Ensure `this.game.match` is properly set up
        try {
            this.game.match = new Match(this.game, this.players); // Ensure `this.players` is correctly set up
            this.game.match.playRemote().then(() => {
                console.log('Game match started successfully.');
            }).catch(error => {
                console.error('Error starting game match:', error);
            });
        } catch (error) {
            console.error('Error initializing match:', error);
        }
    }

    handlePlayerConnected(players) {
		console.log('handlePlayerConnected:', players);
		console.log('handlePlayerConnected:', players.length);


        if (Array.isArray(players)) {
            console.log('Player statuses received:', players);
    
            if (players.length > 16) {
                this.showError('Cannot join, room is full.');
                return;
            }
    
            this.players = players.map(player => new Player(
				player.name,
				player.isRemote,
				player.displayName,
				player.role,
			));

			// Check if the player name has been set
            if (!this.playerNameSet) {
                this.setCurrentPlayerName(`player${players.length}`);
                this.playerNameSet = true; // Update the flag
            }
			
            this.updatePlayerList(this.players);
            this.refreshCurrentPlayer(); // Update currentPlayer information
            this.setupTournamentButton();
			return players;
        } else {
			console.error('Received player_connected message but data.players is not an array:', players);
        }
    }

    handlePlayerDisconnected(players) {
        if (Array.isArray(players)) {
            this.players = players.map(player => ({
                name: player.name,
                displayName: player.name,
                role: player.role,
                isRemote: true,
                stats: {}
            }));
            this.updatePlayerList(this.players);
            this.refreshCurrentPlayer(); // Ensure currentPlayer is updated
        } else {
            console.error('Received player_disconnected message but data.players is not an array:', players);
        }
    }
    
    updatePlayerList(players) {
        const playerListDiv = document.getElementById('playerList');
        if (!playerListDiv) {
            console.error('Player list element not found.');
            return;
        }
        playerListDiv.innerHTML = ''; // Clear existing list

        players.forEach((player, index) => {
            const playerElement = document.createElement('p');
            const playerName = player.name || player.displayName;
            playerElement.textContent = `Player ${index + 1}: ${playerName}`;
            playerListDiv.appendChild(playerElement);
        });
        console.log('Updated player list:', players);
    }


    setCurrentPlayerName(name) {
		console.log('Setting current player name to:', name);
		if (name === undefined || name === null) {
			console.error('Invalid name received:', name);
		}
		this.currentPlayerName = name;
		console.log('currentPlayerName:', this.currentPlayerName);
		this.setupTournamentButton(); // Ensure setupTournamentButton is called after setting current player name
	}

    refreshCurrentPlayer() {
        if (this.currentPlayerName) {
            this.currentPlayer = this.players.find(player => player.name === this.currentPlayerName);
            console.log('Updated current player:', this.currentPlayer);
        } else {
            console.error('Current player name is not set.');
        }
    }

    setupTournamentButton() {
        // const startTournamentBtn = document.getElementById('js-start-tournament-btn').style.display = 'block';
        const startTournamentBtn = document.getElementById('js-start-tournament-btn');

        if (!startTournamentBtn) {
            console.error('Start Tournament button not found.');
            return;
        }
        
        console.log('Players:', this.players); // Debugging line
        console.log('Current player name:', this.currentPlayerName); // Log the current player name

        this.refreshCurrentPlayer(); // Ensure currentPlayer is up-to-date

        if (!this.currentPlayer) {
            console.error('Current player not found.');
            return;
        }

        if (this.currentPlayer.role === 'player1') {
            startTournamentBtn.style.display = 'block'; // Show the button for player1
        	this.boundStartTournamentHandler = this.startTournamentHandler.bind(this);
            startTournamentBtn.removeEventListener('click', this.startTournamentHandler);
            startTournamentBtn.addEventListener('click', this.startTournamentHandler);        
        } else {
            startTournamentBtn.style.display = 'none'; // Hide the button for others
        }
    }


    async startTournamentHandler() {
        try {
            const response = await this.checkPlayerCount();
            if (!response.success) {
                console.error('Error fetching player count:', response.message);
                return;
            }

            let currentPlayers = [this.players[0], this.players[1]];

            if (!(currentPlayers[0] instanceof Player) || !(currentPlayers[1] instanceof Player)) {
                console.error('Players must be instances of Player class.');
                return;
            }

            console.log('Current Players:', currentPlayers);

            await loadPage('pong');
            console.log('loadPage');

            try {
                this.game.match = new Match(this.game, currentPlayers);
                await this.game.match.playRemote();
                console.log('game.match.playRemote');

                while (this.game.match.score.winner === null) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                console.log('Match winner:', this.game.match.score.winner);
                console.log('Match Result:', this.game.match.score.result);

                let matchResult = { 
                    player1: currentPlayers[0].name, 
                    player2: currentPlayers[1].name, 
                    player1Score: this.game.match.score.result[0], 
                    player2Score: this.game.match.score.result[1], 
                    timestamp: this.game.match.timestamp 
                };

                this.matchResult.push(matchResult);

                if (this.matchResult.length > 0) {
                    await this.endTournament();
                }
            } catch (error) {
                console.error('Error starting game:', error);
            }
        } catch (error) {
            console.error('Error in startTournamentHandler:', error);
        }
    }


    showError(message) {
        const errorElement = document.getElementById('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            console.error('Error element not found.');
        }
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















	// async start() {
		

		
	// 	// Request the server to check player count
	// 	const response = await this.checkPlayerCount();
	// 	if (!response.success) {
	// 		const error2 = document.getElementById('error2');
	// 		error2.textContent = response.message;
	// 		error2.style.display = 'block';
	// 		return;
	// 	}
	

	// 	//from server side
	// 	console.log('response.playerCount', response.players);

	// 	//from client side
	// 	console.log('this.players.length', this.players.length);

	// 	console.log('response.player1', response.players[0]);
	// 	console.log('response.player1', response.players[1]);

	// 	let currentPlayers = [this.players[0], this.players[1]];
		
	// 	// currentPlayers[1] = this.players[1];

	// 	// Debugging
	// 	console.log('Type of currentPlayers[0]:', typeof currentPlayers[0]);
	// 	console.log('Type of currentPlayers[1]:', typeof currentPlayers[1]);
	// 	console.log('currentPlayers[0]:', currentPlayers[0]);
	// 	console.log('currentPlayers[1]:', currentPlayers[1]);
	
	// 	if (!(currentPlayers[0] instanceof Player) || !(currentPlayers[1] instanceof Player)) {
	// 		console.error('Players must be instances of Player class.');
	// 		return;
	// 	}
	
	// 	console.log('Current Players:', currentPlayers);

	// 	// response.playerCount[1] = this.players[1];
	// 	try{
	// 		// Load the game page only after all players are ready
	// 		await loadPage('pong');
	// 		console.log('loadPage');
			
	// 		// for (let index = 0; index < this.players.length; index++) 
			
	// 		console.log('before game.match.playRemote');
	// 		try {
	// 			this.game.match = new Match(this.game, currentPlayers);
	// 			// Rest of the method implementation...
	// 		} catch (error) {
	// 			console.error('Error starting game:', error);
	// 		}
	// 		console.log('after game.match.playRemote');

	// 		await this.game.match.playRemote();
	// 		console.log('game.match.playRemote');


	// 		// Wait for match results
	// 		while (this.game.match.score.winner === null) {
	// 			await new Promise(resolve => setTimeout(resolve, 100));
	// 		}
	// 		console.log('Match winner:', this.game.match.score.winner);
	// 		console.log('Match Result:', this.game.match.score.result);

	// 		let matchResult = { 
	// 			player1: currentPlayers[0].name, 
	// 			player2: currentPlayers[1].name, 
	// 			player1Score: this.game.match.score.result[0], 
	// 			player2Score: this.game.match.score.result[1], 
	// 			timestamp: this.game.match.timestamp 
	// 		};

	// 		this.matchResult.push(matchResult);

	// 		if (index + 1 < this.players.length) {
	// 			const loser = this.game.match.score.winner === 0 ? 1 : 0;
	// 			currentPlayers[loser] = this.players[index + 1];
	// 			console.log(`New player names after match ${index}: ${currentPlayers[0].name} vs ${currentPlayers[1].name}`);
	// 		}
			

	// 		// Ensure that match results are available before ending the tournament
	// 		if (this.matchResult.length > 0) {
	// 			this.endTournament(); // Call endTournament only if match results are available
	// 		}
	// 	}
	// 	catch {}
	// }
	
	checkPlayerCount() {
		return new Promise((resolve, reject) => {
			if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
				console.error('WebSocket connection is not open.');
				reject({ success: false, message: 'WebSocket connection is not open' });
				return;
			}
	
			// Send a request to get the player count
			const requestMessage = JSON.stringify({ type: 'get_player_count' });
			this.connection.send(requestMessage);
	
			// Handle the server's response
			const handleResponse = (event) => {
				const message = JSON.parse(event.data);
				if (message.type === 'player_count_response') {
					// Return the player count to the caller
					resolve({ success: true, count: message.count });
					this.connection.removeEventListener('message', handleResponse);
				} else {
					console.error('Unexpected message type:', message.type);
					reject({ success: false, message: 'Unexpected message type' });
				}
			};
	
			this.connection.addEventListener('message', handleResponse);
		});
	}
	
	

	// async generatePlayerName() {
	// 	try {
			
	// 		// Fetch player count from the server
	// 		const playerCount = await this.checkPlayerCount();
			
	// 		if (!playerCount.success) {
	// 			throw new Error('Failed to get player count');
	// 		}
	
	// 		// Calculate new player number
	// 		const newPlayerNumber = playerCount + 1; // Assuming 1-based indexing
	// 		return `Player${newPlayerNumber}`;
	// 	} catch (error) {
	// 		console.error('Error generating player name:', error);
	// 		return 'Player1'; // Fallback name
	// 	}
	// }
	


	// async addPlayer() {
	// 	// const playerName = document.getElementById('playerNameInput').value.trim();
	// 	// this.connectToServer();
		
	// 	const playerName = await this.generatePlayerName();
	// 	// const playerRole = this.generatePlayerRole();

	// 	const error = document.getElementById('error');

	// 	console.log('Attempting to add player with name:', playerName);
	
	// 	if (playerName === '') {
	// 		console.log('Invalid player name provided.');
	// 		error.textContent = 'Please enter a valid name';
	// 		error.style.display = 'block'; 
	// 		return;
	// 	}
	// 	error.style.display = 'none'; 
	
	// 	if (this.players.length > 0) {
	// 		console.log('Remote player already added, validating player name with server.');
	// 		// Validate player name with the server if a remote player has already been added
	// 		try {
	// 			const isValid = await this.validatePlayerNameWithServer(playerName);
	// 			console.log('Player name validation result:', isValid);
	// 			if (!isValid) {
	// 				console.log('Player name is already taken or invalid.');
	// 				error.textContent = 'Player name is already taken or invalid';
	// 				error.style.display = 'block'; 
	// 				return;
	// 			}
	// 			// error.style.display = 'none'; 
	// 		} catch (error) {
	// 			console.error('Error validating player name:', error);
	// 			return;
	// 		}
	// 	}
	// 	console.log('Creating new player instance for:', playerName);
	// 	// const newPlayer = new Player(playerName, true); 
	// 	const newPlayer = new Player(
	// 		playerName, // name
	// 		true,       // isRemote
	// 		playerName,  // displayName (optional, default is the same as name)
	// 		playerName,     // role (default value, adjust as needed)
	// 	);
	// 	console.log('New player:', newPlayer);
		


	// 	console.log('Adding new player to the players list.');
	// 	this.players.push(newPlayer);

	// 	console.log('check newPlayer', newPlayer);



	// 	console.log('Updating internal state and UI.');

	
	// 	this.displayPlayers();
	// 	document.getElementById('js-add-player-btn').style.display = 'none';
	// 	document.getElementById('playerNameInput').style.display = 'none';
			
	// 	// Initialize Remote here
	// 	// await this.initializeRemote(playerName);

	// 	// Wait for WebSocket connection to be established
	// 	await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust timeout as needed
	// }

	async validatePlayerNameWithServer(playerName) {
		return new Promise((resolve, reject) => {
			if (!this.remote) {
				console.error('WebSocket is not connected or not open.');
				reject('WebSocket is not connected');
				return;
			}

			const validationMessage = JSON.stringify({ type: 'validate_player', name: playerName });
			console.log('Sending validation message:', validationMessage);

			const handleResponse = (event) => {
				const message = JSON.parse(event.data);
				if (message.type === 'validation_response') {
					resolve(message.valid);
					this.remote.connection.connection.removeEventListener('message', handleResponse);
				}
			};

			this.remote.connection.connection.addEventListener('message', handleResponse);
			this.remote.connection.connection.send(validationMessage);
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

	
}

export { Tournament };
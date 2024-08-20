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
		this.pageLoadedPromise = null;
        this.pageLoadedResolve = null;
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

        this.connection.onclose = (event) => {
            console.error('WebSocket closed:', event);
			// Add more detailed information
			console.log('Code:', event.code);
			console.log('Reason:', event.reason);
			console.log('Was Clean:', event.wasClean);
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

			case 'load_page':
				this.handleLoadPage(data.player);
				break;
			
			case 'enter_acknowledged':
				this.enterPressed(data.player);
				break;
			



            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    }


	enterPressed(playerName) {
		console.log(`${playerName} is ready`);
	}
	

	handleLoadPage(playerName) {
		console.log('handleLoadPage called with playerName:', playerName);
		console.log('Current player name:', this.currentPlayerName);
	
		if (this.currentPlayerName) {
			console.log('Loading page for:', this.currentPlayerName);
	
			// Create a new promise for page loaded
            this.pageLoadedPromise = new Promise((resolve) => {
                this.pageLoadedResolve = resolve;
            });

			window.loadPage('pong').then(() => {
				console.log('Page loaded successfully');
				// this.sendPageLoadedMessage();
			}).catch(error => {
				console.error('Error loading page:', error);
			});
		} else {
			console.error('Current player name is not set. Cannot load page.');
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
		if (name && typeof name === 'string') {
			console.log('Setting current player name to:', name);
			this.currentPlayerName = name;
			console.log('currentPlayerName:', this.currentPlayerName);
			this.setupTournamentButton(); // Ensure setupTournamentButton is called after setting current player name
		} else {
			console.error('Invalid name received:', name);
		}
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
            // const response = await this.checkPlayerCount();
            // if (!response.success) {
            //     console.error('Error fetching player count:', response.message);
            //     return;
            // }
			if (this.pageLoadedPromise) {
                await this.pageLoadedPromise;
            }
            
			let currentPlayers = [this.players[0], this.players[1]];

            if (!(currentPlayers[0] instanceof Player) || !(currentPlayers[1] instanceof Player)) {
                console.error('Players must be instances of Player class.');
                return;
            }
            console.log('this.game:', this.game);
            console.log('Current Players:', currentPlayers);

            console.log('this.connection:', this.connection);

            // await loadPage('pong');
            // console.log('loadPage');

            try {
				this.game.connection = this.connection;
                // this.game.match = new Match(this.game, currentPlayers, this.connection);
                const match = new Match(this.game, currentPlayers, this.connection);
				this.game.match = match;

                // this.game.match = this.connection;
                console.log('before: game.match.playRemote');

				await match.playRemote();
				// await this.game.match.playRemote();

                console.log('after: game.match.playRemote');










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



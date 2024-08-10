import { Player } from './Player.js';
import { Tournament } from './Tournament.js';


class Remote {
    constructor(playerName) {
		this.name = playerName;
		this.connection = null; // WebSocket connection
        this.players = []; // Initialize players as an empty array
    }

    connectToServer() {
		
			const serverUrl = 'wss://10.15.109.3:8443/ws/pingpongsocket/'; // Hardcoded WebSocket URL
			this.connection = new WebSocket(serverUrl);

			this.connection.onopen = () => {
				console.log('WebSocket is connected.');
			};

			this.connection.onmessage = (event) => {
				const message = JSON.parse(event.data);
				console.log(`Received message from server:`, message);
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
            case 'players_ready':
                // Ensure the players array from the message is assigned to this.players
                if (data.players) {
                    this.players = data.players;
                    this.updatePlayerList(this.players);

                    // // Check if all players are ready
                    // if (this.players.length > 0) {
                    //     const allPlayersReady = this.players.length === this.players.length;
                    //     if (allPlayersReady) {
                    //         console.log('All players are ready. Transitioning to the game page.');
                    //         loadPage('pong'); // Force transition to the game page
                    //     }
                    // } else {
                    //     console.error('Received players_ready message, but no players array was provided.');
                    // }
                }
                break;

			case 'player_disconnected':
				// Update the player list to remove the disconnected player
				this.updatePlayerList(data.players);
				break;



            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    }

	updatePlayerList(players) {
        const playerListDiv = document.getElementById('playerList');


        // Clear existing players to avoid duplication
        playerListDiv.innerHTML = ''; // Clear existing list

        players.forEach((player, index) => {
            // Add new player to the DOM
            const playerElement = document.createElement('p');
            playerElement.textContent = `Player ${index + 1}: ${player.role}`;
            playerListDiv.appendChild(playerElement);
        });
        console.log('Updated player list:', players);
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

}

export { Remote };

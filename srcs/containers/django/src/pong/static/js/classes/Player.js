import { AI } from './AI.js';

class Player {
	constructor(name, isRemote = false) {
		this.name = name;
		this.ai = null;
		this.isRemote = isRemote;
		this.connection = null; // WebSocket connection for remote player

		this.stats = {
			wins: 0,
			losses: 0,
		};

		if (this.isRemote) {
            this.connectToServer(); // Automatically connect if remote
        }
	}

	setAI(game) {
		this.ai = new AI(game);
	}

	isAI() {
		return this.ai !== null;
	}


	connectToServer() {
		if (this.isRemote) {
			const serverUrl = 'wss://10.15.109.3:8443/ws/pingpongsocket/'; // Hardcoded WebSocket URL
			this.connection = new WebSocket(serverUrl);

			this.connection.onopen = () => {
				console.log(`${this.name} connected to server`);
				this.connection.send(JSON.stringify({ type: 'join', name: this.name }));
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
	}

    handleServerMessage(message) {
        switch (message.type) {
            case 'players_ready':
                // Update the player list on the page
                this.updatePlayerList(message.players);
                break;
			case 'player_disconnected':
				// Update the player list to remove the disconnected player
				this.updatePlayerList(message.players);
				break;
            case 'registration_status':
                if (message.status === 'already_registered') {
                    this.showError('You are already registered.');
                } else if (message.status === 'registered') {
                    console.log(`Player ${message.player_name} successfully registered.`);
                }
                break;
            default:
                console.log(`Unknown message type: ${message.type}`);
        }
    }

	updatePlayerList(players) {
        const playerListDiv = document.getElementById('playerList');
        playerListDiv.innerHTML = ''; // Clear existing list

        players.forEach((player, index) => {
            const playerElement = document.createElement('p');
            playerElement.textContent = `Player ${index + 1}: ${player.role}`;
            playerListDiv.appendChild(playerElement);
        });
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

export { Player };


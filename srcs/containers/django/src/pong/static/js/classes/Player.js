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
		// Handle messages received from the server
		switch (message.type) {
			case 'startMatch':
				// Handle match start
				console.log(`${this.name} match started.`);
				break;
			case 'matchResult':
				// Handle match result
				console.log(`${this.name} received match result.`);
				break;
			default:
				console.log(`Unknown message type: ${message.type}`);
		}
	}

	sendMessage(message) {
		if (this.connection && this.connection.readyState === WebSocket.OPEN) {
			this.connection.send(JSON.stringify(message));
		}
	}
}

export { Player };


// Remote.js
// import { Tournament } from './Tournament.js';

class Remote {
    constructor(playerName) {
        this.name = playerName;
        this.connection = null;
        this.players = [];
        this.game = null; // Set this in connectToServer if needed
        this.Tournament = null; // Will be linked from outside
    }

    connectToServer() {
        const serverUrl = 'wss://10.15.109.3:8443/ws/pingpongsocket/';
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
            case 'players_ready':
                if (data.players && Array.isArray(data.players)) {
                    console.log('Player statuses received:', data.players);
                    this.players = data.players;    
                    this.updatePlayerList(this.players);
                    if (this.players.length >= 2 && this.Tournament) {
                        this.Tournament.players = this.players;  
                        this.Tournament.start(); 
                    }
                } else {
                    console.error('Received players_ready message but data.players is not an array:', data.players);
                }
                break;

            case 'player_disconnected':
                if (data.players && Array.isArray(data.players)) {
                    this.players = data.players; 
                    this.updatePlayerList(data.players);
                } else {
                    console.error('Received player_disconnected message but data.players is not an array:', data.players);
                }
                break;

            default:
                console.log(`Unknown message type: ${data.type}`);
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
        console.log('Updated player list:', players);
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

export { Remote };

// // import { Player } from './Player.js';
// import { Tournament } from './Tournament.js';
// import { Game } from './Game.js';



// class Remote {
//     constructor(playerName, game) {
// 		this.name = playerName;
// 		this.connection = null; // WebSocket connection
//         this.players = []; // Initialize players as an empty array
//         this.game = game; // Store the `game` instance
//         this.Tournament = new Tournament(game); // Initialize Tournament with the game instance
//     }

//     connectToServer() {
		
// 			const serverUrl = 'wss://10.15.109.3:8443/ws/pingpongsocket/'; // Hardcoded WebSocket URL
// 			this.connection = new WebSocket(serverUrl);

// 			this.connection.onopen = () => {
// 				console.log('WebSocket is connected.');
// 			};

// 			this.connection.onmessage = (event) => {
// 				const message = JSON.parse(event.data);
// 				console.log(`Received message from server:`, event.data);
// 				this.handleServerMessage(message);
                
// 			};

// 			this.connection.onerror = (error) => {
// 				console.error(`${this.name} WebSocket error:`, error);
// 			};

// 			this.connection.onclose = () => {
// 				console.log(`${this.name} disconnected from server`);
// 			};
		
// 	}

//     handleServerMessage(data) {
//         switch (data.type) {
//             case 'players_ready':
//                 if (data.players && Array.isArray(data.players)) {
//                     // Ensure the players array from the message is assigned to this.players
//                     console.log('Player statuses received:', data.players);
//                     this.players = data.players;    
//                     this.updatePlayerList(this.players);
//                     if (this.players.length >= 2) {
//                         this.Tournament.players = this.players;  // Ensure Tournament players are updated
//                         this.Tournament.start(); 
//                     }
//                 } else {
//                     console.error('Received players_ready message but data.players is not an array:', data.players);
//                 }
//                 break;

// 			case 'player_disconnected':
// 				if (data.players && Array.isArray(data.players)) {
//                     this.players = data.players; 
//                     this.updatePlayerList(data.players);
//                 } else {
//                     console.error('Received player_disconnected message but data.players is not an array:', data.players);
//                 }
// 				break;

            



//             default:
//                 console.log(`Unknown message type: ${data.type}`);
//         }
//     }

// 	updatePlayerList(players) {
//         const playerListDiv = document.getElementById('playerList');


//         // Clear existing players to avoid duplication
//         playerListDiv.innerHTML = ''; // Clear existing list

//         players.forEach((player, index) => {
//             // Add new player to the DOM
//             const playerElement = document.createElement('p');
//             playerElement.textContent = `Player ${index + 1}: ${player.role}`;
//             playerListDiv.appendChild(playerElement);
//         });
//         console.log('Updated player list:', players);
//     }

//     showError(message) {
//         const errorElement = document.getElementById('error');
//         errorElement.textContent = message;
//         errorElement.style.display = 'block';
//     }

// }

// export { Remote };

// document.addEventListener('DOMContentLoaded', () => {
//     const playerName = 'PlayerName'; // You can get this from the user input or another source
//     const game = new Game(); // Initialize your Game class

//     const remote = new Remote(playerName, game); // Initialize the Remote class
//     remote.connectToServer(); // Connect to the server

//     // If you want to automatically start adding players or the tournament
//     const tournament = new Tournament(game); // Initialize the Tournament class
//     remote.Tournament = tournament; // Link the Remote instance to the Tournament instance
// });

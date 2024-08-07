// import { gameState } from './game-state.js';

// import { gameState } from './game-state.js';

// import { startGame } from './start-end-game.js';
// import { ball, updateLocalGameState } from './update.js';
// import { endTournament } from './tournament-end.js';


// async function startGameUserVsUserremote() {
//     const error = document.getElementById('error');

//     // Clear any previous error messages
//     if (error) {
//         error.style.display = 'none';
//     }

//     try {
//         // Load the game page
//         await loadPage('pong');

//         // Initialize the WebSocket connection
//         initializeWebSocket();
	
// 	} catch (err) {
//         console.error('Error starting game:', err);
// 		if (error) {
//             error.style.display = 'block';
//             error.textContent = 'Error starting the game. Please try again.';
//         }
// 	}
// } 

// let pingpongsocket = null;

// function initializeWebSocket() {
//     // This message will be printed when the WebSocket is created
// 	console.log('Creating a new WebSocket connection...'); 
// 	pingpongsocket = new WebSocket('wss://10.15.109.3:8443/ws/pingpongsocket/');
    
//     pingpongsocket.onopen = function() {
//         console.log('WebSocket is connected.');
// 		initiateRemotePlay();

//     };

//     pingpongsocket.onmessage = function(event) {
//         try {
//             const data = JSON.parse(event.data);
//             console.log('Message from server:', data);
//             handleServerMessage(data); // Ensure data is passed to handleServerMessage
//         } catch (error) {
//             console.error('Error parsing message from server:', error);
//         }
//     };

//     pingpongsocket.onclose = function(event) {
//         console.log('WebSocket is closed.');
//     };

//     pingpongsocket.onerror = function(error) {
//         console.error('WebSocket error: ', error);
//     };
// }


// function handleServerMessage(data) {

//     if (data.type === 'players_ready') {
//         console.log('Player statuses received:', data.players);

// 		// Check and set game state
//         if (!Array.isArray(data.players) || data.players.length !== 2) {
//             console.error('Invalid player data received.');
//             return;
//         }

//         gameState.players = data.players.map((player) => 
//             player.role === 'first' ? 'Player 1' : 'Player 2'
//         );

//         console.log('Current gameState.players:', gameState.players);

//         if (data.players.length === 2 && !gameState.gameStarted) {
//             console.log('Both players are ready. Starting the game.');
// 			gameState.gameStarted = true;
// 			startGame(gameState.players[0], gameState.players[1], 'remote');  
//         } else {
//             console.log('Waiting for both players to be ready...');
//         }
//     } else if (data.type === 'player_disconnected') {
//         console.log('A player has disconnected. Current players:', data.players);
//         // Handle player disconnection if needed
//     } else if (data.type === 'game_update') {
//         console.log('Game update received:', data.game_state);
//         updateLocalGameState(data.game_state); // Sync local game state
//     } else {
//         console.log('Unhandled message type:', data.type);
//     }
// }


// function initiateRemotePlay() {
//     const message = { type: 'initiate_remote_play' };
//     sendMessageToWebSocket(message);
// }


// function players_ready() {
// 	const message = { type: 'player_ready', data: {} };
// 	sendMessageToWebSocket(message);
// }

// function sendMessageToWebSocket(message) {
// 	if (pingpongsocket && pingpongsocket.readyState === WebSocket.OPEN) {
// 		pingpongsocket.send(JSON.stringify(message));
// 		console.log('Message sent:', message);
// 	} else {
// 		console.error('WebSocket is not open to send messages. Retrying...');
// 		setTimeout(() => sendMessageToWebSocket(message), 1000); // Retry after 1 second
// 	}
// }

// export { startGameUserVsUserremote, initiateRemotePlay, initializeWebSocket, handleServerMessage, players_ready, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };



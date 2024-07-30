import { gameState } from './game-state.js';
import { startGame } from './start-end-game.js';
import { ball} from './update.js';
import {endTournament} from './tournament-end.js';

let pingpongSocket;


function initializeWebSocket() {
    pingpongSocket = new WebSocket('wss://10.15.106.3:8443/ws/pingpongsocket/');
    
    pingpongSocket.onopen = function(event) {
        console.log('WebSocket is connected.');
        // You can send a message to the server upon connection if needed
        // pingpongSocket.send(JSON.stringify({ type: 'INIT', data: 'Some data' }));
    };

    pingpongSocket.onmessage = function(event) {
        console.log('Message from server ', event.data);
        handleServerMessage(data);
        // Handle incoming messages from the server
    };

    pingpongSocket.onclose = function(event) {
        console.log('WebSocket is closed.');
    };

    pingpongSocket.onerror = function(error) {
        console.error('WebSocket error: ', error);
    };
}

function handleServerMessage(data) {
    switch (data.type) {
        case 'players_ready':
            if (data.role === 'first') {
                document.getElementById('player1-status').textContent = "Player 1: Ready!";
            } else if (data.role === 'second') {
                document.getElementById('player2-status').textContent = "Player 2: Ready!";
            }
            if (data.role === 'first' || data.role === 'second') {
                startGame(gameState.players[0], gameState.players[1], 'online');
            }
            break;
        case 'player_action':
            // Handle actions sent from the server, such as updates to the game state
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

document.getElementById('continueButton').addEventListener('click', () => {
    // Code to handle the continue button click, e.g., sending a message to the server to start or continue the game
});

function addPlayer() {
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
	gameState.players.push(playerName);
	displayPlayers();
	document.getElementById('playerNameInput').value = '';
}

function nextGame() {
	gameState.running = true;
	gameState.currentGameIndex += 1;
	console.log('Game index:', gameState.currentGameIndex);
	console.log('Match order length:', gameState.matchOrder.length);
	if (gameState.currentGameIndex > gameState.matchOrder.length) {
		endTournament();
		return ;
	}
	const player1 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]];
	const player2 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]];
	console.log('Next match:', player1, 'vs', player2);
	startGame(player1, player2, 'tournament');
}

function displayPlayers() {
	const playerListDiv = document.getElementById('playerList');
	playerListDiv.innerHTML = ''; // Clear existing list
	console.log('Players:', gameState.players);
	gameState.players.forEach(player => {
		let index = gameState.players.indexOf(player) + 1;
		let name = player;
		const playerElement = document.createElement('p');
		playerElement.textContent = `Player ${index}: ${name}`;
		playerListDiv.appendChild(playerElement);
	});
}

function matchOrderInit() {
	for (let i = 0; i < gameState.players.length; i++) {
		for (let j = i + 1; j < gameState.players.length; j++) {
			gameState.matchOrder.push([i, j]);
		}
	}
	console.log('Match order:', gameState.matchOrder);
}

function scoreBoardInit() {
	for (let i = 0; i < gameState.players.length; i++) {
		gameState.scoreBoard.push(0);
	}
}

function initializeTournament() {
    initializeWebSocket();
	console.log('Players:', gameState.players); 
    // Set up initial state for the tournament
	matchOrderInit();    
	scoreBoardInit();
	nextGame();
	console.log('Players length:', gameState.players.length);
}


function displayScoreTournament() {
	displayScore();
	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} Score: ` + gameState.playerScores[0], 20, 30);
	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} Score: ` + gameState.playerScores[1], canvas.width - 180, 30);
}

function updateScoreTournament() {
	if (ball.x < 0) {
		gameState.playerScores[0] += 1;
		ball.resetBall();
	} else if (ball.x + ball.width > canvas.width) {
		gameState.playerScores[1] += 1;
		ball.resetBall();
	}

	if (gameState.playerScores[0] === gameState.scoreToWin || gameState.playerScores[1] === gameState.scoreToWin) {
		if (gameState.playerScores[0] == gameState.scoreToWin) {
			setTimeout(function() {
				alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} wins!`);
			}
			, 100);
			return false;
		}
		else {
			setTimeout(function() {
				alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} wins!`);
			}
			, 100);
			return false;
		}
	}
	return true;
}

export { addPlayer, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };















// let pingpongsocket = null; // Define pingpongsocket globally
// let is_first_player = false;
// let is_player_ready = false;
// let is_opponent_ready = false;

// function initializepingpongWebSocket() {
    
//     pingpongsocket = new WebSocket('wss://10.15.106.3:8443/ws/pingpongsocket/');
    
//     pingpongsocket.onopen = function(event) {
//         console.log('WebSocket connection opened');
//         // Assuming you need to send an 'initiate_remote_play' message to start
//         initiateRemotePlay();
//     };

//     pingpongsocket.onmessage = function(event) {
//         const data = JSON.parse(event.data);
//         console.log('Message from server:', data);

//         if (data.type === 'players_ready') {
//             is_opponent_ready = true;
//             console.log('Both players are ready to start the game.');
//             if (is_player_ready && is_opponent_ready) {
//                 startRemoteGame('Player 1', 'Player 2', 'remote', is_first_player);
//             }
//         } else if (data.type === 'game_state') {
//             updateGameState(data.state);
//         }
//     };

//     pingpongsocket.onclose = function(event) {
//         console.log('WebSocket connection closed');
//         // handleWebSocketClose();
//         // Set a timeout to attempt reconnecting after 15 seconds
//         // setReconnectTimeout();
//     };
// }

// function selectGameMode(mode) {
//     if (mode === 'remote') {
//         document.getElementById('gameModeSelection').style.display = 'none';
//         document.getElementById('remotePlay').style.display = 'block';
//         document.getElementById('chatContainer').style.display = 'block'; // Show chat room
//         initializechatWebSocket();
//         initializepingpongWebSocket();

//         // Set is_first_player based on user's role
//         is_first_player = true; // This player is the first player

//     }
// }

// function cancelRemotePlay() {
//     document.getElementById('remotePlay').style.display = 'none';
//     document.getElementById('gameModeSelection').style.display = 'block';
//     if (pingpongsocket) {
//         pingpongsocket.close(); // Close the WebSocket connection when canceling remote play
//     }  
// }

// function initiateRemotePlay() {
//     const message = { type: 'initiate_remote_play', role: 'first' }; // Adjust 'role' as needed
//     sendMessageToWebSocket(message);
// }

// function actionData(data) {
//     // data parameter contains the incoming message data
//     if (data.type === 'game_state') {
//         updateGameState(data.state); // Update game state based on received data
//     } else {
//         console.error('Unknown message type received:', data.type);
//     }
// }


// function sendMessageToWebSocket(message) {
//     if (pingpongsocket && pingpongsocket.readyState === WebSocket.OPEN) {
//         pingpongsocket.send(JSON.stringify(message));
//         console.log('Message sent:', message);
//     } else {
//         console.error('WebSocket is not open to send messages. Retrying...');
//         setTimeout(() => sendMessageToWebSocket(message), 1000); // Retry after 1 second
//     }
// }


// function sendGameState() {
//     const state = {
//         player1: { x: player1.x, y: player1.y },
//         player2: { x: player2.x, y: player2.y },
//         ball: { x: ball.x, y: ball.y },
//         player1Score: player1Score,
//         player2Score: player2Score
//     };
//     const message = { type: 'game_state', state: state };
//     sendMessageToWebSocket(message);
// }

// function sendPlayerAction(actionData) {
//     const message = {
//         type: 'player_action',
//         data: actionData
//     };
//     if (pingpongsocket.readyState === WebSocket.OPEN) {
//         pingpongsocket.send(JSON.stringify(message));
//     } else {
//         console.error('WebSocket is not open to send messages.');
//     }
// }

// document.addEventListener('DOMContentLoaded', function() {
//     const remotePlayButton = document.getElementById('remotePlay');
//     if (remotePlayButton) {
//         remotePlayButton.style.display = 'none'; // Ensure the remotePlay div is visible
//     } else {
//         console.error('Remote play button container not found in the DOM.');
//     }
// });


// function startRemoteGame(player1Name, player2Name, mode, isFirstPlayer) {
//     console.log(`Starting remote game with ${player1Name} and ${player2Name} in ${mode} mode. First player: ${isFirstPlayer}`);
//     isPlayerFirst = isFirstPlayer;
//     // document.getElementById('gameButtons').style.display = 'block';
//     // document.getElementById('pongCanvas').style.display = 'block';
//     gameMode = mode;
//     gameLoop(); // Assuming gameLoop is defined somewhere else
    
// }

// function players_ready() {
//     const message = { type: 'player_ready', data: {} };
//     sendMessageToWebSocket(message);
//     is_player_ready = true;
// }

// function updateGameState(state) {
//     player1.x = state.player1.x;
//     player1.y = state.player1.y;
//     player2.x = state.player2.x;
//     player2.y = state.player2.y;
//     ball.x = state.ball.x;
//     ball.y = state.ball.y;
//     player1Score = state.player1Score;
//     player2Score = state.player2Score;
// }

// const canvas = document.getElementById("pongCanvas");
// const ctx = canvas.getContext("2d");

// // Paddle properties
// const paddleWidth = 14, paddleHeight = 80, paddleSpeed = 6;
// const player1 = { x: 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
// const player2 = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };

// // Ball properties
// const ballSize = 14;
// const ball = { x: canvas.width / 2, y: canvas.height / 2, width: ballSize, height: ballSize, dx: -7, dy: 6 };

// // Score
// let player1Score = 0, player2Score = 0;

// // Key controls
// let keys = {};
// document.addEventListener("keydown", (event) => { keys[event.key] = true; });
// document.addEventListener("keyup", (event) => { keys[event.key] = false; });

// // Game mode
// let gameMode = '';

// // Draw functions

// function drawRect(x, y, width, height, color) {
//     ctx.fillStyle = color;
//     ctx.fillRect(x, y, width, height);
// }

// function drawPaddle(paddle) {
//     drawRect(paddle.x, paddle.y, paddle.width, paddle.height, "white");
// }

// function drawBall(ball) {
//     drawRect(ball.x, ball.y, ball.width, ball.height, "white");
// }

// function drawNet() {
//     for (let i = 0; i < canvas.height; i += 20) {
//         drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
//     }
// }

// function displayScore() {
//     ctx.font = "20px Arial";
//     ctx.fillStyle = "white";
//     ctx.fillText("Player 1 Score: " + player1Score, 20, 30);
//     ctx.fillText("Player 2 Score: " + player2Score, canvas.width - 180, 30);
// }

// // Update functions

// function updatePaddle(paddle) {
//     paddle.y += paddle.dy;
//     if (paddle.y < 0) paddle.y = 0;
//     if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;
// }

// function updateBall() {
//     ball.x += ball.dx;
//     ball.y += ball.dy;

//     if (ball.y < 0 || ball.y + ball.height > canvas.height) {
//         ball.dy *= -1; // Bounce off top and bottom
//     }

//     let paddle = (ball.dx < 0) ? player1 : player2;

//     if (ball.x < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height + ball.height / 2 ||
//         ball.x + ball.width > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height + ball.height / 2) {
//         ball.dy = (ball.y - (paddle.y + paddle.height / 2)) * 0.25;
//         ball.dx *= -1; // Bounce off paddles
//     }
// }

// function updateScore() {
//     if (ball.x < 0) {
//         player2Score += 1;
//         resetBall();
//     } else if (ball.x + ball.width > canvas.width) {
//         player1Score += 1;
//         resetBall();
//     }

//     if (player1Score == 10 || player2Score == 10) {
//         if (player1Score == 10) {
//             alert("Player 1 wins!");
//         } else {
//             alert("Player 2 wins!");
//         }
//         player1Score = 0;
//         player2Score = 0;
//     }
// }

// function resetBall() {
//     ball.x = canvas.width / 2;
//     ball.y = canvas.height / 2;
//     ball.dx *= -1; // Change ball direction
//     ball.dy = ball.dx / 2;
// }

// // Control paddles
// function movePaddles() {
//     // Player 1 controls
//     if (keys["w"]) player1.dy = -paddleSpeed;
//     else if (keys["s"]) player1.dy = paddleSpeed;
//     else player1.dy = 0;

//     // Player 2 controls
//     if (gameMode === 'user-vs-user') {
//         if (keys["ArrowUp"]) player2.dy = -paddleSpeed;
//         else if (keys["ArrowDown"]) player2.dy = paddleSpeed;
//         else player2.dy = 0;
//     } else if (gameMode === 'user-vs-computer') {
//         // Simple AI for computer
//         if (player2.y + player2.height / 2 < ball.y) {
//             player2.dy = paddleSpeed;
//         } else {
//             player2.dy = -paddleSpeed;
//         }
//     }

//     updatePaddle(player1);
//     updatePaddle(player2);
// }

// // Main loop

// function gameLoop() {
//     // Clear the canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Draw net, paddles, and ball
//     drawNet();
//     drawPaddle(player1);
//     drawPaddle(player2);
//     drawBall(ball);
//     displayScore();

//     // Update game state
//     movePaddles();
//     updateBall();
//     updateScore();

//     // if (isHost) {
//     //     sendGameState(); // Send game state only if this client is the host
//     // }
//     if (is_first_player) {
//         sendGameState(); // Send game state only if this client is the first player
//     }

//     requestAnimationFrame(gameLoop);
// }


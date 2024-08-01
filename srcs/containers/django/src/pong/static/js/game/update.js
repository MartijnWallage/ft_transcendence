import Stats from './three-lib/stats.module.js'
import { Scene } from './assets/Scene.js';
import { movePaddleAI } from './ai.js';
import { updateScore } from './score.js';
import { gameState } from './game-state.js';
import { sendMessageToWebSocket } from './websocket.js';

// FPS stats viewer
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//key listener
let keys = {};
document.addEventListener("keydown", (event) => { 
	keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});

const container = document.getElementById('threejs-container');
const scene = new Scene(container);
window.addEventListener('resize', () => scene.onWindowResize(gameState));
const { ball, field, paddle_p1, paddle_p2, cam1, cam2 } = scene;


function updateLocalGameState(gameStateFromServer) {
    console.log('Updating local game state with:', gameStateFromServer);

    // Update game state based on server data
    gameState.players = gameStateFromServer.players;
    gameState.playerScores = gameStateFromServer.playerScores;
    gameState.ballPosition = gameStateFromServer.ballPosition;
    gameState.paddlePositions = gameStateFromServer.paddlePositions;
    gameState.running = gameStateFromServer.running;
    gameState.mode = gameStateFromServer.mode;

    // Update paddles and ball positions
    paddle_p1.mesh.position.set(gameState.paddlePositions[0].x, gameState.paddlePositions[0].y, gameState.paddlePositions[0].z);
    paddle_p2.mesh.position.set(gameState.paddlePositions[1].x, gameState.paddlePositions[1].y, gameState.paddlePositions[1].z);
    ball.setPosition(gameState.ballPosition);

    // Update the scoreboard
    updateScore(field);
}

// function update() {
	
// 	// move left paddle
// 	let direction = keys['a'] ? -1 : keys['d'] ? 1 : 0;
// 	paddle_p1.movePaddle(direction, field);

// 	// move right paddle
// 	if (gameState.mode === 'user-vs-computer'){ 
// 		direction = movePaddleAI(paddle_p2, ball);
// 	} else {
// 		direction = keys['ArrowRight'] ? -1 : keys['ArrowLeft'] ? 1 : 0;
// 	}
// 	paddle_p2.movePaddle(direction, field);

//     // move and bounce ball
// 	ball.animateBall();
//     ball.tryPaddleCollision(paddle_p1, paddle_p2, scene.audio);
// 	ball.tryCourtCollision(field);

// 	var split = document.getElementById('vertical-line');
// 	if (gameState.running === false) {
// 		cam1.renderMenuView(scene);
// 		split.style.display = 'none';
// 	}
// 	if (gameState.running === true) {
// 		updateScore(field);
// 		if (gameState.mode === 'user-vs-computer') {
// 			cam1.renderSingleView(scene);
// 		}
// 		if (gameState.mode === 'user-vs-user' || gameState.mode === 'tournament') {
// 			cam1.renderSplitView(scene, 0);
// 			cam2.renderSplitView(scene, 1);
// 			split.style.display = 'block';
// 		}
// 	}

// 	// Send the updated game state to the server
// 	sendGameStateToServer();
// }

function update() {
    if (gameState.running) {
        // Handle paddle movement for player 1
        let direction = keys['a'] ? -1 : keys['d'] ? 1 : 0;
        paddle_p1.movePaddle(direction, field);

        // Handle paddle movement for player 2 or AI
        if (gameState.mode === 'user-vs-computer'){ 
            direction = movePaddleAI(paddle_p2, ball);
        } else {
            direction = keys['ArrowRight'] ? -1 : keys['ArrowLeft'] ? 1 : 0;
        }
        paddle_p2.movePaddle(direction, field);

        // Move and bounce the ball
        ball.animateBall();
        ball.tryPaddleCollision(paddle_p1, paddle_p2, scene.audio);
        ball.tryCourtCollision(field);

        // Update the score and render views
        updateScore(field);

        // Determine the view based on game mode
        if (gameState.mode === 'user-vs-user' || gameState.mode === 'tournament') {
            cam1.renderSplitView(scene, 0);
            cam2.renderSplitView(scene, 1);
        } else {
            cam1.renderSingleView(scene);
        }

        // Send the updated game state to the server
        sendGameStateToServer();
    }
}


function sendGameStateToServer() {
    const message = {
        type: 'game_update',
        game_state: {
            players: gameState.players,
            playerScores: gameState.playerScores,
            ballPosition: ball.getPosition(),
            paddlePositions: [paddle_p1.getPosition(), paddle_p2.getPosition()],
            running: gameState.running,
            mode: gameState.mode,
        }
    };
    sendMessageToWebSocket(message);
}

function animate() {
	stats.begin(); // for the FPS stats
	update();
	scene.controls.update();
	requestAnimationFrame(animate);
	stats.end(); // for the FPS stats
}

requestAnimationFrame(animate);

export { paddle_p2, paddle_p1, ball, field, keys, updateLocalGameState };


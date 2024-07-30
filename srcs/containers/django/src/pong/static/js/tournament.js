
import {endTournament} from './tournament-end.js';

async function startTournament(game) {
	if (game.playerNames.length < 2) {
		var error2 = document.getElementById('error2');
		error2.style.display = 'block'; 
		return;
	}

	try {
		await loadPage('pong');
		initializeTournament(game);
	} catch (error) {
		console.error('Error starting game:', error);
	}
}

function addPlayer(game) {
	console.log(`Is game defined? ${game}`);
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
	game.playerNames.push(playerName);
	displayPlayers(game);
	document.getElementById('playerNameInput').value = '';
}

function nextGame(game) {
	game.running = true;
	game.currentGameIndex += 1;
	console.log('Game index:', game.currentGameIndex);
	console.log('Match order length:', game.matchOrder.length);
	if (game.currentGameIndex > game.matchOrder.length) {
		endTournament(game);
		return ;
	}
	const player1 = game.playerNames[game.matchOrder[game.currentGameIndex - 1][0]];
	const player2 = game.playerNames[game.matchOrder[game.currentGameIndex - 1][1]];
	console.log('Next match:', player1, 'vs', player2);
	game.playerNames = ['player1', 'player2'];
	game.mode = 'tournament';
	game.startGame('tournament');
}

function displayPlayers(game) {
	const playerListDiv = document.getElementById('playerList');
	playerListDiv.innerHTML = ''; // Clear existing list
	console.log('Players:', game.playerNames);
	game.playerNames.forEach(player => {
		let index = game.playerNames.indexOf(player) + 1;
		let name = player;
		const playerElement = document.createElement('p');
		playerElement.textContent = `Player ${index}: ${name}`;
		playerListDiv.appendChild(playerElement);
	});
}

function matchOrderInit(game) {
	for (let i = 0; i < game.playerNames.length; i++) {
		for (let j = i + 1; j < game.playerNames.length; j++) {
			game.matchOrder.push([i, j]);
		}
	}
	console.log('Match order:', game.matchOrder);
}

function scoreBoardInit(game) {
	for (let i = 0; i < game.playerNames.length; i++) {
		game.scoreBoard.push(0);
	}
}

function initializeTournament(game) {
	console.log('Players:', game.playerNames); 
	// document.getElementById('announcement').innerText = `Next match: ${player1} vs ${player2}`;
	// document.getElementById('announcement').style.display = 'block';
	matchOrderInit(game);    
	scoreBoardInit(game);
	nextGame(game);
	console.log('Players length:', game.playerNames.length);
}


function displayScoreTournament(game) {
	displayScore();
	ctx.fillText( `${game.playerNames[game.matchOrder[game.currentGameIndex - 1][0]]} Score: ` + game.playerScores[0], 20, 30);
	ctx.fillText( `${game.playerNames[game.matchOrder[game.currentGameIndex - 1][1]]} Score: ` + game.playerScores[1], canvas.width - 180, 30);
}

function updateScoreTournament(game) {
	ball = game.ball;

	if (ball.x < 0) {
		game.playerScores[0] += 1;
		ball.resetBall();
	} else if (ball.x + ball.width > canvas.width) {
		game.playerScores[1] += 1;
		ball.resetBall();
	}

	if (game.playerScores[0] === game.scoreToWin || game.playerScores[1] === game.scoreToWin) {
		if (game.playerScores[0] == game.scoreToWin) {
			setTimeout(function() {
				alert(`${game.playerNames[game.matchOrder[game.currentGameIndex - 1][0]]} wins!`);
			}
			, 100);
			return false;
		}
		else {
			setTimeout(function() {
				alert(`${game.playerNames[game.matchOrder[game.currentGameIndex - 1][1]]} wins!`);
			}
			, 100);
			return false;
		}
	}
	return true;
}

export { startTournament, addPlayer, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };
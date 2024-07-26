import { addParticipant, createMatch, createTournament } from "./tournament-score-db.js";
import {gameState} from './game-state.js';

function stopGame() {
	gameState.running= false;
}

async function endTournament() {
	alert("Tournament Ended!");
	gameState.running= false;

	// scoreBoardTournament();

	// Example usage:
	
    try {
        let tournamentId = await createTournament();

		for (const player of gameState.players) {
			await addParticipant(player, tournamentId);
		}

		for (let index = 0; index < gameState.matchResult.length; index++) {
			let match = gameState.matchResult[index];
			let player1 = gameState.players[gameState.matchOrder[index][0]];
			let player2 = gameState.players[gameState.matchOrder[index][1]];
			let player1Score = match[0];
			let player2Score = match[1];
			console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
			await createMatch(tournamentId, player1, player2, player1Score, player2Score);
		}

        // gameState.matchResult.forEach( async (match, index) => {
        //     let player1 = gameState.players[gameState.matchOrder[index][0]];
        //     let player2 = gameState.players[gameState.matchOrder[index][1]];
        //     let player1Score = match[0];
        //     let player2Score = match[1];
        //     console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
        //     await createMatch(tournamentId, player1, player2, player1Score, player2Score);
        // });

        // Clear the game state
        gameState.players = [];
        gameState.matchOrder = [];
        gameState.scoreBoard = [];
        gameState.matchResult = [];
		gameState.currentGameIndex = 0;
		gameState.player1Score = 0;
		gameState.player2Score = 0;

        stopGame();
    } catch (error) {
        console.error('Error ending tournament:', error);
    }
}


function scoreBoardTournament() {
	// Step 1: Combine the player names and their victories into an array of objects
	const scoreBoard = [];

	gameState.players.forEach((player, index) => {
		scoreBoard.push({ name: player, victories: gameState.scoreBoard[index] });
	});

	// Step 2: Sort the array of objects based on the number of victories in descending order
	scoreBoard.sort((a, b) => b.victories - a.victories);

	console.log("scoreBoard:", scoreBoard);
	// Display scoreBoard in the HTML as a table

	const scoreBoardDiv = document.getElementById('scoreBoard');
	scoreBoardDiv.innerHTML = "<h2>scoreBoard</h2>";
	const scoreBoardTable = document.createElement('table');
	scoreBoardTable.style.width = '100%';
	scoreBoardTable.style.borderCollapse = 'collapse';
	scoreBoardTable.style.color = 'yellow'; // Set the text color to yellow

	// Create the header row
	const headerRow = document.createElement('tr');
	const playerHeader = document.createElement('th');
	playerHeader.textContent = 'Player';
	playerHeader.style.border = '3px solid yellow';
	playerHeader.style.padding = '8px';
	const victoriesHeader = document.createElement('th');
	victoriesHeader.textContent = 'Victories';
	victoriesHeader.style.border = '3px solid yellow';
	victoriesHeader.style.padding = '8px';
	headerRow.appendChild(playerHeader);
	headerRow.appendChild(victoriesHeader);
	scoreBoardTable.appendChild(headerRow);

	// Create rows for each player
	scoreBoard.forEach(player => {
		const row = document.createElement('tr');
		const playerCell = document.createElement('td');
		playerCell.textContent = player.name;
		playerCell.style.border = '1px solid yellow';
		playerCell.style.padding = '8px';
		const victoriesCell = document.createElement('td');
		victoriesCell.textContent = player.victories;
		victoriesCell.style.border = '1px solid yellow';
		victoriesCell.style.padding = '8px';
		row.appendChild(playerCell);
		row.appendChild(victoriesCell);
		scoreBoardTable.appendChild(row);
	});

	scoreBoardDiv.appendChild(scoreBoardTable);
}


export {endTournament};
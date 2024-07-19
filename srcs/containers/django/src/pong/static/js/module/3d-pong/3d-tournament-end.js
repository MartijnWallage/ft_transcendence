import { addParticipant, createMatch, createTournament } from "./tournament-score.js";
import {gameState} from './3d-game-state.js';

function stopGame() {
	gameState.running= false;
}

function endTournament() {
	alert("Tournament Ended!");
	gameState.running= false;

	scoreBoardTournament();

	// Example usage:
	
	createTournament();

	const tournamentId = 1;
	gameState.players.forEach(player => {
		addParticipant(player, tournamentId);
	});

	gameState.matchResult.forEach((match, index) => {
		let player1 = gameState.players[gameState.matchOrder[index][0]];
		let player2 = gameState.players[gameState.matchOrder[index][1]];
		let player1Score = match[0];
		let player2Score = match[1];
		console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
		createMatch(tournamentId, player1, player2, player1Score, player2Score);
	});

	gameState.players = [];
	gameState.matchOrder = [];
	gameState.scoreBoard = [];

	// document.getElementById('js-start-tournament-btn').style.display = 'none';
	// document.getElementById('playerNameInput').value = '';
	// document.getElementById('announcement').innerText = 'Tournament has ended. Please add players for a new tournament.';
	// setTimeout(() => document.getElementById('announcement').innerText = 'Tournament has ended. Please add players for a new tournament.', 4000);
	// document.getElementById('announcement').style.display = 'none';

	stopGame();
}


function scoreBoardTournament() {
	// Step 1: Combine the player names and their victories into an array of objects
	const scoreBoard = [];

	gameState.players.forEach((player, index) => {
		scoreBoard.push({ name: player, victories: gameState.scoreBoard[index] });
	});

	// for (let i = 0; i < gameState.players.length; i++) {
	// 	scoreBoard.push({ name: gameState.players[i], victories: gameState.scoreBoard[i] });
	// }
	


	// Step 2: Sort the array of objects based on the number of victories in descending order
	scoreBoard.sort((a, b) => b.victories - a.victories);

	// Step 3: Extract the sorted player names and their victories (optional, for display)
	// const sortedPlayerNames = scoreBoard.map(player => player.name);
	// const sortedVictories = scoreBoard.map(player => player.victories);

	console.log("scoreBoard:", scoreBoard);
	// console.log("Sorted Player Names:", sortedPlayerNames);
	// console.log("Sorted Victories:", sortedVictories);

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
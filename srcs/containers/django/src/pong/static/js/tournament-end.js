import { addParticipant, createMatch, createTournament } from "./tournament-score-db.js";

async function endTournament(game) {
	alert("Tournament Ended!");
	game.running= false;

	// scoreBoardTournament();

	// Example usage:
	
    try {
        let tournamentId = await createTournament();

		for (const player of game.playerNames) {
			await addParticipant(player, tournamentId);
		}

		for (let index = 0; index < game.matchResult.length; index++) {
			let match = game.matchResult[index];
			let player1 = game.playerNames[game.matchOrder[index][0]];
			let player2 = game.playerNames[game.matchOrder[index][1]];
			let player1Score = match[0];
			let player2Score = match[1];
			console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
			await createMatch(tournamentId, player1, player2, player1Score, player2Score);
		}

        // game.matchResult.forEach( async (match, index) => {
        //     let player1 = game.players[game.matchOrder[index][0]];
        //     let player2 = game.players[game.matchOrder[index][1]];
        //     let player1Score = match[0];
        //     let player2Score = match[1];
        //     console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
        //     await createMatch(tournamentId, player1, player2, player1Score, player2Score);
        // });

        // Clear the game state
        game.playerNames = [];
        game.matchOrder = [];
        game.scoreBoard = [];
        game.matchResult = [];
		game.currentGameIndex = 0;
		game.playerScores = [0, 0];

        game.stopGame();
    } catch (error) {
        console.error('Error ending tournament:', error);
    }
}


function scoreBoardTournament(game) {
	// Step 1: Combine the player names and their victories into an array of objects
	const scoreBoard = [];

	game.playerNames.forEach((player, index) => {
		scoreBoard.push({ name: player, victories: game.scoreBoard[index] });
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
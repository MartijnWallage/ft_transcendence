import { addParticipant, createMatch, createTournament } from "./tournament-score-db.js";
import {gameState} from './game-state.js';

function stopGame() {
	gameState.running= false;
}

async function endTournament() {
	alert("Tournament Ended!");
	gameState.running= false;
	
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

        gameState.players = [];
        gameState.matchOrder = [];
        gameState.scoreBoard = [];
        gameState.matchResult = [];
		gameState.currentGameIndex = 0;
		gameState.playerScores = [0, 0];

        stopGame();
    } catch (error) {
        console.error('Error ending tournament:', error);
    }
}


export {endTournament};
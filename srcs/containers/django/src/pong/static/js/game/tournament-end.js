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

		console.log('Match Result:', gameState.matchResult);

		for (let index = 0; index < gameState.matchResult.length; index++) {
			let match = gameState.matchResult[index];
			let player1 = match.player1;
			let player2 = match.player2;
			let player1Score = match.score1;
			let player2Score = match.score2;
			console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
			await createMatch(tournamentId, player1, player2, player1Score, player2Score);
		}

        stopGame();
    } catch (error) {
        console.error('Error ending tournament:', error);
    }

	gameState.players = [];
}

export {endTournament};
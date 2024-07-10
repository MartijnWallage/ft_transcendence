import {gameState} from './game-state.js';
import {startGame} from './entrypoint.js';
import {endTournament} from './tournament-end.js';

function nextGame() {
    gameState.gameRunning = true;
    gameState.currentGameIndex += 1;
    console.log('Game index:', gameState.currentGameIndex);
    console.log('Match order length:', gameState.matchOrder.length);
    if (gameState.currentGameIndex > gameState.matchOrder.length) {
        endTournament();
        return ;
    }
    const player1 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]];
    const player2 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]];
    setTimeout(function() {
        console.log('Next match:', player1, 'vs', player2);
        alert(`Next match: ${player1} vs ${player2}`);
    }, 500);
    // document.getElementById('announcement').innerText = `Current match: ${player1} vs ${player2}`;
    setTimeout(() => startGame(player1, player2, 'tournament'), 1000);
}

export {nextGame};
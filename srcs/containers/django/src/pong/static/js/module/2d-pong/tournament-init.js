import { gameState } from "./game-state.js";
import { nextGame } from "./tournament-game.js";

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
    console.log('Players:', gameState.players); 
    // document.getElementById('announcement').innerText = `Next match: ${player1} vs ${player2}`;
    // document.getElementById('announcement').style.display = 'block';
    matchOrderInit();    
    nextGame();
    scoreBoardInit();
    console.log('Players length:', gameState.players.length);
}

export { displayPlayers, initializeTournament};
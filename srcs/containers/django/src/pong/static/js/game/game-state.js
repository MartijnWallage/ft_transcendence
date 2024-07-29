let gameState = {
	player1: '',
	player2: '',
	players: [],
	matchOrder: [],
	currentGameIndex: 0,
	indexNewPlayer: 1,
	playerScores: [0, 0],
	scoreToWin: 1,
	running: false,
	mode: '',
	matchResult: [],
};

function isWinner() {
    return gameState.playerScores[0] === gameState.scoreToWin ? 0:
        gameState.playerScores[1] === gameState.scoreToWin ? 1:
        -1;
}

export { gameState, isWinner };
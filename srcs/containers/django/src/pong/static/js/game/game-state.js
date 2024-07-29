let gameState = {
	players: [],
	matchOrder: [],
	currentGameIndex: 0,
	playerScores: [0, 0],
	scoreToWin: 1,
	running: false,
	mode: '',
	matchResult: [],
	scoreBoard: []
};

function isWinner() {
    return gameState.playerScores[0] === gameState.scoreToWin ? 0:
        gameState.playerScores[1] === gameState.scoreToWin ? 1:
        -1;
}

export { gameState, isWinner };
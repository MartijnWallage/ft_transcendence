class Match {
	constructor() {
		this.players = [];
		this.matchOrder = [];
		this.currentMatchIndex = 0;
		this.playerScores = [0, 0];
		this.running = false;
		this.mode = '';
		this.matchResult = [];
		this.scoreBoard = [];
	}

	addPlayer(player) {
		this.players.push(player);
	}

	removePlayer(player) {
		this.players = this.players.filter(p => p !== player);
	}
}

export { Match };
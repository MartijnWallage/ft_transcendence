import { textToDiv, HTMLToDiv, displayDiv, notDisplayDiv } from '../utils.js';

class Score {
	constructor(game, players) {
		this.game = game;
		this.players = players;
		console.log('In Score: Players:', this.players);
		this.scoreToWin = game.scoreToWin;
		this.result = [0, 0];
		this.winner = null;
	}

	async update() {
		const ball = this.game.ball;
		const field = this.game.field;
		const halfFieldWidth = field.geometry.parameters.width / 2;
		const ballRightSide = ball.position.x + ball.radius;
		const ballLeftSide = ball.position.x - ball.radius;
		const player_role = this.game.match.players[0].online_role;
		let scorer;

		// console.log('mode:', this.game.mode, 'player_role:', player_role);

		// if (this.game.mode === 'vsOnline' && player_role === 'B') {
		if (ballRightSide < -halfFieldWidth)
			scorer = 1;
		else if (ballLeftSide > halfFieldWidth)
			scorer = 0;
		else
			return;
		this.result[scorer] += 1;
		textToDiv(this.result[scorer], `player${scorer + 1}-score`);
		// }

		if (this.game.mode === 'vsOnline' && player_role === 'A') {
			if (this.game.socket.readyState === WebSocket.OPEN) {
				let scoreUpdate = {
					type: 'score_update',
					score_A: this.result[0],
					score_B: this.result[1],
				};
				console.log('Sending score update:', scoreUpdate);
				this.game.socket.send(JSON.stringify(scoreUpdate));
			}
		}

		// else if (this.game.mode ==! 'vsOnline') {
		// 	if (ballRightSide < -halfFieldWidth)
		// 		scorer = 1;
		// 	else if (ballLeftSide > halfFieldWidth)
		// 		scorer = 0;
		// 	else
		// 		return;
		// 	this.result[scorer] += 1;
		// 	textToDiv(this.result[scorer], `player${scorer + 1}-score`);
		// }
		
		
		ball.serveBall();
		if (this.game.match.players[1].isAI()) {
			this.game.match.players[1].ai.refreshView();
		}
		
		if (this.result[0] === this.scoreToWin)
			this.winner = 0;
		else if (this.result[1] === this.scoreToWin)
			this.winner = 1;
		else 
			return;
		
		this.game.running = false;
		this.game.socket.close();

		ball.resetBall();
		await this.displayWinMessage(`${this.players[this.winner].name}`);
		this.game.readyForNextMatch = true;
	}

	displayWinMessage(winner) {
		this.game.audio.playSound(this.game.audio.win);
		textToDiv(winner, 'announcement-l1');
		textToDiv('is a winner', 'announcement-mid');
		
		displayDiv('menu');
		menu.style.opacity = 1;
		
		if (this.game.tournament != null) {
			displayDiv('js-next-game-btn');
		}
		else {
			displayDiv('js-replay-btn');
		}
		displayDiv('js-exit-btn');
		
		return new Promise((resolve) => {
			const winBtn = document.getElementById('winButtons');
			function onClick(event) {
			winBtn.removeEventListener('click', onClick);
			resolve(event);
			}
			winBtn.addEventListener('click', onClick);
		});
	}
	
}

export { Score };
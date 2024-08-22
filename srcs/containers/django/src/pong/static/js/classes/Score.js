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

		let scorer;
		if (ballRightSide < -halfFieldWidth)
			scorer = 1;
		else if (ballLeftSide > halfFieldWidth)
			scorer = 0;
		else
			return;
		
		this.result[scorer] += 1;
		textToDiv(this.result[scorer], `player${scorer + 1}-score`);
		
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
		if (this.game.match.players[1].ai) {
			this.game.scene.remove(this.game.match.players[1].ai.mesh);
		}

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
import { textToDiv } from '../utils.js';

class Score {
	constructor(game, players) {
		this.game = game;
		this.players = players;
		console.log('In Score: Players:', this.players);
		this.scoreToWin = game.scoreToWin;
		this.result = [0, 0];
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
		
		let winner;
		if (this.result[0] === this.scoreToWin)
			winner = 0;
		else if (this.result[1] === this.scoreToWin)
			winner = 1;
		else
			return;
		
		this.game.running = false;
		ball.resetBall();
		await this.displayWinMessage(`${this.players[winner].name} wins!`);
	}

	displayWinMessage(message) {
		textToDiv(message, 'announcement');
		var menu = document.getElementById('menu');
		menu.style.display = 'block';
		menu.style.opacity = 1;
		const btn = document.getElementById('js-next-game-btn');
		btn.style.display = 'block';
		return new Promise((resolve) => {
			function onClick(event) {
				btn.removeEventListener('click', onClick);
				btn.style.display = 'none';
				resolve(event); 
			}
			document.addEventListener('click', onClick);
		});
	}
}

export { Score };
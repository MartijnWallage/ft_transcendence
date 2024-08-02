import { textToDiv } from '../utils.js';

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
		// Just for logging purposes
		const AIPrediction = this.game.match.players[1].isAI() ? this.players[1].ai.destination : null;


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
		
		if (scorer === 0 && this.game.match.players[1].isAI()) {
			console.log(`Score! Ball z position is ${ball.position.z}`);
			console.log(`AI Predication was ${AIPrediction}`);
			console.log(`Off by ${ball.position.z - AIPrediction}`);
		}

		ball.serveBall();
		
		if (this.result[0] === this.scoreToWin)
			this.winner = 0;
		else if (this.result[1] === this.scoreToWin)
			this.winner = 1;
		else
			return;
		
		this.game.running = false;

		ball.resetBall();
		await this.displayWinMessage(`${this.players[this.winner].name} wins!`);
	}

	displayWinMessage(message) {
		textToDiv(message, 'announcement');
		
		var menu = document.getElementById('menu');
		menu.style.display = 'block';
		menu.style.opacity = 1; // Ensure this matches your CSS transitions if any
		
		const btn = document.getElementById('js-next-game-btn');
		btn.style.display = 'block';
		
		return new Promise((resolve) => {
			function onClick(event) {
			btn.removeEventListener('click', onClick); // Remove the event listener after the click
			btn.style.display = 'none';
			resolve(event);
			}
		
			btn.addEventListener('click', onClick); // Attach the event listener to the button
		});
		}
		  
}

export { Score };
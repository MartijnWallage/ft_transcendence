import { textToDiv, HTMLToDiv, displayDiv, notDisplayDiv } from '../utils.js';
import { getCookie } from '../userMgmt.js';

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
		
		if (this.result[0] === this.scoreToWin)
			this.winner = 0;
		else if (this.result[1] === this.scoreToWin)
			this.winner = 1;
		else 
			return;
		
		this.game.running = false;

		ball.resetBall();
		await this.displayWinMessage(`${this.players[this.winner].name}`);
		// alert(this.players[0].name, this.players[1].name)
		await this.saveMatchResult(this.players[0].name, this.players[1].name);
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
	
	async saveMatchResult(p1_name, p2_name) {
		const matchData = {
			// player1: this.players[0].name,
			// player2: this.players[1].name,
			// player1_score: this.result[0],
			// player2_score: this.result[1],
			player1: p1_name,
			player2: p2_name,
			player1_score: 6,
			player2_score: 5,
			mode: this.game.mode,  // Assume this.game.mode is already set correctly
			timestamp: new Date().getTime(),
		};

		// console.log(player1, player2, player1_score, player2_score, mode, timestamp);
		// alert(player1, player2, player1_score, player2_score, mode, timestamp);

		try {
			const response = await fetch('/api/save_match/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'),  // Include CSRF token if needed
				},
				body: JSON.stringify(matchData),
			});

			const data = await response.json();

			if (data.status === 'success') {
				console.log('Match result saved successfully');
			} else {
				console.error('Failed to save match result:', data.message);
			}
		} catch (error) {
			console.error('Error saving match result:', error);
		}
	}
}



export { Score };
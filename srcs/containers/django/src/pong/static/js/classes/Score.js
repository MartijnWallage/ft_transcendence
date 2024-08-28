import { textToDiv, HTMLToDiv, displayDiv, notDisplayDiv } from '../utils.js';

class Score {
	constructor(game, players) {
		this.game = game;
		this.players = players;
		console.log('In Score: Players:', this.players);
		this.result = [0, 0];
		this.winner = null;
		this.onlineUpdate = false;
	}

	async update() {
		const { ball, field, mode, match, socket } = this.game;
		const halfFieldWidth = field.geometry.parameters.width / 2;
		const ballRightSide = ball.position.x + ball.radius;
		const ballLeftSide = ball.position.x - ball.radius;
		const playerRole = match.players[0].online_role;
		let scorer = null;

		const isVsOnlineMode = mode === 'vsOnline';
		const isPlayerRoleA = playerRole === 'A';

		if (!isVsOnlineMode || (isVsOnlineMode && isPlayerRoleA)) {
			if (ballRightSide < -halfFieldWidth)
				scorer = 1;
			else if (ballLeftSide > halfFieldWidth)
				scorer = 0;
			else
				return;
			this.result[scorer] += 1;
			textToDiv(this.result[scorer], `player${scorer + 1}-score`);
		}
		if (scorer === null && !this.onlineUpdate)
			return;
			
		if (isVsOnlineMode && isPlayerRoleA)
			this.sendScoreUpdate(this.result[0], this.result[1]);
		this.onlineUpdate = false;
			
		ball.serveBall();
		if (match.players[1].isAI())
			match.players[1].ai.refreshView();
		
		if (this.result[0] == this.game.settings.scoreToWin) {
			this.winner = 0;
        } else if (this.result[1] == this.game.settings.scoreToWin) {
			this.winner = 1;
        } else { 
			return;
        }
		
		this.game.running = false;
		if (socket)
			socket.close();

		ball.resetBall();
		console.log('LOG: mode:', this.game.mode);
		if (this.game.mode === 'solo' || this.game.mode === 'UvU') {
			console.log('Registering inside the database...');
            this.game.registerInDatabase();
		}
        else if (this.game.mode === 'vsOnline' && playerRole === 'A') {
			console.log('Registering inside the database...');
            this.game.registerInDatabase();
        }
		await this.displayWinMessage(`${this.players[this.winner].name}`);
		this.game.readyForNextMatch = true;
	}

	sendScoreUpdate(scoreA, scoreB) {
		if (this.game.socket.readyState === WebSocket.OPEN) {
			let scoreUpdate = {
				type: 'score_update',
				score_A: scoreA,
				score_B: scoreB,
			};
			console.log('Sending score update:', scoreUpdate);
			this.game.socket.send(JSON.stringify(scoreUpdate));
		}
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
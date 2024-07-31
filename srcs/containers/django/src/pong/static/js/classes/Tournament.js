class Tournament {

	constructor(game) {
		this.game = game;
//		this.players = [];
		this.indexNewPlayer = 1;
	}

	async startTournament() {
		const game = this.game;

		if (game.players.length < 2) {
			var error2 = document.getElementById('error2');
			error2.style.display = 'block'; 
			return;
		}

		try {
			await loadPage('pong');
			game.matchResult = [];
			game.playerScores = [0, 0];
			game.player1 = game.players[0];
			game.player2 = game.players[1];
			console.log('Players:', game.players);
			console.log('Next match:', game.player1, 'vs', game.player2);
			console.log(`before start match indexNewPlayer: ${this.indexNewPlayer} >= players.length: ${game.players.length}`);
			await game.initMatch('tournament');
			console.log(`after start match indexNewPlayer: ${this.indexNewPlayer} >= players.length: ${game.players.length}`);
			// while(this.nextTournamentMatch());
			for (let index = 0; index < game.players.length; index++)
				await this.nextTournamentMatch();
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}

	addPlayer() {
		const game = this.game;
	
		const playerName = document.getElementById('playerNameInput').value.trim();
		console.log(playerName);
		var error = document.getElementById('error');
		if (playerName === '') {
			error.style.display = 'block'; 
			return;
		}
		else {
			error.style.display = 'none'; 
		}
		game.players.push(playerName);
		this.displayPlayers();
		document.getElementById('playerNameInput').value = '';
	}

	async nextTournamentMatch() {
		const game = this.game;

		const match = {
			player1: game.player1,
			player2: game.player2,
			score1: game.playerScores[0],
			score2: game.playerScores[1],
			timestamp: Date.now()
		};
		game.matchResult.push(match);
		console.log('Match:', game.matchResult);

		game.running = true;
		this.indexNewPlayer += 1;
		console.log('Index new player:', this.indexNewPlayer);
		if (this.indexNewPlayer >= game.players.length) {
			console.log(`indexNewPlayer: ${this.indexNewPlayer} >= players.length: ${game.players.length}`);
			this.endTournament();
			return 0;
		}
		if (game.playerScores[0] > game.playerScores[1]) {
			game.player2 = game.players[this.indexNewPlayer];
		}
		else {
			game.player1 = game.players[this.indexNewPlayer];
		}
		console.log('Next match:', game.player1, 'vs', game.player2);
		await game.initMatch();
		return 1;
	}


	displayPlayers() {
		const game = this.game;
	
		const playerListDiv = document.getElementById('playerList');
		playerListDiv.innerHTML = ''; // Clear existing list
		game.players.forEach(player => {
			let index = game.players.indexOf(player) + 1;
			let name = player;
			const playerElement = document.createElement('p');
			playerElement.textContent = `Player ${index}: ${name}`;
			playerListDiv.appendChild(playerElement);
		});
	}

	displayScoreTournament() {
		const game = this.game;

		game.displayScore();
		ctx.fillText( `${game.player1} Score: ` + game.playerScores[0], 20, 30);
		ctx.fillText( `${game.player2} Score: ` + game.playerScores[1], canvas.width - 180, 30);
	}

	updateScoreTournament() {
		const game = this.game;
		ball = game.ball;

		if (ball.x < 0) {
			game.playerScores[0] += 1;
			ball.resetBall();
		} else if (ball.x + ball.width > canvas.width) {
			game.playerScores[1] += 1;
			ball.resetBall();
		}

		if (game.playerScores[0] === game.scoreToWin || game.playerScores[1] === game.scoreToWin) {
			if (game.playerScores[0] == game.scoreToWin) {
				setTimeout(function() {
					alert(`${game.player1} wins!`);
				}
				, 100);
				return false;
			}
			else {
				setTimeout(function() {
					alert(`${game.player2} wins!`);
				}
				, 100);
				return false;
			}
		}
		return true;
	}

	// Tournament Score Database

	getCurrentDateISO() {
		const now = new Date();
		return now.toISOString();  // Format ISO 8601
	}
	
	async addParticipant(playerName, tournamentId) {
		console.log('Adding participant:', playerName);
		$.ajax({
			url: '/api/add_participant/',
			type: 'POST',
	
			data: JSON.stringify({
				'tournament_id': tournamentId,
				'player_name': playerName
			}),
	
			contentType: 'application/json; charset=utf-8',
	
			dataType: 'json',
	
			success: function(response) {
				console.log('Participant added:', response);
			},
	
			error: function(error) {
				console.log('Error addParicipant:', error);
			}
	
		});
	}
	
	async createTournament() {
		console.log('Creating tournament...');
		const currentDate = this.getCurrentDateISO();
		console.log('Current Date:', currentDate);
	
		return new Promise((resolve, reject) => {
			$.ajax({
				url: '/api/create_tournament/',
				type: 'POST',
				data: JSON.stringify({
					'date': currentDate
				}),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
	
				success: function(response) {
					console.log('Tournament created successfully:', response);
					if (response && response.tournament_id) {
						console.log('Tournament ID:', response.tournament_id);
						resolve(response.tournament_id);
					} else {
						console.log('Tournament ID not found in the response.');
						resolve(null);
					}
				},
				error: function(error) {
					console.error('Error creating tournament:', error);
					reject(error);
				}
			});
		});
	}
	
	async createMatch(tournamentId, player1, player2, player1_score, player2_score) {
		console.log('Creating Match...');
		$.ajax({
			url: '/api/create_match/',
			type: 'POST',
			data: JSON.stringify({
				'tournament_id': tournamentId,
				'player1' : player1,
				'player2' : player2,
				'player1_score' : player1_score,
				'player2_score' : player2_score
			}),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
	
			success: function(response) {
				console.log('Match created successfully:', response);
			},
			error: function(error) {
				console.error('Error creating match:', error);
			}
		});
	}

	// Tournament End

	async endTournament() {
		const game = this.game;

		alert("Tournament Ended!");
		game.running = false;

		// scoreBoardTournament();

		// Example usage:
		
		try {
			let tournamentId = await this.createTournament();

			for (const player of game.players) {
				await this.addParticipant(player, tournamentId);
			}

			console.log('Match Result:', game.matchResult);

			for (let index = 0; index < game.matchResult.length; index++) {
				let match = game.matchResult[index];
				let player1 = match.player1;
				let player2 = match.player2;
				let player1Score = match.score1;
				let player2Score = match.score2;
				console.log('Match:', index, ': ', player1, player2, player1Score, player2Score);
				await this.createMatch(tournamentId, player1, player2, player1Score, player2Score);
			}

			game.stopGame();
		} catch (error) {
			console.error('Error ending tournament:', error);
		}

		game.players = [];
	}
}

export { Tournament };
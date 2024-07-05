function selectGameMode(mode) {
	gameMode = mode;
	if (mode === 'user-vs-user') {
		// document.getElementById('nameInputs').style.display = 'block';
	} 
	else if (mode === 'user-vs-computer') {
		startGame('Guest', 'Computer', 'user-vs-computer');
	} 
	else if (mode === 'tournament') {
		document.getElementById('nameInputsTournament').style.display = 'inline-block';
		// startTournament();
	}
}

function startGameWithPlayer2() {
	const player2Name = document.getElementById('player2Name').value;
	if (player2Name.trim() === '') {
		alert('Please enter a valid name for Player 2');
	} else {
		const player1Name = '{{ user.username|default:"Guest" }}';
		startGame(player1Name, player2Name, 'user-vs-user');
	}
}

function startGame(player1Name, player2Name, mode) {
	// document.getElementById('nameInputs').style.display = 'none';
	// document.getElementById('nameInputsTournament').style.display = 'none';
	// document.getElementById('gameButtons').style.display = 'block';
	document.getElementById('pongCanvas').style.display = 'block';
	initializeGame(player1Name, player2Name, mode);
}

function endGame() {
	var redirecturi = "/";
	window.location.href = redirecturi;
}
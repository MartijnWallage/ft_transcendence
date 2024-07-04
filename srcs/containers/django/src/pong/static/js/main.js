function startGameUserVsUser() {
	const player2Name = document.getElementById('player2Name').value;
	if (player2Name.trim() === '') {
		alert('Please enter a valid name for Player 2');
	} else {
		loadPage('pong')
		const player1Name = '{{ user.username|default:"Guest" }}';
		startGame(player1Name, player2Name, 'user-vs-user');
	}
}

function startGame(player1Name, player2Name, mode) {
	document.getElementById('pongCanvas').style.display = 'block';
    console.log(`Starting game: ${player1Name} vs ${player2Name}`);
	console.log(`Game mode: ${mode}`);
	if (mode === 'tournament') {
		gameLoopTournament();
	}
	else if (mode === 'user-vs-user') {
		gameLoopUserVsUser();
	}
	else if (mode === 'user-vs-computer') {
		gameLoopUserVsComputer();
	}
}

function endGame() {
	var redirecturi = "/";
	window.location.href = redirecturi;
}
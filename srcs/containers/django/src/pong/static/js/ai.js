function aiOppeonent(){
	// Simple AI for computer
	if (player2.y + player2.height / 2 < ball.y) {
		player2.dy = paddleSpeed;
	} else {
		player2.dy = -paddleSpeed;
	}
}
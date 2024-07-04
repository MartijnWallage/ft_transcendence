
// Key controls
let keys = {};

document.addEventListener("keydown", (event) => { 
    keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false; 
});


function displayScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    if (gameMode === 'user-vs-user' || gameMode === 'user-vs-computer') {
        ctx.fillText("Player 1 Score: " + player1Score, 20, 30);
        ctx.fillText("Player 2 Score: " + player2Score, canvas.width - 180, 30);
    } else {
        ctx.fillText( `${players[matchOrder[currentGameIndex - 1][0]]} Score: ` + player1Score, 20, 30);
        ctx.fillText( `${players[matchOrder[currentGameIndex - 1][1]]} Score: ` + player2Score, canvas.width - 180, 30);
    }
}

function updateScore() {
    if (ball.x < 0) {
        player2Score += 1;
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        player1Score += 1;
        resetBall();
    }

    if (player1Score == scoreToWin || player2Score == scoreToWin) {
        if (gameMode === 'user-vs-user' || gameMode === 'user-vs-computer') {
            if (player1Score == scoreToWin) {
                alert('Player 1 wins!');
            }
            else {
                alert('Player 2 wins!');
            }
            gameRunning = false;
        }
        else if (gameMode === 'tournament') {
            if (player1Score == scoreToWin) {
                alert(`${players[matchOrder[currentGameIndex - 1][0]]} wins!`);
            }
            else {
                alert(`${players[matchOrder[currentGameIndex - 1][1]]} wins!`);
            }
            player1Score = 0;
            player2Score = 0;
            if (player1Score == scoreToWin) {
                scoreBoard[matchOrder[currentGameIndex - 1][0]] += 1;
                console.log('number of victory player ' + matchOrder[currentGameIndex - 1][0] + ' :' + scoreBoard[matchOrder[currentGameIndex - 1][0]]);
            } else {
                scoreBoard[matchOrder[currentGameIndex - 1][1]] += 1;
                console.log('number of victory player ' + matchOrder[currentGameIndex - 1][1] + ' :' + scoreBoard[matchOrder[currentGameIndex - 1][1]]);
            }
            nextGame();
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1; // Change ball direction
    ball.dy = ball.dx / 2;
}


// Control paddles
function movePaddles() {
    // Player 1 controls
    if (keys["w"]) player1.dy = -paddleSpeed;
    else if (keys["s"]) player1.dy = paddleSpeed;
    else player1.dy = 0;

    // Player 2 controls
    if (gameMode === 'user-vs-user' || gameMode === 'tournament') {
        if (keys["ArrowUp"]) player2.dy = -paddleSpeed;
        else if (keys["ArrowDown"]) player2.dy = paddleSpeed;
        else player2.dy = 0;
    } else if (gameMode === 'user-vs-computer') {
        aiOppeonent();
    }

    updatePaddle(player1);
    updatePaddle(player2);
}

// Main loop

function gameLoop() {
    if (!gameRunning) return;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net, paddles, and ball
    drawNet();
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall(ball);
    displayScore();

    // Update game state
    movePaddles();
    updateBall();
    updateScore();

    requestAnimationFrame(gameLoop);
}


function initializeGame(player1Name, player2Name, mode) {
    document.getElementById('pongCanvas').style.display = 'block';
    gameMode = mode;
    console.log(`Starting game: ${player1Name} vs ${player2Name}`);
    gameLoop();
}




// Game mode
// let gameMode = '';

// Update functions

// Function to update paddle positions based on their current velocities
// function updatePaddles() {
//     updatePaddle(player1); // Update local player's paddle

//     // If this client is Player A, update the computer-controlled paddle
//     if (isPlayerA) {
//         updateComputerPaddle();
//     } else {
//         updatePaddle(player2); // Update Player B's paddle
//     }
// }



// function updateBall() {
//     ball.x += ball.dx;
//     ball.y += ball.dy;

//     if (ball.y < 0 || ball.y + ball.height > canvas.height) {
//         ball.dy *= -1; // Bounce off top and bottom
//     }

//     let paddle = (ball.dx < 0) ? player1 : player2;

//     if (ball.x < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height + ball.height / 2 ||
//         ball.x + ball.width > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height + ball.height / 2) {
//         ball.dy = (ball.y - (paddle.y + paddle.height / 2)) * 0.25;
//         ball.dx *= -1; // Bounce off paddles
//     }
// }


// // Control paddles
// function movePaddles() {
//     // Player 1 controls
//     if (keys["w"]) player1.dy = -paddleSpeed;
//     else if (keys["s"]) player1.dy = paddleSpeed;
//     else player1.dy = 0;

//     // Player 2 controls
//     if (keys["ArrowUp"]) player2.dy = -paddleSpeed;
//     else if (keys["ArrowDown"]) player2.dy = paddleSpeed;
//     else player2.dy = 0;
    
//     updatePaddle(player1);
//     updatePaddle(player2);
// }










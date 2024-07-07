const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Paddle properties
const  paddleWidth = 14;
const  paddleHeight = 80;
const  paddleSpeed = 6;

const player1 = {
                x: 10,
                y: canvas.height / 2 - paddleHeight / 2, 
                width: paddleWidth, 
                height: paddleHeight,
                dy: 0,
};

const player2 = {
                x: canvas.width - paddleWidth - 10,
                y: canvas.height / 2 - paddleHeight / 2,
                width: paddleWidth,
                height: paddleHeight,
                dy: 0,
};

// Ball properties
const ballSize = 14;

const ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: ballSize,
            height: ballSize,
            dx: -7,
            dy: 6,
};

// Score
let player1Score = 0;
let player2Score = 0;

let scoreToWin = 3;

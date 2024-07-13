const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const monoColor = "#C4C5C6";

// Paddle properties
const  paddleWidth = 14;
const  paddleHeight = 70;
const  paddleSpeed = 6;
const  paddleOffset = 10;

const player1 = {
				name : "Player 1",
                x: paddleOffset,
                y: canvas.height / 2 - paddleHeight / 2,
                width: paddleWidth,
                height: paddleHeight,
                dy: 0,
				color : monoColor,
				score : 0,
};

const player2 = {
				name : "Player 2",
                x: canvas.width - paddleWidth - paddleOffset,
                y: canvas.height / 2 - paddleHeight / 2,
                width: paddleWidth,
                height: paddleHeight,
                dy: 0,
				color : monoColor,
				score : 0,
};

const getRandomInt = max => Math.floor(Math.random() * max);

// Ball properties
const ballSize = 14;

let serveDirection = getRandomInt(2) ? 1 : -1;

const ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: ballSize,
            height: ballSize,
            serve: serveDirection,
            dx: 3 * serveDirection,
            dy: getRandomInt(6),
			color : monoColor,
			serveSpeed : 3,
};

const scoreToWin = 10;

export {canvas, ctx, monoColor, paddleWidth, paddleHeight, paddleSpeed, player1, player2, ball, scoreToWin, getRandomInt};

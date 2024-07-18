// Paddle properties
const paddleConf = {
					width: 0.3,
					height: 1,
					depth: 2,
					speed: 0.2,
};

// Ball properties
const ballConf = {
					radius: 0.4,
					speed: 0.10,
};

// Score
const scoreToWin = 1;

const getRandomInt = max => Math.floor(Math.random() * max);

let serveDirection = getRandomInt(2) ? 1 : -1;

export {paddleConf, ballConf, scoreToWin, getRandomInt};

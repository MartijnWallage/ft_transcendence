// Paddle properties
const paddleConf = {
                    width: 0.3,
                    height: 1,
                    depth: 2,
                    // Speed: 6,
};

// Ball properties
const ballConf = {
                    radius: 0.4,
                    speed: 0.09,
};

// Score
const scoreToWin = 3;

const getRandomInt = max => Math.floor(Math.random() * max);

let serveDirection = getRandomInt(2) ? 1 : -1;

export {paddleConf, ballConf, scoreToWin, getRandomInt};

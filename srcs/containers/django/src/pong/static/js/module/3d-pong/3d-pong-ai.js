import { ball } from './3d-app.js';

function movePaddleAI(paddle) {
    const bottomPaddle = paddle.position.z + paddle.geometry.parameters.depth / 2;
    const topPaddle = paddle.position.z - paddle.geometry.parameters.depth / 2;
    const bottomBall = ball.position.z + ball.radius / 2;
    const topBall = ball.position.z - ball.radius / 2;

    return bottomBall < topPaddle ? -1 : topBall > bottomPaddle ? 1 : 0;
}

export {movePaddleAI};
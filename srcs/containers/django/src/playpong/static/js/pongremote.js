let remotecanvas, remotectx, remoteplayer1, remoteplayer2, remoteball, remotews;

function initializeGameremote(remoteplayer1Name, remoteplayer2Name, mode, websocket) {
    remotews = websocket;
    remotecanvas = document.getElementById('pongremoteCanvas');
    remotectx = remotecanvas.getContext('2d');
    remoteplayer1 = { name: remoteplayer1Name, paddle: { x: 10, y: remotecanvas.height / 2 - 50, width: 10, height: 100 } };
    remoteplayer2 = { name: remoteplayer2Name, paddle: { x: remotecanvas.width - 20, y: remotecanvas.height / 2 - 50, width: 10, height: 100 } };
    remoteball = { x: remotecanvas.width / 2, y: remotecanvas.height / 2, radius: 10, dx: 2, dy: 2 };

    if (mode === 'remoteuser-vs-remoteuser') {
        remotews.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'update') {
                // Update game state with the data from the other player
                remoteplayer2.paddle.y = message.paddleY;
                remoteball = message.remoteball;
            }
        };
    }

    requestAnimationFrame(remotegameLoop);
}

function remotegameLoop() {
    remotectx.clearRect(0, 0, remotecanvas.width, remotecanvas.height);
    remotedrawPaddle(remoteplayer1.paddle);
    remotedrawPaddle(remoteplayer2.paddle);
    remotedrawremoteBall(remoteball);

    remoteupdateGameState();

    if (remotews && remotews.readyState === WebSocket.OPEN) {
        remotews.send(JSON.stringify({
            type: 'update',
            paddleY: remoteplayer1.paddle.y,
            remoteball: remoteball
        }));
    }

    requestAnimationFrame(remotegameLoop);
}

function remotedrawPaddle(paddle) {
    remotectx.fillStyle = 'white';
    remotectx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function remotedrawremoteBall(remoteball) {
    remotectx.beginPath();
    remotectx.arc(remoteball.x, remoteball.y, remoteball.radius, 0, Math.PI * 2);
    remotectx.fillStyle = 'white';
    remotectx.fill();
    remotectx.closePath();
}

function remoteupdateGameState() {
    // Update remoteball position
    remoteball.x += remoteball.dx;
    remoteball.y += remoteball.dy;

    // remoteBall collision with top and bottom walls
    if (remoteball.y + remoteball.radius > remotecanvas.height || remoteball.y - remoteball.radius < 0) {
        remoteball.dy *= -1;
    }

    // remoteBall collision with paddles
    if (remoteball.x - remoteball.radius < remoteplayer1.paddle.x + remoteplayer1.paddle.width &&
        remoteball.y > remoteplayer1.paddle.y && remoteball.y < remoteplayer1.paddle.y + remoteplayer1.paddle.height) {
        remoteball.dx *= -1;
    }

    if (remoteball.x + remoteball.radius > remoteplayer2.paddle.x &&
        remoteball.y > remoteplayer2.paddle.y && remoteball.y < remoteplayer2.paddle.y + remoteplayer2.paddle.height) {
        remoteball.dx *= -1;
    }

    // remoteBall out of bounds
    if (remoteball.x + remoteball.radius < 0 || remoteball.x - remoteball.radius > remotecanvas.width) {
        // Reset remoteball position
        remoteball.x = remotecanvas.width / 2;
        remoteball.y = remotecanvas.height / 2;
        remoteball.dx *= -1;
    }
}

// Add event listeners for remoteplayer1 paddle movement
window.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowUp':
            remoteplayer1.paddle.y -= 20;
            break;
        case 'ArrowDown':
            remoteplayer1.paddle.y += 20;
            break;
    }
});

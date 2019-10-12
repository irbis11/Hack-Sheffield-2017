var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);

app.use(express.static('.'));

server = http.listen(7777, function() {
	console.log('Listening on port 7777');
});

process.on('exit', function() {
	console.log('About to exit, waiting for remaining connections to compvare');
	server.close();
});

process.on('SIGTERM', function() {
	console.log('About to exit, waiting for remaining connections to compvare');
	server.close();
});

var state = Object();
var players = Object();
var screens = [];
var ballDelta = Object();
initializeGame();

io.on('connection', function(socket) {
	console.log('Client connected');

    socket.on('disconnect', function() {
        console.log('Client disconnected');
    });

    socket.on('SCREEN', function() {
        screens.push(socket);
    });

    socket.on('PLAY LEFT', function() {
        players.left = socket;
        if (players.right !== null && !state.started) {
            startGame();
        }
    });

    socket.on('PLAY RIGHT', function() {
        players.right = socket;
        if (players.left !== null && !state.started) {
            startGame();
        }
    });

    socket.on('UP', function() {
        var player = getPlayer(socket);
        switch (player) {
            case 'LEFT':
                state.leftPaddle -= 100;
                if (state.leftPaddle < 0) {
                    state.leftPaddle = 0;
                }
                console.log("Left moved up");
                break;
            case 'RIGHT':
                state.rightPaddle -= 100;
                if (state.rightPaddle < 0) {
                    state.rightPaddle = 0;
                }
                console.log("Right moved up");
                break;
            default:
                console.log("Unknown player is trying to move up");
        }
    });

    socket.on('DOWN', function() {
        var player = getPlayer(socket);
        switch (player) {
            case 'LEFT':
                state.leftPaddle += 100;
                if (state.leftPaddle > 10000) {
                    state.leftPaddle = 10000;
                }
                console.log("Left moved down");
                break;
            case 'RIGHT':
                state.rightPaddle += 100;
                if (state.rightPaddle > 10000) {
                    state.rightPaddle = 10000;
                }
                console.log("Right moved down");
                break;
            default:
                console.log("Unknown player is trying to move down");
        }
    });

});

function getPlayer(socket) {
    if (socket === players.left) {
        return 'LEFT';
    } else if (socket === players.right) {
        return 'RIGHT';
    } else {
        return 'NONE';
    }
}

function initializeGame() {
    players.left = null;
    players.right = null;
	// Game size is 10000x10000
    state.started = false;
	state.leftPaddle = 0;
	state.rightPaddle = 0;
	state.ball = Object();
	state.ball.x = 5000;
	state.ball.y = 5000;
	ballDelta.x = 2;
	ballDelta.y = 8;
}

function startGame() {
    state.started = true;
    setInterval(gameLoop, 50);
}

function gameLoop() {
    // Tick the game
    // Move the ball
    state.ball.x += ballDelta.x;
    state.ball.y += ballDelta.y;
    // Bounce of off the walls
    if (state.ball.y <= 0 || state.ball.y >= 10000) {
        ballDelta.y = -ballDelta.y;
    }
    // Send the game state
	console.log("Loop: sending state to players");
	players.left.emit("STATE", state);
	players.right.emit("STATE", state);
	screens.forEach(function(screen) {
        screen.emit("STATE", state);
    });
}

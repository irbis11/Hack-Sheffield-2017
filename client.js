var socket;

function pageLoad() {

    socket = io();

    socket.emit("SCREEN");

    socket.on('STATE', function(argument) {
        var state = argument;
        //Assumes paddles[] + ball populated
        paddles.y1 = state.leftPaddle * height;
        paddles.y2 = state.rightPaddle * height;
        ball.x = state.ball.x * width;
        ball.y = state.ball.y * height;
    });

    console.log("Client initialized");
}

document.addEventListener('DOMContentLoaded', pageLoad);

// ---- Drawing ---- //

var scorefont;
function preload() {
  scorefont = loadFont('Pixeled.ttf');
}

var canvas;

var paddles;
var ball;

// p5 canvas setup method
function setup() {

  canvas = createCanvas(innerWidth, innerHeight);
  paddles = { y1: 0.5*height, y2: 0.5*height};
  ball = { x: 0.5*width, y: 0.5*height };

}

// Client-side draw loop
function draw() {
  fill('#ffffff');
  drawBackground();
  drawObjects();
}

// Draw flat background, scores, and net
function drawBackground() {

        background(color('#2C2C34'));

         // Draw scores
        textFont(scorefont, width/22);
        textAlign(CENTER);
        text('1', width/2 - width/6, height/6);
        text('2', width/2 + width/6, height/6);

        var netblocks = 12; // # of block in net
        var blockgapratio = 2; // this many gaps make up a single net block

        let blockwidth = width * 0.01; // 1/125th width of screen
        let blockheight = height / (netblocks + netblocks / blockgapratio);

        var gapheight = blockheight / blockgapratio;

        for (var y = blockheight; y < height - blockheight; y += blockheight + gapheight)
                rect(width/2 - blockwidth/2, y, blockwidth, blockheight);
}

// Draws paddles given 0->10000 position of both paddles, 0 being minimum
// height and 10000 being maximum height.
function drawObjects() {

        strokeWeight(0);

        // Draw Paddles
        let paddleheight = height / 4;
        let paddlewidth = width / 42;

        // Precompute half the width and height of paddles
        var halfheight = paddleheight / 2;
        var halfwidth = paddlewidth / 2;

        let p1x = width / 10 - halfwidth;
        let p1y = paddles.y1;

        let p2x = width - p1x - paddlewidth;
        let p2y = paddles.y2;


        rect(p1x, p1y, halfwidth, halfheight);
        rect(p2x, p2y, halfwidth, halfheight);

        // Draw ball
        let ballwidth = width / 36;

        let bx = ball.x - ballwidth / 2;
        let by = ball.y - ballwidth / 2;

        rect(bx, by, ballwidth, ballwidth);

}

function mapY(posy) {
        return map(posy, 0, 10000, 1000, 9000);
}

// Handles window resizing
window.onresize = function() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.resize(w,h);
  width = w;
  height = h;
};

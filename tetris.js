// Props to OneLoneCoder @Javidx9 who inspired me to clone his game in VS
// Original Author
// ~~~~~~
// Twitter: @javidx9
// Blog: www.onelonecoder.com
// ~~~~~~
// https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_Tetris.cpp
// https://www.youtube.com/watch?v=8OK8_tHeCIA&t=1011s


sound = {
    music : () => play("Tetris_theme.ogg")
}

// Assets
xv = yv = 0;
px = py = 10;
fieldWidth = 12;
fieldHeight = 22;
tileWidth = 20;

canv = null;
ctx = null;
intervalId = null;
music = new Audio('Tetris_theme.ogg');
gamePause = false;

game = {}
currentPiece = {}

tetrominos = [
    "..X...X...X...X.", // I
	"..X..XX...X.....", // T
	".....XX..XX.....", // O
	"..X..XX..X......", // Z
	".X...XX...X.....", // S
	".X...X...XX.....", // L
	"..X...X..XX....."  // J
]
tetrocolors = [
    "black",
    "lightblue",
    "violet",
    "yellow",
    "red",
    "green",
    "orange",
    "blue",
    "white",
    "grey"
]

function stopGame() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        music.pause();
        music.load();
    }
}

function startNewGame() {
    if (!gamePause) {
        stopGame();
    }
    game = {
        speed: 20,
        speedCount: 0,
        forceDown: false,
        pieceCount: 0,
        score: 0,
        field: [],
        completeLines: [],
        nextTetrino: Math.floor(Math.random() * 100) % 7
    }
    
    currentPiece = {
        id: Math.floor(Math.random() * 100) % 7,
        rot: 0,
        x: fieldWidth / 2,
        y: 0
    }

    for (var x = 0; x < fieldWidth; x++) {
        for (var y = 0; y < fieldHeight; y++) {
            game.field[y*fieldWidth + x] = ( x == 0 || x == fieldWidth - 1 || y == fieldHeight -1) ? 9 : 0;
        }
    }

    music.play();
    music.loop= true;
    intervalId = setInterval(gameloop,50);
}

function gameloop() {
    game.speedCount++;
    game.forceDown = (game.speedCount == game.speed)

    if (game.forceDown){
        game.speedCount = 0;
        game.pieceCount++;
        if (game.pieceCount % 50 == 0) {
            if (game.speed >= 10) game.speed--;
        }
        // Test if current piece can move down
        if (doesPieceFit(currentPiece.id, currentPiece.rot, currentPiece.x, currentPiece.y + 1)) {
            currentPiece.y++;
        } else {
            // it cannot be moved down so lock it on the field.
            for (var px = 0; px < 4; px++) {
                for (var py = 0; py < 4; py++) {
                    if (tetrominos[currentPiece.id][rotate(px, py, currentPiece.rot)] != '.') {
                        game.field[(currentPiece.y + py) * fieldWidth + (currentPiece.x + px)] = currentPiece.id + 1;
                    }
                }
            }
            // check for completed lines
            for (py = 0; py < 4; py++) {
                if (currentPiece.y + py < fieldHeight -1 ){
                    var line = true;
                    for (var px = 1; px < fieldWidth - 1; px++) {
                        line &= (game.field[(currentPiece.y + py) * fieldWidth + px]) != 0;
                    }
                    if (line) {
                        for (var px = 1; px < fieldWidth - 1; px++) {
                            game.field[(currentPiece.y + py) * fieldWidth + px] = 8;
                        }
                        game.completeLines.push(currentPiece.y + py);
                    }
                }
            }
            game.score += 25;
            game.score += Math.pow(10, game.completeLines.length) * 100

            // Pick new piece
            currentPiece.x = fieldWidth / 2;
            currentPiece.y = 0;
            currentPiece.rot = 0;
            currentPiece.id = game.nextTetrino;
            game.nextTetrino = Math.floor(Math.random() * 100) % 7;
            if (!doesPieceFit(currentPiece.id, currentPiece.rot, currentPiece.x, currentPiece.y)) {
                stopGame();
            }
        }
    }
    drawGame();
    removeFullLines();
}

function drawGame () {
    // reset Field
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,canv.width, canv.height);

    // draw Field
    for (var x = 0; x < fieldWidth; x++) {
        for (var y = 0; y < fieldHeight; y++) {
            if (game.completeLines.indexOf(y) == -1) {
                ctx.fillStyle = tetrocolors[game.field[y*fieldWidth+x]];
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fillRect(x * tileWidth, y * tileWidth, tileWidth - 2, tileWidth - 2)
        }
    }
    
    //draw current Tile
    for (var px = 0; px < 4; px ++){
        for (var py = 0; py < 4; py++) {
            if (tetrominos[currentPiece.id][rotate(px, py, currentPiece.rot)] != '.') {
                ctx.fillStyle = tetrocolors[currentPiece.id + 1]
                ctx.fillRect((currentPiece.x + px) * tileWidth, (currentPiece.y + py) * tileWidth, tileWidth - 2, tileWidth - 2);
            }
        }
    }

    // draw Score
    ctx.fillStyle="gold";
    ctx.font = "18px Arial"
    ctx.fillText(`Score ${game.score}`, fieldWidth * tileWidth + 20, 20)
    // draw next Piece
    for (var px = 0; px < 4; px++) {
        for (var py = 0; py < 4; py++) {
            if (tetrominos[game.nextTetrino][rotate(px, py, 0)] != '.') {
                ctx.fillStyle = tetrocolors[game.nextTetrino + 1]
                ctx.fillRect(((fieldWidth + 1) + px) * tileWidth, (2 + py) * tileWidth, tileWidth - 2, tileWidth - 2);
            }
        }
    }
    fieldWidth * tileWidth + 20, 40
    // draw linecount
    ctx.fillStyle="gold";
    ctx.font = "18px Arial"
    ctx.fillText(`Tilecount ${game.pieceCount}`, fieldWidth * tileWidth + 20, 8 * tileWidth)
}

function removeFullLines() {
    if (game.completeLines.length > 0) {
        var y = game.completeLines[0]
        for (var line of game.completeLines) {
            game.field.splice(line * fieldWidth, fieldWidth);
            game.field = [9,0,0,0,0,0,0,0,0,0,0,9].concat(game.field);
        }
        game.completeLines = []
    }
}

function play (soundfile) {
    s = new Audio(soundfile)
    s.play()
}

function rotate(px, py, rot) {
    var pi = 0;
    switch (rot % 4) {
        case 0: {
            pi = py * 4 + px; // 0 deg
            break;
        }
        case 1: {
            pi = 12 + py - (px * 4); // 90 deg
            break;
        }
        case 2: {
            pi = 15 - (py * 4) - px; // 180 deg
            break;
        }
        case 3: {
            pi = 3 - py + (px * 4); // 270 deg
            break;
        }
        
    }
    return pi
}

function doesPieceFit(tetromino, rot, posX, posY) {
    // All Field cells >0 are occupied
    for (var px = 0; px < 4; px++) {
        for (var py = 0; py < 4; py++){
            // get index into piece
            var pi = rotate(px, py, rot)

            // get index into field
            var fi = (posY + py) * fieldWidth + (posX + px)

            if (posX + px >= 0 && posX + px < fieldWidth) {
                if (posY + py >= 0 && posY + py < fieldHeight) {
                    if (tetrominos[tetromino][pi] != '.' && game.field[fi] != 0) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function keyPush(evt) {
    console.log(evt.keyCode);
    switch(evt.keyCode) {
        case 37 : { // Left
            if (doesPieceFit(currentPiece.id, currentPiece.rot, currentPiece.x - 1, currentPiece.y)) {
                currentPiece.x--;
            }
            break;
        }
        case 38 : { // Up
            if (doesPieceFit(currentPiece.id, currentPiece.rot + 90, currentPiece.x, currentPiece.y)) {
                currentPiece.rot += 1;
            }
            break;
        }
        case 39 : { // Right
            if (doesPieceFit(currentPiece.id, currentPiece.rot, currentPiece.x + 1, currentPiece.y)) {
                currentPiece.x++;
            }
            break;
        }
        case 40 : { // Down
            if (doesPieceFit(currentPiece.id, currentPiece.rot, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
            }
            break;
        }
        case 82 : {
            startNewGame();
            break;
        }
        case 83 : {
            stopGame();
            break;
        }
    }
}

window.onload = function() {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    document.addEventListener("keydown", keyPush);
}
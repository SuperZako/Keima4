var GoBoard;
(function (GoBoard) {
    var Stone;
    (function (Stone) {
        Stone[Stone["Black"] = 1] = "Black";
        Stone[Stone["White"] = 2] = "White";
    })(Stone || (Stone = {}));
    var ToColumnIndex = {
        0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "J", 9: "K",
        10: "L", 11: "M", 12: "N", 13: "O", 14: "P", 15: "Q", 16: "R", 17: "S", 18: "T",
    };
    var ToNumber = {
        "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7, "J": 8, "K": 9,
        "L": 10, "M": 11, "N": 12, "O": 13, "P": 14, "Q": 15, "R": 16, "S": 17, "T": 18,
    };
    var playerColor = Stone.Black;
    var Opponent = [0, 2, 1];
    var container;
    var canvas;
    var context;
    var shinkaya = new Image();
    var black = new Image();
    var white = new Image();
    var boardSize = 19;
    // グリッドサイズ
    var gridSize = 0;
    var gridStart = 0;
    var gridEnd = 0;
    var halfGridSize = 0;
    var canvasWidth = 0;
    var canvasHeight = 0;
    var canvasSize = 1920;
    var board = [];
    var lastMove = {
        x: -1,
        y: -1,
    };
    var gameOn = false;
    function resize() {
        //if (container && container.style) {
        //    canvasWidth = canvas.width = Number(container.style.width);
        //    canvasHeight = canvas.height = Number(container.style.height);
        //}
        //offsetX = (pitchImageWidth - canvas.width) / 2;
        //offsetY = (pitchImageHeight - canvas.height) / 2;
        //draw();
    }
    function mousemove(ev) {
        if (gameOn) {
            var canvasRect = canvas.getBoundingClientRect();
            var mouseX = ev.x - canvasRect.left;
            var mouseY = ev.y - canvasRect.top;
            var x = mouseX / canvasRect.width * 1920;
            var y = mouseY / canvasRect.height * 1920;
            if (gridStart <= x && x <= gridEnd && gridStart <= y && y <= gridEnd) {
                x += gridSize / 2;
                y += gridSize / 2;
                x -= x % gridSize;
                y -= y % gridSize;
                drawBoard();
                var image = playerColor === Stone.Black ? black : white;
                Renderer.drawTransparentImage(image, 0.4, x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);
                drawMark();
                return;
            }
            drawBoard();
            drawMark();
        }
    }
    function mousedown(ev) {
        if (gameOn) {
            var canvasRect = canvas.getBoundingClientRect();
            var mouseX = ev.x - canvasRect.left;
            var mouseY = ev.y - canvasRect.top;
            var x = mouseX / canvasRect.width * 1920;
            var y = mouseY / canvasRect.height * 1920;
            if (gridStart <= x && x <= gridEnd && gridStart <= y && y <= gridEnd) {
                x -= gridStart;
                x += gridSize / 2;
                x -= x % gridSize;
                x = Math.floor(x / gridSize);
                var gridX = ToColumnIndex[x];
                y -= gridStart;
                y += gridSize / 2;
                y -= y % gridSize;
                y = Math.floor(y / gridSize);
                var gridY = boardSize - y;
                if (Command.isLegal(playerColor, x, y)) {
                    Command.play(playerColor, gridX + gridY);
                    drawMark();
                    setTimeout(function () {
                        var opponent = Opponent[playerColor];
                        Command.genmove(opponent);
                    }, 100);
                }
            }
        }
    }
    GoBoard.mousedown = mousedown;
    function setGameOn(value) {
        gameOn = value;
        GameInfo.updateState(gameOn);
    }
    GoBoard.setGameOn = setGameOn;
    function isGameOn() {
        return gameOn;
    }
    GoBoard.isGameOn = isGameOn;
    function setPlayerColor(stone) {
        var color = stone === "black" ? Stone.Black : Stone.White;
        if (playerColor === color) {
            return;
        }
        playerColor = color;
        GameInfo.updatePlayerLabel(playerColor);
    }
    GoBoard.setPlayerColor = setPlayerColor;
    function getPlayerColor() {
        return playerColor;
    }
    GoBoard.getPlayerColor = getPlayerColor;
    function setBoardSize(size) {
        var width = canvas.width;
        boardSize = size;
        gridSize = width / (boardSize + 3);
        halfGridSize = gridSize / 2;
        gridStart = 2 * gridSize;
        gridEnd = canvas.width - gridStart;
    }
    GoBoard.setBoardSize = setBoardSize;
    function clearBoard() {
        for (var y = 0; y < 19; ++y) {
            for (var x = 0; x < 19; ++x) {
                board[y][x] = 0;
            }
        }
    }
    GoBoard.clearBoard = clearBoard;
    function updateBoard() {
        for (var y = 0; y < boardSize; ++y) {
            for (var x = 0; x < boardSize; ++x) {
                var stone = Keima.Main.getStone(x, y);
                board[y][x] = stone;
            }
        }
        drawBoard();
        drawMark();
    }
    GoBoard.updateBoard = updateBoard;
    function initialize() {
        container == document.querySelector(".container");
        canvas = document.querySelector(".board");
        canvas.width = 1920;
        canvas.height = 1920;
        context = canvas.getContext('2d');
        shinkaya.src = "/images/shinkaya.jpg";
        black.src = "/images/black.png";
        white.src = "/images/white.png";
        for (var i = 0; i < 19; ++i) {
            var array = [];
            for (var j = 0; j < 19; ++j) {
                array.push(0);
            }
            board.push(array);
        }
        //window.addEventListener('resize', resize, false);
        canvas.addEventListener("mousemove", mousemove, false);
        canvas.addEventListener("mousedown", mousedown, false);
        //resize();
    }
    GoBoard.initialize = initialize;
    function drawMark() {
        var lastMove = Command.getLastMove();
        if (!lastMove) {
            return;
        }
        var pos = lastMove.pos;
        if (pos === "PASS") {
            return;
        }
        var column = ToNumber[pos.substr(0, 1)];
        var row = Number(pos.substr(1));
        if (column !== undefined && row !== undefined) {
            Renderer.drawCircle(column * gridSize + gridStart, row * gridSize + gridStart, gridSize / 4);
        }
    }
    GoBoard.drawMark = drawMark;
    function drawAllStone() {
        for (var y = 0; y < boardSize; ++y) {
            for (var x = 0; x < boardSize; ++x) {
                if (board[y][x] === Stone.Black) {
                    Renderer.drawImageScaled(black, x * gridSize - gridSize / 2 + 2 * gridSize, y * gridSize - gridSize / 2 + 2 * gridSize, gridSize, gridSize);
                }
                if (board[y][x] === Stone.White) {
                    Renderer.drawImageScaled(white, x * gridSize - gridSize / 2 + 2 * gridSize, y * gridSize - gridSize / 2 + 2 * gridSize, gridSize, gridSize);
                }
            }
        }
    }
    GoBoard.drawAllStone = drawAllStone;
    function drawColumnIndex() {
        var height = canvas.height;
        for (var i = 0; i < boardSize; ++i) {
            var x = i * gridSize + gridStart;
            Renderer.drawText(ToColumnIndex[i], "80px 'ＭＳ Ｐゴシック'", "gray", "center", "bottom", x, gridSize);
            Renderer.drawText(ToColumnIndex[i], "80px 'ＭＳ Ｐゴシック'", "gray", "center", "bottom", x, height);
        }
    }
    GoBoard.drawColumnIndex = drawColumnIndex;
    function drawRowIndex() {
        var width = canvas.width;
        for (var i = 0; i < boardSize; ++i) {
            var y = i * gridSize + gridStart;
            Renderer.drawText((boardSize - i).toString(), "80px 'ＭＳ Ｐゴシック'", "gray", "center", "middle", halfGridSize, y);
            Renderer.drawText((boardSize - i).toString(), "80px 'ＭＳ Ｐゴシック'", "gray", "center", "middle", width - halfGridSize, y);
        }
    }
    GoBoard.drawRowIndex = drawRowIndex;
    function drawBoard() {
        var width = canvas.width;
        var height = canvas.height;
        gridSize = width / (boardSize + 3);
        Renderer.fillRect('white', 0, 0, width, height);
        Renderer.drawImageScaled(shinkaya, gridSize, gridSize, width - 2 * gridSize, height - 2 * gridSize);
        drawColumnIndex();
        drawRowIndex();
        for (var i = 0; i < boardSize; ++i) {
            var y = i * gridSize + 2 * gridSize;
            Renderer.drawLine('black', 5, gridStart, y, gridEnd, y);
        }
        for (var i = 0; i < boardSize; ++i) {
            var x = i * gridSize + 2 * gridSize;
            Renderer.drawLine('black', 5, x, gridStart, x, gridEnd);
        }
        switch (boardSize) {
            case 9:
                for (var i = 2; i < boardSize; i += 4) {
                    for (var j = 2; j < boardSize; j += 4) {
                        Renderer.fillCircle(gridStart + i * gridSize, gridStart + j * gridSize, gridSize / 5);
                    }
                }
                Renderer.fillCircle(gridStart + 4 * gridSize, gridStart + 4 * gridSize, gridSize / 5);
                break;
            case 19:
                for (var i = 3; i < boardSize; i += 6) {
                    for (var j = 3; j < boardSize; j += 6) {
                        Renderer.fillCircle(gridStart + i * gridSize, gridStart + j * gridSize, gridSize / 5);
                    }
                }
                break;
            default:
                break;
        }
        drawAllStone();
    }
    GoBoard.drawBoard = drawBoard;
    function draw() {
        var width = canvas.width;
        var height = canvas.height;
        gridSize = width / (boardSize + 3);
        halfGridSize = gridSize / 2;
        gridStart = 2 * gridSize;
        gridEnd = canvas.width - gridStart;
        drawBoard();
    }
    GoBoard.draw = draw;
})(GoBoard || (GoBoard = {}));
//# sourceMappingURL=GoBoard.js.map
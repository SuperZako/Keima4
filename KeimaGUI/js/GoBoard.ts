
namespace GoBoard {

    enum Stone {
        Black = 1,
        White = 2
    }

    const ToColumnIndex: { [key: number]: string } = {
        0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "J", 9: "K",
        10: "L", 11: "M", 12: "N", 13: "O", 14: "P", 15: "Q", 16: "R", 17: "S", 18: "T",
    };

    const ToNumber: { [key: string]: number } = {
        "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7, "J": 8, "K": 9,
        "L": 10, "M": 11, "N": 12, "O": 13, "P": 14, "Q": 15, "R": 16, "S": 17, "T": 18,
    };

    let playerColor = Stone.Black;
    const Opponent = [0, 2, 1]
    let container: HTMLDivElement;
    let canvas: HTMLCanvasElement;
    var context: CanvasRenderingContext2D;

    var shinkaya = new Image();
    var black = new Image();
    var white = new Image();

    let boardSize = 19;

    // グリッドサイズ
    let gridSize = 0;
    let gridStart = 0;
    let gridEnd = 0;
    let halfGridSize = 0;

    let canvasWidth = 0;
    let canvasHeight = 0;

    var canvasSize = 1920;

    let board: number[][] = [];

    let lastMove = {
        x: -1,
        y: -1,
    }

    let gameOn = false;

    function resize() {
        //if (container && container.style) {
        //    canvasWidth = canvas.width = Number(container.style.width);
        //    canvasHeight = canvas.height = Number(container.style.height);
        //}
        //offsetX = (pitchImageWidth - canvas.width) / 2;
        //offsetY = (pitchImageHeight - canvas.height) / 2;
        //draw();
    }

    function mousemove(ev: MouseEvent) {
        if (gameOn) {
            let canvasRect = canvas.getBoundingClientRect();
            var mouseX = ev.x - canvasRect.left;
            var mouseY = ev.y - canvasRect.top;

            let x = mouseX / canvasRect.width * 1920;
            let y = mouseY / canvasRect.height * 1920;

            if (gridStart <= x && x <= gridEnd && gridStart <= y && y <= gridEnd) {

                x += gridSize / 2;
                y += gridSize / 2;
                x -= x % gridSize
                y -= y % gridSize

                drawBoard();
                let image = playerColor === Stone.Black ? black : white;
                Renderer.drawTransparentImage(image, 0.4, x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);
                drawMark()
                return;
            }
            drawBoard();
            drawMark()
        }
    }

    export function mousedown(ev: MouseEvent) {
        if (gameOn) {
            let canvasRect = canvas.getBoundingClientRect();
            var mouseX = ev.x - canvasRect.left;
            var mouseY = ev.y - canvasRect.top;

            let x = mouseX / canvasRect.width * 1920;
            let y = mouseY / canvasRect.height * 1920;

            if (gridStart <= x && x <= gridEnd && gridStart <= y && y <= gridEnd) {
                x -= gridStart;
                x += gridSize / 2;
                x -= x % gridSize
                x = Math.floor(x / gridSize);
                let gridX = ToColumnIndex[x];

                y -= gridStart;
                y += gridSize / 2;
                y -= y % gridSize
                y = Math.floor(y / gridSize);
                let gridY = boardSize - y;

                if (Command.isLegal(playerColor, x, y)) {
                    Command.play(playerColor, gridX + gridY);
                    drawMark()
                    setTimeout(() => {
                        let opponent = Opponent[playerColor];
                        Command.genmove(opponent);
                    }, 100);
                }
            }
        }
    }

    export function setGameOn(value: boolean) {
        gameOn = value;

        GameInfo.updateState(gameOn);
    }

    export function isGameOn() {
        return gameOn;
    }

    export function setPlayerColor(stone: string) {
        let color = stone === "black" ? Stone.Black : Stone.White;

        if (playerColor === color) {
            return;
        }

        playerColor = color;

        GameInfo.updatePlayerLabel(playerColor);
    }

    export function getPlayerColor() {
        return playerColor;
    }

    export function setBoardSize(size: number) {
        let width = canvas.width;

        boardSize = size;
        gridSize = width / (boardSize + 3);
        halfGridSize = gridSize / 2;
        gridStart = 2 * gridSize;
        gridEnd = canvas.width - gridStart;

    }

    export function clearBoard() {
        for (let y = 0; y < 19; ++y) {
            for (let x = 0; x < 19; ++x) {
                board[y][x] = 0;
            }
        }
    }

    export function updateBoard() {
        for (let y = 0; y < boardSize; ++y) {
            for (let x = 0; x < boardSize; ++x) {
                let stone: number = Keima.Main.getStone(x, y);
                board[y][x] = stone;
            }
        }
        drawBoard();
        drawMark();
    }

    export function initialize() {
        container == <HTMLDivElement>document.querySelector(".container");
        canvas = <HTMLCanvasElement>document.querySelector(".board");
        canvas.width = 1920;
        canvas.height = 1920;
        context = canvas.getContext('2d');

        shinkaya.src = "/images/shinkaya.jpg"
        black.src = "/images/black.png";
        white.src = "/images/white.png";

        for (let i = 0; i < 19; ++i) {
            let array: number[] = [];
            for (let j = 0; j < 19; ++j) {
                array.push(0);
            }
            board.push(array);

        }

        //window.addEventListener('resize', resize, false);
        canvas.addEventListener("mousemove", mousemove, false);
        canvas.addEventListener("mousedown", mousedown, false);
        //resize();
    }

    export function drawMark() {
        let lastMove = Command.getLastMove();

        if (!lastMove) {
            return;
        }

        let pos = lastMove.pos;

        if (pos === "PASS") {
            return;
        }

        let column = ToNumber[pos.substr(0, 1)];
        let row = Number(pos.substr(1));

        if (column !== undefined && row !== undefined) {
            Renderer.drawCircle(column * gridSize + gridStart, row * gridSize + gridStart, gridSize / 4);
        }
    }
    export function drawAllStone() {

        for (let y = 0; y < boardSize; ++y) {
            for (let x = 0; x < boardSize; ++x) {
                if (board[y][x] === Stone.Black) {
                    Renderer.drawImageScaled(black, x * gridSize - gridSize / 2 + 2 * gridSize, y * gridSize - gridSize / 2 + 2 * gridSize, gridSize, gridSize);
                }

                if (board[y][x] === Stone.White) {
                    Renderer.drawImageScaled(white, x * gridSize - gridSize / 2 + 2 * gridSize, y * gridSize - gridSize / 2 + 2 * gridSize, gridSize, gridSize);
                }
            }
        }
    }

    export function drawColumnIndex() {
        let height = canvas.height;
        for (let i = 0; i < boardSize; ++i) {
            let x = i * gridSize + gridStart;
            Renderer.drawText(ToColumnIndex[i], "80px 'ＭＳ Ｐゴシック'", "gray", "center", "bottom", x, gridSize);
            Renderer.drawText(ToColumnIndex[i], "80px 'ＭＳ Ｐゴシック'", "gray", "center", "bottom", x, height);
        }
    }

    export function drawRowIndex() {
        let width = canvas.width;
        for (let i = 0; i < boardSize; ++i) {
            let y = i * gridSize + gridStart;
            Renderer.drawText((boardSize - i).toString(), "80px 'ＭＳ Ｐゴシック'", "gray", "center", "middle", halfGridSize, y);
            Renderer.drawText((boardSize - i).toString(), "80px 'ＭＳ Ｐゴシック'", "gray", "center", "middle", width - halfGridSize, y);
        }
    }

    export function drawBoard() {
        let width = canvas.width;
        let height = canvas.height;

        gridSize = width / (boardSize + 3);

        Renderer.fillRect('white', 0, 0, width, height);
        Renderer.drawImageScaled(shinkaya, gridSize, gridSize, width - 2 * gridSize, height - 2 * gridSize);

        drawColumnIndex();
        drawRowIndex();

        for (let i = 0; i < boardSize; ++i) {
            let y = i * gridSize + 2 * gridSize;
            Renderer.drawLine('black', 5, gridStart, y, gridEnd, y);
        }

        for (let i = 0; i < boardSize; ++i) {
            let x = i * gridSize + 2 * gridSize;
            Renderer.drawLine('black', 5, x, gridStart, x, gridEnd);
        }

        switch (boardSize) {
            case 9:
                for (let i = 2; i < boardSize; i += 4) {
                    for (let j = 2; j < boardSize; j += 4) {
                        Renderer.fillCircle(gridStart + i * gridSize, gridStart + j * gridSize, gridSize / 5);
                    }
                }
                Renderer.fillCircle(gridStart + 4 * gridSize, gridStart + 4 * gridSize, gridSize / 5);
                break;
            case 19:
                for (let i = 3; i < boardSize; i += 6) {
                    for (let j = 3; j < boardSize; j += 6) {
                        Renderer.fillCircle(gridStart + i * gridSize, gridStart + j * gridSize, gridSize / 5);
                    }
                }
                break;
            default:
                break;
        }

        drawAllStone();
    }

    export function draw() {
        let width = canvas.width;
        let height = canvas.height;

        gridSize = width / (boardSize + 3);
        halfGridSize = gridSize / 2;
        gridStart = 2 * gridSize;
        gridEnd = canvas.width - gridStart;

        drawBoard();
    }
}
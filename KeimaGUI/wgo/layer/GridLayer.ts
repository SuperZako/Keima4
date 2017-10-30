/// <reference path="./CanvasLayer.ts" />
namespace WGo {
    var theme_variable = function (key, board) {
        return typeof board.theme[key] == "function" ? board.theme[key](board) : board.theme[key];
    }
    export class GridLayer extends CanvasLayer {
        constructor() {
            super();
        }

        draw(board: Board) {
            // draw grid
            var tmp;

            this.context.beginPath();
            this.context.lineWidth = theme_variable("gridLinesWidth", board);
            this.context.strokeStyle = theme_variable("gridLinesColor", board);

            var tx = Math.round(board.left),
                ty = Math.round(board.top),
                bw = Math.round(board.fieldWidth * (board.size - 1)),
                bh = Math.round(board.fieldHeight * (board.size - 1));

            this.context.strokeRect(tx - board.ls, ty - board.ls, bw, bh);

            for (var i = 1; i < board.size - 1; i++) {
                tmp = Math.round(board.getX(i)) - board.ls;
                this.context.moveTo(tmp, ty);
                this.context.lineTo(tmp, ty + bh);

                tmp = Math.round(board.getY(i)) - board.ls;
                this.context.moveTo(tx, tmp);
                this.context.lineTo(tx + bw, tmp);
            }

            this.context.stroke();

            // draw stars
            this.context.fillStyle = theme_variable("starColor", board);

            if (board.starPoints[board.size]) {
                for (var key in board.starPoints[board.size]) {
                    this.context.beginPath();
                    this.context.arc(board.getX(board.starPoints[board.size][key].x) - board.ls, board.getY(board.starPoints[board.size][key].y) - board.ls, theme_variable("starSize", board), 0, 2 * Math.PI, true);
                    this.context.fill();
                }
            }
        }
    }
}
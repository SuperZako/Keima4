namespace WGo {

    // New experimental board theme system - it can be changed in future, if it will appear to be unsuitable.
    export var themes = {
        old: {
            shadowColor: "rgba(32,32,32,0.5)",
            shadowTransparentColor: "rgba(32,32,32,0)",
            shadowBlur: 0,
            shadowSize: function (board: Board) {
                return board.shadowSize;
            },
            markupBlackColor: "rgba(255,255,255,0.8)",
            markupWhiteColor: "rgba(0,0,0,0.8)",
            markupNoneColor: "rgba(0,0,0,0.8)",
            markupLinesWidth: function (board: Board) {
                return board.autoLineWidth ? board.stoneRadius / 7 : board.lineWidth;
            },
            gridLinesWidth: 1,
            gridLinesColor: function (board: Board) {
                return "rgba(0,0,0," + Math.min(1, board.stoneRadius / 15) + ")";
            },
            starColor: "#000",
            starSize: function (board: Board) {
                return board.starSize * ((board.width / 300) + 1);
            },
            stoneSize: function (board: Board) {
                return board.stoneSize * Math.min(board.fieldWidth, board.fieldHeight) / 2;
            },
            coordinatesColor: "rgba(0,0,0,0.7)",
            font: function (board: Board) {
                return board.font;
            },
            linesShift: 0.5
        },

        /**
         * Object containing default graphical properties of a board.
         * A value of all properties can be even static value or function, returning final value.
         * Theme object doesn't set board and stone textures - they are set separately.
         */

        default: {
            shadowColor: "rgba(62,32,32,0.5)",
            shadowTransparentColor: "rgba(62,32,32,0)",
            shadowBlur: function (board: Board) {
                return board.stoneRadius * 0.1;
            },
            shadowSize: 1,
            markupBlackColor: "rgba(255,255,255,0.9)",
            markupWhiteColor: "rgba(0,0,0,0.7)",
            markupNoneColor: "rgba(0,0,0,0.7)",
            markupLinesWidth: function (board: Board) {
                return board.stoneRadius / 8;
            },
            gridLinesWidth: function (board: Board) {
                return board.stoneRadius / 15;
            },
            gridLinesColor: "#654525",
            starColor: "#531",
            starSize: function (board: Board) {
                return (board.stoneRadius / 8) + 1;
            },
            stoneSize: function (board: Board) {
                return Math.min(board.fieldWidth, board.fieldHeight) / 2;
            },
            coordinatesColor: "#531",
            variationColor: "rgba(0,32,128,0.8)",
            font: "calibri",
            linesShift: 0.25
        },
    };
}
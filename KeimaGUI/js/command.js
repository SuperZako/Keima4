WinJS.Namespace.define("Commands", {
    showSettings: WinJS.UI.eventHandler(function (ev) {
        var contentDialog = document.getElementById("settings").winControl;
        contentDialog.show();
    }),
    addDirectory: WinJS.UI.eventHandler(function (ev) {
        //pm.addDirectory();
        //ProjectManager.addDirectory();
    }),
    newFile: WinJS.UI.eventHandler(function (ev) {
        //Sessions.addTab();
    }),
    openFile: WinJS.UI.eventHandler(function (ev) {
        //openFile();
    }),
    save: WinJS.UI.eventHandler(function (ev) {
        //let tab = Sessions.getCurrent();
        //tab.save(false);
    }),
    saveAs: WinJS.UI.eventHandler(function (ev) {
        // let tab = Sessions.getCurrent();
        // tab.save(true);
    }),
    showDialog: WinJS.UI.eventHandler(function (ev) {
        var meessage = "\n            Keima v.0.0.1\n            Written by Ishikawa Masashi.\n            Your comments welcome.\n            \u3053\u306E\u30BD\u30D5\u30C8\u3092\u4F7F\u7528\u3055\u308C\u305F\u30E6\u30FC\u30B6\u30FC\u69D8\u304B\u3089\u306E\u3054\u610F\u898B\u30FB\u3054\u8981\u671B\u3092\u304A\u5F85\u3061\u3057\u3066\u304A\u308A\u307E\u3059\u3002\n            a622740@gmail.com  \n        ";
        var msgBox = new Windows.UI.Popups.MessageDialog(meessage);
        msgBox.showAsync();
    }),
    querySubmittedHandler: WinJS.UI.eventHandler(function (ev) {
        var queryText = ev.detail.queryText;
        var res = Keima.Main.gets(queryText);
        //var x = Keima.Main.getLastMove();
        //GoBoard.updateBoard();
        var msgBox = new Windows.UI.Popups.MessageDialog(res);
        msgBox.showAsync();
    }),
    newGame: WinJS.UI.eventHandler(function (ev) {
        var contentDialog = document.getElementById("settings").winControl;
        contentDialog.show();
        contentDialog.onbeforehide = function () {
            setTimeout(function () {
                Command.newGame();
            }, 100);
        };
    }),
    pass: WinJS.UI.eventHandler(function (ev) {
        setTimeout(function () { Command.pass(); }, 100);
    }),
    resign: WinJS.UI.eventHandler(function (ev) {
        Command.resign();
    }),
});
var Command;
(function (Command) {
    // この名前空間でのみランタイムコンポーネントを呼び出すこと。
    function initialize() {
        Keima.Main.initialize();
    }
    Command.initialize = initialize;
    function isLegal(color, x, y) {
        var result = Keima.Main.isLegal(color, x, y);
        return result;
    }
    Command.isLegal = isLegal;
    function gets(input) {
        var result = Keima.Main.gets(input);
        return result;
    }
    Command.gets = gets;
    function play(color, position) {
        var stone = color === 1 ? "black" : "white";
        var input = "play " + stone + " " + position;
        var result = Keima.Main.gets(input);
        GameInfo.updateMoveInfo();
        GameInfo.updatePrisoners();
        GoBoard.updateBoard();
    }
    Command.play = play;
    function getPrisoner(color) {
        var result = Keima.Main.getPrisoner(color);
        return result;
    }
    Command.getPrisoner = getPrisoner;
    function getLastMove(n) {
        if (n === void 0) { n = 0; }
        var lastMove = Keima.Main.getLastMove(n);
        if (lastMove === "") {
            return null;
        }
        var split = lastMove.split(" ");
        return {
            color: split[0],
            moves: split[1],
            pos: split[2],
        };
    }
    Command.getLastMove = getLastMove;
    function genmove(color) {
        var stone = color === 1 ? "black" : "white";
        var result = Keima.Main.gets("genmove " + stone);
        var lastMove = getLastMove();
        if (lastMove.pos === "PASS") {
            var secondLastMode = getLastMove(1);
            if (secondLastMode.pos === "PASS") {
                var score = finalScore();
                //var msgBox = new (<any>Windows).UI.Popups.MessageDialog(score);
                //msgBox.showAsync();
                var dialog = document.getElementById("messageDialog").winControl;
                var content_1 = document.querySelector(".messageContent");
                content_1.textContent = score.color + "Win!" + "+" + score.point;
                dialog.show();
                GoBoard.setGameOn(false);
                return;
            }
            var passDialog = document.getElementById("messageDialog").winControl;
            var content = document.querySelector(".messageContent");
            content.textContent = "Pass!";
            passDialog.show();
            GameInfo.updateMoveInfo();
            return;
        }
        GameInfo.updatePrisoners();
        GameInfo.updateMoveInfo();
        GoBoard.updateBoard();
    }
    Command.genmove = genmove;
    function pass() {
        var playerColor = GoBoard.getPlayerColor();
        play(playerColor, "PASS");
        if (playerColor === 1) {
            genmove(2);
            return;
        }
        genmove(1);
    }
    Command.pass = pass;
    function newGame() {
        Keima.Main.gets("clear_board");
        GoBoard.setGameOn(true);
        GameInfo.updatePrisoners();
        GoBoard.updateBoard();
        setTimeout(function () {
            if (GoBoard.getPlayerColor() == 2) {
                genmove(1);
            }
            GoBoard.updateBoard();
        }, 100);
    }
    Command.newGame = newGame;
    function resign() {
        if (GoBoard.isGameOn()) {
            var loseDialog = document.getElementById("lose").winControl;
            loseDialog.show();
            GoBoard.setGameOn(false);
        }
    }
    Command.resign = resign;
    function clearBoard() {
        var str = Keima.Main.gets("clear_board");
        GoBoard.clearBoard();
    }
    Command.clearBoard = clearBoard;
    function boardsize(size) {
        clearBoard();
        var result = Keima.Main.gets("boardsize " + size);
        GoBoard.setBoardSize(size);
        GoBoard.updateBoard();
    }
    Command.boardsize = boardsize;
    function finalScore() {
        var result = Keima.Main.gets("final_score");
        var color = result.substr(0, 1) === "w" ? "White" : "Black";
        var point = Number(result.substr(1));
        return { color: color, point: point };
    }
    Command.finalScore = finalScore;
})(Command || (Command = {}));
//# sourceMappingURL=command.js.map
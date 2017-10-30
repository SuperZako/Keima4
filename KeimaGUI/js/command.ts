declare var Keima: any;
declare var Windows: any;

WinJS.Namespace.define("Commands", {
    showSettings: WinJS.UI.eventHandler(function (ev: any) {
        var contentDialog = document.getElementById("settings").winControl;
        contentDialog.show();
    }),

    addDirectory: WinJS.UI.eventHandler(function (ev: any) {
        //pm.addDirectory();
        //ProjectManager.addDirectory();
    }),

    newFile: WinJS.UI.eventHandler(function (ev: any) {
        //Sessions.addTab();
    }),

    openFile: WinJS.UI.eventHandler(function (ev: any) {
        //openFile();
    }),

    save: WinJS.UI.eventHandler(function (ev: any) {
        //let tab = Sessions.getCurrent();
        //tab.save(false);
    }),

    saveAs: WinJS.UI.eventHandler(function (ev: any) {
        // let tab = Sessions.getCurrent();
        // tab.save(true);
    }),

    showDialog: WinJS.UI.eventHandler(function (ev: any) {
        let meessage = `
            Keima v.0.0.1
            Written by Ishikawa Masashi.
            Your comments welcome.
            このソフトを使用されたユーザー様からのご意見・ご要望をお待ちしております。
            a622740@gmail.com  
        `;

        var msgBox = new (<any>Windows).UI.Popups.MessageDialog(meessage);

        msgBox.showAsync();
    }),

    querySubmittedHandler: WinJS.UI.eventHandler(function (ev: any) {
        var queryText = ev.detail.queryText;
        let res = Keima.Main.gets(queryText);

        //var x = Keima.Main.getLastMove();
        //GoBoard.updateBoard();

        var msgBox = new (<any>Windows).UI.Popups.MessageDialog(res);

        msgBox.showAsync();
    }),

    newGame: WinJS.UI.eventHandler(function (ev: any) {
        var contentDialog = document.getElementById("settings").winControl;
        contentDialog.show();

        contentDialog.onbeforehide = () => {
            setTimeout(() => {
                Command.newGame();
            }, 100);
        };
    }),
    pass: WinJS.UI.eventHandler(function (ev: any) {
        setTimeout(() => { Command.pass(); }, 100);
    }),

    resign: WinJS.UI.eventHandler(function (ev: any) {
        Command.resign();
    }),
});


namespace Command {
    // この名前空間でのみランタイムコンポーネントを呼び出すこと。


    export function initialize() {
        Keima.Main.initialize();
    }

    export function isLegal(color: number, x: number, y: number): boolean {
        let result = Keima.Main.isLegal(color, x, y);
        return result;
    }

    export function gets(input: string) {
        let result: string = Keima.Main.gets(input);
        return result;
    }

    export function play(color: number, position: string) {
        let stone = color === 1 ? "black" : "white";
        let input = "play " + stone + " " + position;
        let result = Keima.Main.gets(input);

        GameInfo.updateMoveInfo();
        GameInfo.updatePrisoners();

        GoBoard.updateBoard();
    }

    export function getPrisoner(color: number): number {
        let result = Keima.Main.getPrisoner(color);
        return result;
    }

    export function getLastMove(n = 0) {
        let lastMove: string = Keima.Main.getLastMove(n);

        if (lastMove === "") {
            return null;
        }

        let split = lastMove.split(" ");
        return {
            color: split[0],
            moves: split[1],
            pos: split[2],
        };
    }

    export function genmove(color: number) {
        let stone = color === 1 ? "black" : "white";
        let result = Keima.Main.gets("genmove " + stone);

        let lastMove = getLastMove();


        if (lastMove.pos === "PASS") {
            let secondLastMode = getLastMove(1);

            if (secondLastMode.pos === "PASS") {
                let score = finalScore();

                //var msgBox = new (<any>Windows).UI.Popups.MessageDialog(score);
                //msgBox.showAsync();

                var dialog = document.getElementById("messageDialog").winControl;
                let content = <HTMLDivElement>document.querySelector(".messageContent");
                content.textContent = score.color + "Win!" + "+" + score.point;
                dialog.show();



                GoBoard.setGameOn(false);
                return;
            }


            var passDialog = document.getElementById("messageDialog").winControl;
            let content = <HTMLDivElement>document.querySelector(".messageContent");
            content.textContent = "Pass!";
            passDialog.show();

            GameInfo.updateMoveInfo();
            return;

        }


        GameInfo.updatePrisoners();
        GameInfo.updateMoveInfo();
        GoBoard.updateBoard();
    }

    export function pass() {
        let playerColor = GoBoard.getPlayerColor();

        play(playerColor, "PASS");

        if (playerColor === 1) {
            genmove(2);
            return;
        }

        genmove(1);
    }

    export function newGame() {
        Keima.Main.gets("clear_board");
        GoBoard.setGameOn(true);

        GameInfo.updatePrisoners();
        GoBoard.updateBoard();

        setTimeout(() => {
            if (GoBoard.getPlayerColor() == 2) {
                genmove(1);
            }

            GoBoard.updateBoard();
        }, 100);
    }

    export function resign() {

        if (GoBoard.isGameOn()) {
            var loseDialog = document.getElementById("lose").winControl;
            loseDialog.show();

            GoBoard.setGameOn(false);
        }
    }

    export function clearBoard() {
        let str = Keima.Main.gets("clear_board");
        GoBoard.clearBoard();
    }

    export function boardsize(size: number) {
        clearBoard();
        let result = Keima.Main.gets("boardsize " + size);
        GoBoard.setBoardSize(size);
        GoBoard.updateBoard();
    }

    export function finalScore() {
        let result: string = Keima.Main.gets("final_score");
        let color = result.substr(0, 1) === "w" ? "White" : "Black";
        let point = Number(result.substr(1));
        return { color, point };
    }

}
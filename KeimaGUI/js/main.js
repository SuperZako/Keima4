

(function () {
    'use strict';


    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを初期化します。

            } else {
                // TODO: このアプリケーションは中断状態から再度アクティブ化されました。
                // ここでアプリケーションの状態を復元します。
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                var boardSizeSelectElement = document.getElementById("boardSize");
                boardSizeSelectElement.onchange = (ev) => {
                    let value = boardSizeSelectElement.value;
                    Command.boardsize(Number(value));
                }

                var blackRadio = document.getElementById("blackRadio");
                blackRadio.onclick = (ev) => {
                    let value = blackRadio.value;
                    GoBoard.setPlayerColor(value);
                }

                var whiteRadio = document.getElementById("whiteRadio");
                whiteRadio.onclick = (ev) => {
                    let value = whiteRadio.value;
                    GoBoard.setPlayerColor(value);
                }

                Game.initialize();

                setTimeout(() => { Keima.Main.initialize() }, 1000);
                GoBoard.initialize();
                GoBoard.draw();


            }));
        }
    };
    app.oncheckpoint = function (args) {
        // TODO: このアプリケーションは中断しようとしています。ここで中断中に維持する必要のある状態を保存します。
        // WinJS.Application.sessionState オブジェクトを使用している可能性があります。このオブジェクトは、中断の間自動的に保存され、復元されます。
        //ご使用のアプリケーションを中断する前に非同期の操作を完了する必要がある場合は、args.setPromise() を呼び出してください。
    };
    app.start();
}());


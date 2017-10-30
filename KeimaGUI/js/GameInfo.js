var GameInfo;
(function (GameInfo) {
    function updateState(gameOn) {
        //let stateLabel = document.querySelector(".state");
        //if (gameOn) {
        //    stateLabel.textContent = "▶";
        //    return;
        //}
        //stateLabel.textContent = "◼";
    }
    GameInfo.updateState = updateState;
    function updateMoveInfo() {
        //let lastMove = Command.getLastMove();
        //let moveInfo = <HTMLDivElement>document.querySelector(".moveInfo");
        //moveInfo.textContent = "●:" + (Number(lastMove.moves) + 1);
        //if (lastMove.color === "black") {
        //    moveInfo.style.color = "white"
        //    return;
        //}
        //moveInfo.style.color = "black";
    }
    GameInfo.updateMoveInfo = updateMoveInfo;
    function updatePlayerLabel(playerColor) {
        var player1Label = document.querySelector(".player1Label");
        var player2Label = document.querySelector(".player2Label");
        if (playerColor === 1) {
            player1Label.textContent = "You";
            player2Label.textContent = "CPU";
            return;
        }
        player1Label.textContent = "CPU";
        player2Label.textContent = "You";
    }
    GameInfo.updatePlayerLabel = updatePlayerLabel;
    function updatePrisoners() {
        var player1Prisoner = document.getElementById("player1Prisoner");
        var player2Prisoner = document.getElementById("player2Prisoner");
        player1Prisoner.textContent = "Prisoners   " + Command.getPrisoner(1).toString();
        player2Prisoner.textContent = "Prisoners   " + Command.getPrisoner(2).toString();
    }
    GameInfo.updatePrisoners = updatePrisoners;
})(GameInfo || (GameInfo = {}));
//# sourceMappingURL=GameInfo.js.map
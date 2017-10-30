


namespace GameInfo {

    export function updateState(gameOn: boolean) {
        //let stateLabel = document.querySelector(".state");
        //if (gameOn) {

        //    stateLabel.textContent = "▶";
        //    return;
        //}
        //stateLabel.textContent = "◼";
    }

    export function updateMoveInfo() {
        //let lastMove = Command.getLastMove();

        //let moveInfo = <HTMLDivElement>document.querySelector(".moveInfo");
        //moveInfo.textContent = "●:" + (Number(lastMove.moves) + 1);

        //if (lastMove.color === "black") {
        //    moveInfo.style.color = "white"
        //    return;
        //}

        //moveInfo.style.color = "black";
    }

    export function updatePlayerLabel(playerColor: number) {
        let player1Label = <HTMLElement>document.querySelector(".player1Label");
        let player2Label = <HTMLElement>document.querySelector(".player2Label");

        if (playerColor === 1) {
            player1Label.textContent = "You";
            player2Label.textContent = "CPU";
            return;
        }

        player1Label.textContent = "CPU";
        player2Label.textContent = "You";
    }

    export function updatePrisoners() {
        let player1Prisoner = document.getElementById("player1Prisoner");
        let player2Prisoner = document.getElementById("player2Prisoner");

        player1Prisoner.textContent = "Prisoners   " + Command.getPrisoner(1).toString();
        player2Prisoner.textContent = "Prisoners   " + Command.getPrisoner(2).toString();
    }
}
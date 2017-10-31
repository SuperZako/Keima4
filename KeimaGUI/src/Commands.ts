declare var Keima: any;
namespace Commands {
    // この名前空間でのみランタイムコンポーネントを呼び出すこと。
    export function initialize() {
        Keima.Main.initialize();
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
    export function play(color: number, position: string) {
        let stone = color === 1 ? "black" : "white";
        let input = "play " + stone + " " + position;
        let result = Keima.Main.gets(input);
        return result;
    }
    export function genmove(color: number) {
        let stone = color === 1 ? "black" : "white";
        let result = Keima.Main.gets("genmove " + stone);

        let lastMove = getLastMove();

        if (lastMove.pos === "PASS") {
            let secondLastMove = getLastMove(1);

            if (secondLastMove.pos === "PASS") {
                //let score = finalScore();

                //let textContent = score.color + "Win!" + "+" + score.point;
                //resultDialog.showDialog(textContent);

                //Main.setGameOn(false);
                Main.resign();
                return;
            }
            // GameInfo.updateMoveInfo();
            return lastMove;

        }
        return lastMove;
    }
    export function clear_board() {
        Keima.Main.clearBoard();
    }
    export function finalScore() {
        let result: string = Keima.Main.gets("final_score");
        let color = result.substr(0, 1) === "W" ? "White" : "Black";
        let point = Number(result.substr(1));
        return { color, point };
    }
}
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
        return lastMove;
    }
    export function clear_board() {
        Keima.Main.clearBoard();
    }
}
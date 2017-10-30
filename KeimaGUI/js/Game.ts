

namespace Game {
    let gameOn = false;

    export function initialize() {
        Renderer.initialize();
    }


    export function setGameOn(value: boolean) {
        gameOn = value;

        GameInfo.updateState(gameOn);
    }

    export function isGameOn() {
        return gameOn;
    }
}
var Game;
(function (Game) {
    var gameOn = false;
    function initialize() {
        Renderer.initialize();
    }
    Game.initialize = initialize;
    function setGameOn(value) {
        gameOn = value;
        GameInfo.updateState(gameOn);
    }
    Game.setGameOn = setGameOn;
    function isGameOn() {
        return gameOn;
    }
    Game.isGameOn = isGameOn;
})(Game || (Game = {}));
//# sourceMappingURL=Game.js.map
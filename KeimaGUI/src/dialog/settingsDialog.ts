class SettingsDialog extends Dialog {
    private okButton = <HTMLButtonElement>document.getElementById("ok");
    private cancelButton = <HTMLButtonElement>document.getElementById("cancel");
    public constructor() {
        super(document.getElementById("settings-dialog"));
        this.okButton.addEventListener("click", () => {
            super.hide();
            var boardSize = <NodeListOf<HTMLInputElement>>document.getElementsByName("board-size");
            let size = 19;
            for (let i = 0; i < boardSize.length; i++) {
                if (boardSize[i].checked) {
                    size = Number(boardSize[i].value);
                }
            }
            var colors = <NodeListOf<HTMLInputElement>>document.getElementsByName("color");
            let color = "black";
            for (let i = 0; i < colors.length; i++) {
                if (colors[i].checked) {
                    color = colors[i].value;
                }
            }
            let board = document.getElementById("board");
            board.removeChild(board.childNodes[0]);
            Main.setBoardSize(size);
            Main.setPlayerColor(color);
        });
        this.cancelButton.addEventListener("click", () => {
            super.hide();
        });
    }


    public showDialog() {
        super.show();
        return this;
    }
}
const settingsDialog = new SettingsDialog(); 
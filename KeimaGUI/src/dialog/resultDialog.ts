

class ResultDialog extends Dialog {
    private content = document.getElementById("result-dialog-content");
    private okButton = <HTMLButtonElement>document.getElementById("result-dialog-ok");
    private yes: () => void;
    private no: () => void;
    public constructor() {
        super(document.getElementById("result-dialog"));
        this.okButton.addEventListener("click", () => {
            super.hide();
        });
    }
    public showDialog(title: string) {
        this.content.textContent = title;
        super.show();
        return this;
    }
}
let resultDialog = new ResultDialog();
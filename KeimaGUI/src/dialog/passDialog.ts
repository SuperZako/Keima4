/// <reference path="./dialog.ts" />

class PassDialog extends Dialog {
    private content = document.getElementById("pass-dialog-content");
    private yesButton = <HTMLButtonElement>document.getElementById("yes");
    private noButton = <HTMLButtonElement>document.getElementById("no");
    private yes: () => void;
    private no: () => void;
    public constructor() {
        super(document.getElementById("pass-dialog"));
        this.yesButton.addEventListener("click", () => {
            super.hide();
            this.yes();

        });
        this.noButton.addEventListener("click", () => {
            super.hide();
            if (this.no) {
                this.no();
            }
        });
    }

    public showDialog(title: string, yes: () => void, no?: () => void) {

        if (no === undefined) {
            this.noButton.style.display = "none";
        } else {
            this.noButton.style.display = "block";
        }

        this.content.textContent = title;
        this.yes = yes;
        this.no = no;

        super.show();
        return this;

    }
};

const passDialog = new PassDialog();
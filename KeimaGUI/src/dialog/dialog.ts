class Dialog {
    public constructor(protected overlay: HTMLElement) {

    }
    public show() {
        this.overlay.style.display = "flex";
    }
    public hide() {
        this.overlay.style.display = "none";
    }
}
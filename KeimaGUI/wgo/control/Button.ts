/// <reference path="./Clickable.ts" />
namespace WGo {
    /**
     * Widget of button with image icon. 
     */
    export class Button extends Clickable<HTMLButtonElement> {
        constructor(player, args) {
            super(player, args);
            var elem = this.element = document.createElement("button");
            elem.className = "wgo-button wgo-button-" + args.name;
            elem.title = WGo.t(args.name);

            this.init(player, args);
        }

        disable() {
            super.disable();
            this.element.disabled = true;//"disabled";
        }

        enable() {
            super.enable();
            this.element.disabled = false;//"";
        }
    }
}
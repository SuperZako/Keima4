/// <reference path="./Clickable.ts" />

namespace WGo {
    /**
     * Widget used in menu
     */
    export class MenuItem extends Clickable<HTMLDivElement> {

        constructor(player, args) {
            super(player, args);
            let elem = this.element = document.createElement("div");
            elem.className = "wgo-menu-item wgo-menu-item-" + args.name;
            elem.title = WGo.t(args.name);
            elem.innerHTML = elem.title;

            this.init(player, args);
        }
    }
}
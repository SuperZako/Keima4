/// <reference path="./Widget.ts" />
namespace WGo {

    /**
     * Widget for move counter.
     */
    export class MoveNumber extends Widget<HTMLFormElement> {
        move = document.createElement("input");
        constructor(player: Player) {
            super(player);
            this.element = document.createElement("form");
            this.element.className = "wgo-player-mn-wrapper";

            var move = this.move;// = document.createElement("input");
            move.type = "text";
            move.value = "0";
            (<any>move).maxlength = 3;
            move.className = "wgo-player-mn-value";
            //move.disabled = "disabled";
            this.element.appendChild(move);

            this.element.onsubmit = move.onchange = function (player) {
                player.goTo(this.getValue());
                return false;
            }.bind(this, player);

            player.addEventListener("update", (e) => {
                this.setValue(e.path.m);
            });

            player.addEventListener("kifuLoaded", this.enable.bind(this));
            player.addEventListener("frozen", this.disable.bind(this));
            player.addEventListener("unfrozen", this.enable.bind(this));
        }

        public disable() {
            super.disable();
            this.move.disabled = false;//"disabled";
        }

        public enable() {
            super.enable();
            this.move.disabled = true;//"";
        }

        public setValue(n) {
            this.move.value = n;
        }

        public getValue() {
            return parseInt(this.move.value);
        }
    }
}
/// <reference path="./Widget.ts" />
namespace WGo {
    /**
      * Clickable widget - for example button. It has click action. 
      *
      * args = {
      *   title: String, // required
      *	 init: Function, // other initialization code can be here
      *	 click: Function, // required *** onclick event
      *   togglable: BOOLEAN, // default false
      *	 selected: BOOLEAN, // default false
      *	 disabled: BOOLEAN, // default false
      *	 multiple: BOOLEAN
      * }
      */

    export class Clickable<T extends HTMLElement> extends Widget<T> {
        selected: boolean;
        _touch_i: number;
        _touch_int: number;
        constructor(player, args) {
            super(player, args);
        }

        public init(player, args) {
            var fn: () => void;

            if (args.togglable) {
                fn = () => {
                    if (this.disabled) {
                        return;
                    }
                    if (args.click.call(this, player)) {
                        this.select();
                    } else {
                        this.unselect();
                    }
                };
            } else {
                fn = () => {
                    if (this.disabled) return;
                    args.click.call(this, player);
                };
            }

            this.element.addEventListener("click", fn);
            this.element.addEventListener("touchstart", (e) => {
                e.preventDefault();
                fn();
                if (args.multiple) {
                    this._touch_i = 0;
                    this._touch_int = window.setInterval(() => {
                        if (this._touch_i > 500) {
                            fn();
                        }
                        this._touch_i += 100;
                    }, 100);
                }
                return false;
            });

            if (args.multiple) {
                this.element.addEventListener("touchend", (e) => {
                    window.clearInterval(this._touch_int);
                });
            }

            if (args.disabled)
                this.disable();
            if (args.init)
                args.init.call(this, player);
        }

        public select() {
            this.selected = true;
            if (this.element.className.search("wgo-selected") == -1)
                this.element.className += " wgo-selected";
        }

        public unselect() {
            this.selected = false;
            this.element.className = this.element.className.replace(" wgo-selected", "");
        }
    }
}
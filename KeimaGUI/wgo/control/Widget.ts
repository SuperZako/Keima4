namespace WGo {
    /**
     * Control.Widget base class. It is used for implementing buttons and other widgets.
     * First parameter is BasicPlayer object, second can be configuratioon object. 
     *
     * args = {
     *   name: String, // required - it is used for class name
     *	 init: Function, // other initialization code can be here
     *	 disabled: BOOLEAN, // default false
     * }
     */
    interface WidgetArguments {
        name: string;
        init;
        disabled: boolean;
        type?;
    }
    export class Widget<T extends HTMLElement> {
        element: T;
        disabled: boolean;
        constructor(player: Player, args?: WidgetArguments) {
            this.element = this.element || document.createElement((args && args.type) ? args.type : "div");
            if (args) {
                this.element.className = "wgo-widget-" + (args && args.name) ? args.name : "";
            }
            this.init(player, args);
        }

        /**
         * Initialization function.
         */
        public init(player: Player, args: WidgetArguments) {
            if (!args) {
                return;
            }
            if (args.disabled) {
                this.disable();
            }
            if (args.init) {
                args.init.call(this, player);
            }
        }

        /**
         * Append to element.
           */
        public appendTo(target: HTMLElement) {
            target.appendChild(this.element);
        }

        /**
         * Make button disabled - eventual click listener mustn't be working.
           */

        public disable() {
            this.disabled = true;
            if (this.element.className.search("wgo-disabled") == -1) {
                this.element.className += " wgo-disabled";
            }
        }

        /**
         * Make button working
         */
        public enable() {
            this.disabled = false;
            this.element.className = this.element.className.replace(" wgo-disabled", "");
            // (<HTMLButtonElement>this.element).disabled = false;
        }

    }
}
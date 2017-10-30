/// <reference path="./player/basicplayer.ts" />
namespace WGo {

    "use strict";

    /**
     * Base class for BasicPlayer's component. Each component should implement this interface.
     */

    export class Component {
        element = document.createElement("div");
        constructor() { }
        /**
         * Append component to element.
         */

        public appendTo(target: HTMLElement) {
            target.appendChild(this.element);
        }

        /**
         * Compute and return width of component.
         */

        public getWidth() {
            var css = window.getComputedStyle(this.element);
            return parseInt(css.width);
        }

        /**
         * Compute and return height of component.
         */

        public getHeight() {
            var css = window.getComputedStyle(this.element);
            return parseInt(css.height);
        }

        /**
         * Update component. Actually dimensions are defined and cannot be changed in this method, 
         * but you can change for example font size according to new dimensions.
         */

        public updateDimensions() {
        }
    }
    BasicPlayer.component.Component = Component;
}
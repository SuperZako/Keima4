namespace WGo {
    export class CanvasLayer {
        element = document.createElement('canvas');
        context: CanvasRenderingContext2D;
        pixelRatio: number;
        constructor() {
            // this.element = document.createElement('canvas');
            this.context = this.element.getContext('2d');

            // Adjust pixel ratio for HDPI screens (e.g. Retina)
            this.pixelRatio = window.devicePixelRatio || 1;
            if (this.pixelRatio > 1) {
                this.context.scale(this.pixelRatio, this.pixelRatio);
            }
        }
        public setDimensions(width: number, height: number) {
            this.element.width = width;
            this.element.style.width = (width / this.pixelRatio) + 'px';
            this.element.height = height;
            this.element.style.height = (height / this.pixelRatio) + 'px';
        }

        appendTo(element, weight) {
            this.element.style.position = 'absolute';
            this.element.style.zIndex = weight;
            element.appendChild(this.element);
        }
        removeFrom(element) {
            element.removeChild(this.element);
        }
        getContext(args: { x: number, y: number }) {
            return this.context;
        }
        draw(board) {
        }
        clear(element, weight) {
            this.context.clearRect(0, 0, this.element.width, this.element.height);
        }
    }
}
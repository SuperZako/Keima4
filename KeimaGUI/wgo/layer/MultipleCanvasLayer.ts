namespace WGo {
    /**
       * Layer that is composed from more canvases. The proper canvas is selected according to drawn object.
       * In default there are 4 canvases and they are used for board objects like stones. This allows overlapping of objects.
       */
    export class MultipleCanvasLayer extends CanvasLayer {
        layers: number;
        elements: HTMLCanvasElement[] = [];
        contexts: CanvasRenderingContext2D[] = [];
        constructor() {
            super();
            this.init(4);
        }

        init(n: number) {
            this.layers = n;

            this.elements = [];
            this.contexts = [];

            // Adjust pixel ratio for HDPI screens (e.g. Retina)
            this.pixelRatio = window.devicePixelRatio || 1;

            for (var i = 0; i < n; i++) {
                let tmp = document.createElement('canvas');
                let tmpContext = tmp.getContext('2d');

                if (this.pixelRatio > 1) {
                    tmpContext.scale(this.pixelRatio, this.pixelRatio);
                }

                this.elements.push(tmp);
                this.contexts.push(tmpContext);
            }
        }

        appendTo(element, weight) {
            for (var i = 0; i < this.layers; i++) {
                this.elements[i].style.position = 'absolute';
                this.elements[i].style.zIndex = weight;
                element.appendChild(this.elements[i]);
            }
        }

        removeFrom(element) {
            for (var i = 0; i < this.layers; i++) {
                element.removeChild(this.elements[i]);
            }
        }

        getContext(args: { x: number, y: number }) {
            if (args.x % 2) {
                return (args.y % 2) ? this.contexts[0] : this.contexts[1];
            }
            else {
                return (args.y % 2) ? this.contexts[2] : this.contexts[3];
            }
            //return ((args.x%2) && (args.y%2) || !(args.x%2) && !(args.y%2)) ? this.context_odd : this.context_even;
        }

        clear(element, weight) {
            for (var i = 0; i < this.layers; i++) {
                this.contexts[i].clearRect(0, 0, this.elements[i].width, this.elements[i].height);
            }
        }

        setDimensions(width, height) {
            for (var i = 0; i < this.layers; i++) {
                this.elements[i].width = width;
                this.elements[i].style.width = (width / this.pixelRatio) + 'px';
                this.elements[i].height = height;
                this.elements[i].style.height = (height / this.pixelRatio) + 'px';
            }
        }
    }
}
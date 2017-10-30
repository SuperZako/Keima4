namespace WGo {
    export class ShadowLayer extends MultipleCanvasLayer {
        // shadowSize: number;
        board;
        constructor(board: Board, private shadowSize = 1, shadowBlur?) {
            super();
            this.init(2);
            // this.shadowSize = shadowSize === undefined ? 1 : shadowSize;
            this.board = board;
        }

        getContext(args) {
            return ((args.x % 2) && (args.y % 2) || !(args.x % 2) && !(args.y % 2)) ? this.contexts[0] : this.contexts[1];
        }

        setDimensions(width, height) {
            super.setDimensions(width, height);

            for (var i = 0; i < this.layers; i++) {
                this.contexts[i].setTransform(1, 0, 0, 1, Math.round(this.shadowSize * this.board.stoneRadius / 7), Math.round(this.shadowSize * this.board.stoneRadius / 7));
            }
        }
    }
}
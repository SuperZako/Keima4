namespace WGo {

    export enum StoneColor {
        Black = 1,
        White = -1
    };
    const ToColumnIndex: { [key: number]: string } = {
        0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "J", 9: "K",
        10: "L", 11: "M", 12: "N", 13: "O", 14: "P", 15: "Q", 16: "R", 17: "S", 18: "T",
    };
    const ToNumber: { [key: string]: number } = {
        "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7, "J": 8, "K": 9,
        "L": 10, "M": 11, "N": 12, "O": 13, "P": 14, "Q": 15, "R": 16, "S": 17, "T": 18,
    };
    export class GameLogic {
        editMode = false;
        originalReader: KifuReader;
        _ev_click;
        _ev_move;
        _ev_out;
        _lastX;
        _lastY;
        _last_mark;
        private turn = StoneColor.Black;
        constructor(private player: Player, private board: Board, private playerColor: StoneColor) {
            this.set(!this.editMode);


            //if (playerColor !== this.turn) {
            //    this.genmove(this.turn);
            //}

        }
        private genmove(color: StoneColor) {
            let result = Commands.genmove(color);
            let x = ToNumber[result.pos.substring(0, 1)];
            let y = Number(result.pos.substring(1));
            this.play(x, y);
            this.turn = -this.turn;//
        }
        // board mousemove callback for edit move - adds highlighting
        private edit_board_mouse_move(x, y) {
            if (this.player.frozen || (this._lastX == x && this._lastY == y)) {
                return;
            }

            this._lastX = x;
            this._lastY = y;

            if (this._last_mark) {
                this.board.removeObject(this._last_mark);
            }

            if (x != -1 && y != -1 && this.player.kifuReader.game.isValid(x, y)) {
                this._last_mark = {
                    type: "outline",
                    x: x,
                    y: y,
                    c: this.player.kifuReader.game.turn
                };
                this.board.addObject(this._last_mark);
            } else {
                delete this._last_mark;
            }
        }

        // board mouseout callback for edit move	
        private edit_board_mouse_out() {
            if (this._last_mark) {
                this.board.removeObject(this._last_mark);
                delete this._last_mark;
                delete this._lastX;
                delete this._lastY;
            }
        }

        // get differences of two positions as a change object (TODO create a better solution, without need of this function)
        private pos_diff(old_p: Position, new_p: Position) {
            var size = old_p.size, add = [], remove = [];

            for (var i = 0; i < size * size; i++) {
                if (old_p.schema[i] && !new_p.schema[i]) {
                    remove.push({ x: Math.floor(i / size), y: i % size });
                } else if (old_p.schema[i] != new_p.schema[i]) {
                    add.push({ x: Math.floor(i / size), y: i % size, c: new_p.schema[i] });
                }
            }

            return {
                add: add,
                remove: remove
            }
        }
        public set(set) {
            if (!this.editMode && set) {
                // save original kifu reader
                // this.originalReader = this.player.kifuReader;

                // create new reader with cloned kifu
                // this.player.kifuReader = new KifuReader(this.player.kifu.clone(), this.originalReader.rememberPath, this.originalReader.allow_illegal);

                // go to current position
                // this.player.kifuReader.goTo(this.originalReader.path);


                Commands.clear_board();
                const kifuReader = this.player.kifuReader;
                let current = kifuReader.path.m;
                for (var i = 0; i < current; i++) {
                    kifuReader.next();
                    let move = kifuReader.change.add[0];
                    Commands.play(move.c, ToColumnIndex[move.x] + String(19 - move.y));
                }

                // register edit listeners
                this._ev_click = this._ev_click || this.click.bind(this);//this.play.bind(this);
                this._ev_move = this._ev_move || this.edit_board_mouse_move.bind(this);
                this._ev_out = this._ev_out || this.edit_board_mouse_out.bind(this);

                this.board.addEventListener("click", this._ev_click);
                this.board.addEventListener("mousemove", this._ev_move);
                this.board.addEventListener("mouseout", this._ev_out);

                this.editMode = true;


                if (this.playerColor !== this.turn) {
                    this.genmove(this.turn);
                }
            } else if (this.editMode && !set) {
                // go to the last original position
                this.originalReader.goTo(this.player.kifuReader.path);

                // change object isn't actual - update it, not elegant solution, but simple
                this.originalReader.change = this.pos_diff(this.player.kifuReader.getPosition(), this.originalReader.getPosition());

                // update kifu reader
                this.player.kifuReader = this.originalReader;
                this.player.update(true);

                // remove edit listeners
                this.board.removeEventListener("click", this._ev_click);
                this.board.removeEventListener("mousemove", this._ev_move);
                this.board.removeEventListener("mouseout", this._ev_out);

                this.editMode = false;
            }
        }
        public click(x: number, y: number) {
            if (this.player.kifuReader.game.isValid(x, y)) {
                Commands.play(this.turn, ToColumnIndex[x] + (19 - y));
                this.play(x, y);
                this.turn = this.turn === StoneColor.Black ? StoneColor.White : StoneColor.Black;

                if (this.playerColor !== this.turn) {
                    setTimeout(() => {
                        this.genmove(this.turn);
                    }, 10);
                }
            }
        }
        public play(x: number, y: number) {
            const player = this.player;
            if (this.player.frozen || !this.player.kifuReader.game.isValid(x, y)) {
                return;
            }

            this.player.kifuReader.node.appendChild(new KNode({
                move: {
                    x: x,
                    y: y,
                    c: this.player.kifuReader.game.turn
                },
                _edited: true
            }));
            this.player.next(this.player.kifuReader.node.children.length - 1);

            this.player.dispatchEvent({
                type: "frozen",
                target: this.player,
            });
        }
    }
}
namespace WGo {


    function pos_diff(old_p: Position, new_p: Position) {
        let size = old_p.size;
        let add: { x: number, y: number, c: number }[] = [];
        let remove: { x: number, y: number }[] = [];

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


    // change game object according to node, return changes
    function exec_node(game: Game, node, first?) {
        if (node.parent) {
            node.parent._last_selected = node.parent.children.indexOf(node);
        }

        // handle moves nodes
        if (node.move != undefined) {
            if (node.move.pass) {
                game.pass(node.move.c);
                return { add: [], remove: [] };
            }
            else {
                var res = game.play(node.move.x, node.move.y, node.move.c);
                if (typeof res == "number") throw new InvalidMoveError(res, node);
                // we must check whether to add move (it can be suicide)
                for (var i in <any[]>res) {
                    if (res[i].x == node.move.x && res[i].y == node.move.y) {
                        return {
                            add: [],
                            remove: res
                        }
                    }
                }
                return {
                    add: [node.move],
                    remove: res
                }
            }
        }
        // handle other(setup) nodes
        else {
            if (!first)
                game.pushPosition();

            var add = [], remove = [];

            if (node.setup != undefined) {
                for (var i in node.setup) {
                    if (node.setup[i].c) {
                        game.setStone(node.setup[i].x, node.setup[i].y, node.setup[i].c);
                        add.push(node.setup[i]);
                    }
                    else {
                        game.removeStone(node.setup[i].x, node.setup[i].y);
                        remove.push(node.setup[i]);
                    }
                }
            }

            if (node.turn) game.turn = node.turn;

            return {
                add: add,
                remove: remove
            };
        }
    }


    function set_subtract(a, b) {
        var n = [];
        let q: boolean;
        for (var i in a) {
            q = true;
            for (var j in b) {
                if (a[i].x == b[j].x && a[i].y == b[j].y) {
                    q = false;
                    break;
                }
            }
            if (q) {
                n.push(a[i]);
            }
        }
        return n;
    }

    var concat_changes = function (ch_orig, ch_new) {
        ch_orig.add = set_subtract(ch_orig.add, ch_new.remove).concat(ch_new.add);
        ch_orig.remove = set_subtract(ch_orig.remove, ch_new.add).concat(ch_new.remove);
    }

    /**
     * KifuReader object is capable of reading a kifu nodes and executing them. It contains Game object with actual position.
     * Variable change contains last changes of position.
     * If parameter rememberPath is set, KifuReader will remember last selected child of all nodes.
     * If parameter allowIllegalMoves is set, illegal moves will be played instead of throwing an exception
     */

    export class KifuReader {
        node: KNode;
        allow_illegal;
        game: Game;
        path = { m: 0 };
        change;
        rememberPath;
        repeating: string;
        constructor(private kifu: Kifu, rememberPath, allowIllegalMoves) {
            this.node = this.kifu.root;
            this.allow_illegal = allowIllegalMoves || false;
            this.game = new Game(this.kifu.size, this.allow_illegal ? "NONE" : "KO", this.allow_illegal, this.allow_illegal);
            // this.path = { m: 0 };

            if (this.kifu.info["HA"] && this.kifu.info["HA"] > 1) {
                this.game.turn = WGo.W;
            }
            this.change = exec_node(this.game, this.node, true);

            if (rememberPath) {
                this.rememberPath = true;
            } else {
                this.rememberPath = false;
            }
        }

        private exec_first() {
            //if(!this.node.parent) return;

            this.game.firstPosition();
            this.node = this.kifu.root;

            this.path = { m: 0 };

            if (this.kifu.info["HA"] && this.kifu.info["HA"] > 1) {
                this.game.turn = WGo.W;
            }
            this.change = exec_node(this.game, this.node, true);
        }
        private exec_previous() {
            if (!this.node.parent) {
                return false;
            }

            this.node = this.node.parent;

            this.game.popPosition();
            if (this.node.turn) {
                this.game.turn = this.node.turn;
            }

            if (this.path[this.path.m] !== undefined) {
                delete this.path[this.path.m];
            }
            this.path.m--;

            return true;
        }
        public exec_next(i?) {
            if (i === undefined && this.rememberPath) {
                i = this.node._last_selected;
            }
            i = i || 0;
            var node = this.node.children[i];

            if (!node) {
                return false;
            }

            var ch = exec_node(this.game, node);

            this.path.m++;
            if (this.node.children.length > 1) {
                this.path[this.path.m] = i;
            }

            this.node = node;
            return ch;
        }

        /**
         * Go to next node and if there is a move play it.
         */

        next(i?) {
            this.change = this.exec_next(i);
            return this;
        }

        /**
         * Execute all nodes till the end.
         */

        last() {
            var ch;
            this.change = {
                add: [],
                remove: []
            }
            while (ch = this.exec_next()) {
                concat_changes(this.change, ch);
            }
            return this;
        }

        /**
         * Return to the previous position (redo actual node) 
         */

        previous() {
            var old_pos = this.game.getPosition();
            this.exec_previous();
            this.change = pos_diff(old_pos, this.game.getPosition());
            return this;
        }

        /**
         * Go to the initial position
         */

        first() {
            var old_pos = this.game.getPosition();
            this.exec_first();
            this.change = pos_diff(old_pos, this.game.getPosition());
            return this;
        }

        /**
         * Go to position specified by path object
         */

        goTo(path) {
            if (path === undefined) {
                return this;
            }

            var old_pos = this.game.getPosition();

            this.exec_first();

            var r;

            for (var i = 0; i < path.m; i++) {
                if (!this.exec_next(path[i + 1])) {
                    break;
                }
            }

            this.change = pos_diff(old_pos, this.game.getPosition());
            return this;
        }

        /**
         * Go to previous fork (a node with more than one child)
         */

        previousFork() {
            var old_pos = this.game.getPosition();
            while (this.exec_previous() && this.node.children.length == 1) { };
            this.change = pos_diff(old_pos, this.game.getPosition());
            return this;
        }

        /**
         * Shortcut. Get actual position object.
         */

        getPosition() {
            return this.game.getPosition();
        }

        /**
         * Allow or disallow illegal moves to be played
         */

        allowIllegalMoves(b) {
            if (b) {
                this.game.allow_rewrite = true;
                this.game.allow_suicide = true;
                this.repeating = "NONE";
            }
            else {
                this.game.allow_rewrite = false;
                this.game.allow_suicide = false;
                this.repeating = "KO";
            }
        }
    }
}
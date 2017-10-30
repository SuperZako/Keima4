﻿namespace WGo {
    //-------- WGo.Game ---------------------------------------------------------------------------
    // function for stone capturing
    var do_capture = function (position: Position, captured: { x: number, y: number }[], x, y, c) {
        if (x >= 0 && x < position.size && y >= 0 && y < position.size && position.get(x, y) == c) {
            position.set(x, y, 0);
            captured.push({ x: x, y: y });

            do_capture(position, captured, x, y - 1, c);
            do_capture(position, captured, x, y + 1, c);
            do_capture(position, captured, x - 1, y, c);
            do_capture(position, captured, x + 1, y, c);
        }
    }

    // looking at liberties
    var check_liberties = function (position, testing, x: number, y: number, c) {
        // out of the board there aren't liberties
        if (x < 0 || x >= position.size || y < 0 || y >= position.size) return true;
        // however empty field means liberty
        if (position.get(x, y) == 0) return false;
        // already tested field or stone of enemy isn't giving us a liberty.
        if (testing.get(x, y) == true || position.get(x, y) == -c) return true;

        // set this field as tested
        testing.set(x, y, true);

        // in this case we are checking our stone, if we get 4 trues, it has no liberty
        return check_liberties(position, testing, x, y - 1, c) &&
            check_liberties(position, testing, x, y + 1, c) &&
            check_liberties(position, testing, x - 1, y, c) &&
            check_liberties(position, testing, x + 1, y, c);
    }

    // analysing function - modifies original position, if there are some capturing, and returns array of captured stones
    function check_capturing(position: Position, x: number, y: number, c) {
        var captured = [];
        // is there a stone possible to capture?
        if (x >= 0 && x < position.size && y >= 0 && y < position.size && position.get(x, y) == c) {
            // create testing map
            var testing = new Position(position.size);
            // if it has zero liberties capture it
            if (check_liberties(position, testing, x, y, c)) {
                // capture stones from game
                do_capture(position, captured, x, y, c);
            }
        }
        return captured;
    }




    /**
     * Creates instance of game class.
     *
     * @class
     * This class implements game logic. It basically analyses given moves and returns capture stones.
     * WGo.Game also stores every position from beginning, so it has ability to check repeating positions
     * and it can effectively restore old positions.</p>
     *
     * @param {number} size of the board
     * @param {"KO"|"ALL"|"NONE"} checkRepeat (optional, default is "KO") - how to handle repeated position:
     * KO - ko is properly handled - position cannot be same like previous position
     * ALL - position cannot be same like any previous position - e.g. it forbids triple ko
     * NONE - position can be repeated
     *
     * @param {boolean} allowRewrite (optional, default is false) - allow to play moves, which were already played:
     * @param {boolean} allowSuicide (optional, default is false) - allow to play suicides, stones are immediately captured
     */
    export class Game {
        repeating: string;
        allow_rewrite: boolean;
        allow_suicide: boolean;
        stack: Position[] = [];
        turn: number;
        constructor(private size = 19, checkRepeat: string, allowRewrite: boolean, allowSuicide) {
            this.repeating = checkRepeat === undefined ? "KO" : checkRepeat; // possible values: KO, ALL or nothing
            this.allow_rewrite = allowRewrite || false;
            this.allow_suicide = allowSuicide || false;

            this.stack[0] = new Position(this.size);
            this.stack[0].capCount = { black: 0, white: 0 };
            this.turn = WGo.B;

        }
        get position() { return this.stack[this.stack.length - 1]; }
        set position(pos: Position) { this.stack[this.stack.length - 1] = pos; }

        /**
         * Gets actual position.
         *
         * @return {WGo.Position} actual position
         */
        public getPosition() { return this.stack[this.stack.length - 1]; }


        // analysing history
        private checkHistory(position, x, y) {
            var flag, stop;

            if (this.repeating == "KO" && this.stack.length - 2 >= 0) stop = this.stack.length - 2;
            else if (this.repeating == "ALL") stop = 0;
            else return true;

            for (var i = this.stack.length - 2; i >= stop; i--) {
                if (this.stack[i].get(x, y) == position.get(x, y)) {
                    flag = true;
                    for (var j = 0; j < this.size * this.size; j++) {
                        if (this.stack[i].schema[j] != position.schema[j]) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) return false;
                }
            }

            return true;
        }
        /**
         * Play move.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @param {(WGo.B|WGo.W)} c color
         * @param {boolean} noplay - if true, move isn't played. Used by WGo.Game.isValid.
         * @return {number} code of error, if move isn't valid. If it is valid, function returns array of captured stones.
         *
         * Error codes:
         * 1 - given coordinates are not on board
         * 2 - on given coordinates already is a stone
         * 3 - suicide (currently they are forbbiden)
         * 4 - repeated position
         */
        public play(x, y, c, noplay?) {
            //check coordinates validity
            if (!this.isOnBoard(x, y)) {
                return 1;
            }
            if (!this.allow_rewrite && this.position.get(x, y) != 0) {
                return 2;
            }

            // clone position
            if (!c) c = this.turn;

            var new_pos = this.position.clone();
            new_pos.set(x, y, c);

            // check capturing
            var cap_color = c;
            var captured = check_capturing(new_pos, x - 1, y, -c).concat(check_capturing(new_pos, x + 1, y, -c), check_capturing(new_pos, x, y - 1, -c), check_capturing(new_pos, x, y + 1, -c));

            // check suicide
            if (!captured.length) {
                var testing = new Position(this.size);
                if (check_liberties(new_pos, testing, x, y, c)) {
                    if (this.allow_suicide) {
                        cap_color = -c;
                        do_capture(new_pos, captured, x, y, c);
                    }
                    else return 3;
                }
            }

            // check history
            if (this.repeating && !this.checkHistory(new_pos, x, y)) {
                return 4;
            }

            if (noplay) {
                return false;
            }

            // update position info
            new_pos.color = c;
            new_pos.capCount = {
                black: this.position.capCount.black,
                white: this.position.capCount.white
            };
            if (cap_color == WGo.B) {
                new_pos.capCount.black += captured.length;
            } else {
                new_pos.capCount.white += captured.length;
            }
            // save position
            this.pushPosition(new_pos);

            // reverse turn
            this.turn = -c;

            return captured;
        }

        /**
         * Play pass.
         *
         * @param {(WGo.B|WGo.W)} c color
         */

        pass(c) {
            this.pushPosition();
            if (c) {
                this.position.color = c;
                this.turn = -c;
            }
            else {
                this.position.color = this.turn;
                this.turn = -this.turn;
            }
        }

        /**
         * Finds out validity of the move.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @param {(WGo.B|WGo.W)} c color
         * @return {boolean} true if move can be played.
         */

        isValid(x: number, y: number, c?: number) {
            return typeof this.play(x, y, c, true) != "number";
        }

        /**
         * Controls position of the move.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @return {boolean} true if move is on board.
         */

        public isOnBoard(x: number, y: number) {
            return x >= 0 && y >= 0 && x < this.size && y < this.size;
        }

        /**
         * Inserts move into current position. Use for setting position, for example in handicap game. Field must be empty.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @param {(WGo.B|WGo.W)} c color
         * @return {boolean} true if operation is successfull.
         */

        public addStone(x: number, y: number, c) {
            if (this.isOnBoard(x, y) && this.position.get(x, y) == 0) {
                this.position.set(x, y, c || 0);
                return true;
            }
            return false;
        }

        /**
         * Removes move from current position.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @return {boolean} true if operation is successfull.
         */

        removeStone(x: number, y: number) {
            if (this.isOnBoard(x, y) && this.position.get(x, y) != 0) {
                this.position.set(x, y, 0);
                return true;
            }
            return false;
        }

        /**
         * Set or insert move of current position.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @param {(WGo.B|WGo.W)} c color
         * @return {boolean} true if operation is successfull.
         */

        public setStone(x: number, y: number, c: number) {
            if (this.isOnBoard(x, y)) {
                this.position.set(x, y, c || 0);
                return true;
            }
            return false;
        }

        /**
         * Get stone on given position.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @return {(WGo.B|WGo.W|0)} color
         */

        public getStone(x: number, y: number) {
            if (this.isOnBoard(x, y)) {
                return this.position.get(x, y);
            }
            return 0;
        }

        /**
         * Add position to stack. If position isn't specified current position is cloned and stacked.
         * Pointer of actual position is moved to the new position.
         *
         * @param {WGo.Position} tmp position (optional)
         */

        public pushPosition(pos?: Position) {
            if (!pos) {
                var pos = this.position.clone();
                pos.capCount = {
                    black: this.position.capCount.black,
                    white: this.position.capCount.white
                };
                pos.color = this.position.color;
            }
            this.stack.push(pos);
            if (pos.color) {
                this.turn = -pos.color;
            }
            return this;
        }

        /**
         * Remove current position from stack. Pointer of actual position is moved to the previous position.
         */

        popPosition() {
            var old = null;
            if (this.stack.length > 0) {
                old = this.stack.pop();

                if (this.stack.length == 0) {
                    this.turn = WGo.B;
                } else if (this.position.color) {
                    this.turn = -this.position.color;
                } else {
                    this.turn = -this.turn;
                }
            }
            return old;
        }

        /**
         * Removes all positions.
         */

        firstPosition() {
            this.stack = [];
            this.stack[0] = new Position(this.size);
            this.stack[0].capCount = { black: 0, white: 0 };
            this.turn = WGo.B;
            return this;
        }

        /**
         * Gets count of captured stones.
         *
         * @param {(WGo.BLACK|WGo.WHITE)} color
         * @return {number} count
         */

        getCaptureCount(color) {
            return color == WGo.B ? this.position.capCount.black : this.position.capCount.white;
        }

        /**
         * Validate postion. Position is tested from 0:0 to size:size, if there are some moves, that should be captured, they will be removed.
         * You can use this, after insertion of more stones.
         *
         * @return array removed stones
         */
        public validatePosition() {
            var p,
                white = 0,
                black = 0,
                captured = [],
                new_pos = this.position.clone();

            for (let x = 0; x < this.size; x++) {
                for (let y = 0; y < this.size; y++) {
                    let c = this.position.get(x, y);
                    if (c) {
                        p = captured.length;
                        captured = captured.concat(check_capturing(new_pos, x - 1, y, -c),
                            check_capturing(new_pos, x + 1, y, -c),
                            check_capturing(new_pos, x, y - 1, -c),
                            check_capturing(new_pos, x, y + 1, -c));

                        if (c == WGo.B) {
                            black += captured.length - p;
                        } else {
                            white += captured.length - p;
                        }
                    }
                }
            }
            this.position.capCount.black += black;
            this.position.capCount.white += white;
            this.position.schema = new_pos.schema;

            return captured;
        }
    }
}
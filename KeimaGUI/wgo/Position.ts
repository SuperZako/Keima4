namespace WGo {
    /**
     * Creates instance of position object.
     *
     * @class
     * <p>WGo.Position is simple object storing position of go game. It is implemented as matrix <em>size</em> x <em>size</em> with values WGo.BLACK, WGo.WHITE or 0. It can be used by any extension.</p>
     *
     * @param {number} size of the board
     */
    // BoardInfo
    export class Position {
        schema: number[] = [];
        capCount: { black: number, white: number };
        color: number;
        constructor(public size = 19) {
            for (let i = 0; i < this.size * this.size; i++) {
                this.schema[i] = 0;
            }
        }
        /**
         * Returns value of given coordinates.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @return {(WGo.BLACK|WGo.WHITE|0)} color
         */
        get(x: number, y: number) {
            if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
                return undefined;
            }
            return this.schema[x * this.size + y];
        }

        /**
         * Sets value of given coordinates.
         *
         * @param {number} x coordinate
         * @param {number} y coordinate
         * @param {(WGo.B|WGo.W|0)} c color
         */

        set(x, y, c) {
            this.schema[x * this.size + y] = c;
            return this;
        }

        /**
         * Clears the whole position (every value is set to 0).
         */

        clear() {
            for (var i = 0; i < this.size * this.size; i++) {
                this.schema[i] = 0;
            }
            return this;
        }

        /**
         * Clones the whole position.
         *
         * @return {WGo.Position} copy of position
         */
        public clone() {
            var clone = new Position(this.size);
            clone.schema = this.schema.slice(0);
            return clone;
        }

        /**
         * Compares this position with another position and return change object
         *
         * @param {WGo.Position} position to compare to.
         * @return {object} change object with structure: {add:[], remove:[]}
         */

        compare(position: Position) {
            var add = [], remove = [];

            for (var i = 0; i < this.size * this.size; i++) {
                if (this.schema[i] && !position.schema[i]) remove.push({
                    x: Math.floor(i / this.size),
                    y: i % this.size
                });
                else if (this.schema[i] != position.schema[i]) add.push({
                    x: Math.floor(i / this.size),
                    y: i % this.size,
                    c: position.schema[i]
                });
            }

            return {
                add: add,
                remove: remove
            }
        }
    }
}
namespace WGo {


    interface IKNode {
        move: { x: number, y: number, c: number };
        _edited: boolean;
    };

    /**
     * Node class of kifu game tree. It can contain move, setup or markup properties.
     *
     * @param {object} properties
     * @param {KNode} parent (null for root node)
     */
    export class KNode implements IKNode {

        move: { x: number, y: number, c: number };
        _edited: boolean;


        children: KNode[] = [];
        setup;
        markup;
        turn;
        _last_selected;
        constructor(properties?: IKNode, public parent?: KNode) {
            // save all properties
            if (properties) {
                for (var key in properties) {
                    this[key] = properties[key];
                }
            }
        }
        private no_add(arr, obj, key) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].x == obj.x && arr[i].y == obj.y) {
                    arr[i][key] = obj[key];
                    return;
                }
            }
            arr.push(obj);
        }

        private no_remove(arr: { x: number, y: number }[], obj) {
            if (!arr)
                return;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].x == obj.x && arr[i].y == obj.y) {
                    arr.splice(i, 1);
                    return;
                }
            }
        }
        /**
         * Get node's children specified by index. If it doesn't exist, method returns null.
         */
        public getChild(ch) {
            var i = ch || 0;
            if (this.children[i])
                return this.children[i];
            else return null;
        }

        /**
         * Add setup property.
         * 
         * @param {object} setup object with structure: {x:<x coordinate>, y:<y coordinate>, c:<color>}
         */
        public addSetup(setup) {
            this.setup = this.setup || [];
            this.no_add(this.setup, setup, "c");
            return this;
        }

        /**
         * Remove setup property.
         * 
         * @param {object} setup object with structure: {x:<x coordinate>, y:<y coordinate>}
         */
        public removeSetup(setup: { x: number, y: number }) {
            this.no_remove(this.setup, setup);
            return this;
        }

        /**
         * Add markup property.
         * 
         * @param {object} markup object with structure: {x:<x coordinate>, y:<y coordinate>, type:<type>}
         */
        public addMarkup(markup) {
            this.markup = this.markup || [];
            this.no_add(this.markup, markup, "type");
            return this;
        }

        /**
         * Remove markup property.
         * 
         * @param {object} markup object with structure: {x:<x coordinate>, y:<y coordinate>}
         */
        public removeMarkup(markup) {
            this.no_remove(this.markup, markup);
            return this;
        }

        /**
         * Remove this node.
         * Node is removed from its parent and children are passed to parent.
         */
        public remove() {
            var p = this.parent;
            if (!p) {
                // throw new Exception("Root node cannot be removed");
            }
            for (let i = 0; i < p.children.length; ++i) {
                if (p.children[i] == this) {
                    p.children.splice(i, 1);
                    break;
                }
            }
            p.children = p.children.concat(this.children);
            this.parent = null;
            return p;
        }

        /**
         * Insert node after this node. All children are passed to new node.
         */

        public insertAfter(node: KNode) {
            for (var child in this.children) {
                this.children[child].parent = node;
            }
            node.children = node.children.concat(this.children);
            node.parent = this;
            this.children = [node];
            return node;
        }

        /**
         * Append child node to this node.
         */

        public appendChild(node: KNode) {
            node.parent = this;
            this.children.push(node);
            return node;
        }

        /**
         * Get properties as object.
         */

        public getProperties() {
            var props: any = {};
            for (var key in this) {
                if (this.hasOwnProperty(key) && key != "children" && key != "parent" && key[0] != "_")
                    props[key] = this[key];
            }
            return props;
        }
    }
}
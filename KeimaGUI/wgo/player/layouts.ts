namespace WGo {
    export interface Layout {
        top?: string[];
        left?: string[];
        bottom?: string[];
        right?: string[];
    }
    /**
     * Preset layouts
     * They have defined regions as arrays, which can contain components. For each of these layouts each component specifies where it is placed.
     * You can create your own layout in same manners, but you must specify components manually.
     */
    export var layouts: { [key: string]: Layout } = {
        "one_column": {
            top: [],
            bottom: [],
        },
        "no_comment": {
            top: [],
            bottom: [],
        },
        "right_top": {
            top: [],
            right: [],
        },
        "right": {
            right: [],
        },
        "minimal": {
            bottom: []
        },
    };


    /**
     * WGo player can have more layouts. It allows responsive design of the player.
     * Possible layouts are defined as array of object with this structure:
     * 
     * layout = {
     *   Object layout, // layout as specified above
     *   Object conditions, // conditions that has to be valid to apply this layout
     *   String className // custom classnames
     * }
     *
     * possible conditions:
     *  - minWidth - minimal width of player in px
     *  - maxWidth - maximal width of player in px
     *  - minHeight - minimal height of player in px
     *  - maxHeight - maximal height of player in px
     *  - custom - function which is called in template context, must return true or false
     *
     * Player's template evaluates layouts step by step and first layout that matches the conditions is applied.
     *
     * Look below at the default dynamic layout. Layouts are tested after every window resize.
     */
    export interface DynamicLayout {
        conditions?: { minWidth?: number, minHeight?: number };
        className: string;
        layout: Layout;
    }
    export var dynamicLayout: DynamicLayout[] = [
        {
            conditions: {
                minWidth: 650,
            },
            layout: layouts["right_top"],
            className: "wgo-twocols wgo-large",
        },
        {
            conditions: {
                minWidth: 550,
                minHeight: 600,
            },
            layout: layouts["one_column"],
            className: "wgo-medium"
        },
        {
            conditions: {
                minWidth: 350,
            },
            layout: layouts["no_comment"],
            className: "wgo-small"
        },
        {	// if conditions object is omitted, layout is applied 
            layout: layouts["no_comment"],
            className: "wgo-xsmall",
        },
    ];
}
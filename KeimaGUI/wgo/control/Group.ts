namespace WGo {
    /**
     * Group of widgets
     */
    //interface GroupArguments {
    //    name: string;
    //    widgets?;
    //}
    export class Group extends Widget<HTMLDivElement> {
        constructor(player, args) {
            super(player, args);
            this.element = document.createElement("div");
            this.element.className = "wgo-ctrlgroup wgo-ctrlgroup-" + args.name;

            var widget;
            for (var w in args.widgets) {
                widget = args.widgets[w].constructor(player, args.widgets[w].args);
                widget.appendTo(this.element);
            }
        }
    }
}
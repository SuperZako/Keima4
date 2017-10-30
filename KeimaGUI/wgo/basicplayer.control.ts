/// <reference path="./control/Widget.ts" />
/// <reference path="./control/Group.ts" />
/// <reference path="./control/Clickable.ts" />
/// <reference path="./control/Button.ts" />
/// <reference path="./control/MenuItem.ts" />
/// <reference path="./control/MoveNumber.ts" />

namespace WGo {

    "use strict";

    function compare_widgets(a, b) {
        if (a.weight < b.weight) {
            return -1;
        }
        if (a.weight > b.weight) {
            return 1;
        }
        return 0;
    }


    export class Control extends Component {

        /**
         * List of widgets (probably MenuItem objects) to be displayed in drop-down menu.
         */

        static menu = [{
            constructor: (player, args) => new MenuItem(player, args),
            args: {
                name: "switch-coo",
                togglable: true,
                click: function (player) {
                    player.setCoordinates(!player.coordinates);
                    return player.coordinates;
                },
                init: function (player) {
                    if (player.coordinates)
                        this.select();
                }
            }
        }];



        /**
         * List of widgets (probably Button objects) to be displayed.
         *
         * widget = {
         *	 constructor: Function, // construct a instance of widget
         *	 args: Object,
         * }
        */

        static widgets = [
            {
                constructor: (player, args) => new Group(player, args),
                args: {
                    name: "left",
                    widgets: [{
                        constructor: (player, args) => new Button(player, args),
                        args: {
                            name: "menu",
                            togglable: true,
                            click: player_menu,
                        }
                    }]
                }
            }, {
                constructor: (player, args) => new Group(player, args),
                args: {
                    name: "right",
                    widgets: [{
                        constructor: (player, args) => new Button(player, args),
                        args: {
                            name: "about",
                            click: function (player) {
                                player.showMessage(WGo.t("about-text"));
                            },
                        }
                    }]
                }
            }, {
                constructor: (player, args) => new Group(player, args),
                args: {
                    name: "control",
                    widgets: [{
                        constructor: (player, args) => new Button(player, args),
                        args: {
                            name: "first",
                            disabled: true,
                            init: function (player) {
                                player.addEventListener("update", butupd_first.bind(this));
                                player.addEventListener("frozen", but_frozen.bind(this));
                                player.addEventListener("unfrozen", but_unfrozen.bind(this));
                            },
                            click: function (player) {
                                player.first();
                            },
                        }
                    }, {
                        constructor: (player: Player, args) => new Button(player, args),
                        args: {
                            name: "multiprev",
                            disabled: true,
                            multiple: true,
                            init: function (player: Player) {
                                player.addEventListener("update", butupd_first.bind(this));
                                player.addEventListener("frozen", but_frozen.bind(this));
                                player.addEventListener("unfrozen", but_unfrozen.bind(this));
                            },
                            click: function (player: Player) {
                                var p = WGo.clone(player.kifuReader.path);
                                p.m -= 10;
                                player.goTo(p);
                            },
                        }
                    }, {
                        constructor: (player: Player, args) => new Button(player, args),
                        args: {
                            name: "previous",
                            disabled: true,
                            multiple: true,
                            init: function (player: Player) {
                                player.addEventListener("update", butupd_first.bind(this));
                                player.addEventListener("frozen", but_frozen.bind(this));
                                player.addEventListener("unfrozen", but_unfrozen.bind(this));
                            },
                            click: function (player: Player) {
                                player.previous();
                            },
                        }
                    }, {
                        constructor: (player: Player, args) => new MoveNumber(player),
                    }, {
                        constructor: (player: Player, args) => new Button(player, args),
                        args: {
                            name: "next",
                            disabled: true,
                            multiple: true,
                            init: function (player: Player) {
                                player.addEventListener("update", butupd_last.bind(this));
                                player.addEventListener("frozen", but_frozen.bind(this));
                                player.addEventListener("unfrozen", but_unfrozen.bind(this));
                            },
                            click: function (player: Player) {
                                player.next();
                            },
                        }
                    }, {
                        constructor: (player: Player, args) => new Button(player, args),
                        args: {
                            name: "multinext",
                            disabled: true,
                            multiple: true,
                            init: function (player) {
                                player.addEventListener("update", butupd_last.bind(this));
                                player.addEventListener("frozen", but_frozen.bind(this));
                                player.addEventListener("unfrozen", but_unfrozen.bind(this));
                            },
                            click: function (player) {
                                var p = WGo.clone(player.kifuReader.path);
                                p.m += 10;
                                player.goTo(p);
                            },
                        }
                    }, {
                        constructor: (player, args) => new Button(player, args),
                        args: {
                            name: "last",
                            disabled: true,
                            init: function (player) {
                                player.addEventListener("update", butupd_last.bind(this));
                                player.addEventListener("frozen", but_frozen.bind(this));
                                player.addEventListener("unfrozen", but_unfrozen.bind(this));
                            },
                            click: function (player) {
                                player.last()
                            },
                        }
                    }
                    ]
                }
            }
        ];

        iconBar: HTMLDivElement;
        widgets; //
        constructor(player) {
            super();

            this.widgets = [];
            this.element.className = "wgo-player-control";

            this.prepare_dom(player);
        }
        private prepare_dom(player) {

            this.iconBar = document.createElement("div");
            this.iconBar.className = "wgo-control-wrapper";
            this.element.appendChild(this.iconBar);

            var widget;

            //for (var w in Control.widgets) {
            //    widget = new Control.widgets[w].constructor(player, Control.widgets[w].args);
            //    widget.appendTo(this.iconBar);
            //    this.widgets.push(widget);
            //}
            for (let w of Control.widgets) {
                widget = w.constructor(player, w.args);
                widget.appendTo(this.iconBar);
                this.widgets.push(widget);
            }
        }

        updateDimensions() {
            if (this.element.clientWidth < 340) {
                this.element.className = "wgo-player-control wgo-340";
            } else if (this.element.clientWidth < 440) {
                this.element.className = "wgo-player-control wgo-440";
            } else {
                this.element.className = "wgo-player-control";
            }
        }
    }

    var butupd_first = function (e) {
        if (!e.node.parent && !this.disabled) this.disable();
        else if (e.node.parent && this.disabled) this.enable();
    }

    var butupd_last = function (e) {
        if (!e.node.children.length && !this.disabled) {
            this.disable();
        } else if (e.node.children.length && this.disabled) {
            this.enable();
        }
    }

    var but_frozen = function (e) {
        this._disabled = this.disabled;
        if (!this.disabled) this.disable();
    }

    var but_unfrozen = function (e) {
        if (!this._disabled) this.enable();
        delete this._disabled;
    }




    // display menu
    function player_menu(player) {

        if (player._menu_tmp) {
            delete player._menu_tmp;
            return;
        }
        if (!player.menu) {
            player.menu = document.createElement("div");
            player.menu.className = "wgo-player-menu";
            player.menu.style.position = "absolute";
            player.menu.style.display = "none";

            this.element.parentElement.appendChild(player.menu);

            var widget;
            for (var i in Control.menu) {
                widget = Control.menu[i].constructor(player, Control.menu[i].args/*, true*/);
                widget.appendTo(player.menu);
            }
        }

        if (player.menu.style.display != "none") {
            player.menu.style.display = "none";

            document.removeEventListener("click", player._menu_ev);
            //document.removeEventListener("touchstart", player._menu_ev);
            delete player._menu_ev;

            this.unselect();
            return false;
        }
        else {
            player.menu.style.display = "block";

            var top = this.element.offsetTop;
            var left = this.element.offsetLeft;

            // kinda dirty syntax, but working well
            if (this.element.parentElement.parentElement.parentElement.parentElement == player.regions.bottom.wrapper) {
                player.menu.style.left = left + "px";
                player.menu.style.top = (top - player.menu.offsetHeight + 1) + "px";
            }
            else {
                player.menu.style.left = left + "px";
                player.menu.style.top = (top + this.element.offsetHeight) + "px";
            }

            player._menu_ev = player_menu.bind(this, player)
            player._menu_tmp = true;

            document.addEventListener("click", player._menu_ev);
            //document.addEventListener("touchstart", player._menu_ev);

            return true;
        }
    }

    layouts["right_top"].top.push("Control");
    layouts["right"].right.push("Control");
    layouts["one_column"].top.push("Control");
    layouts["no_comment"].bottom.push("Control");
    layouts["minimal"].bottom.push("Control");

    var player_terms = {
        "about": "About",
        "first": "First",
        "multiprev": "10 moves back",
        "previous": "Previous",
        "next": "Next",
        "multinext": "10 moves forward",
        "last": "Last",
        "switch-coo": "Display coordinates",
        "menu": "Menu",
    };

    for (var key in player_terms) {
        i18n.en[key] = player_terms[key];
    }

    BasicPlayer.component.Control = Control;

}
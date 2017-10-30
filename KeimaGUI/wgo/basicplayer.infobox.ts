namespace WGo {

    "use strict";


    var prepare_dom_info = function (type) {
        var res: any = {};
        res.wrapper = document.createElement("div");
        res.wrapper.className = "wgo-player-info-box-wrapper";

        res.box = document.createElement("div");
        res.box.className = "wgo-player-info-box";
        res.wrapper.appendChild(res.box);

        res.title = document.createElement("div");
        res.title.className = "wgo-player-info-title";
        res.title.innerHTML = WGo.t(type);
        res.box.appendChild(res.title);

        res.val = document.createElement("div");
        res.val.className = "wgo-player-info-value";
        res.box.appendChild(res.val);

        return res;
    }



    var modify_font_size = function (elem) {
        var css, max, size;

        if (elem.style.fontSize) {
            size = parseInt(elem.style.fontSize);
            elem.style.fontSize = "";
            css = window.getComputedStyle(elem);
            max = parseInt(css.fontSize);
            elem.style.fontSize = size + "px";
        }
        else {
            css = window.getComputedStyle(elem);
            max = size = parseInt(css.fontSize);
        }

        if (size == max && elem.scrollHeight <= elem.offsetHeight) return;
        else if (elem.scrollHeight > elem.offsetHeight) {
            size -= 2;
            while (elem.scrollHeight > elem.offsetHeight && size > 1) {
                elem.style.fontSize = size + "px";
                size -= 2;
            }
        }
        else if (size < max) {
            size += 2;
            while (elem.scrollHeight <= elem.offsetHeight && size <= max) {
                elem.style.fontSize = size + "px";
                size += 2;
            }
            if (elem.scrollHeight > elem.offsetHeight) {
                elem.style.fontSize = (size - 4) + "px";
            }
        }
    }




    /**
     * Implements box with basic informations about go players.
     */
    export class InfoBox extends Component {
        menu;
        white;
        black;
        constructor(private player) {
            super(/*player*/);
            this.element.className = "wgo-infobox";

            this.prepare_dom();

            player.addEventListener("kifuLoaded", this.kifu_loaded.bind(this));
            player.addEventListener("update", this.update.bind(this));

        }

        private kifu_loaded(e) {
            var info = e.kifu.info || {};

            if (info.black) {
                this.black.name.innerHTML = WGo.filterHTML(info.black.name) || WGo.t("black");
                this.black.info.rank.val.innerHTML = WGo.filterHTML(info.black.rank) || "-";
            }
            else {
                this.black.name.innerHTML = WGo.t("black");
                this.black.info.rank.val.innerHTML = "-";
            }
            if (info.white) {
                this.white.name.innerHTML = WGo.filterHTML(info.white.name) || WGo.t("white");
                this.white.info.rank.val.innerHTML = WGo.filterHTML(info.white.rank) || "-";
            }
            else {
                this.white.name.innerHTML = WGo.t("white");
                this.white.info.rank.val.innerHTML = "-";
            }

            this.black.info.caps.val.innerHTML = "0";
            this.white.info.caps.val.innerHTML = "0";

            if (info.TM) {
                this.setPlayerTime("black", info.TM);
                this.setPlayerTime("white", info.TM);
            }
            else {
                this.black.info.time.val.innerHTML = "--:--";
                this.white.info.time.val.innerHTML = "--:--";
            }

            this.updateDimensions();
        }
        private update(e) {
            if (e.node.BL) this.setPlayerTime("black", e.node.BL);
            if (e.node.WL) this.setPlayerTime("white", e.node.WL);
            if (e.position.capCount.black !== undefined) this.black.info.caps.val.innerHTML = e.position.capCount.black;
            if (e.position.capCount.white !== undefined) this.white.info.caps.val.innerHTML = e.position.capCount.white;
        }

        private prepare_dom() {
            this._prepare_dom_box("menu", this.player);
            this.prepare_dom_box("white");
            this.prepare_dom_box("black");
            this.element.appendChild(this.menu.box);
            this.element.appendChild(this.white.box);
            this.element.appendChild(this.black.box);
        }

        private _prepare_dom_box(type: string, player: Player) {
            this[type] = {};
            var t = this[type];
            t.box = document.createElement("div");
            t.box.className = "wgo-box-wrapper wgo-player-wrapper wgo-" + type;

            //t.name = document.createElement("div");
            //t.name.className = "wgo-box-title";
            //t.name.innerHTML = type;
            //t.box.appendChild(t.name);

            //var info_wrapper;
            //info_wrapper = document.createElement("div");
            //info_wrapper.className = "wgo-player-info";
            //t.box.appendChild(info_wrapper);

            let frozen = false;
            let newGameAnsStop = new Button(player, {
                name: "newgame",
                click: (player) => {
                    // player.showDialog(WGo.t("about-text"));

                    player._editable = player._editable || new GameLogic(player, player.board, StoneColor.Black);

                    frozen = !frozen;
                    if (frozen) {
                        newGameAnsStop.select();
                    } else {
                        newGameAnsStop.unselect();
                    }

                    player.dispatchEvent({
                        type: frozen ? "frozen" : "unfrozen",
                        target: player,
                    });
                },
            });
            newGameAnsStop.appendTo(t.box);

            let pass = new Button(player, {
                name: "pass",
                click: function (player) {
                },
            });
            pass.appendTo(t.box);

            //t.info = {};
            //t.info.rank = prepare_dom_info("rank");
            //t.info.rank.val.innerHTML = "-";
            //t.info.caps = prepare_dom_info("caps");
            //t.info.caps.val.innerHTML = "0";
            // t.info.time = prepare_dom_info("time");
            // t.info.time.val.innerHTML = "--:--";
            //info_wrapper.appendChild(t.info.rank.wrapper);
            //info_wrapper.appendChild(t.info.caps.wrapper);
            // info_wrapper.appendChild(t.info.time.wrapper);

        }
        private prepare_dom_box(type: string) {
            this[type] = {};
            var t = this[type];
            t.box = document.createElement("div");
            t.box.className = "wgo-box-wrapper wgo-player-wrapper wgo-" + type;

            t.name = document.createElement("div");
            t.name.className = "wgo-box-title";
            t.name.innerHTML = type;
            t.box.appendChild(t.name);

            var info_wrapper;
            info_wrapper = document.createElement("div");
            info_wrapper.className = "wgo-player-info";
            t.box.appendChild(info_wrapper);

            t.info = {};
            t.info.rank = prepare_dom_info("rank");
            t.info.rank.val.innerHTML = "-";
            t.info.caps = prepare_dom_info("caps");
            t.info.caps.val.innerHTML = "0";
            t.info.time = prepare_dom_info("time");
            t.info.time.val.innerHTML = "--:--";
            info_wrapper.appendChild(t.info.rank.wrapper);
            info_wrapper.appendChild(t.info.caps.wrapper);
            info_wrapper.appendChild(t.info.time.wrapper);
        }

        public setPlayerTime(color, time: number) {
            const min = Math.floor(time / 60);
            const sec = Math.round(time) % 60;
            this[color].info.time.val.innerHTML = min + ":" + ((sec < 10) ? "0" + sec : sec);
        }
        public updateDimensions() {
            modify_font_size(this.black.name);
            modify_font_size(this.white.name);
        }
    }

    layouts["right_top"].right.push("InfoBox");
    layouts["right"].right.push("InfoBox");
    layouts["one_column"].top.push("InfoBox");
    layouts["no_comment"].top.push("InfoBox");

    WGo.i18n.en["rank"] = "Rank";
    WGo.i18n.en["caps"] = "Caps";
    WGo.i18n.en["time"] = "Time";

    BasicPlayer.component.InfoBox = InfoBox;
}

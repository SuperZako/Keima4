/// <reference path="./Commands.ts" />

/**
 * Main namespace - it initializes WGo in first run and then execute main function.
 * You must call WGo.init() if you want to use library, without calling WGo.
 */
declare var Keima;
namespace WGo {
    "use strict";

    //enum stone {
    //    S_EMPTY,  // 空点
    //    S_BLACK,  // 黒石
    //    S_WHITE,  // 白石
    //    S_OB,     // 盤外
    //    S_MAX     // 番兵
    //};

    var scripts = document.getElementsByTagName('script');
    var path = scripts[scripts.length - 1].src.split('?')[0];      // remove any ?query
    var mydir = path.split('/').slice(0, -1).join('/') + '/';

    // basic information
    export var version = "2.3.1";

    // constants for colors (rather use WGo.B or WGo.W)
    export var B = 1;
    export var W = -1;

    // if true errors will be shown in dialog window, otherwise they will be ignored
    export var ERROR_REPORT = true;
    export var DIR = mydir;

    // Language of player, you can change this global variable any time. Object WGo.i18n.<your lang> must exist.
    export var lang = "en";

    // Add terms for each language here
    export var i18n = {
        en: {}
    };

    // browser detection - can be handy
    export var opera = navigator.userAgent.search(/(opera)(?:.*version)?[ \/]([\w.]+)/i) != -1;
    export var webkit = navigator.userAgent.search(/(webkit)[ \/]([\w.]+)/i) != -1;
    export var msie = navigator.userAgent.search(/(msie) ([\w.]+)/i) != -1;
    export var mozilla = navigator.userAgent.search(/(mozilla)(?:.*? rv:([\w.]+))?/i) != -1 && !webkit && !msie;

    export var WHITE;
    // translating function
    export function t(str: string, a?) {
        var loc = i18n[lang][str] || i18n.en[str];
        if (loc) {
            for (var i = 1; i < arguments.length; i++) {
                loc = loc.replace("$", arguments[i]);
            }
            return loc;
        }
        return str;
    }

    // helping function for deep cloning of simple objects,
    export function clone(obj) {
        if (obj && typeof obj == "object") {
            var n_obj = obj.constructor == Array ? [] : {};

            for (var key in obj) {
                if (obj[key] == obj) n_obj[key] = obj;
                else n_obj[key] = WGo.clone(obj[key]);
            }

            return n_obj;
        }
        else return obj;
    }

    // filter html to avoid XSS
    export function filterHTML(text: string) {
        if (!text || typeof text != "string") return text;
        return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    Commands.initialize();
}
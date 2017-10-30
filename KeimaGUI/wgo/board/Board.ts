/// <reference path="../WGo.ts" />
namespace WGo {
    function theme_variable(key, board) {
        return typeof board.theme[key] == "function" ? board.theme[key](board) : board.theme[key];
    }
    var shadow_handler = {
        draw: function (args, board) {
            var xr = board.getX(args.x),
                yr = board.getY(args.y),
                sr = board.stoneRadius;

            this.beginPath();

            var blur = theme_variable("shadowBlur", board);
            var radius = Math.max(0, sr - 0.5);
            var gradient = this.createRadialGradient(xr - board.ls, yr - board.ls, radius - 1 - blur, xr - board.ls, yr - board.ls, radius + blur);

            gradient.addColorStop(0, theme_variable("shadowColor", board));
            gradient.addColorStop(1, theme_variable("shadowTransparentColor", board));

            this.fillStyle = gradient;

            this.arc(xr - board.ls, yr - board.ls, radius + blur, 0, 2 * Math.PI, true);
            this.fill();
        },
        clear: function (args, board: Board) {
            var xr = board.getX(args.x),
                yr = board.getY(args.y),
                sr = board.stoneRadius;
            this.clearRect(xr - 1.1 * sr - board.ls, yr - 1.1 * sr - board.ls, 2.2 * sr, 2.2 * sr);
        }
    }

    // Shadow handler for the 'REALISITC' rendering mode
    var shadow_handler_realistic = {
        draw: function (args, board) {
            var xr = board.getX(args.x),
                yr = board.getY(args.y),
                sr = board.stoneRadius,
                lsX = 1.0,
                lsY = -5.0,
                blur = 5.0;

            this.beginPath();

            var radius = Math.max(0, (sr - 0.5) * 0.85);
            var gradient = this.createRadialGradient(xr - lsX, yr - lsY, radius - 1 - blur, xr - lsX, yr - lsY, radius + blur);

            gradient.addColorStop(0, theme_variable("shadowColor", board));
            gradient.addColorStop(1, theme_variable("shadowTransparentColor", board));

            this.fillStyle = gradient;

            this.arc(xr - lsX, yr - lsY, radius + blur, 0, 2 * Math.PI, true);
            this.fill();
        },
        clear: function (args, board) {
            var xr = board.getX(args.x),
                yr = board.getY(args.y),
                sr = board.stoneRadius,
                lsX = 1.0,
                lsY = -5.0,
                blur = 5.0;

            this.clearRect(xr - 1.1 * sr - lsX, yr - 1.1 * sr - lsY, 2.2 * sr, 2.2 * sr);
        }
    }

    var get_markup_color = function (board: Board, x: number, y: number) {
        if (board.obj_arr[x][y][0].c == WGo.B) return theme_variable("markupBlackColor", board);
        else if (board.obj_arr[x][y][0].c == WGo.W) return theme_variable("markupWhiteColor", board);
        return theme_variable("markupNoneColor", board);
    }

    var is_here_stone = function (board: Board, x: number, y: number) {
        return (board.obj_arr[x][y][0] && board.obj_arr[x][y][0].c == WGo.W || board.obj_arr[x][y][0].c == WGo.B);
    }

    var redraw_layer = function (board: Board, layer) {
        var handler;

        board[layer].clear();
        board[layer].draw(board);

        for (var x = 0; x < board.size; x++) {
            for (var y = 0; y < board.size; y++) {
                for (var z = 0; z < board.obj_arr[x][y].length; z++) {
                    var obj = board.obj_arr[x][y][z];
                    if (!obj.type) handler = board.stoneHandler;
                    else if (typeof obj.type == "string") handler = Board.drawHandlers[obj.type];
                    else handler = obj.type;

                    if (handler[layer]) handler[layer].draw.call(board[layer].getContext(obj), obj, board);
                }
            }
        }

        for (var i = 0; i < board.obj_list.length; i++) {
            var obj = board.obj_list[i];
            var handler = obj.handler;

            if (handler[layer]) handler[layer].draw.call(board[layer].getContext(obj.args), obj.args, board);
        }
    }

    // shell stone helping functions

    var shell_seed;

    var draw_shell_line = function (ctx, x, y, radius, start_angle, end_angle, factor, thickness) {
        ctx.strokeStyle = "rgba(64,64,64,0.2)";

        ctx.lineWidth = (radius / 30) * thickness;
        ctx.beginPath();

        radius -= Math.max(1, ctx.lineWidth);

        var x1 = x + radius * Math.cos(start_angle * Math.PI);
        var y1 = y + radius * Math.sin(start_angle * Math.PI);
        var x2 = x + radius * Math.cos(end_angle * Math.PI);
        var y2 = y + radius * Math.sin(end_angle * Math.PI);

        var m, angle, x, diff_x, diff_y;
        if (x2 > x1) {
            m = (y2 - y1) / (x2 - x1);
            angle = Math.atan(m);
        }
        else if (x2 == x1) {
            angle = Math.PI / 2;
        }
        else {
            m = (y2 - y1) / (x2 - x1);
            angle = Math.atan(m) - Math.PI;
        }

        var c = factor * radius;
        diff_x = Math.sin(angle) * c;
        diff_y = Math.cos(angle) * c;

        var bx1 = x1 + diff_x;
        var by1 = y1 - diff_y;

        var bx2 = x2 + diff_x;
        var by2 = y2 - diff_y;

        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(bx1, by1, bx2, by2, x2, y2);
        ctx.stroke();
    }

    var draw_shell = function (arg) {
        var from_angle = arg.angle;
        var to_angle = arg.angle;

        for (var i = 0; i < arg.lines.length; i++) {
            from_angle += arg.lines[i];
            to_angle -= arg.lines[i];
            draw_shell_line(arg.ctx, arg.x, arg.y, arg.radius, from_angle, to_angle, arg.factor, arg.thickness);
        }
    }
    var default_field_clear = function (args, board) {
        var xr = board.getX(args.x),
            yr = board.getY(args.y),
            sr = board.stoneRadius;
        this.clearRect(xr - 2 * sr - board.ls, yr - 2 * sr - board.ls, 4 * sr, 4 * sr);
    }
    //---------------------- WGo.Board -----------------------------------------------------------------------------
    export class Board {
        // drawing handlers
        static drawHandlers = {
            // handler for normal stones
            NORMAL: {
                // draw handler for stone layer
                stone: {
                    // drawing function - args object contain info about drawing object, board is main board object
                    // this function is called from canvas2D context
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius,
                            radgrad;

                        // set stone texture
                        if (args.c == WGo.W) {
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, sr / 3, xr - sr / 5, yr - sr / 5, 5 * sr / 5);
                            radgrad.addColorStop(0, '#fff');
                            radgrad.addColorStop(1, '#aaa');
                        }
                        else {
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 1, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                            radgrad.addColorStop(0, '#666');
                            radgrad.addColorStop(1, '#000');
                        }

                        // paint stone
                        this.beginPath();
                        this.fillStyle = radgrad;
                        this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                        this.fill();
                    }
                },
                // adding shadow handler
                shadow: shadow_handler,
            },

            PAINTED: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius,
                            radgrad;

                        if (args.c == WGo.W) {
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 2, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                            radgrad.addColorStop(0, '#fff');
                            radgrad.addColorStop(1, '#ddd');
                        }
                        else {
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 1, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                            radgrad.addColorStop(0, '#111');
                            radgrad.addColorStop(1, '#000');
                        }

                        this.beginPath();
                        this.fillStyle = radgrad;
                        this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                        this.fill();

                        this.beginPath();
                        this.lineWidth = sr / 6;

                        if (args.c == WGo.W) {
                            this.strokeStyle = '#999';
                            this.arc(xr + sr / 8, yr + sr / 8, sr / 2, 0, Math.PI / 2, false);
                        }
                        else {
                            this.strokeStyle = '#ccc';
                            this.arc(xr - sr / 8, yr - sr / 8, sr / 2, Math.PI, 1.5 * Math.PI);
                        }

                        this.stroke();
                    }
                },
                shadow: shadow_handler,
            },

            // handler for image based stones
            REALISTIC: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        var whiteCount = board.whiteStoneGraphic.length;
                        var blackCount = board.blackStoneGraphic.length;

                        if (typeof this.randIndex === 'undefined') {
                            this.randIndex = Math.ceil(Math.random() * 1e5);
                        }

                        var redraw = function () {
                            board.redraw();
                        };

                        // Check if image has been loaded properly
                        // see https://stereochro.me/ideas/detecting-broken-images-js
                        var isOkay = function (img) {
                            if (typeof img === 'string') { return false; }
                            if (!img.complete) { return false; }
                            if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) {
                                return false;
                            }
                            return true;
                        };

                        if (args.c == WGo.W) {
                            var idx = this.randIndex % whiteCount;
                            if (typeof board.whiteStoneGraphic[idx] === 'string') {
                                // The image has not been loaded yet
                                var stoneGraphic = new Image();
                                // Redraw the whole board after the image has been loaded.
                                // This prevents 'missing stones' and similar graphical errors
                                // especially on slower internet connections.
                                stoneGraphic.onload = redraw;
                                stoneGraphic.src = board.whiteStoneGraphic[idx];
                                board.whiteStoneGraphic[idx] = stoneGraphic;
                            }

                            if (isOkay(board.whiteStoneGraphic[idx])) {
                                this.drawImage(board.whiteStoneGraphic[idx], xr - sr, yr - sr, 2 * sr, 2 * sr);
                            }
                            else {
                                // Fall back to SHELL handler if there was a problem loading the image
                                Board.drawHandlers.SHELL.stone.draw.call(this, args, board);
                            }
                        }
                        else { // args.c == WGo.B
                            var idx = this.randIndex % blackCount;
                            if (typeof board.blackStoneGraphic[idx] === 'string') {
                                var stoneGraphic = new Image();
                                stoneGraphic.onload = redraw;
                                stoneGraphic.src = board.blackStoneGraphic[idx];
                                board.blackStoneGraphic[idx] = stoneGraphic;
                            }

                            if (isOkay(board.blackStoneGraphic[idx])) {
                                this.drawImage(board.blackStoneGraphic[idx], xr - sr, yr - sr, 2 * sr, 2 * sr);
                            }
                            else {
                                Board.drawHandlers.SHELL.stone.draw.call(this, args, board);
                            }
                        }
                    }
                },
                shadow: shadow_handler_realistic,
            },

            GLOW: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        var radgrad;
                        if (args.c == WGo.W) {
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, sr / 3, xr - sr / 5, yr - sr / 5, 8 * sr / 5);
                            radgrad.addColorStop(0, '#fff');
                            radgrad.addColorStop(1, '#666');
                        }
                        else {
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 1, xr - sr / 5, yr - sr / 5, 3 * sr / 5);
                            radgrad.addColorStop(0, '#555');
                            radgrad.addColorStop(1, '#000');
                        }

                        this.beginPath();
                        this.fillStyle = radgrad;
                        this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                        this.fill();
                    },
                },
                shadow: shadow_handler,
            },

            SHELL: {
                stone: {
                    draw: function (args, board) {
                        var xr,
                            yr,
                            sr = board.stoneRadius;

                        shell_seed = shell_seed || Math.ceil(Math.random() * 9999999);

                        xr = board.getX(args.x);
                        yr = board.getY(args.y);

                        var radgrad;

                        if (args.c == WGo.W) {
                            radgrad = "#aaa";
                        }
                        else {
                            radgrad = "#000";
                        }

                        this.beginPath();
                        this.fillStyle = radgrad;
                        this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                        this.fill();

                        // do shell magic here
                        if (args.c == WGo.W) {
                            // do shell magic here
                            var type = shell_seed % (3 + args.x * board.size + args.y) % 3;
                            var z = board.size * board.size + args.x * board.size + args.y;
                            var angle = (2 / z) * (shell_seed % z);

                            if (type == 0) {
                                draw_shell({
                                    ctx: this,
                                    x: xr,
                                    y: yr,
                                    radius: sr,
                                    angle: angle,
                                    lines: [0.10, 0.12, 0.11, 0.10, 0.09, 0.09, 0.09, 0.09],
                                    factor: 0.25,
                                    thickness: 1.75
                                });
                            }
                            else if (type == 1) {
                                draw_shell({
                                    ctx: this,
                                    x: xr,
                                    y: yr,
                                    radius: sr,
                                    angle: angle,
                                    lines: [0.10, 0.09, 0.08, 0.07, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06],
                                    factor: 0.2,
                                    thickness: 1.5
                                });
                            }
                            else {
                                draw_shell({
                                    ctx: this,
                                    x: xr,
                                    y: yr,
                                    radius: sr,
                                    angle: angle,
                                    lines: [0.12, 0.14, 0.13, 0.12, 0.12, 0.12],
                                    factor: 0.3,
                                    thickness: 2
                                });
                            }
                            radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, sr / 3, xr - sr / 5, yr - sr / 5, 5 * sr / 5);
                            radgrad.addColorStop(0, 'rgba(255,255,255,0.9)');
                            radgrad.addColorStop(1, 'rgba(255,255,255,0)');

                            // add radial gradient //
                            this.beginPath();
                            this.fillStyle = radgrad;
                            this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                            this.fill();
                        }
                        else {
                            radgrad = this.createRadialGradient(xr + 0.4 * sr, yr + 0.4 * sr, 0, xr + 0.5 * sr, yr + 0.5 * sr, sr);
                            radgrad.addColorStop(0, 'rgba(32,32,32,1)');
                            radgrad.addColorStop(1, 'rgba(0,0,0,0)');

                            this.beginPath();
                            this.fillStyle = radgrad;
                            this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                            this.fill();

                            radgrad = this.createRadialGradient(xr - 0.4 * sr, yr - 0.4 * sr, 1, xr - 0.5 * sr, yr - 0.5 * sr, 1.5 * sr);
                            radgrad.addColorStop(0, 'rgba(64,64,64,1)');
                            radgrad.addColorStop(1, 'rgba(0,0,0,0)');

                            this.beginPath();
                            this.fillStyle = radgrad;
                            this.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                            this.fill();
                        }
                    }
                },
                shadow: shadow_handler,
            },

            MONO: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius,
                            lw = theme_variable("markupLinesWidth", board) || 1;

                        if (args.c == WGo.W) this.fillStyle = "white";
                        else this.fillStyle = "black";

                        this.beginPath();
                        this.arc(xr, yr, Math.max(0, sr - lw), 0, 2 * Math.PI, true);
                        this.fill();

                        this.lineWidth = lw;
                        this.strokeStyle = "black";
                        this.stroke();
                    }
                },
            },

            CR: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        this.strokeStyle = args.c || get_markup_color(board, args.x, args.y);
                        this.lineWidth = args.lineWidth || theme_variable("markupLinesWidth", board) || 1;
                        this.beginPath();
                        this.arc(xr - board.ls, yr - board.ls, sr / 2, 0, 2 * Math.PI, true);
                        this.stroke();
                    },
                },
            },

            // Label drawing handler
            LB: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius,
                            font = args.font || theme_variable("font", board) || "";

                        this.fillStyle = args.c || get_markup_color(board, args.x, args.y);

                        if (args.text.length == 1) this.font = Math.round(sr * 1.5) + "px " + font;
                        else if (args.text.length == 2) this.font = Math.round(sr * 1.2) + "px " + font;
                        else this.font = Math.round(sr) + "px " + font;

                        this.beginPath();
                        this.textBaseline = "middle";
                        this.textAlign = "center";
                        this.fillText(args.text, xr, yr, 2 * sr);

                    },
                },

                // modifies grid layer too
                grid: {
                    draw: function (args, board) {
                        if (!is_here_stone(board, args.x, args.y) && !args._nodraw) {
                            var xr = board.getX(args.x),
                                yr = board.getY(args.y),
                                sr = board.stoneRadius;
                            this.clearRect(xr - sr, yr - sr, 2 * sr, 2 * sr);
                        }
                    },
                    clear: function (args, board) {
                        if (!is_here_stone(board, args.x, args.y)) {
                            args._nodraw = true;
                            redraw_layer(board, "grid");
                            delete args._nodraw;
                        }
                    }
                },
            },

            SQ: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = Math.round(board.stoneRadius);

                        this.strokeStyle = args.c || get_markup_color(board, args.x, args.y);
                        this.lineWidth = args.lineWidth || theme_variable("markupLinesWidth", board) || 1;
                        this.beginPath();
                        this.rect(Math.round(xr - sr / 2) - board.ls, Math.round(yr - sr / 2) - board.ls, sr, sr);
                        this.stroke();
                    }
                }
            },

            TR: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        this.strokeStyle = args.c || get_markup_color(board, args.x, args.y);
                        this.lineWidth = args.lineWidth || theme_variable("markupLinesWidth", board) || 1;
                        this.beginPath();
                        this.moveTo(xr - board.ls, yr - board.ls - Math.round(sr / 2));
                        this.lineTo(Math.round(xr - sr / 2) - board.ls, Math.round(yr + sr / 3) + board.ls);
                        this.lineTo(Math.round(xr + sr / 2) + board.ls, Math.round(yr + sr / 3) + board.ls);
                        this.closePath();
                        this.stroke();
                    }
                }
            },

            MA: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        this.strokeStyle = args.c || get_markup_color(board, args.x, args.y);
                        this.lineCap = "round";
                        this.lineWidth = (args.lineWidth || theme_variable("markupLinesWidth", board) || 1) * 2 - 1;
                        this.beginPath();
                        this.moveTo(Math.round(xr - sr / 2), Math.round(yr - sr / 2));
                        this.lineTo(Math.round(xr + sr / 2), Math.round(yr + sr / 2));
                        this.moveTo(Math.round(xr + sr / 2) - 1, Math.round(yr - sr / 2));
                        this.lineTo(Math.round(xr - sr / 2) - 1, Math.round(yr + sr / 2));
                        this.stroke();
                        this.lineCap = "butt";
                    }
                }
            },

            SL: {
                stone: {
                    draw: function (args, board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        this.fillStyle = args.c || get_markup_color(board, args.x, args.y);
                        this.beginPath();
                        this.rect(xr - sr / 2, yr - sr / 2, sr, sr);
                        this.fill();
                    }
                }
            },

            SM: {
                stone: {
                    draw: function (args, board: Board) {
                        var xr = board.getX(args.x),
                            yr = board.getY(args.y),
                            sr = board.stoneRadius;

                        this.strokeStyle = args.c || get_markup_color(board, args.x, args.y);
                        this.lineWidth = (args.lineWidth || theme_variable("markupLinesWidth", board) || 1) * 2;
                        this.beginPath();
                        this.arc(xr - sr / 3, yr - sr / 3, sr / 6, 0, 2 * Math.PI, true);
                        this.stroke();
                        this.beginPath();
                        this.arc(xr + sr / 3, yr - sr / 3, sr / 6, 0, 2 * Math.PI, true);
                        this.stroke();
                        this.beginPath();
                        this.moveTo(xr - sr / 1.5, yr);
                        this.bezierCurveTo(xr - sr / 1.5, yr + sr / 2, xr + sr / 1.5, yr + sr / 2, xr + sr / 1.5, yr);
                        this.stroke();
                    }
                }
            },

            outline: {
                stone: {
                    draw: function (args, board: Board) {
                        if (args.alpha) this.globalAlpha = args.alpha;
                        else this.globalAlpha = 0.3;
                        if (args.stoneStyle) Board.drawHandlers[args.stoneStyle].stone.draw.call(this, args, board);
                        else board.stoneHandler.stone.draw.call(this, args, board);
                        this.globalAlpha = 1;
                    }
                }
            },

            mini: {
                stone: {
                    draw: function (args, board) {
                        board.stoneRadius = board.stoneRadius / 2;
                        if (args.stoneStyle) Board.drawHandlers[args.stoneStyle].stone.draw.call(this, args, board);
                        else board.stoneHandler.stone.draw.call(this, args, board);
                        board.stoneRadius = board.stoneRadius * 2;
                    }
                }
            },
        };


        static default = {
            size: 19,
            width: 0,
            height: 0,
            font: "Calibri", // deprecated
            lineWidth: 1, // deprecated
            autoLineWidth: false, // deprecated
            starPoints: {
                5: [{ x: 2, y: 2 }],
                7: [{ x: 3, y: 3 }],
                8: [{ x: 2, y: 2 }, { x: 5, y: 2 }, { x: 2, y: 5 }, { x: 5, y: 5 }],
                9: [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 4, y: 4 }, { x: 2, y: 6 }, { x: 6, y: 6 }],
                10: [{ x: 2, y: 2 }, { x: 7, y: 2 }, { x: 2, y: 7 }, { x: 7, y: 7 }],
                11: [{ x: 2, y: 2 }, { x: 8, y: 2 }, { x: 5, y: 5 }, { x: 2, y: 8 }, { x: 8, y: 8 }],
                12: [{ x: 3, y: 3 }, { x: 8, y: 3 }, { x: 3, y: 8 }, { x: 8, y: 8 }],
                13: [{ x: 3, y: 3 }, { x: 9, y: 3 }, { x: 6, y: 6 }, { x: 3, y: 9 }, { x: 9, y: 9 }],
                14: [{ x: 3, y: 3 }, { x: 10, y: 3 }, { x: 3, y: 10 }, { x: 10, y: 10 }],
                15: [{ x: 3, y: 3 }, { x: 11, y: 3 }, { x: 7, y: 7 }, { x: 3, y: 11 }, { x: 11, y: 11 }],
                16: [{ x: 3, y: 3 }, { x: 12, y: 3 }, { x: 3, y: 12 }, { x: 12, y: 12 }],
                17: [{ x: 3, y: 3 }, { x: 8, y: 3 }, { x: 13, y: 3 }, { x: 3, y: 8 }, { x: 8, y: 8 },
                { x: 13, y: 8 }, { x: 3, y: 13 }, { x: 8, y: 13 }, { x: 13, y: 13 }],
                18: [{ x: 3, y: 3 }, { x: 14, y: 3 }, { x: 3, y: 14 }, { x: 14, y: 14 }],
                19: [{ x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 }, { x: 3, y: 9 }, { x: 9, y: 9 },
                { x: 15, y: 9 }, { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 }],
                20: [{ x: 3, y: 3 }, { x: 16, y: 3 }, { x: 3, y: 16 }, { x: 16, y: 16 }],
                21: [{ x: 3, y: 3 }, { x: 10, y: 3 }, { x: 17, y: 3 }, { x: 3, y: 10 }, { x: 10, y: 10 },
                { x: 17, y: 10 }, { x: 3, y: 17 }, { x: 10, y: 17 }, { x: 17, y: 17 }],
            },
            //stoneHandler: Board.drawHandlers.SHELL,
            stoneHandler: Board.drawHandlers.REALISTIC, // New photograph based stones
            starSize: 1, // deprecated
            shadowSize: 1, // deprecated
            stoneSize: 1, // deprecated
            section: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },

            //background: WGo.DIR+"wood1.jpg",    // Original version, tileing
            //background: WGo.DIR+"wood_512.jpg", // Mobile friendly, low resolution
            background: WGo.DIR + "wood_1024.jpg",  // High resolution version, use with REALISTIC handler

            //whiteStoneGraphic: [ WGo.DIR+"white_128.png" ], // Single image only, hires
            //blackStoneGraphic: [ WGo.DIR+"black_128.png" ], // Single image only, hires

            //whiteStoneGraphic: [ WGo.DIR+"white_64.png" ], // Single image only, lowres
            //blackStoneGraphic: [ WGo.DIR+"black_64.png" ], // Single image only, lowres

            whiteStoneGraphic: [
                WGo.DIR + "stones/white00_128.png",
                WGo.DIR + "stones/white01_128.png",
                WGo.DIR + "stones/white02_128.png",
                WGo.DIR + "stones/white03_128.png",
                WGo.DIR + "stones/white04_128.png",
                WGo.DIR + "stones/white05_128.png",
                WGo.DIR + "stones/white06_128.png",
                WGo.DIR + "stones/white07_128.png",
                WGo.DIR + "stones/white08_128.png",
                WGo.DIR + "stones/white09_128.png",
                WGo.DIR + "stones/white10_128.png"
            ],
            blackStoneGraphic: [
                WGo.DIR + "stones/black00_128.png",
                WGo.DIR + "stones/black01_128.png",
                WGo.DIR + "stones/black02_128.png",
                WGo.DIR + "stones/black03_128.png"
            ],

            theme: {}
        };

        static coordinates = {
            grid: {
                draw: function (args, board) {
                    var ch, t, xright, xleft, ytop, ybottom;

                    this.fillStyle = theme_variable("coordinatesColor", board);
                    this.textBaseline = "middle";
                    this.textAlign = "center";
                    this.font = board.stoneRadius + "px " + (board.font || "");

                    xright = board.getX(-0.75);
                    xleft = board.getX(board.size - 0.25);
                    ytop = board.getY(-0.75);
                    ybottom = board.getY(board.size - 0.25);

                    for (var i = 0; i < board.size; i++) {
                        ch = i + "A".charCodeAt(0);
                        if (ch >= "I".charCodeAt(0)) ch++;

                        t = board.getY(i);
                        this.fillText(board.size - i, xright, t);
                        this.fillText(board.size - i, xleft, t);

                        t = board.getX(i);
                        this.fillText(String.fromCharCode(ch), t, ytop);
                        this.fillText(String.fromCharCode(ch), t, ybottom);
                    }

                    this.fillStyle = "black";
                }
            }
        };

        size: number;
        width: number;
        height: number;
        fieldHeight: number;
        fieldWidth: number;
        top: number;
        left: number;
        font: string;
        lineWidth: number;
        autoLineWidth: boolean;
        starPoints: Object;
        stoneHandler: any;
        starSize: number;
        stoneSize: number;
        shadowSize: number;
        background: string;
        section: {
            top: number,
            right: number,
            bottom: number,
            left: number
        };
        theme;
        tx: number;
        ty: number;
        bx: number;
        by: number;
        pixelRatio: number;
        element: HTMLElement;
        obj_arr: any;
        obj_list: any;
        layers: any;
        listeners: any;
        grid: GridLayer;
        shadow: ShadowLayer;
        stone: MultipleCanvasLayer;
        stoneRadius: number;
        ls: number;
        /**
         * Board class constructor - it creates a canvas board
         *
         * @param elem DOM element to put in
         * @param config configuration object. It is object with "key: value" structure. Possible configurations are:
         *
         * - size: number - size of the board (default: 19)
         * - width: number - width of the board (default: 0)
         * - height: number - height of the board (default: 0)
         * - font: string - font of board writings (!deprecated)
         * - lineWidth: number - line width of board drawings (!deprecated)
         * - autoLineWidth: boolean - if set true, line width will be automatically computed accordingly to board size - this option rewrites 'lineWidth' /and it will keep markups sharp/ (!deprecated)
         * - starPoints: Object - star points coordinates, defined for various board sizes. Look at Board.default for more info.
         * - stoneHandler: Board.DrawHandler - stone drawing handler (default: Board.drawHandlers.SHELL)
         * - starSize: number - size of star points (default: 1). Radius of stars is dynamic, however you can modify it by given constant. (!deprecated)
         * - stoneSize: number - size of stone (default: 1). Radius of stone is dynamic, however you can modify it by given constant. (!deprecated)
         * - shadowSize: number - size of stone shadow (default: 1). Radius of shadow is dynamic, however you can modify it by given constant. (!deprecated)
         * - background: string - background of the board, it can be either color (#RRGGBB) or url. Empty string means no background. (default: WGo.DIR+"wood1.jpg")
         * - section: {
         *     top: number,
         *     right: number,
         *     bottom: number,
         *     left: number
         *   }
         *   It defines a section of board to be displayed. You can set a number of rows(or cols) to be skipped on each side.
         *   Numbers can be negative, in that case there will be more empty space. In default all values are zeros.
         * - theme: Object - theme object, which defines all graphical attributes of the board. Default theme object is "WGo.Board.themes.default". For old look you may use "WGo.Board.themes.old".
         *
         * Note: properties lineWidth, autoLineWidth, starPoints, starSize, stoneSize and shadowSize will be considered only if you set property 'theme' to 'WGo.Board.themes.old'.
         */

        constructor(elem, config) {
            var config = config || {};

            // set user configuration
            for (var key in config) {
                this[key] = config[key];
            }

            // add default configuration
            for (var key in Board.default) {
                if (this[key] === undefined) {
                    this[key] = Board.default[key];
                }
            }
            // add default theme variables
            for (var key in themes.default) {
                if (this.theme[key] === undefined) {
                    this.theme[key] = themes.default[key];
                }
            }

            // set section if set
            this.tx = this.section.left;
            this.ty = this.section.top;
            this.bx = this.size - 1 - this.section.right;
            this.by = this.size - 1 - this.section.bottom;

            // init board
            this.init();

            // append to element
            elem.appendChild(this.element);

            // set initial dimensions

            // set the pixel ratio for HDPI (e.g. Retina) screens
            this.pixelRatio = window.devicePixelRatio || 1;

            if (this.width && this.height) this.setDimensions(this.width, this.height);
            else if (this.width) this.setWidth(this.width);
            else if (this.height) this.setHeight(this.height);
        }

        // Public methods are in the prototype:


        /**
         * Initialization method, it is called in constructor. You shouldn't call it, but you can alter it.
         */

        init() {

            // placement of objects (in 3D array)
            this.obj_arr = [];
            for (var i = 0; i < this.size; i++) {
                this.obj_arr[i] = [];
                for (var j = 0; j < this.size; j++) this.obj_arr[i][j] = [];
            }

            // other objects, stored in list
            this.obj_list = [];

            // layers
            this.layers = [];

            // event listeners, binded to board
            this.listeners = [];

            this.element = document.createElement('div');
            this.element.className = 'wgo-board';
            this.element.style.position = 'relative';

            if (this.background) {
                if (this.background[0] == "#") this.element.style.backgroundColor = this.background;
                else {
                    this.element.style.backgroundImage = "url('" + this.background + "')";
                    /*this.element.style.backgroundRepeat = "repeat";*/
                    if (this.stoneHandler == Board.drawHandlers.REALISTIC) {
                        // The photographed wood images do not repeat and are the size of an actual
                        // Go-Board. Therefore scale to fit.
                        this.element.style.backgroundSize = "100%";
                    }
                }
            }

            this.grid = new GridLayer();
            this.shadow = new ShadowLayer(this, theme_variable("shadowSize", this));
            this.stone = new MultipleCanvasLayer();

            this.addLayer(this.grid, 100);
            this.addLayer(this.shadow, 200);
            this.addLayer(this.stone, 300);
        }

        /**
         * Set new width of board, height is computed to keep aspect ratio.
         *
         * @param {number} width
         */
        setWidth(width) {
            this.width = width;
            this.width *= this.pixelRatio;
            this.fieldHeight = this.fieldWidth = this.calcFieldWidth();//.call(this);
            this.left = this.calcLeftMargin();//.call(this);

            this.height = (this.by - this.ty + 1.5) * this.fieldHeight;
            this.top = this.calcTopMargin();//.call(this);

            this.updateDim();//.call(this);
            this.redraw();
        }

        /**
         * Set new height of board, width is computed to keep aspect ratio.
         *
         * @param {number} height
         */

        setHeight(height) {
            this.height = height;
            this.height *= this.pixelRatio;
            this.fieldWidth = this.fieldHeight = this.calcFieldHeight();//.call(this);
            this.top = this.calcTopMargin();//.call(this);

            this.width = (this.bx - this.tx + 1.5) * this.fieldWidth;
            this.left = this.calcLeftMargin();//.call(this);

            this.updateDim();//.call(this);
            this.redraw();
        }

        /**
         * Set both dimensions.
         *
         * @param {number} width
         * @param {number} height
         */

        setDimensions(width?: number, height?: number) {
            this.width = width || parseInt(this.element.style.width, 10);
            this.width *= this.pixelRatio;
            this.height = height || parseInt(this.element.style.height, 10);
            this.height *= this.pixelRatio;

            this.fieldWidth = this.calcFieldWidth();
            this.fieldHeight = this.calcFieldHeight();
            this.left = this.calcLeftMargin();
            this.top = this.calcTopMargin();

            this.updateDim();
            this.redraw();
        }

        /**
         * Get currently visible section of the board
         */

        getSection() {
            return this.section;
        }

        /**
         * Set section of the board to be displayed
         */

        setSection(section_or_top, right: number, bottom: number, left: number) {
            if (typeof section_or_top == "object") {
                this.section = section_or_top;
            }
            else {
                this.section = {
                    top: section_or_top,
                    right: right,
                    bottom: bottom,
                    left: left,
                }
            }

            this.tx = this.section.left;
            this.ty = this.section.top;
            this.bx = this.size - 1 - this.section.right;
            this.by = this.size - 1 - this.section.bottom;

            this.setDimensions();
        }

        /**
         * Set board size (eg: 9, 13 or 19), this will clear board's objects.
         */

        setSize(size = 19) {
            // var size = size || 19;

            if (size != this.size) {
                this.size = size;

                this.obj_arr = [];
                for (var i = 0; i < this.size; i++) {
                    this.obj_arr[i] = [];
                    for (var j = 0; j < this.size; j++) this.obj_arr[i][j] = [];
                }

                this.bx = this.size - 1 - this.section.right;
                this.by = this.size - 1 - this.section.bottom;
                this.setDimensions();
            }
        }

        /**
         * Redraw everything.
         */

        redraw() {
            try {
                // redraw layers
                for (var i = 0; i < this.layers.length; i++) {
                    this.layers[i].clear(this);
                    this.layers[i].draw(this);
                }

                // redraw field objects
                for (var i = 0; i < this.size; i++) {
                    for (var j = 0; j < this.size; j++) {
                        this.drawField(i, j);
                    }
                }

                // redraw custom objects
                for (var i = 0; i < this.obj_list.length; i++) {
                    var obj = this.obj_list[i];
                    var handler = obj.handler;

                    for (var layer in handler) {
                        handler[layer].draw.call(this[layer].getContext(obj.args), obj.args, this);
                    }
                }
            }
            catch (err) {
                // If the board is too small some canvas painting function can throw an exception, but we don't want to break our app
                console.log("WGo board failed to render. Error: " + err.message);
            }
        }

        /**
         * Get absolute X coordinate
         *
         * @param {number} x relative coordinate
         */

        getX(x) {
            return this.left + x * this.fieldWidth;
        }

        /**
         * Get absolute Y coordinate
         *
         * @param {number} y relative coordinate
         */

        getY(y) {
            return this.top + y * this.fieldHeight;
        }

        /**
         * Add layer to the board. It is meant to be only for canvas layers.
         *
         * @param {Board.CanvasLayer} layer to add
         * @param {number} weight layer with biggest weight is on the top
         */

        addLayer(layer, weight) {
            layer.appendTo(this.element, weight);
            layer.setDimensions(this.width, this.height);
            this.layers.push(layer);
        }

        /**
         * Remove layer from the board.
         *
         * @param {Board.CanvasLayer} layer to remove
         */

        removeLayer(layer: CanvasLayer) {
            var i = this.layers.indexOf(layer);
            if (i >= 0) {
                this.layers.splice(i, 1);
                layer.removeFrom(this.element);
            }
        }

        update(changes) {
            var i;
            if (changes.remove && changes.remove == "all") this.removeAllObjects();
            else if (changes.remove) {
                for (i = 0; i < changes.remove.length; i++) this.removeObject(changes.remove[i]);
            }

            if (changes.add) {
                for (i = 0; i < changes.add.length; i++) this.addObject(changes.add[i]);
            }
        }

        addObject(obj) {
            // handling multiple objects
            if (obj.constructor == Array) {
                for (var i = 0; i < obj.length; i++) {
                    this.addObject(obj[i]);
                }
                return;
            }

            try {
                // clear all objects on object's coordinates
                this.clearField(obj.x, obj.y);

                // if object of this type is on the board, replace it
                var layers = this.obj_arr[obj.x][obj.y];
                for (var z = 0; z < layers.length; z++) {
                    if (layers[z].type == obj.type) {
                        layers[z] = obj;
                        this.drawField(obj.x, obj.y);
                        return;
                    }
                }

                // if object is a stone, add it at the beginning, otherwise at the end
                if (!obj.type) {
                    layers.unshift(obj);
                } else {
                    layers.push(obj);
                }

                // draw all objects
                this.drawField(obj.x, obj.y);
            }
            catch (err) {
                // If the board is too small some canvas painting function can throw an exception, but we don't want to break our app
                console.log("WGo board failed to render. Error: " + err.message);
            }
        }

        removeObject(obj) {
            // handling multiple objects
            if (obj.constructor == Array) {
                for (var n = 0; n < obj.length; n++) this.removeObject(obj[n]);
                return;
            }

            try {
                var i;
                for (var j = 0; j < this.obj_arr[obj.x][obj.y].length; j++) {
                    if (this.obj_arr[obj.x][obj.y][j].type == obj.type) {
                        i = j;
                        break;
                    }
                }
                if (i === undefined) {
                    return;
                }

                // clear all objects on object's coordinates
                this.clearField(obj.x, obj.y);

                this.obj_arr[obj.x][obj.y].splice(i, 1);

                this.drawField(obj.x, obj.y);
            }
            catch (err) {
                // If the board is too small some canvas painting function can throw an exception, but we don't want to break our app
                console.log("WGo board failed to render. Error: " + err.message);
            }
        }
        removeObjectsAt(x: number, y: number) {
            if (!this.obj_arr[x][y].length)
                return;

            this.clearField(x, y);
            this.obj_arr[x][y] = [];
        }

        removeAllObjects() {
            this.obj_arr = [];
            for (var i = 0; i < this.size; i++) {
                this.obj_arr[i] = [];
                for (var j = 0; j < this.size; j++) this.obj_arr[i][j] = [];
            }
            this.redraw();
        }

        addCustomObject(handler, args?) {
            this.obj_list.push({ handler: handler, args: args });
            this.redraw();
        }

        public removeCustomObject(handler, args?) {
            for (var i = 0; i < this.obj_list.length; i++) {
                var obj = this.obj_list[i];
                if (obj.handler == handler && obj.args == args) {
                    this.obj_list.splice(i, 1);
                    this.redraw();
                    return true;
                }
            }
            return false;
        }

        addEventListener(type, callback) {
            var _this = this,
                evListener = {
                    type: type,
                    callback: callback,
                    handleEvent: function (e) {
                        var coo = _this.getMousePos(e);
                        callback(coo.x, coo.y, e);
                    }
                };

            this.element.addEventListener(type, evListener, true);
            this.listeners.push(evListener);
        }

        removeEventListener(type, callback) {
            for (var i = 0; i < this.listeners.length; i++) {
                var listener = this.listeners[i];
                if (listener.type == type && listener.callback == callback) {
                    this.element.removeEventListener(listener.type, listener, true);
                    this.listeners.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

        getState() {
            return {
                objects: WGo.clone(this.obj_arr),
                custom: WGo.clone(this.obj_list)
            };
        }

        restoreState(state) {
            this.obj_arr = state.objects || this.obj_arr;
            this.obj_list = state.custom || this.obj_list;

            this.redraw();
        }

        // Private methods of WGo.Board
        private calcLeftMargin() {
            return (3 * this.width) / (4 * (this.bx + 1 - this.tx) + 2) - this.fieldWidth * this.tx;
        }

        private calcTopMargin() {
            return (3 * this.height) / (4 * (this.by + 1 - this.ty) + 2) - this.fieldHeight * this.ty;
        }

        private calcFieldWidth() {
            return (4 * this.width) / (4 * (this.bx + 1 - this.tx) + 2);
        }

        private calcFieldHeight() {
            return (4 * this.height) / (4 * (this.by + 1 - this.ty) + 2);
        }

        private clearField(x, y) {
            var handler;
            for (var z = 0; z < this.obj_arr[x][y].length; z++) {
                var obj = this.obj_arr[x][y][z];
                if (!obj.type) handler = this.stoneHandler;
                else if (typeof obj.type == "string") handler = Board.drawHandlers[obj.type];
                else handler = obj.type;

                for (var layer in handler) {
                    if (handler[layer].clear) handler[layer].clear.call(this[layer].getContext(obj), obj, this);
                    else default_field_clear.call(this[layer].getContext(obj), obj, this);
                }
            }
        }
        private drawField(x: number, y: number) {
            var handler;
            for (var z = 0; z < this.obj_arr[x][y].length; z++) {
                var obj = this.obj_arr[x][y][z];
                if (!obj.type)
                    handler = this.stoneHandler;
                else if (typeof obj.type == "string")
                    handler = Board.drawHandlers[obj.type];
                else
                    handler = obj.type;

                for (var layer in handler) {
                    handler[layer].draw.call(this[layer].getContext(obj), obj, this);
                }
            }
        }
        private getMousePos(e) {
            // new hopefully better translation of coordinates

            var x, y;

            x = e.layerX * this.pixelRatio;
            x -= this.left;
            x /= this.fieldWidth;
            x = Math.round(x);

            y = e.layerY * this.pixelRatio;
            y -= this.top;
            y /= this.fieldHeight;
            y = Math.round(y);

            return {
                x: x >= this.size ? -1 : x,
                y: y >= this.size ? -1 : y
            };
        }
        private updateDim() {
            this.element.style.width = (this.width / this.pixelRatio) + "px";
            this.element.style.height = (this.height / this.pixelRatio) + "px";

            this.stoneRadius = theme_variable("stoneSize", this);
            //if(this.autoLineWidth) this.lineWidth = this.stoneRadius/7; //< 15 ? 1 : 3;
            this.ls = theme_variable("linesShift", this);

            for (var i = 0; i < this.layers.length; i++) {
                this.layers[i].setDimensions(this.width, this.height);
            }
        }
    }
}
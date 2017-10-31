/// <reference path="./JGO/medium/board.ts" />
/// <reference path="./JGO/large/board.ts" />
/// <reference path="./JGO/board.ts" />
/// <reference path="./JGO/setup.ts" />
/// <reference path="./JGO/record.ts" />
/// <reference path="./commands.ts" />

namespace Main {
    let player = JGO.BLACK;

    let moveNum = 0;
    let moves = 0;
    let gotoMove = 0;
    var jnotifier;
    let gameOn = true;
    let lastHover = false;
    let turn = JGO.BLACK; // next player
    let lastX = -1;
    let lastY = -1; // hover helper vars
    let ko: JGO.Coordinate = undefined;
    let lastMove: JGO.Coordinate; // ko coordinate and last move coordinate
    let jrecord = new JGO.Record(19);
    let jboard = jrecord.jboard;

    export function initializeValues() {
        moveNum = 0;
        moves = 0;
        gotoMove = 0;
        lastHover = false;
        turn = JGO.BLACK; // next player
        lastX = -1;
        lastY = -1; // hover helper vars
        ko = undefined;
        lastMove = undefined;
    }
    export function setGameOn(value: boolean) {
        gameOn = value;
        turn = JGO.BLACK;
        if (gameOn) {
            // play.classList.add("selected");
            return;
        }
        // play.classList.remove("selected");
    }

    export function toggleGameOn() {
        setGameOn(!gameOn);
    }


    export function clearBoard() {
        let str = Keima.Main.gets("clear_board");
        jboard.clear();
    }

    export function setBoardSize(size: number) {
        clearBoard();
        let result = Keima.Main.gets("boardsize " + size);
        jrecord = new JGO.Record(size);
        jboard = jrecord.jboard;
        initialize();
    }

    export function setPlayerColor(color: string) {
        if (color === "black") {
            document.getElementById("black-name").textContent = "Player";
            document.getElementById("white-name").textContent = "CPU";
            player = JGO.BLACK;
        } else {
            document.getElementById("black-name").textContent = "CPU";
            document.getElementById("white-name").textContent = "Player";
            player = JGO.WHITE;
        }

        initializeValues();
        setGameOn(true);
        if (color === "white") {
            let lastGenMove = Commands.genmove(turn);
            if (lastGenMove.pos === "PASS") {
                passDialog.showDialog("CPU Passed", () => {
                    turn = (turn == JGO.BLACK) ? JGO.WHITE : JGO.BLACK;
                });
                return;
            }
            click(jboard.getCoordinate(lastGenMove.pos), undefined);
        }
    }

    export function resign() {
        let score = Commands.finalScore();

        let textContent = score.color + "Win!" + "+" + score.point;
        resultDialog.showDialog(textContent);

        Main.setGameOn(false);
    }

    function move(dir: number) { // dir=0 has special meaning "beginning"
        if (!jrecord) {
            return; // disable movement until SGF loaded
        }

        if (dir == 0) {
            jrecord.first();
            moveNum = 0;
        }
        while (dir < 0) {
            if (!jrecord.previous()) {
                break;
            }
            moveNum--;
            dir++;
        }
        while (dir > 0) {
            if (!jrecord.next()) {
                break;
            }
            moveNum++;
            dir--;
        }
        updateInfo();
    }

    function nextVariation() {
        jrecord.setVariation((jrecord.getVariation() + 1) % jrecord.getVariations());
    }

    function updateInfo() {
        var info = jrecord.getCurrentNode().info;
        document.getElementById("move").textContent = String(moveNum);
        document.getElementById("comments").textContent = info.comment ? info.comment.replace(/\n/g, '<br>') : '';
        document.getElementById("black_captures").textContent = info.captures[JGO.BLACK];
        document.getElementById("white_captures").textContent = info.captures[JGO.WHITE];
        document.getElementById("#variation").textContent = String(jrecord.getVariation() + 1);
        document.getElementById("variations").textContent = String(jrecord.getVariations());
    }

    function updateGameInfo(info) {
        var html = "";

        if ("black" in info) {
            html += "Black: <strong>" + info.black;
            if ("blackRank" in info) html += ", " + info.blackRank;
            html += "</strong><br />";
        }

        if ("white" in info) {
            html += "White: <strong>" + info.white;
            if ("whiteRank" in info) html += ", " + info.whiteRank;
            html += "</strong><br />";
        }

        var additional = [["result", "Result"]];

        for (let tup of additional) {
            if (tup[0] in info) {
                html += tup[1] + ": <strong>" + info[tup[0]] + "</strong><br>";
            }
        }
        document.getElementById("information").textContent = html;
    }

    function getParams(): any { // VERY simple query parameter parse
        var params = {}, url = window.location.toString();
        if (url.indexOf('?') !== -1) {
            url.substr(url.indexOf('?') + 1).split('&').forEach(function (pair) {
                var pos = pair.indexOf('=');
                if (pos === -1) return; // skip if no equals sign
                params[pair.substr(0, pos)] = pair.substr(pos + 1);
            });
        }
        return params;
    }

    function updateCaptures(node: JGO.RecordNode) {
        document.getElementById('black-captures').textContent = "Captures: " + node.info.captures[JGO.BLACK];
        document.getElementById('white-captures').textContent = "Captures: " + node.info.captures[JGO.WHITE];
    }


    function click(coord: JGO.Coordinate, ev: KeyboardEvent) {
        //if (c.i < 10) move(-1); // back
        //if (c.i > 10) move(1); // forward

        var opponent = (turn == JGO.BLACK) ? JGO.WHITE : JGO.BLACK;

        //if (ev.shiftKey) { // on shift do edit
        //    if (jboard.getMark(coord) == JGO.MARK.NONE) {
        //        jboard.setMark(coord, JGO.MARK.SELECTED);
        //    } else {
        //        jboard.setMark(coord, JGO.MARK.NONE);
        //    }
        //    return;
        //}

        // clear hover away - it'll be replaced or then it will be an illegal move
        // in any case so no need to worry about putting it back afterwards
        if (lastHover) {
            jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);
        }

        lastHover = false;

        var play = jboard.playMove(coord, turn, ko);

        if (play.success) {

            let node = jrecord.createNode(true);
            node.info.captures[turn] += play.captures.length; // tally captures
            node.setType(coord, turn); // play stone
            node.setType(play.captures, JGO.CLEAR); // clear opponent's stones

            if (lastMove) {
                node.setMark(lastMove, JGO.MARK.NONE); // clear previous mark
            }
            if (ko) {
                node.setMark(ko, JGO.MARK.NONE); // clear previous ko mark
            }

            node.setMark(coord, JGO.MARK.CIRCLE); // mark move
            lastMove = coord;

            if (play.ko) {
                node.setMark(play.ko, JGO.MARK.CIRCLE); // mark ko, too
            }
            ko = play.ko;

            turn = opponent;
            updateCaptures(node);
            return true;
        } else {
            alert('Illegal move: ' + play.errorMsg);
        }
        return false;
    }

    export function initialize() {
        document.addEventListener("keydown", (e) => { // left/right arrow navigation
            if (e.keyCode == 37) {
                // move(-1);
            } else if (e.keyCode == 39) {
                // move(1);
            }
        });

        var params = getParams(); // parse URL parameters

        //if ('board' in params && params.board in JGO.BOARD)
        //    var jsetup = new JGO.Setup(jboard, JGO.BOARD[params.board]);
        //else
        var jsetup = new JGO.Setup(jboard, JGO.BOARD.large);

        // we can use this to change the board to listen to
        jnotifier = jsetup.getNotifier();


        jsetup.create('board', (canvas) => {
            canvas.addListener('click', (coord: JGO.Coordinate, ev: KeyboardEvent) => {
                if (coord.i == -1 || coord.j == -1 || coord.i >= jboard.width || coord.j >= jboard.width) {
                    return;
                }

                if (!gameOn) {
                    return;
                }
                if (player === turn) {
                    let s = jboard.toString(coord);

                    let result = click(coord, ev);
                    if (result) {
                        Commands.play(player, s);


                        let lastGenMove = Commands.genmove(turn);
                        if (lastGenMove.pos === "PASS") {
                            passDialog.showDialog("Passed", () => {
                                turn = (turn == JGO.BLACK) ? JGO.WHITE : JGO.BLACK;
                            });
                            return;
                        }
                        click(jboard.getCoordinate(lastGenMove.pos), undefined);

                    }
                }
            });

            canvas.addListener('mousemove', function (coord, ev) {
                if (!gameOn) {
                    return;
                }

                if (coord.i == -1 || coord.j == -1 || (coord.i == lastX && coord.j == lastY)) {
                    return;
                }

                if (lastHover) // clear previous hover if there was one
                    jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);

                lastX = coord.i;
                lastY = coord.j;

                if (jboard.getType(coord) == JGO.CLEAR && jboard.getMark(coord) == JGO.MARK.NONE) {
                    jboard.setType(coord, turn == JGO.WHITE ? JGO.DIM_WHITE : JGO.DIM_BLACK);
                    lastHover = true;
                } else
                    lastHover = false;
            });

            canvas.addListener('mouseout', function (ev) {
                if (!gameOn) {
                    return;
                }
                if (lastHover) {
                    jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);
                }

                lastHover = false;
            });
        });

        if ('hidemenu' in params) {
            document.getElementById("menu").style.display = "none";
        }
        if ('hideinfo' in params) {
            document.getElementById("infopane").style.display = "none";
        }
        if ('move' in params) {
            gotoMove = parseInt(params.move);
        }
        if ('url' in params) {
            loadURL(params.url); // load straight away
        }
    };

    function loadSGF(sgf) {
        jrecord = JGO.load(sgf, true);

        if (typeof jrecord == 'string') {
            alert('Error loading SGF: ' + jrecord);
            return;
        }

        if (!(jrecord instanceof JGO.Record)) {
            alert('Empty SGF or multiple games in one SGF not supported!');
            return;
        }

        // $('#moves').html(jrecord.normalize() - 1); // longest sequence first
        document.getElementById("moves").textContent = String(jrecord.normalize() - 1);
        jnotifier.changeBoard(jrecord.getBoard());
        updateGameInfo(jrecord.getRootNode().info);
        moveNum = 0;
        move(gotoMove); // also updates game info
        gotoMove = 0;
    }

    function loadURL(url) {
        //$.ajax('http://static.jgoboard.com/get_sgf.php', {
        //    dataType: 'jsonp', data: { url: url }, complete: function (resp) {
        //        loadSGF(resp.responseJSON);
        //    }
        //});
    }

    function loadFile() {
        //var files = document.getElementById("file").files;

        //if (!files || files.length == 0)
        //    alert("File loading either not supported or no file selected!");

        //var reader = new FileReader();
        //reader.onload = function () { loadSGF(reader.result); };
        //reader.readAsText(files[0], "UTF-8");
    }

    //var play = document.getElementById("play");
    //play.addEventListener("click", (ev) => {
    //    toggleGameOn();
    //});

    let pass = document.getElementById("pass");
    pass.addEventListener("click", (ev) => {
        if (!gameOn) {
            return;
        }
        // Commands.play(turn, "PASS");
        passDialog.showDialog("Are You Sure to Pass?",
            () => {
                turn = (turn === JGO.BLACK) ? JGO.WHITE : JGO.BLACK;

                let lastGenMove = Commands.genmove(turn);
                if (!gameOn) {
                    return;
                }
                if (lastGenMove.pos === "PASS") {
                    let score = Commands.finalScore();

                    let textContent = score.color + "Win!" + "+" + score.point;
                    resultDialog.showDialog(textContent);

                    Main.setGameOn(false);
                    return;
                }
                click(jboard.getCoordinate(lastGenMove.pos), undefined);
            },
            () => {
            });

    });

    let settings = document.getElementById("settings");
    settings.addEventListener("click", (ev) => {
        settingsDialog.showDialog();
    });

    let resignIcon = document.getElementById("resign");
    resignIcon.addEventListener("click", (ev) => {
        resign();
    });

    Commands.initialize();
}

Main.initialize();
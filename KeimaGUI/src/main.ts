/// <reference path="./JGO/medium/board.ts" />
/// <reference path="./JGO/large/board.ts" />
/// <reference path="./JGO/board.ts" />
/// <reference path="./JGO/setup.ts" />
/// <reference path="./JGO/record.ts" />
/// <reference path="./commands.ts" />

let player = JGO.BLACK;

var moveNum = 0, moves = 0, gotoMove = 0;
var jrecord: JGO.Record, jnotifier;
let isPlaying = false;

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
    // $('#move').html(moveNum);
    document.getElementById("move").textContent = String(moveNum);
    // $('#comments').html(info.comment ? info.comment.replace(/\n/g, '<br>') : '');
    document.getElementById("comments").textContent = info.comment ? info.comment.replace(/\n/g, '<br>') : '';
    // $('#black_captures').html(info.captures[JGO.BLACK]);
    document.getElementById("black_captures").textContent = info.captures[JGO.BLACK];
    // $('#white_captures').html(info.captures[JGO.WHITE]);
    document.getElementById("white_captures").textContent = info.captures[JGO.WHITE];
    // $('#variation').html(jrecord.getVariation() + 1);
    document.getElementById("#variation").textContent = String(jrecord.getVariation() + 1);
    // $('#variations').html(jrecord.getVariations());
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

    //$.each(additional, function (i, tup) {
    //    if (tup[0] in info)
    //        html += tup[1] + ": <strong>" + info[tup[0]] + "</strong><br>";
    //});
    for (let tup of additional) {
        if (tup[0] in info) {
            html += tup[1] + ": <strong>" + info[tup[0]] + "</strong><br>";
        }
    }
    // $('#information').html(html);
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

var updateCaptures = function (node) {
    //document.getElementById('black-captures').innerText = node.info.captures[JGO.BLACK];
    //document.getElementById('white-captures').innerText = node.info.captures[JGO.WHITE];
};


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

/*document.onload = () => */
{
    document.addEventListener("keydown", (e) => { // left/right arrow navigation
        if (e.keyCode == 37) {
            // move(-1);
        } else if (e.keyCode == 39) {
            // move(1);
        }
    });

    var params = getParams(); // parse URL parameters
    // var jboard = new JGO.Board(19, 19); // hardcoded size
    var jrecord = new JGO.Record(19);
    var jboard = jrecord.jboard;

    //if ('board' in params && params.board in JGO.BOARD)
    //    var jsetup = new JGO.Setup(jboard, JGO.BOARD[params.board]);
    //else
    var jsetup = new JGO.Setup(jboard, JGO.BOARD.large);

    // we can use this to change the board to listen to
    jnotifier = jsetup.getNotifier();


    var turn = JGO.BLACK; // next player
    var lastHover = false, lastX = -1, lastY = -1; // hover helper vars
    var ko: JGO.Coordinate = undefined, lastMove: JGO.Coordinate; // ko coordinate and last move coordinate

    jsetup.create('board', (canvas) => {
        canvas.addListener('click', (coord: JGO.Coordinate, ev: KeyboardEvent) => {
            if (!isPlaying) {
                return;
            }
            if (player === turn) {
                let s = jboard.toString(coord);
                Commands.play(player, s);
                click(coord, ev);

                let lastGenMove = Commands.genmove(turn);
                click(jboard.getCoordinate(lastGenMove.pos), undefined);
            } else {
            }
        });

        canvas.addListener('mousemove', function (coord, ev) {
            if (!isPlaying) {
                return;
            }

            if (coord.i == -1 || coord.j == -1 || (coord.i == lastX && coord.j == lastY))
                return;

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
            if (!isPlaying) {
                return;
            }
            if (lastHover) {
                jboard.setType(new JGO.Coordinate(lastX, lastY), JGO.CLEAR);
            }

            lastHover = false;
        });
    });

    if ('hidemenu' in params) {
        //$('#menu').hide();
        document.getElementById("menu").style.display = "none";
    }
    if ('hideinfo' in params) {
        // $('#infopane').hide();
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

let play = document.getElementById("play");
play.addEventListener("click", (ev) => {
    if (!isPlaying) {
        play.classList.add("selected");
        isPlaying = true;
        return;
    }

    play.classList.remove("selected");
    isPlaying = false;
});


Commands.initialize();
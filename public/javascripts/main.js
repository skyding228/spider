"use strict";

var term,
    protocol,
    socketURL,
    socket,
    pid;

var Clock = new Date(), LastCommunicateTime = Clock.getTime(), TTL = 1000 * 60 * 30, HeartBeatMsg = '_heart_beat_';
var NodeName = '<%=hostName%>' || 'spiderweb', CurrentStatus = null;
var Status = {
    connected: {favicon: 'green24.png', name: 'connected'},
    closed: {favicon: 'red24.png', name: 'closed'},
    message: {favicon: 'blue24.png', name: 'message'}
};
var HiddenProp = getHiddenProp();
var VisEvtName = HiddenProp.replace(/[H|h]idden/, '') + 'visibilitychange';
var StorageEvtName = '_all_terminal_cmd';
if (!HiddenProp || !VisEvtName || !window.localStorage) {
    alert('部分特性此浏览器不支持,影响体验,推荐使用Chrome浏览器!');
}

Terminal.applyAddon(fit);
Terminal.applyAddon(attach);
Terminal.applyAddon(zmodem);
Terminal.applyAddon(search);
Terminal.applyAddon(fullscreen);

var terminalContainer = document.getElementById('terminal-container'),
    terminalHeader = document.getElementById('terminal-header');

function setTerminalSize() {
    var width = '100%';
    var height = '800px';
    terminalContainer.style.width = width;
    terminalContainer.style.height = height;
    term.fit();
}

function setPadding() {
    term.element.style.padding = '10px';
    term.fit();
}

createTerminal();

function createTerminal() {
    window.onresize = function () {
        term.fit()
    };
    // Clean terminal
    while (terminalContainer.children.length) {
        terminalContainer.removeChild(terminalContainer.children[0]);
    }
    term = new Terminal({
        scrollback: 1000
    });
    window.term = term;  // Expose `term` to window for debugging purposes
    term.on('resize', function (size) {
        if (!pid) {
            return;
        }
        var cols = size.cols,
            rows = size.rows,
            url = 'terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows;

        fetch(url, {method: 'POST', credentials: 'include'});
    });
    protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
    var path = location.pathname;
    if (path) {
        path = path.substring(0, path.lastIndexOf('/'));
    } else {
        path = '';
    }
    socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + path + '/terminals/';

    term.open(terminalContainer);
    setPadding();
    term.toggleFullScreen();
    term.focus();

    // fit is called within a setTimeout, cols and rows need this.
    setTimeout(function () {

        // Set terminal size again to set the specific dimensions on the demo
        setTerminalSize();

        fetch('terminals?cols=' + term.cols + '&rows=' + term.rows, {
            method: 'POST',
            credentials: 'include'
        }).then(function (res) {

            res.text().then(function (pid) {
                window.pid = pid;
                socketURL += pid;
                socket = new WebSocket(socketURL);
                socket.onopen = runRealTerminal;
                socket.onclose = runFakeTerminal;
                socket.onerror = runFakeTerminal;

                term.zmodemAttach(socket, {
                    noTerminalWriteOutsideSession: true,
                });

                term.on("zmodemRetract", () => {
                    start_form.style.display = "none";
                    start_form.onsubmit = null;
                });

                term.on("zmodemDetect", (detection) => {
                    function do_zmodem() {
                        term.detach();
                        let zsession = detection.confirm();

                        var promise;

                        if (zsession.type === "receive") {
                            promise = _handle_receive_session(zsession);
                        }
                        else {
                            promise = _handle_send_session(zsession);
                        }

                        promise.catch(console.error.bind(console)).then(() => {
                            term.attach(socket);
                        });
                    }

                    if (_auto_zmodem()) {
                        do_zmodem();
                    }
                    else {
                        start_form.style.display = "";
                        start_form.onsubmit = function (e) {
                            start_form.style.display = "none";

                            if (document.getElementById("zmstart_yes").checked) {
                                do_zmodem();
                            }
                            else {
                                detection.deny();
                            }
                        };
                    }
                });
            });
        });
    }, 0);
}

//----------------------------------------------------------------------
// UI STUFF

function _show_file_info(xfer) {
    var file_info = xfer.get_details();

    document.getElementById("name").textContent = file_info.name;
    document.getElementById("size").textContent = file_info.size;
    document.getElementById("mtime").textContent = file_info.mtime;
    document.getElementById("files_remaining").textContent = file_info.files_remaining;
    document.getElementById("bytes_remaining").textContent = file_info.bytes_remaining;

    document.getElementById("mode").textContent = "0" + file_info.mode.toString(8);

    var xfer_opts = xfer.get_options();
    ["conversion", "management", "transport", "sparse"].forEach((lbl) => {
        document.getElementById('zfile_' + lbl).textContent = xfer_opts[lbl];
    });

    document.getElementById("zm_file").style.display = "";
}
function _hide_file_info() {
    document.getElementById("zm_file").style.display = "none";
}

function _save_to_disk(xfer, buffer) {
    return Zmodem.Browser.save_to_disk(buffer, xfer.get_details().name);
}

var skipper_button = document.getElementById("zm_progress_skipper");
var skipper_button_orig_text = skipper_button.textContent;

function _show_progress() {
    skipper_button.disabled = false;
    skipper_button.textContent = skipper_button_orig_text;

    document.getElementById("bytes_received").textContent = 0;
    document.getElementById("percent_received").textContent = 0;

    document.getElementById("zm_progress").style.display = "";
}

function _update_progress(xfer) {
    var total_in = xfer.get_offset();

    document.getElementById("bytes_received").textContent = total_in;

    var percent_received = 100 * total_in / xfer.get_details().size;
    document.getElementById("percent_received").textContent = percent_received.toFixed(2);
}

function _hide_progress() {
    document.getElementById("zm_progress").style.display = "none";
}

var start_form = document.getElementById("zm_start");

function _auto_zmodem() {
    return true;
}

// END UI STUFF
//----------------------------------------------------------------------

function _handle_receive_session(zsession) {
    zsession.on("offer", function (xfer) {
        current_receive_xfer = xfer;

        _show_file_info(xfer);

        var offer_form = document.getElementById("zm_offer");

        function on_form_submit() {
            offer_form.style.display = "none";

            //START
            //if (offer_form.zmaccept.value) {
            if (_auto_zmodem() || document.getElementById("zmaccept_yes").checked) {
                _show_progress();

                var FILE_BUFFER = [];
                xfer.on("input", (payload) => {
                    _update_progress(xfer);
                    FILE_BUFFER.push(new Uint8Array(payload));
                });
                xfer.accept().then(
                    () => {
                        _save_to_disk(xfer, FILE_BUFFER);
                    },
                    console.error.bind(console)
                );
            }
            else {
                xfer.skip();
            }
            //END
        }

        if (_auto_zmodem()) {
            on_form_submit();
        }
        else {
            offer_form.onsubmit = on_form_submit;
            offer_form.style.display = "";
        }
    });

    var promise = new Promise((res) => {
        zsession.on("session_end", () => {
            _hide_file_info();
            _hide_progress();
            res();
        });
    });

    zsession.start();

    return promise;
}

function _handle_send_session(zsession) {
    var choose_form = document.getElementById("zm_choose");
    choose_form.style.display = "";

    var file_el = document.getElementById("zm_files");

    var promise = new Promise((res) => {
        file_el.onchange = function (e) {
            choose_form.style.display = "none";

            var files_obj = file_el.files;

            Zmodem.Browser.send_files(
                zsession,
                files_obj,
                {
                    on_offer_response(obj, xfer) {
                        if (xfer) _show_progress();
                        //console.log("offer", xfer ? "accepted" : "skipped");
                    },
                    on_progress(obj, xfer) {
                        _update_progress(xfer);
                    },
                    on_file_complete(obj) {
                        //console.log("COMPLETE", obj);
                        _hide_progress();
                    },
                }
            ).then(_hide_progress).then(
                zsession.close.bind(zsession),
                console.error.bind(console)
            ).then(() => {
                _hide_file_info();
                _hide_progress();
                res();
            });
        };
    });

    return promise;
}

//This is here to allow canceling of an in-progress ZMODEM transfer.
var current_receive_xfer;


function runRealTerminal() {
    term.attach(socket);
    term.on('data', function (d) {
        if(HeartBeatMsg === d){
            return;
        }
        LastCommunicateTime = Clock.getTime();
        if (document[HiddenProp]) {
            changeStatus(Status.message.name);
        }
    });
    term._initialized = true;
    changeStatus(Status.connected.name);
    setTimeout(changeToDir, 300);
}

function changeToDir() {
    var dir = getQueryString('dir'), file = getQueryString('file');
    if (!dir) {
        var path = getQueryString('path');
        var index = path.lastIndexOf('/');
        if (index !== -1) {
            dir = path.substring(0, index);
        }
        file = path.substring(path.lastIndexOf('/') + 1);
    }
    dir && term.send('cd ' + dir + ' \n');
    file && term.send('tail -f ' + file + ' \n');
}
function runFakeTerminal() {
    if (term._initialized) {
        term.write('\r\n terminal closed!');
        changeStatus(Status.closed.name);
        return;
    }

    term._initialized = true;

    var shellprompt = '$ ';

    term.prompt = function () {
        term.write('\r\n' + shellprompt);
    };

    term.writeln('Welcome to xterm.js');
    term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
    term.writeln('Type some keys and commands to play around.');
    term.writeln('');
    term.prompt();

    term.on('key', function (key, ev) {
        var printable = (
            !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
        );

        if (ev.keyCode == 13) {
            term.prompt();
        } else if (ev.keyCode == 8) {
            // Do not delete the prompt
            if (term.x > 2) {
                term.write('\b \b');
            }
        } else if (printable) {
            term.write(key);
        }
    });

    term.on('paste', function (data, ev) {
        term.write(data);
    });
}

function isTerminalClosed() {
    return CurrentStatus === Status.closed.name;
}
function changeStatus(status) {
    if (isTerminalClosed()) {
        return;
    }
    if (status === CurrentStatus) {
        return;
    }
    CurrentStatus = status;
    if (!Status[status]) {
        return;
    }
    status = Status[status];
    var $favicon = document.getElementById('favicon');
    $favicon.href = 'public/imgs/' + status.favicon;
    document.title = NodeName + '-' + status.name;
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", 'i'); // 匹配目标参数
    var result = window.location.search.substr(1).match(reg);  // 对querystring匹配目标参数
    if (result != null) {
        return decodeURIComponent(result[2]);
    } else {
        return null;
    }
}

function getHiddenProp() {
    var prefixes = ['webkit', 'moz', 'ms', 'o'];
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';
    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++) {
        if ((prefixes[i] + 'Hidden') in document)
            return prefixes[i] + 'Hidden';
    }
    // otherwise it's not supported
    return null;
}
function runClock() {
    var period = 10 * 1000;
    setInterval(function () {
        Clock.setTime(Clock.getTime() + period);
    }, period);
}
function heartbeat() {
    setInterval(function () {
        var now = Clock.getTime();
        if (now - LastCommunicateTime < TTL) {
            term.send(HeartBeatMsg);
        }
    }, 30 * 1000);

}
(function init(){
    runClock();
    heartbeat();
})();
document.addEventListener(VisEvtName, function () {
    if (!document[HiddenProp]) {
        changeStatus(Status.connected.name);
    }
}, false);
var $command = document.getElementById('command');
$command.onkeypress = function (event) {
    if (event.keyCode === 13) {
        var cmd = $command.value + '\n';
        localStorage.setItem(StorageEvtName, cmd);
        $command.value = '';
        // the source terminal can not receive the storage changed event
        term.send(cmd);
        localStorage.removeItem(StorageEvtName);
    }
};
window.addEventListener('storage', function (event) {
    if (event.newValue && StorageEvtName === event.key) {
        console.log(event.key, event.newValue);
        term.send(event.newValue);
    }
});


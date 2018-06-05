/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/6/5
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
var pty = require('node-pty');
var StartListeners = [];
var StopListeners = [];

function listenStart() {
    var cmd = "docker events --filter 'event=start' --format '{{.ID}}'";
    var term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', ['-c', cmd], {
        encoding: null,
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.PWD,
        env: process.env
    });
    term.on('data', function (containerId) {
        containerId = removeEnterKey(new String(containerId));
        console.log(containerId + ' started');
        StartListeners.forEach(listener => {
            listener(containerId);
        });
    });
}
function listenStop() {
    var cmd = "docker events --filter 'event=stop' --format '{{.ID}}'";
    var term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', ['-c', cmd], {
        encoding: null,
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.PWD,
        env: process.env
    });
    term.on('data', function (containerId) {
        containerId = removeEnterKey(new String(containerId));
        console.log(containerId + ' stoped');
        StopListeners.forEach(listener => {
            listener(containerId);
        });
    });
}
//remove \n
function removeEnterKey(str) {
    return str.replace(/\n/, '').replace(/\r/,'');
}
/**
 * the callback will be invoked when a docker container start. the arguments is container id
 * @param callback
 */
function onStart(callback) {
    StartListeners.push(callback);
}

/**
 * the callback will be invoked when a docker container stop. the arguments is container id
 * @param callback
 */
function onStop(callback) {
    StopListeners.push(callback);
}

listenStart();
listenStop();

module.exports = {
    onStart: onStart,
    onStop: onStop
};
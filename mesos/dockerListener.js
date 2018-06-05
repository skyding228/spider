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

function listen() {
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
        StartListeners.forEach(listener => {
            listener(containerId);
        });
    });
}
/**
 * the callback will be invoked when a docker container create. the arguments is container id
 * @param callback
 */
function onStart(callback) {
    StartListeners.push(callback);
}

listen();

module.exports = {
    onStart: onStart
};
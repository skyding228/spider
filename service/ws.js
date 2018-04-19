/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/4/19
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
var _ = require('lodash');

var WebSockets = {};
var NextSocketId = 1;


function sendFiles(ws, files) {
    setTimeout(function () {
        ws.send(JSON.stringify(files));
    }, 1);
}

function getNewSocketId() {
    return NextSocketId++;
}

function saveWebSocket(id, ws) {
    WebSockets[id] = ws;
}

function removeSocket(id) {
    delete WebSockets[id];
}

function getAliveSockets() {
    return _.valuesIn(WebSockets);
}

function sendFilesToAllWS(files){
    if(!files.length){
        return;
    }
    setTimeout(function () {
        getAliveSockets().forEach(ws=> {
            sendFiles(ws, files);
        })
    }, 1);
}

module.exports = {
    sendFiles: sendFiles,
    getNewSocketId: getNewSocketId,
    saveWebSocket: saveWebSocket,
    removeSocket: removeSocket,
    getAliveSockets: getAliveSockets,
    sendFilesToAllWS:sendFilesToAllWS
};


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
var NextSocketId = new Date().getTime();
var config = require('./configuration');

var BATCH = config.files_batch_size; //batch size to send files,too large maybe has a error

function sendFiles(ws, files) {
    while (files.length > BATCH) {
        var toSend = files.splice(0, BATCH);
        send(ws, toSend);
    }
    if (files.length) {
        send(ws, files);
    }

}

function send(ws, files) {
    setTimeout(function () {
        try {
            ws.send(JSON.stringify(files));
        }catch (e){
            console.log('send new files to browser error',e);
        }
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

function sendFilesToAllWS(files) {
    if (!files.length) {
        return;
    }
    getAliveSockets().forEach(ws=> {
        sendFiles(ws, files);
    });
}

module.exports = {
    sendFiles: sendFiles,
    getNewSocketId: getNewSocketId,
    saveWebSocket: saveWebSocket,
    removeSocket: removeSocket,
    getAliveSockets: getAliveSockets,
    sendFilesToAllWS: sendFilesToAllWS
};


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
var Files = require('../service/files');
var console = require('../service/console');
var config = require('../service/configuration');
var WS = require('../service/ws');

var express = require('express');
var router = express.Router();

router.get('/new', function getNewSocket(req, res, next) {
    var id = WS.getNewSocketId();
    console.log('new websocket ' + id);
    res.json(id);
});

router.ws('/files/:id', function filesSocket(ws, req) {
    ws.on('message', function (msg) {
        WS.saveWebSocket(req.params.id, ws);
        console.log('receive ' + msg + ' from web socket ' + req.params.id);
        var files = Files.getFiles();
        WS.sendFiles(ws, files);
    });
    ws.on('close', function (msg) {
        console.log('close web socket ' + req.params.id);
        WS.removeSocket(req.params.id);
    });
});

module.exports = router;
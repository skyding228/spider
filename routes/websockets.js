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

var express = require('express');
var router = express.Router();

var WebSockets = {};
var NextSocketId = 1;
var BATCH = config.files_batch_size;


router.get('/new', function getNewSocket(req, res, next) {
    var id = NextSocketId++;
    WebSockets[id] = 1; //only represent the socket is alive
    console.log('new websocket '+id);
    res.json(id);
});

router.ws('/files/:id', function filesSocket(ws, req) {
    ws.on('message', function (msg) {
        console.log('receive ' + msg + ' from web socket ' + req.params.id);
        var files = Files.getFiles();
        while (files.length > BATCH) {
            var toSend = files.splice(0, BATCH);
            sendFiles(ws,toSend);
        }
        if (files.length) {
            sendFiles(ws,files);
        }
    });
    ws.on('close', function (msg) {
        console.log('close web socket ' + req.params.id);
        delete  WebSockets[req.params.id];
    });
});

function sendFiles(ws,files) {
   setTimeout(function(){
       ws.send(JSON.stringify(files));
   },1);
}

module.exports = router;
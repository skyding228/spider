var express = require('express');
var router = express.Router();

var files = require('../service/files');
var hosts = require('../service/hosts');
var console = require('../service/console');

/* GET home page. */
router.get('/files', function (req, res, next) {
    res.json(files.getFiles());
});

router.get('/hosts', function (req, res, next) {
    res.json(hosts.getHosts());
});

router.post('/collect', function (req, res, next) {
    hosts.addHost(req.body.host);
    files.addFiles(req.body.files, req.body.host);
    console.log('receive ' + req.body.files.length + 'files from ', req.body.host, newFiles.length + ' is new files');
    res.json(hosts.getHosts());
});

router.get('/download', function (req, res) {
    console.log('download ' + req.query.path);
    res.download(req.query.path);
});

module.exports = router;

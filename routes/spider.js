var express = require('express');
var router = express.Router();

var files = require('../service/files');
var hosts = require('../service/hosts');

/* GET home page. */
router.get('/files', function (req, res, next) {
    res.json(files.getFiles());
});

router.get('/hosts', function (req, res, next) {
    res.json(hosts.getHosts());
});

router.post('/collect', function (req, res, next) {
    console.log('receive files from ' + req.body.host);
    hosts.addHost(req.body.host);
    files.addFiles(req.body.files,req.body.host.url);
    res.json(hosts.getHosts());
});


module.exports = router;

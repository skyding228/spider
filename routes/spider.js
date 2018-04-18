var express = require('express');
var router = express.Router();

var files = require('../service/files');
var hosts = require('../service/hosts');
var console = require('../service/console');
var config = require('../service/configuration');
/* GET home page. */
router.get('/files', function (req, res, next) {
    res.json(files.getFiles());
});

router.get('/hosts', function (req, res, next) {
    res.json(hosts.getHosts());
});

router.post('/collect', function (req, res, next) {
    console.log('receive files from ',req.body.host);
    hosts.addHost(req.body.host);
    files.addFiles(req.body.files,req.body.host);
    res.json(hosts.getHosts());
});

router.get('/download/:id(.+)',function(req,res){
    console.log('download + '+req.params.id);
    res.download(files.resoleUri(config.root_dir, req.params.id));
});

module.exports = router;

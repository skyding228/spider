var express = require('express');
var router = express.Router();

var fileSteps = require('../service/fileSteps');
var hosts = require('../service/hosts');

/* GET home page. */
router.get('/files', function(req, res, next) {
  res.json(fileSteps.getFiles());
});

router.get('/hosts', function(req, res, next) {
  res.json(hosts.getHosts());
});

router.post('/push',function(req, res, next) {
  res.json(hosts.getHosts());
});


module.exports = router;

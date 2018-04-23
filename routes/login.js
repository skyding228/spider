/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/4/23
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */

var express = require('express');
var router = express.Router();
var sessions = require('../service/sessions');
var users = require('../service/users');
var path = require('path');

router.get('/verifyToken', function (req, res) {
    res.json(sessions.verifyToken(req) ? 'yes' : 'no');
});

router.get('/login', function (req, res, next) {
    res.sendFile(path.resolve(__dirname, '../html/login.html'));
});

router.post('/login', function (req, res, next) {
    var error = users.verifyUser(req.body.name, req.body.pwd);
    if (!error) {
        res.cookie(sessions.tokenKey, sessions.newToken(), {maxAge: 1000 * 60 * 60 * 24 * 365});
        res.redirect('/');
    } else {
        res.redirect('/login?_error=' + error);
    }
});


module.exports = router;
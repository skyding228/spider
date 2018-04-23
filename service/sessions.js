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

var TOKEN = '_token';
var SESSION = {};
var TOKEN_INDEX = 1;
var hosts = require('./hosts');
var users = require('./users');
var request = require('request');
var files = require('./files');

function loginFilter(req, res, next) {
    if (hosts.isMaster()) {
        if (!verifyToken(req)) {
            res.redirect('/login');
            return;
        } else {
            next();
        }
        return;
    }
    var loginUrl = files.resoleUri(hosts.getMaster(), 'login');
    toVerifyTokenOnMaster(req, next, function () {
        res.redirect(loginUrl);
    });
}

function removeToken(req) {
    var token = getTokenFromReq(req);
    if (token) {
        delete SESSION[token];
    }
}

function newToken() {
    var now = new Date().getTime();
    var token = now + (TOKEN_INDEX++);
    SESSION[token] = {};
    return token;
}

function getSession(token) {
    if (!token) {
        return null;
    }
    return SESSION[token];
}

function getTokenFromReq(req) {
    var token = req.query[TOKEN];
    token = token || req.cookies[TOKEN];
    return token;
}

function verifyToken(req) {
    return !!SESSION[getTokenFromReq(req)];
}
/**
 *
 * @param req
 * @param yesCb the callback to execute if has login
 * @param noCb
 */
function toVerifyTokenOnMaster(req, yesCb, noCb) {
    var token = getTokenFromReq(req);
    if (!token) {
        noCb();
        return;
    }
    var url = files.resoleUri(hosts.getMaster(), 'verifyToken?' + TOKEN + '=' + token);
    request.get(url, function (err, res, body) {
        if ('yes' === body) {
            yesCb();
        } else {
            noCb();
        }
    });
}

module.exports = {
    loginFilter: loginFilter,
    newToken: newToken,
    removeToken: removeToken,
    verifyToken: verifyToken,
    getSession: getSession,
    tokenKey: TOKEN
};
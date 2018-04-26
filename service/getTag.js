/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/4/25
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
var exec = require('child_process').exec;
var config = require('./configuration');
var request = require('request');
var files = require('./files');
var sessions = require('./sessions');
var console = require('./console');

function splitToTags(file) {
    file = file && file.replace(/\r/g, '');
    var tags = [];
    var lines = file.split('\n');
    lines.forEach(line => {
        line = line && line.trim();
        if (line) {
            tags.push(line);
        }
    });
    return tags;
};


function getTags(req, res) {
    var hostUrl = req.query.hostUrl;
    if (hostUrl) {
        var token = req.query[sessions.tokenKey];
        getRemoteTags(hostUrl, token, res);
    } else {
        getLocalTags(res);
    }
}
function getLocalTags(res) {
    console.log('exec shell at ' + config.get_tag_shell_path);
    exec(config.get_tag_shell_path, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
        console.log('stderr' + stderr);
        var tags = [];
        if (stdout) {
            tags = splitToTags(stdout);
        }
        console.log(tags);
        res.json(tags);
    });
}

function getRemoteTags(hostUrl, token, res) {
    var url = files.resoleUri(hostUrl, '/spider/getTag?' + sessions.tokenKey + '=' + token);
    console.log('get remote tags from '+url);
    request.get({url: url}
        , function (err, resp, body) {
            var tags = '';
            if (err) {
                console.log('send to ' + url + ' err!', err);
            } else {
                tags = body;
            }
            res.end(tags);
        });
}

module.exports = {
    getTags: getTags
};
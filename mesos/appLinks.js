/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/5/24
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
var fs = require('fs');
var urls = require('../service/utils').urls;
var Exec = require('child_process').exec;
var console = require('../service/console');

var ABSOLUTE_ROOT_DIR = '/singularity/executors';
var LINK_ROOT_DIR = '/opt/';

function listDir(path) {
    var dirs = [];
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var absolutePath = path + '/' + file;
        if (!fs.existsSync(absolutePath)) {
            return;
        }
        var states = fs.statSync(absolutePath);
        if (states.isDirectory()) {
            dirs.push(file);
        }
    }

    return dirs;
}


function linkDir(dir) {
    var link = urls.resoleUri(LINK_ROOT_DIR, dir);
    var absolute = urls.resoleUri(urls.resoleUri(ABSOLUTE_ROOT_DIR, dir), 'runs');
    if (!fs.existsSync(absolute)) {
        return;
    }
    var runsDir = listDir(absolute);
    for (var i = 0; i < runsDir.length; i++) {
        if (runsDir[i] !== 'latest') {
            absolute = urls.resoleUri(absolute, runsDir[i]);
            break;
        }
    }
    if (!fs.existsSync(absolute)) {
        return;
    }
    execLn(absolute, link);
}


function execLn(absolute, link) {
    var cmd = 'ln -s ' + absolute + ' ' + link;
    Exec(cmd, function (err, stdout, stderr) {
        console.log(cmd, err, stdout, stderr);
    });
}

function watchNewDirs() {
    fs.watch(ABSOLUTE_ROOT_DIR, {recursive: false}, function (event, dir) {
        if ('rename' === event) {
            linkDir(dir);
        }
    });
}

function initLinks() {
    var absoluteDirs = listDir(ABSOLUTE_ROOT_DIR);
    absoluteDirs.forEach(dir => {
        linkDir(dir);
    });
}

function init() {
    initLinks();
    watchNewDirs();
}

module.exports = {
    init: init
};

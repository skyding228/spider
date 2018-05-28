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

var config = require('../service/configuration');

var ABSOLUTE_ROOT_DIR = urls.resoleUri(config.singularity_root_dir,'executors/') ;
var LINK_ROOT_DIR = '/opt/';

function listDir(path) {
    var dirs = [];
    if (!fs.existsSync(path)) {
        return dirs;
    }
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var absolutePath = path + '/' + file;
        if (!fs.existsSync(absolutePath)) {
            return dirs;
        }
        var states = fs.statSync(absolutePath);
        if (states.isDirectory()) {
            dirs.push(file);
        }
    }

    return dirs;
}

function getAbsoluteDir(dir){
    var absolute = urls.resoleUri(urls.resoleUri(ABSOLUTE_ROOT_DIR, dir), 'runs');
    if (!fs.existsSync(absolute)) {
        return null;
    }
    var runsDir = listDir(absolute);
    for (var i = 0; i < runsDir.length; i++) {
        if (runsDir[i] !== 'latest') {
            absolute = urls.resoleUri(absolute, runsDir[i]);
            break;
        }
    }
    if (!fs.existsSync(absolute)) {
        return null;
    }
    return absolute;
}

function linkDir(dir) {
    var link = urls.resoleUri(LINK_ROOT_DIR, dir);
    var absolute = getAbsoluteDir(dir);
    if(absolute){
        execLn(absolute, link);
    }
}

function execLn(absolute, link) {
    var cmd = 'ln -s ' + absolute + ' ' + link;
    Exec(cmd, function (err, stdout, stderr) {
        console.log(cmd, err, stdout, stderr);
    });
}

function watchNewDirs(dir,callback) {
    fs.watch(dir, {recursive: false}, function (event, dir) {
        if ('rename' === event) {
            callback(dir);
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
    watchNewDirs(ABSOLUTE_ROOT_DIR,linkDir);
}

module.exports = {
    init: init,
    getAbsoluteDir:getAbsoluteDir,
    execLn:execLn,
    listDir:listDir,
    watchNewDirs:watchNewDirs
};

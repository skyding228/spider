/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/4/16
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */

var fs = require('fs');
var config = require('./configuration');
var _ = require('lodash');
var hosts = require('./hosts');
var request = require('request');
var console = require('./console');
var WS = require('../service/ws');

var PATH = require('path');

/**
 * {
 *  size
    shortName
    path
    segments
    uri
    tailUrl
    downloadUrl
    host
 * }
 */
/**
 * uri is host + absolute path, one uri can identify one file
 * {
 *  uri:file
 * }
 * @type {{}}
 */
var FileMap = {};

var NewFiles = {};

var BATCH = config.files_batch_size; //batch size to send files,too large maybe has a error

var SizeUnit = [' B', ' K', ' M', ' G', ' T'];
function formatFileSize(size) {
    if (size <= 0) {
        return '0 B';
    }
    for (var i = 0; i < SizeUnit.length; i++) {
        if (size > 1000) {
            size = size / 1000;
        } else {
            break;
        }
    }
    return Math.ceil(size) + SizeUnit[i];
}
/**
 * list all files recursively(exclude folder) to filesList
 * @param path
 * @param filesList
 */
function listFilesRecursively(path, filesList) {
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var absolutePath = path + '/' + file;
        if(!fs.existsSync(absolutePath)){
            return;
        }
        var states = fs.statSync(absolutePath);
        if (states.isDirectory()) {
            listFilesRecursively(path + '/' + file, filesList);
        } else {
            //创建一个对象保存信息
            var obj = {};
            obj.size = formatFileSize(states.size);//文件大小，以字节为单位
            obj.shortName = file; //文件名
            obj.path = path + '/' + file; //文件绝对路径
            filesList.push(obj);
        }
    }
}


/**
 * segment is one folder in path,e.g. opt is one segment of /opt/logs
 */
function addSegmentsAndHost(files, host) {
    var now = new Date().getTime();
    _.forEach(files, file => {
        file.updateAt = now;
        //remove root dir
        if (file.path.startsWith(config.root_dir)) {
            file.path = file.path.substring(config.root_dir.length + 1);
        }
        file.segments = trimSlash(file.path).split('/');
        file.uri = resoleUri(host.url, file.path);
        file.tailUrl = resoleUri(host.url, 'spiderweb-node?path=' + resoleUri(config.root_dir, file.path));
        file.downloadUrl = resoleUri(host.url, 'spider/download?path=' + resoleUri(config.root_dir, file.path));
        file.host = host.name;
    });
    return files;
}

function resoleUri(start, end) {
    var uri = null;
    if (!start.endsWith('/')) {
        start = start + '/';
    }
    if (end.startsWith('/')) {
        end = end.substring(1);
    }
    uri = start + end;
    return uri;
}

/**
 * remove the startsWith and endsWith slash if has
 * @param path
 * @returns {*}
 */
function trimSlash(path) {
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1);
    }
    return path;
}


function getLocalFiles() {
    var fileList = [];
    listFilesRecursively(config.root_dir, fileList);
    return fileList;
}

/**
 * save all files ,return new add files
 * @param files
 * @param host
 * @returns {Array} new files
 */
function addFiles(files, host) {
    files = addSegmentsAndHost(files, host);
    var newFiles = [];
    files.forEach(file=> {
        if (!FileMap[file.uri]) {
            newFiles.push(file);
        }
        FileMap[file.uri] = file;
    });
    if (newFiles.length) {
        sendFiles(newFiles);
        WS.sendFilesToAllWS(newFiles);
    }
    return newFiles;
}


function weedOverdueFiles() {
    var now = new Date().getTime();
    var files = [];
    for (var k in FileMap) {
        var file = FileMap[k];
        if (now - config.collect_interval_ms > file.updateAt) {
            delete FileMap[k];
        } else {
            files.push(file);
        }
    }
    return files;
}

function getFiles() {
    return weedOverdueFiles();
}

function watchNewFiles() {
    fs.watch(config.root_dir, {recursive: true}, function (event, filename) {
        if ('rename' === event) {
            NewFiles[filename] = 1; //use key of object to avoid duplicate
        }
    });
}

function sendFiles(files) {
    if (hosts.isMaster()) {
        return;
    }
    var host = hosts.getLocal();
    var master = resoleUri(hosts.getMaster(), 'spider/collect');
    try {
        while (files.length > BATCH) {
            var toSend = files.splice(0, BATCH);
            send(toSend, host, master);
        }
        if (files.length) {
            send(files, host, master);
        }

    } catch (e) {
        console.log('send files to ' + master + ' has a err!', e);
    }
}
function send(files, host, master) {
    setTimeout(function () {
        console.log('send files to ' + master, files.length);
        request({
            uri: master,
            method: 'POST',
            json: {host: _.pick(host, 'url', 'name'), files: files}
        }, function (err, resp, body) {
            if (err) {
                console.log('send to ' + master + ' err!', err);
            } else {
                try {
                    hosts.addHosts(body);
                } catch (e) {
                    console.log('add hosts has a err!', e, body);
                }
            }
        });
    }, 1);
}

function sendAllFilesCronJob() {
    setTimeout(sendAllFilesCronJob, config.send_interval_ms);
    sendFiles(getLocalFiles());
    // every node can serve their local files
    addFiles(getLocalFiles(), hosts.getLocal());
}

function sendNewFilesCronJob() {
    setTimeout(sendNewFilesCronJob, config.send_new_files_ms);
    var fileNames = _.keysIn(NewFiles);
    NewFiles = {};
    if (!fileNames.length) {
        return;
    }
    var files = [];
    fileNames.forEach(name=> {
        try {
            var path = PATH.resolve(config.root_dir, name);
            if (!fs.existsSync(path)) {
                return;
            }
            var segments = name.split(PATH.sep);
            var stat = fs.statSync(path);
            if (stat.isDirectory()) {
                return;
            }
            var file = {};
            file.shortName = segments[segments.length - 1];
            file.size = formatFileSize(stat.size);
            file.path = resoleUri(config.root_dir, segments.join('/'));
            files.push(file);
        } catch (e) {
            console.log(e);
        }
    });
    addFiles(files, hosts.getLocal());
}
watchNewFiles();
//start cron job
setTimeout(sendAllFilesCronJob, 1000);
setTimeout(sendNewFilesCronJob, 1000);
module.exports = {
    addFiles: addFiles,
    getFiles: getFiles,
    getLocalFiles: getLocalFiles,
    resoleUri:resoleUri
};

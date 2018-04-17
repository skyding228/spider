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
var START_COLLECTION_TIME = new Date().getTime();

/**
 *
 * [{file}]
 * @type [{}]
 */
var Files = [];
/**
 * uri is host + absolute path, one uri can identify one file
 * {
 *  uri:file
 * }
 * @type {{}}
 */
var FileMap = {};

/**
 * list all files recursively(exclude folder) to filesList
 * @param path
 * @param filesList
 */
function listFilesRecursively(path, filesList) {
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            listFilesRecursively(path + '/' + file, filesList);
        } else {
            //创建一个对象保存信息
            var obj = {};
            obj.size = states.size;//文件大小，以字节为单位
            obj.shortName = file; //文件名
            obj.path = path + '/' + file; //文件绝对路径
            filesList.push(obj);
        }
    }
}


/**
 * segment is one folder in path,e.g. opt is one segment of /opt/logs
 */
function addSegmentsAndUri(files, hostUrl) {
    _.forEach(files, file => {
        //remove root dir
        if (file.path.startsWith(config.root_dir)) {
            file.path = file.path.substring(config.root_dir.length + 1);
        }
        file.segments = trimSlash(file.path).split('/');
        file.uri = resoleUri(hostUrl , file.path);
    });
    return files;
}

function resoleUri(start, end) {
    var uri = null;
    if (start.endsWith('/') || end.startsWith('/')) {
        uri = start + end;
    } else {
        uri = start + '/' + end;
    }
    return uri.replace(/\/{2,}/g, '/');
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
 * tell you where to save,Files or NextFiles
 */
function saveToFiles() {
    var now = new Date().getTime();
    //files collection finished,start next one
    if (now - START_COLLECTION_TIME > config.collect_interval_ms) {
        addFiles(getLocalFiles(), hosts.getLocal().url);
        Files = _.valuesIn(FileMap);
        FileMap = {};
        START_COLLECTION_TIME = now;
    }
}

function addFiles(files, hostUrl) {
    files = addSegmentsAndUri(files, hostUrl);
    files.forEach(file=> {
        FileMap[file.uri] = file;
    });
    saveToFiles();
}

function getFiles() {
    //if no files , use collecting files
    if (!Files.length) {
        return _.valuesIn(FileMap);
    }
    return Files;
}
// init to add local files
addFiles(getLocalFiles(), hosts.getLocal().url);
module.exports = {
    addFiles: addFiles,
    getFiles: getFiles,
    getLocalFiles: getLocalFiles
};

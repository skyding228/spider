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

var config = require('./configuration');
var getFileList = require('./dirinfo');
var _ = require('lodash');
var Files = [];


/**
 * file: /nodejs/spider/public/css/hack.cc
 * steps[]: /nodejs,/nodejs/spider,/nodejs/spider/public,/nodejs/spider/public/css,/nodejs/spider/public/css/hack.cc
 * step need startsWith / and endsWithout /
 * @param fileList
 */
function fileSteps(fileList){
    var files = [];
    _.forEach(fileList,file =>{
        var steps = [];
        if(file.path.startsWith(config.root_dir)){
            file.path = file.path.substring(config.root_dir.length + 1);
        }
        var segments =file.path.split('/');
        for(var i=1; i< segments.length; i++){
            steps.push(removeOtioseSlash('/'+segments.slice(0,i).join('/')));
        }
        file.path = removeOtioseSlash('/'+file.path);
        steps.push(file);
        files.push(steps);
    });
    return files;
}

function removeOtioseSlash(path){
    return path.replace(/\/{2,}/g,'/');
}

function addFiles(files){
    Files = Files.concat(fileSteps(files));
}

function getLocalFiles(){
    var fileList = getFileList(config.root_dir);
    return fileList;
}

function getFiles(){
    addFiles(getLocalFiles());
    var nowFiles = Files;
    Files = [];
    return nowFiles;
}

module.exports = {
    addFiles:addFiles,
    getFiles:getFiles,
    getLocalFiles:getLocalFiles
};

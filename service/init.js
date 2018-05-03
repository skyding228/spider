/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/5/3
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
// use lodash template to init some javascript and html files,set some environmental variables
var _ = require('lodash');
var Path = require('path');
var Fs = require('fs');
var Hosts = require('./hosts');
/**
 *
 * @param fileRelativePath the path relative of this dir
 * @param value
 */
function preset(fileRelativePath, value) {
    var file = Path.resolve(__dirname, fileRelativePath);
    console.log('inited ' + Fs.readFileSync(file));
    var tmpl = _.template(Fs.readFileSync(file));
    var afterSet = tmpl(value);
    Fs.writeFileSync(file, afterSet);
    console.log('inited ' + file);
}

function init() {
    preset('../public/javascripts/main.js', {hostName: Hosts.getLocal().name});
}

module.exports = {
    init: init
};

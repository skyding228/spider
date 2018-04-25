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

function splitToTags(file) {
    file = file && file.replace(/\r/g, '');
    var tags = [];
    var lines = file.split('\n');
    lines.forEach(line => {
        var tag = extractTag(line);
        if (tag) {
            tags.push(tag);
        }
    });
    return tags;
}

//fj340_dpm-task: tag with fj316_dpm_func121_build_20171030.1 from http://svn.vfinance.cn/svn/fujie/src/pmd/basis/dpm/branches/fit_wangshang_2.1.0@228486
// {app:fj340_dpm-task,tag:fj316_dpm_func121_build_20171030.1,branch:fit_wangshang_2.1.0@228486}
function extractTag(line) {
    line = line && line.trim();
    if (!line) {
        return null;
    }
    var segments = line.split(/\s+/);
    var app = segments[0].substring(0, segments[0].length - 1); //remove :
    var tag = segments[3];
    var branch = segments[5].substring(segments[5].lastIndexOf('/') + 1);
    return {app: app, tag: tag, branch: branch};
}

function getTags(req, res) {
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

module.exports = {
    getTags: getTags
};
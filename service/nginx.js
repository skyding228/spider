/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/4/27
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */

var urls = require('./utils').urls;
var Path = require('path');
var Fs = require('fs');
var _ = require('lodash'); //https://lodash.com/docs/4.17.5
var Exec = require('child_process').exec;

var CONFIG_FILE_PATH = Path.resolve('/etc/nginx/conf.d/spider.conf');
var USE_NGINX = false;

var genConfig = _.template(Fs.readFileSync(Path.resolve(__dirname, 'nginx_lodash_template.txt')));

function makeConfigFile(hosts) {
    var config = genConfig({hosts: hosts});
    console.log(config);
    Fs.writeFileSync(CONFIG_FILE_PATH, config);
}

function reload(hosts) {
    if (!useNginx()) {
        return;
    }
    makeConfigFile(hosts);
    Exec('nginx -s reload', function (err, stdout, stderr) {
        console.log('reload nginx', err, stdout, stderr);
    });
}

function start(cb) {
    if (!useNginx()) {
        return;
    }
    Exec('service nginx start', function (err, stdout, stderr) {
        console.log('start nginx', err, stdout, stderr);
        cb(err, stdout, stderr);
    });
}
function assignUrl(baseUrl, host) {
    if (host.master) {
        return;
    }

    host.url = urls.resoleUri(baseUrl, host.name);
}

function useNginx(flag) {
    if (flag !== undefined) {
        USE_NGINX = flag;
    }
    return USE_NGINX;
}

if (module === require.main) {
    makeConfigFile();
}

module.exports = {
    useNginx: useNginx,
    assignUrl: assignUrl,
    reload: reload,
    start: start
};
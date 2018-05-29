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
var Locations = {};

var CONFIG_ROOT_DIR = '/etc/nginx/conf.d/';
var USE_NGINX = false;

var genLocation = _.template(Fs.readFileSync(Path.resolve(__dirname, 'nginx_lodash_template.txt')));

function updateLocations(locations) {
    var hasNewProxy = false;
    locations.forEach(location => {
        hasNewProxy = hasNewProxy || updateLocation(location.path, location.url);
    });
    if (hasNewProxy) {
        reload();
    }
}

function updateLocation(path, url) {
    if (Locations[path] === url) {
        return false;
    }
    Locations[path] = url;
    writeConfigFile(path, url);
    return true;
}

function writeConfigFile(path, url) {
    var location = {path: path, url: url};
    var config = genLocation(location);
    console.log(config);
    var filePath = Path.resolve(CONFIG_ROOT_DIR, path + '.conf');
    Fs.writeFileSync(filePath, config);
}

function reload() {
    if (!useNginx()) {
        return;
    }
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
/**
 * change the host URL to nginx location
 * @param baseUrl
 * @param host
 */
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

function proxyHosts(hosts) {
    var locations = [];
    hosts.forEach(host => {
        locations.push({path: host.name, url: host.intraUrl});
    });
    updateLocations(locations);
}

function proxyFiles(files) {
    var locations = [];
    files.forEach(file => {
        if (file.location) {
            locations.push(file.location);
        }
    });
    updateLocations(locations);
}

module.exports = {
    useNginx: useNginx,
    assignUrl: assignUrl,
    start: start,
    proxyHosts: proxyHosts,
    proxyFiles: proxyFiles
};
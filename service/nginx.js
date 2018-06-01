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
/**
 * {path:location}
 * @type {{}}
 */
var Locations = {};

var CONFIG_ROOT_DIR = '/etc/nginx/conf.d/';
var USE_NGINX = false;

var genLocation = _.template(Fs.readFileSync(Path.resolve(__dirname, 'nginx_lodash_template.txt')));

function updateLocations(locations) {
    var hasNewProxy = false;
    locations.forEach(location => {
        if (updateLocation(location)) {
            hasNewProxy = true;
        }
    });
    if (hasNewProxy) {
        reload();
    }
}
/**
 * {
 *      path:
 *      url:
 *      headers:[{
 *          key:
 *          value:
 *      }]
 * }
 * @param path
 * @param url
 * @param appName
 */
function newLocation(path, url, appName) {
    var location = {path: path, url: url};
    if (appName) {
        location.headers = [{key:'app_name',value:appName}];
    }
    return location;
}

function updateLocation(location) {
    if (Locations[location.path].url === location.url) {
        return false;
    }
    Locations[location.path] = location;
    writeConfigFile(location);
    return true;
}

function writeConfigFile(location) {
    var config = genLocation(location);
    console.log(config);
    var filePath = Path.resolve(CONFIG_ROOT_DIR, location.path + '.conf');
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
    if (!useNginx()) {
        return;
    }
    var locations = [];
    hosts.forEach(host => {
        if (host.master) {
            return;
        }
        locations.push(newLocation(host.name, host.intraUrl));
    });
    updateLocations(locations);
}

function proxyFiles(files) {
    if (!useNginx()) {
        return;
    }
    var locations = [];
    files.forEach(file => {
        if (file.segments.length > 2) {
            var app = file.segments[0] + '.' + file.segments[1];
            locations.push(newLocation(app, host.intraUrl, app));
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
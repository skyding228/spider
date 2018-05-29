/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/5/28
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
var console = require('../service/console');
var urls = require('../service/utils').urls;
var config = require('../service/configuration');
var Exec = require('child_process').exec;
var ExecSync = require('child_process').execSync;
var appLinks = require('./appLinks');

var DOCKER_ROOT_DIR = urls.resoleUri(config.docker_root_dir, 'containers');
var LOG_ROOT_DIR = config.root_dir;
var ContainerIdFile = 'containerId';

function linkDir(container) {
    var cmd = 'docker exec -i ' + container + ' bash -c "echo \\$ENV_INFO \\$INSTANCE_NAME \\$TASK_ID"';
    Exec(cmd, function (err, stdout, stderr) {
        console.log(cmd, err, stdout, stderr);
        if (err || !stdout) {
            return;
        }
        var results = stdout.replace(/\n/g, '').split(/ +/);
        var func = results[0], app = results[1], dir = results[2];
        if (!func || !app || !dir) {
            return;
        }
        var absolute = appLinks.getAbsoluteDir(dir);
        if (!absolute) {
            return;
        }
        var funcDir = urls.resoleUri(LOG_ROOT_DIR, func);
        Exec('mkdir ' + funcDir, function (err, stdout, stderr) {
            var link = urls.resoleUri(funcDir, app);
            appLinks.execLn(absolute, link);
        });
        Exec('echo ' + container + ' >' + urls.resoleUri(absolute, ContainerIdFile), function (err, stdout, stderr) {
            console.log('create container id file', err, stdout, stderr);
        });
    });
}

function initLinks() {
    var containers = appLinks.listDir(DOCKER_ROOT_DIR);
    containers.forEach(container => {
        linkDir(container);
    });
    removeInvalidLinks();
}
/**
 * remove the links that the containers exited.
 */
function removeInvalidLinks() {
    removeExitedContainers();
    var funcs = appLinks.listDir(LOG_ROOT_DIR);
    var links = [];
    funcs.forEach(func => {
        var apps = appLinks.listDir(urls.resoleUri(LOG_ROOT_DIR, func));
        apps.forEach(app => {
            links.push(func + '/' + app);
        });
    });
    links.forEach(link => {
        removeLink(link);
    });
}

function removeLink(link) {
    var absoluteLink = urls.resoleUri(LOG_ROOT_DIR, link);
    var containerIdPath = urls.resoleUri(absoluteLink, ContainerIdFile);
    if (!fs.existsSync(containerIdPath)) {
        return;
    }
    var containerId = new String(fs.readFileSync(containerIdPath));
    var absoluteContainer = urls.resoleUri(DOCKER_ROOT_DIR, containerId);
    if (!fs.existsSync(absoluteContainer)) {
        try {
            ExecSync('rm -f ' + absoluteLink);
        } catch (e) {
            console.log('remove ' + absoluteLink + ' error', e);
        }
    }
}

function removeExitedContainers() {
    try {
        ExecSync('rm -rf ' + urls.resoleUri(DOCKER_ROOT_DIR, '/*'));
    } catch (e) {
        console.log('removeExitedContainers error xxxxxxxxxxxxxxxxxxx ');
    }

}

function init() {
    removeExitedContainers();
    initLinks();
    appLinks.watchNewDirs(DOCKER_ROOT_DIR, linkDir);
}

if (require.main === module) {
    init();
}

module.exports = {
    init: init,
    removeInvalidLinks: removeInvalidLinks
};

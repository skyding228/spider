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
var fs = require('fs');
var console = require('../service/console');
var urls = require('../service/utils').urls;
var config = require('../service/configuration');
var Exec = require('child_process').exec;
var ExecSync = require('child_process').execSync;
var appLinks = require('./appLinks');
var dockerListener = require('./dockerListener');

var DOCKER_ROOT_DIR = urls.resoleUri(config.docker_root_dir, 'containers');
var LOG_ROOT_DIR = config.root_dir;
var ContainerIdFile = 'containerId';
var Initialized = false;


function linkDir(containerId) {
    var cmd = 'docker exec -i ' + containerId + ' bash -c "echo \\$ENV_INFO \\$INSTANCE_NAME \\$TASK_ID"';
    Exec(cmd, function (err, stdout, stderr) {
        err && console.log(cmd, err, stdout, stderr);
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
        Exec('echo ' + containerId + ' >' + urls.resoleUri(absolute, ContainerIdFile), function (err, stdout, stderr) {
            err && console.log('create container id file', err, stdout, stderr);
        });
    });
}

function removeLink(containerId) {
    var cmd = 'docker inspect ' + containerId + " --format '{{range .Config.Env}}${{.}}{{end}}'";
    Exec(cmd, function (err, stdout, stderr) {
        err && console.log(cmd, err);
        if (err || !stdout) {
            return;
        }
        var envs = stdout.split('$');
        var ENV_INFO = 'ENV_INFO=', INSTANCE_NAME = 'INSTANCE_NAME=';
        var func, app = null;
        envs.forEach(env=> {
            if (!env) {
                return;
            }
            if (env.startsWith(ENV_INFO)) {
                func = env.substring(ENV_INFO.length + 1);
            } else if (env.startsWith(INSTANCE_NAME)) {
                app = env.substring(INSTANCE_NAME.length + 1);
            }
        });
        if (!func || !app) {
            return;
        }
        var cmd = 'rm -rf ' + func + '/' + app;
        Exec(cmd, function (err, stdout, stderr) {
            err && console.log(cmd, err);
        });
    });
}

function initLinks() {
    Exec('docker ps -q', function (err, stdout, stderr) {
        if (!stdout) {
            return;
        }
        var containers = stdout.split('\n');
        containers.forEach(container => {
            linkDir(container);
        });
    });
}

function getContainerId(appName) {
    var appPath = appName.replace('.', '/');
    var containerIdPath = urls.resoleUri(LOG_ROOT_DIR, appPath + '/' + ContainerIdFile);
    if (!fs.existsSync(containerIdPath)) {
        return null;
    }
    return new String(fs.readFileSync(containerIdPath)).replace('\n', '');
}

function removeExitedContainers() {
    try {
        // the running containers will not be removed because of "device is busying"
        ExecSync('rm -rf ' + urls.resoleUri(DOCKER_ROOT_DIR, '/*'));
    } catch (e) {
        console.log('removeExitedContainers error xxxxxxxxxxxxxxxxxxx ');
    }
}

function init() {
    if (Initialized) {
        return;
    }
    Initialized = true;
    initLinks();
    dockerListener.onStart(linkDir);
    dockerListener.onStop(removeLink);
}

if (require.main === module) {
    init();
}
module.exports = {
    init: init,
    getContainerId: getContainerId
};

//docker inspect f1b278fff2275d14e0db53bc61f8c968df359574633fd941a345abec5adfa165 --format '{{range .Config.Env}}{{.}}\n{{end}}'
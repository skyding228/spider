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

var hosts = {};
var env = process.env;
var console = require('./console');

//env.MASTER = 'http://localhost:3000';
//env.IP = '10.5.16.5';
//env.PORT = 3000;
//env.HOSTNAME = 'wch';

var master = env.MASTER;
var _ = require('lodash');
var config = require('./configuration');

function localhost() {
    var PUBLIC_IP = env.PUBLIC_IP || env.IP;
    var local = {};
    local.intraUrl = 'http://' + env.IP + ':' + env.PORT;
    local.url = 'http://' + PUBLIC_IP + ':' + env.PORT;
    local.name = env.HOSTNAME || 'localhost';
    if (!master) {
        local.master = 1;
    }
    return local;
}

var local = localhost();

function isMaster() {
    return !!local.master;
}

function addHost(host) {
    host.updateAt = new Date().getTime();
    hosts[host.url] = host;
}

function addHosts(hosts) {
    hosts.forEach(host=> {
        addHost(host);
    });
}

function getMaster() {
    return master;
}

function getLocal() {
    return local;
}

function getHosts() {
    addHost(local);
    var now = new Date().getTime();
    for (var k in hosts) {
        var host = hosts[k];
        if (now - host.updateAt > config.collect_interval_ms) {
            delete hosts[k];
        }
    }
    return _.valuesIn(hosts);
}


module.exports = {
    addHost: addHost,
    addHosts:addHosts,
    getMaster: getMaster,
    getLocal: getLocal,
    getHosts: getHosts,
    isMaster: isMaster
};
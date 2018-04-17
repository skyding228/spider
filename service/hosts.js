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
var master = env.MASTER;
var _ = require('lodash');
function localhost(){
    var local = {};
    local.url = 'http://'+ env.IP + ':'+env.PORT;
    local.name = env.HOSTNAME || 'localhost';
    if(master == local.url){
        local.master = 1;
    }
    return local;
}

var local = localhost();

function isMaster(){
    return !!local.master;
}

function addHost(host){
    hosts[host.url] = host;
}

function getMaster(){
    return master;
}

function getLocal(){
    return local;
}

function getHosts(){
    addHost(local);
    var nowHosts = hosts;
    hosts = {};
    return _.valuesIn(nowHosts);
}

module.exports = {
    addHost:addHost,
    getMaster:getMaster,
    getLocal:getLocal,
    getHosts:getHosts,
    isMaster:isMaster
};
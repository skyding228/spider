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

var config = {
    root_dir: 'E:/nodejs/spider/public',
    //the period of collect all hosts files,only used in master node
    collect_interval_ms: 20 * 1000,
    //the period of send files to master, only used in agent node
    send_interval_ms: 5 * 1000
};


module.exports = config;
/**
 * Created by weichunhe on 2015/7/6.
 */
'use strict';
/**
 * JQUERY 默认ajax设置
 */
$.ajaxSetup({
    headers: {'Content-type': 'application/json;charset=UTF-8'}
});

//阻止事件冒泡
var StopPropagation = function (event) {
    event.stopPropagation();
    return false;
};
//添加存储方法 getter & setter
angular.store = function (key, value) {
    if (value) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        return JSON.parse(localStorage.getItem(key));
    }
};

/**
 *
 * 作者：weich
 * 邮箱：1329555958@qq.com
 * 日期：2018/4/23
 *
 * 未经作者本人同意，不允许将此文件用作其他用途。违者必究。
 *
 * @ngdoc
 * @author          weich
 * @name            Role
 * @description
 */
/**
 * User{
 *   name:
 *   pwd:
 * }
 * @type {{}}
 */
var Users = {
    spider: {
        name: 'spider',
        pwd: 'spider'
    }
};

function verifyUser(name, pwd) {
    if (!name) {
        return '用户名不可为空';
    }
    if (!pwd) {
        return '密码不可为空';
    }
    var user = Users[name];
    if (!user) {
        return '用户名不存在';
    }
    if (user.pwd !== pwd) {
        return '密码不正确';
    }
    return null;
}

function getUser(name) {
    return Users[name];
}

module.exports = {
    verifyUser: verifyUser,
    getUser: getUser
};
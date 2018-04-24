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

var fs = require('fs');
var os = require('os');
var UserFilePath = '/opt/spider/users';
var path = require('path');
var USE_FILE = false;
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
        pwd: 'f1a81d782dea6a19bdca383bffe68452'
    }
};

(function initFromFile() {
    UserFilePath = UserFilePath && path.resolve(UserFilePath);
    if (!UserFilePath || !fs.existsSync(UserFilePath) || fs.statSync(UserFilePath).isDirectory()) {
        console.log('There is no file which contains users,use default user.');
        return;
    }
    USE_FILE = true;
    var content = fs.readFileSync(UserFilePath).toString();
    var users = splitToUsers(content);
    if (users.length) {
        Users = {};
        users.forEach(user => {
            Users[user.name] = user;
        });
    }
    console.log(JSON.stringify(Users));
})();


function splitToUsers(content) {
    var users = [];
    content = content.replace(/\r/g, '');
    var lines = content.split('\n');
    lines.forEach(line=> {
        line = line && line.trim();
        if (!line || line[0] === '#') {
            return;
        }
        var segments = line.split('|');
        if (segments.length < 2) {
            return;
        }
        if (segments[0].trim() && segments[1].trim()) {
            users.push(newUser(segments[0].trim(), segments[1].trim()));
        }
    });
    return users;
}

function saveUsersToFile() {
    if (!USE_FILE) {
        return;
    }
    var lines = ['# name | password'];
    for (var k in Users) {
        lines.push(userLine(Users[k]));
    }
    fs.writeFileSync(UserFilePath, lines.join(os.EOL));
}
function userLine(user) {
    return user.name + '|' + user.pwd;
}

function newUser(name, pwd) {
    return {name: name, pwd: pwd};
}

function addUser(name, pwd) {
    name = name && name.trim();
    pwd = pwd && pwd.trim();
    if (!name || !pwd) {
        return null;
    }
    Users[name] = newUser(name, pwd);
    saveUsersToFile();
    return Users[name];
}

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
    addUser: addUser,
    getUser: getUser
};
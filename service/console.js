var _ = require('lodash');
function log(){
    var params = [new Date()];
    for(var i=0;i<arguments.length;i++){
        var arg = arguments[i];
        params.push(_.isObject(arg) ? JSON.stringify(arg) : arg);
    }
    console.log(...params);
}
module.exports = {
    log:log
};

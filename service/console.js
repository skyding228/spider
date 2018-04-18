var _ = require('lodash');
function log(){
    var params = [new Date()];

    arguments.forEach(arg=>{
        params.push(_.isObject(arg) ? JSON.stringify(arg) : arg);
    });
    console.log(...params);
}
module.exports = {
    log:log
};

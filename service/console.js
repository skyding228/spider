var _ = require('lodash');
var debug = process.env.DEBUG;
function log() {
    if (!debug || 'false' === debug) {
        return;
    }
    var params = [new Date()];
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        params.push(_.isObjectLike(arg) ? JSON.stringify(arg) : arg);
    }
    console.log(...params);
}
module.exports = {
    log: log
};

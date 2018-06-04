var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var os = require('os');
var path = require('path');
//var pty = {};
var pty = require('node-pty');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var env = process.env;
var login = require('./routes/login');
var sessions = require('./service/sessions');
var config = require('./service/configuration');
var console = require('./service/console');
var hosts = require('./service/hosts');
var nginx = require('./service/nginx');
var Init = require('./service/init');
var appLinks = require('./mesos/appLinks');
var runtimeLinks = require('./mesos/runtimeLinks');
var HeartBeatMsg = '_heart_beat_';


var terminals = {},
    logs = {};

app.use(bodyParser.json({limit: '1024kb'}));
app.use(bodyParser.urlencoded({limit: '1024kb', extended: false}));
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

//app.use(login);
//app.use(sessions.loginFilter);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/index.html');
});
app.get('/spiderweb-node', function (req, res) {
    res.sendFile(__dirname + '/html/index.html');
});

app.get('/home', function (req, res) {
    res.sendFile(__dirname + '/html/home.html');
});

var spider = require('./routes/spider');
app.use('/spider', spider);

var websockets = require('./routes/websockets');
app.use('/ws', websockets);

app.post('/terminals', function (req, res) {
    var cmd = 'cd ' + config.root_dir + ' && su node ', appName = req.get(nginx.AppNameHeader);
    if (appName) {
        var containerId = runtimeLinks.getContainerId(appName);
        if (containerId) {
            cmd = 'docker exec -it ' + containerId + ' bash';
        }else{
            cmd = 'echo 暂未找到'+appName+',请稍候刷新重试!';
        }
    }
    var cols = parseInt(req.query.cols),
        rows = parseInt(req.query.rows),
        term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', ['-c', cmd], {
            encoding: null,
            name: 'xterm-color',
            cols: cols || 80,
            rows: rows || 24,
            cwd: process.env.PWD,
            env: process.env
        });

    console.log('Created terminal with PID: ' + term.pid);
    terminals[term.pid] = term;
    logs[term.pid] = '';
    term.on('data', function (data) {
        if(logs[term.pid] !== undefined){
            logs[term.pid] += data;
        }
    });
    //term.write('su node \n');
    res.send(term.pid.toString());
    res.end();
});

app.post('/terminals/:pid/size', function (req, res) {
    var pid = parseInt(req.params.pid),
        cols = parseInt(req.query.cols),
        rows = parseInt(req.query.rows),
        term = terminals[pid];

    term.resize(cols, rows);
    console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
    res.end();
});

app.ws('/terminals/:pid', function (ws, req) {
    var term = terminals[parseInt(req.params.pid)];
    console.log('Connected to terminal ' + term.pid);
    ws.send(logs[term.pid]);
    delete logs[term.pid];
    term.on('data', function (data) {
        try {
            ws.send(data);
        } catch (ex) {
            // The WebSocket is not open, ignore
        }
    });

    ws.on('message', function (msg) {
        //ignore heart beat messages
        if (HeartBeatMsg !== msg) {
            term.write(msg);
        }
    });
    function close() {
        closeTerm(term, ws);
    }

    term.on('close', close);
    ws.on('close', function () {
        exitTerm(term);
    });
});
function exitTerm(term){
    term.write('');
    term.write('exit\n');
    term.write('exit\n');
    term.write('exit\n');
}

function closeTerm(term, ws) {
    console.log('Closed terminal ' + term.pid);
    ws.close();
    term.kill(9);
    exitTerm(term);
    // Clean things up
    delete terminals[term.pid];
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var port = 3000,
    host = '0.0.0.0';

if (nginx.useNginx()) {
    console.original('use nginx...');
    port = 3001;
    nginx.start(function () {
        nginx.proxyHosts(hosts.getHosts());
    });
}
Init.init();
appLinks.init();
runtimeLinks.init();
console.original('listening to ' + hosts.getLocal().url);
app.listen(port, host);

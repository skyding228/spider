var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var os = require('os');
var path = require('path');
var pty =  {};//require('node-pty');
var bodyParser = require('body-parser');

var terminals = {},
    logs = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/xterm', express.static(path.join(__dirname ,'node_modules/xterm/dist')));
app.use('/zmodemjs', express.static(path.join(__dirname ,'node_modules/zmodem.js/dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

var spider = require('./routes/spider');
app.use('/spider', spider);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/views/home.html');
});
app.get('/spiderweb-node', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/terminals', function (req, res) {
  var cols = parseInt(req.query.cols),
      rows = parseInt(req.query.rows),
      term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
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
  term.on('data', function(data) {
    logs[term.pid] += data;
  });
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

  term.on('data', function(data) {
    try {
      ws.send(data);
    } catch (ex) {
      // The WebSocket is not open, ignore
    }
  });
  ws.on('message', function(msg) {
    term.write(msg);
  });
  ws.on('close', function () {
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
    delete logs[term.pid];
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = process.env.PORT || 3000,
    host = os.platform() === 'win32' ? '127.0.0.1' : '0.0.0.0';

console.log('App listening to http://' + host + ':' + port);
app.listen(port, host);

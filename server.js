#!/usr/bin/env node

/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var debug = require('debug')('teste:server');
var http = require('http');
// gzip/deflate outgoing responses
var compression = require('compression');

process.env.PORT = '80';
const enviroment = process.env.NODE_ENV || 'development';

if (enviroment == 'production') {
  process.env.PORT = '80';
} else if (enviroment == 'staging') {
  process.env.PORT = '80';
} else if (enviroment == 'development') {
  process.env.PORT = '4200';
}

var app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'dist/alertas-workspace-app'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'dist/alertas-workspace-app', 'favicon.ico')));

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'dist/alertas-workspace-app')));

app.use('/*', function (req, res, next) {
  res.sendFile(__dirname + '/dist/alertas-workspace-app/index.html');
});

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
  if (req.app.get('env') === 'development') {
    res.json(err);
  } else {
    res.json(err);
  }
});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}

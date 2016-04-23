var express = require('express');
var session = require('express-session');
var loader = require('auto-loader');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var Promise = require('bluebird');
//var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./configs/config');
var app = express();

// Set bluebird Promise
//mongoose = Promise.promisifyAll(mongoose);
//mongoose.Promise = Promise;

// Connect to MongoDB
//mongoose.connect(config.mongoose.uri);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Set morgan logger for debug mode
//app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(session({
  // Use express session support since OAuth2orize requires it
  secret: config.sessionSecret,
  saveUninitialized: true,
  resave: true
}));

// Loading endpoint handlers
var routeFiles = loader.load(__dirname + '/routes');
for (var file in routeFiles) {
  app.use(routeFiles[file]);
}

// Start server
app.listen(config.port);
console.log('Magic happens on port ' + config.port);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;

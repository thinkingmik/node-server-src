var config = require('./configs/config')[process.env.NODE_ENV];
var winston = require('winston');

winston.level = config.logLevel;
winston.setLevels({
  error: 0, warn: 1, info: 2, debug: 3
});
winston.addColors({
  error: 'red', warn: 'yellow', info: 'cyan', debug: 'magenta'
});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  timestamp: true,
  colorize: true
});

module.exports = winston;

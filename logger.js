var config = require('./configs/config')[process.env.NODE_ENV];
var winston = require('winston');

winston.level = config.logLevel;
winston.setLevels({
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
});
winston.addColors({
    debug: 'magenta',
    info: 'cyan',
    warn: 'yellow',
    error: 'red'
});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  timestamp: true,
  colorize: true
});

module.exports = winston;

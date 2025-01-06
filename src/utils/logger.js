// logger.js
const logLevels = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
};

const colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  // Text colors
  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',
};

const currentLogLevel = process.env.LOG_LEVEL || logLevels.INFO;

function log(level, message) {
  if (logLevels[level] >= logLevels[currentLogLevel]) {
    if (logLevels[level] == logLevels.INFO)
      level = colors.FgBlue + logLevels[level] + colors.Reset;
    if (logLevels[level] == logLevels.WARNING)
      level = colors.FgYellow + logLevels[level] + colors.Reset;
    if (logLevels[level] == logLevels.ERROR)
      level = colors.FgRed + logLevels[level] + colors.Reset;
    console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
  }
}

module.exports = {
  logLevels,
  log,
};

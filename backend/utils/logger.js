const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

function formatLog(level, endpoint, message, error = null) {
  const timestamp = new Date().toISOString();
  const errorStack = error ? `\n${error.stack}` : '';
  return `[${timestamp}] [${level}] [${endpoint}] ${message}${errorStack}\n`;
}

function log(level, endpoint, message, error = null) {
  const logMessage = formatLog(level, endpoint, message, error);
  
  // Console output
  if (level === 'ERROR') {
    console.error(logMessage);
  } else if (level === 'WARN') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // File output
  fs.appendFileSync(logFile, logMessage);
}

module.exports = {
  info: (endpoint, message) => log('INFO', endpoint, message),
  warn: (endpoint, message, error) => log('WARN', endpoint, message, error),
  error: (endpoint, message, error) => log('ERROR', endpoint, message, error),
};

// Logger.js
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

class Logger {
  constructor(level = 'INFO', logDir = null) {
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    this.currentLevel = this.levels[level.toUpperCase()] ?? this.levels.INFO;
    this.logDir = logDir;

    if (logDir) {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  getLogFilePath() {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Get current date in YYYYMMDD format
    if (!this.logDir) {
      throw new Error('Log directory is not set.');
    }
    return path.join(this.logDir, `coinstopper_${date}.log`);
  }

  log(level, message) {
    const levelValue = this.levels[level.toUpperCase()];
    if (levelValue >= this.currentLevel) {
      const logMessage = `[${new Date().toISOString()}] [${level}] ${message}`;
      console.log(logMessage);
      if (this.logDir) {
        const logFilePath = this.getLogFilePath();
        fs.appendFileSync(logFilePath, logMessage + '\n');
      }
    }
  }

  debug(message) {
    this.log('DEBUG', message);
  }

  info(message) {
    this.log('INFO', message);
  }

  warn(message) {
    this.log('WARN', message);
  }

  error(message) {
    this.log('ERROR', message);
  }

  // Async function to truncate the log file
  async truncateLogFile() {
    try {
      const logFilePath = this.getLogFilePath();
      await fsPromises.truncate(logFilePath, 0);
      console.log(`Log file ${logFilePath} truncated successfully.`);
    } catch (err) {
      console.error(`Error truncating log file: ${err.message}`);
    }
  }
}

module.exports = Logger;

const util = require("util");

const COLORS = {
  reset: "\x1b[0m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

function colorFor(level) {
  return COLORS[level] || "";
}

function logger(level, header, lines = []) {
  const color = colorFor(level);
  const reset = COLORS.reset;
  const prefix = `[${level}] `;
  if (color) console.error(`${color}${prefix}${header}${reset}`);
  else console.error(prefix + header);
  for (const line of lines) {
    if (color) console.error(`${color}${prefix}${line}${reset}`);
    else console.error(prefix + line);
  }
}

function reportError(title, lines = []) {
  logger("error", title, lines);
}

module.exports = { logger, reportError };

const util = require("util");

const COLORS = {
  reset: "\x1b[0m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

function colorFor(level) {
  return COLORS[level] || "";
}

function escapeProperty(s) {
  return s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function escapeData(s) {
  return s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
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
  
  if (isGitHubActions && (level === 'error' || level === 'warn')) {
    const message = [header, ...lines].join(' ');
    const cleanMessage = escapeData(message);
    
    if (level === 'error') {
      console.log(`::error::${cleanMessage}`);
    } else if (level === 'warn') {
      console.log(`::warning::${cleanMessage}`);
    }
  }
}

function reportError(title, lines = []) {
  logger("error", title, lines);
}

function reportWarning(title, lines = []) {
  logger("warn", title, lines);
}

module.exports = { logger, reportError, reportWarning };

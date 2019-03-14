const { green, cyan } = require('chalk')

module.exports = log => {
  const { label = 'logger', timestamp, level, message } = log

  return `${green(`[${label}]`)} ${cyan(
    timestamp.trim()
  )} ${level.trim()} ${message.trim()}`
}

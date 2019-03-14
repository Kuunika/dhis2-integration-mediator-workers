const { transports } = require('winston')

const { Console } = transports
const { terminal: format } = require('../formats')

module.exports = () => {
  const level = process.env.DFQW_LOG_LEVEL || 'info'

  const consoleOption = {
    colorize: 'true',
    level,
    format
  }

  return new Console(consoleOption)
}

const { transports } = require('winston')
const { File } = transports

const { generic: format } = require('../formats')

module.exports = () => {
  const path = process.env.DFQW_LOG_DIR || 'logs'
  const level = process.env.DFQW_LOG_LEVEL || 'info'
  const filename = `${path}/logs.log`

  const fileOptions = {
    filename,
    level,
    format
  }

  return new File(fileOptions)
}

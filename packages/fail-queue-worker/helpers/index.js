const { existsSync } = require('fs')
const { log } = console
const { homedir } = require('os')
const { join } = require('path')
const winston = require('winston')

const getDate = () => {
  const date = new Date()

  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  return `${year}_${month}_${day}`
}

module.exports.addFileTransport = (migrationID, client) => {
  const dir = homedir()
  const path = join(dir, process.env.DFQW_EXT_LOG_DIR || '/dev')

  if (!existsSync(path)) {
    log('environment variables file is not found.')
  }

  const file = `${path}/${client.toUpperCase()}_${migrationID}_${getDate()}.log`
  const level = process.env.DFQW_LOG_LEVEL || 'info'

  const transport = new winston.transports.File({
    filename: file,
    level
  })

  winston.add(transport)
  return transport
}

module.exports.removeTransport = transport => winston.remove(transport)

module.exports.loadEnvironmentVariables = require('./env')
module.exports.configureLogger = require('./logger')
module.exports.configureDatabase = require('./database')

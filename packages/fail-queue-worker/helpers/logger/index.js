const { configure, info } = require('winston')
const { file, terminal } = require('./transports')
const { generic: format } = require('./formats')

module.exports = async (path = null) => {
  const transports = [await file(), await terminal()]

  const configureOptions = {
    transports,
    format
  }
  configure(configureOptions)
  await info('logger configured successfully')
  await console.log()
}

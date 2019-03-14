const { configureLogger, loadEnvironmentVariables } = require('./helpers')
const consumer = require('./consumer')

const main = async () => {
  await loadEnvironmentVariables()
  await configureLogger()
  await consumer()
}

module.exports = main

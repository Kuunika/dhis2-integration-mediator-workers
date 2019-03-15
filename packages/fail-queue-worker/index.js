const { configureLogger } = require('./helpers')
const consumer = require('./consumer')

const main = async () => {
  await configureLogger()
  await consumer()
}

module.exports = main

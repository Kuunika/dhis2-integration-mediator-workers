const Sequelize = require('sequelize')
const { info, error } = require('winston')
const { exit, env } = process

const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}

const sequelizeOptions = {
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool
}

const label = { label: 'database' }

const handleAuthError = async err => {
  await error(err.message, label)
  exit(1)
}

module.exports = async spinner => {
  await info('preparing connection', label)

  const host = env.DFQW_DATABASE_HOST || 'localhost'
  const username = env.DFQW_DATABASE_USERNAME || ''
  const password = env.DFQW_DATABASE_PASSWORD || ''
  const database = env.DFQW_DATABASE

  await info('database variables are set', label)

  sequelizeOptions.host = host

  const sequelize = new Sequelize(
    database,
    username,
    password,
    sequelizeOptions
  )

  await info('database instance is set successfully', label)
  await sequelize.authenticate().catch(handleAuthError)

  await info(
    `connection established successfully to "${database}" database`,
    label
  )

  await console.log()
  return sequelize
}

const { log } = console
const { exit } = process
const { existsSync } = require('fs')
const { join } = require('path')
const { config } = require('dotenv')
const { red, green, cyan } = require('chalk')

const path = join(__dirname, '..', '.env')

module.exports = () => {
  log(green('[env]'), cyan('preparing to load environment variables.'))

  if (!existsSync(path)) {
    log(green('[env]'), red('environment variables file is not found.'))
    exit(1)
  }

  log(green('[env]'), cyan('environment variables file loaded.'))

  const { error = null } = config({
    path
  })
  if (error) {
    log(green('[env]'), red('error configuring environment variables'))
    exit(1)
  }

  log(green('[env]'), cyan('environment variables loaded successfully: '))

  log(
    green('[env]'),
    cyan('environment variables housekeeping was successfully. \n')
  )
}

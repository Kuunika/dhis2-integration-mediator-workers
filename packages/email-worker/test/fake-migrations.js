const { getMigrationModel } = require('../models')
const ora = require('ora')
require('dotenv').config()

module.exports = {
  generateElement: async function () {
    try {
      const spinner = ora()
      const sequelize = await require('./database')(spinner)
      const Migration = await getMigrationModel(sequelize)
      // const date = Date.now()
      const data =
      {
        clientId: 33,
        id: 100
      }
      return await Migration.create(data)
    } catch (e) {
      console.log(e.message)
    }
  },
  clearElement: async function () {
    const spinner = ora()
    const sequelize = await require('./database')(spinner)
    const Migration = await getMigrationModel(sequelize)

    Migration.destroy({
      where: {},
      truncate: true
    })
  }
}

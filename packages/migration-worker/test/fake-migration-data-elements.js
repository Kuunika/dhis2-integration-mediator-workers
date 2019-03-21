const { getMigrationDataElementsModel } = require('../models')
const ora = require("ora");
require('dotenv').config();

module.exports = {
  generateElements: async function () {
    try {
      const spinner = ora();
      const sequelize = await require("./database")(spinner);
      const MigrationDataElements = await getMigrationDataElementsModel(sequelize)
      const data = [
        {
          dataElementId: 23,
          value: 44,
          orgUnit: 'q9qra0ng8xZ',
          period: '201808',
          organizationUnitCode: "sXNwy8bRFub",
          migrationId: 56,
          isValueValid: true,
          isElementAuthorized: true,
          isProcessed: true,
          isMigrated: false
        },
        {
          dataElementId: 8,
          value: 51,
          orgUnit: 'zYfP0gkHRJH',
          period: '201812',
          organizationUnitCode: "mFfOvxjq4y2",
          migrationId: 56,
          isValueValid: true,
          isElementAuthorized: true,
          isProcessed: true,
          isMigrated: false
        },
        {
          dataElementId: 89,
          value: 600,
          orgUnit: 'X5G31mcZV7K',
          period: '201808',
          organizationUnitCode: "V7m6S5TIpqf",
          migrationId: 56,
          isValueValid: true,
          isElementAuthorized: true,
          isProcessed: true,
          isMigrated: false
        },
        {
          dataElementId: 34,
          value: 1234,
          orgUnit: 'q9qra0ng8xZ',
          period: '201808',
          organizationUnitCode: "q9qra0ng8xZ",
          migrationId: 56,
          isValueValid: true,
          isElementAuthorized: true,
          isProcessed: true,
          isMigrated: false
        }
      ];
      return await MigrationDataElements.bulkCreate(data);
    } catch (e) {
      console.log(e.message)
    }
  },
  clearElements: async function () {
    const spinner = ora();
    const sequelize = await require("./database")(spinner);
    const MigrationDataElements = await getMigrationDataElementsModel(sequelize)

    MigrationDataElements.destroy({
      where: {},
      truncate: true
    })
  }
}
const {
  getDataElementModel,
} = require("./models");

const axios = require('axios');

module.exports = async (migrationDataElements, dataValues, sequelize, logger) => {
  const DataElement = await getDataElementModel(sequelize);
  for (const migrationDataElement of migrationDataElements) {
    const dataElement = await DataElement.findByPk(
      migrationDataElement.dataValues.dataElementId
    ).catch(err => logger.info(err.message));
    if (dataElement) {
      await dataValues.push({
        dataElement: dataElement.dataValues.dataElementId,
        value: migrationDataElement.dataValues.value,
        orgUnit: migrationDataElement.dataValues.organizationUnitCode,
        period: migrationDataElement.dataValues.period,
        id: migrationDataElement.dataValues.id
      });
    }
  }

  return await axios({
    url: `${process.env.MW_DHIS2_URL}/dataValueSets`,
    method: 'POST',
    data: {
      dataValues
    },
    auth: {
      username: process.env.MW_DHIS2_USERNAME,
      password: process.env.MW_DHIS2_PASSWORD
    }
  }).catch(err => logger.info(err.message));
}
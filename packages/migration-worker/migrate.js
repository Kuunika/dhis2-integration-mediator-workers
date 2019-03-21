const {
  getDataElementModel,
  getFailQueueModel
} = require("./models");

const axios = require('axios');
const _ = require('lodash');

module.exports = async (migrationDataElements, sequelize, logger) => {
  const dataValues = [];
  const DataElement = await getDataElementModel(sequelize);
  const FailQueue = await getFailQueueModel(sequelize);

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
  const response = await axios({
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

  //TODO: lodash remove key
  if (!response) {
    const failedDataElements = await migrationDataElements.map(migrationDataElement => ({
      ...migrationDataElement.dataValues,
      attempts: 1
    }));
    await FailQueue.bulkCreate(_.omit(failedDataElements, ['id']));
    return;
  }
  return { response, dataValues };
}
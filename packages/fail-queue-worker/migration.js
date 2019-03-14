const axios = require('axios')
const { info, error } = require('winston')
const pushToFailQueue = require('./pushToFailQueue')

const {
  getClientModel,
  getMigrationModel,
  getDataSetModel,
  getMigrationDataElementsModel,
  getDataElementModel,
  getFailQueueModel
} = require('./models')

const query = require('./dhis2Query')

const {
  configureDatabase,
  addFileTransport,
  removeTransport
} = require('./helpers')

const label = { label: 'migration' }

let returnFlag = true
let failFlag = false

let failedDataElementIds = []
let successfulDataElementIds = []

const createLoopArray = async (FailQueue, where, limit) => {
  const { count } = await FailQueue.findAndCountAll({ where }).catch(
    handleError
  )
  const counter = Math.ceil(Number(count) / limit)
  return new Array(counter)
}

module.exports = async data => {
  const { migrationId, client, attempts = 1, email } = data

  const transport = await addFileTransport(migrationId, client)
  await info(`starting migrating migration #: ${migrationId}`, label)

  const sequelize = await configureDatabase()
  const DataElement = await getDataElementModel(sequelize)
  const FailQueue = await getFailQueueModel(sequelize)

  const where = { migrationId, isMigrated: false }
  const limit = Number(process.env.DFQW_DATA_CHUNK_SIZE || 1000)

  const loopArray = await createLoopArray(FailQueue, where, limit)

  let offset = 0

  for (const count of loopArray) {
    await info(
      `processing chunk # : ${offset + 1}`,
      count,
      `of migration ${migrationId}`,
      label
    )

    const failQueues = await getFailQueues(FailQueue, where, limit, offset)
    const chunkLength = failQueues.length
    if (chunkLength != 0) {
      await info(`chunk size: ${chunkLength}`, label)

      const dataValues = await prepareDataValues(DataElement, failQueues)
      await info('chunk data values', label)
      await info(JSON.stringify(dataValues, null, 2), label)

      const res = await query(dataValues)
      if (res) {
        const { updated } = res.data.importCount
        if (dataValues.length === Number(updated)) {
          await info('migration to DHIS2 was successful', label)
          dataValues.forEach(data => successfulDataElementIds.push(data.id))
        } else {
          failFlag = true
          dataValues.forEach(data => failedDataElementIds.push(data.id))
          await error('some elements failed migration to DHIS2', label)
        }
      } else {
        failFlag = true
        await error('migration to DHIS2 failed', label)
      }
      await console.log()
    } else {
      await info(`chunk failed migration`, label)
      failFlag = true
    }

    offset += 1
  }

  if (failFlag) {
    await updateFailQueue(FailQueue, failedDataElementIds, false, attempts)
    await pushToFailQueue(migrationId, email, client, attempts)
  } else {
    await updateFailQueue(FailQueue, successfulDataElementIds, true, attempts)
    await require('./emailProducer')(migrationId, email, client, failFlag)
  }

  await console.log()

  successfulDataElementIds = failedDataElementIds = []
  await removeTransport(transport)
  await sequelize.close()

  return returnFlag
}

const getFailQueues = (FailQueue, where, limit, skip) => {
  const offset = skip * limit
  const query = { where, limit, offset }
  return FailQueue.findAll(query).catch(handleError)
}

const handleError = err => {
  error(err.message, label)
}

const prepareDataValues = async (DataElement, failQueues) => {
  const data = []
  for (const failQueue of failQueues) {
    const {
      id,
      dataElementId,
      value,
      organizationUnitCode: orgUnit,
      period
    } = failQueue.dataValues

    const result = await findDataElement(DataElement, dataElementId)

    if (result) {
      const { dataElementId: dataElement } = result.dataValues
      await data.push({ dataElement, value, orgUnit, period, id })
    } else {
      await error('data element missing', label)
    }
  }

  return data
}

const updateFailQueue = async (FailQueue, ids, isMigrated, attempts) => {
  await FailQueue.update(
    { isMigrated, attempts, isProcessed: true },
    { where: { id: ids } }
  ).catch(handleError)
}

const findDataElement = (DataElement, id) => {
  return DataElement.findByPk(id).catch(handleError)
}

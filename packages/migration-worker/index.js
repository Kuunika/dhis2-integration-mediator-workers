const amqp = require("amqplib/callback_api");
const ora = require("ora");
const axios = require("axios");
const _ = require('lodash');
const EventEmitter = require('events');
const moment = require('moment');
const { Logger } = require('./utils/logger');
const migrate = require('./migrate');
const {
  getMigrationModel,
  getMigrationDataElementsModel,
  getDataElementModel,
  getFailQueueModel
} = require("./models");

const chi = msg => console.log(` [x] Received ${msg.content.toString()}`);

const options = {
  noAck: false
};

const sendEmail = async (
  migrationId,
  email,
  flag,
  logger,
  channelId) => {
  const host = process.env.MW_EMAIL_QUEUE_HOST || 'amqp://localhost';

  amqp.connect(
    host,
    function (err, conn) {
      if (err) logger.info(err.message);
      conn.createChannel(function (err, ch) {
        if (err) console.log(err);

        const options = {
          durable: true,
        };

        const queueName =
          process.env.MW_EMAIL_QUEUE_NAME ||
          'DHIS2_EMAIL_INTEGRATION_QUEUE';

        const source = "migration"
        ch.assertQueue(queueName, options);
        const message = JSON.stringify({ migrationId, email, flag, source, channelId });
        ch.sendToQueue(queueName, Buffer.from(message), {
          persistent: true,
        });
        logger.info(`[x] Sent ${message}`);
        setTimeout(() => conn.close(), 500);
      });
    },
  );
}

const handleQueueConnection = async (err, conn) => {
  if (err) console.log(err);

  const spinner = ora();
  const sequelize = await require("./database")(spinner);

  const Migration = await getMigrationModel(sequelize);
  const MigrationDataElements = await getMigrationDataElementsModel(sequelize);
  const DataElement = await getDataElementModel(sequelize);
  const FailQueue = await getFailQueueModel(sequelize);

  const updateOnSucessfullMigration = async (migrationId, count) => {
    //update migration model
    const migration = await Migration.findByPk(migrationId);
    const totalMigratedElements = migration.dataValues.totalMigratedElements + count;
    return await Migration.update(
      { totalMigratedElements },
      { where: { id: migrationId } }
    );
  }

  const completeMigration = async (migrationId) => {
    return await Migration.update(
      {
        migrationCompletedAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      },
      { where: { id: migrationId } }
    );
  }

  const pushToFailureQueue = (
    migrationId,
    email,
    client,
    logger,
    channelId
  ) => {
    const host = process.env.MW_FAILURE_QUEUE_HOST || 'amqp://localhost';
    amqp.connect(
      host,
      function (err, conn) {
        if (err) logger.info(err.message);
        conn.createChannel(function (err, ch) {
          if (err) logger.info(err.message);
          const options = {
            durable: true,
          };

          const queueName =
            process.env.MW_FAILURE_QUEUE_NAME ||
            'DHIS2_INTEGRATION_FAIL_QUEUE';

          ch.assertQueue(queueName, options);
          const message = JSON.stringify({ migrationId, email, client, channelId });
          ch.sendToQueue(queueName, Buffer.from(message), {
            persistent: true,
          });
          logger.info(`[x] Sent ${message} to failure queue`);
          setTimeout(() => conn.close(), 500);
        });
      },
    );
  }

  const handleChannel = async (err, ch) => {
    const q = process.env.MW_QUEUE_NAME || "INTERGRATION_MEDIATOR";

    ch.assertQueue(q, {
      durable: true
    });
    spinner.succeed(`[*] Waiting for messages in ${q}. To exit press CTRL+C`);
    await ch.consume(
      q,
      async function (msg) {
        const { migrationId = null, channelId } = JSON.parse(msg.content.toString());
        const logger = new Logger(channelId);
        logger.info('Starting migration into DHIS2')

        const acknowlegdementEmitter = new EventEmitter();
        acknowlegdementEmitter.on('$migrationDone', () => {
          ch.ack(msg);
          logger.info('Acknowldging migration done')
        });

        let failureOccured = false;
        let isMigrating = true;
        let offset = 0;
        const limit = Number(process.env.MW_DATA_CHUNK_SIZE || 200);
        let idsToUpdate = []

        while (isMigrating) {
          const where = { migrationId, isMigrated: false }
          const migrationDataElements = await MigrationDataElements.findAll(
            { where, limit, offset }
          ).catch(err => logger.info(err.message));

          if (migrationDataElements.length != 0) {
            logger.info(`migrating for limit ${limit} and offset ${offset}`)
            //pagination increment
            offset += limit;
            const response = await migrate(
              migrationDataElements,
              sequelize,
              logger
            );

            if (response) {
              const { dataValues } = response;
              await updateOnSucessfullMigration(migrationId, dataValues.length);
              idsToUpdate = [...idsToUpdate, ...dataValues.map(dataValue => dataValue.id)];
            } else {
              failureOccured = true;
            }
          } else {
            isMigrating = false
            logger.info('migration done')
          }
        }
        if (failureOccured) {
          await pushToFailureQueue(migrationId, "openlmis@openlmis.org", "openlmis", logger, channelId);
        } else {
          //TODO: replace with real email
          await sendEmail(migrationId, 'openlmis@gmail.com', false, logger, channelId);
          await MigrationDataElements.update(
            { isMigrated: true },
            { where: { id: idsToUpdate } }
          );
        }
        await completeMigration(migrationId);
        await acknowlegdementEmitter.emit('$migrationDone')
      },
      options
    );
  };
  await conn.createChannel(async (err, ch) => await handleChannel(err, ch));
  spinner.stop();
};

module.exports = () => {
  const host = process.env.MW_QUEUE_HOST || "amqp://localhost"
  amqp.connect(
    host,
    async (err, conn) => await handleQueueConnection(err, conn)
  );
}
const amqplib = require("amqplib/callback_api");
const fakeAmqplib = require("exp-fake-amqplib")
amqplib.connect = fakeAmqplib.connect;
const ora = require('ora');
const { Logger } = require('../utils/logger');

const { generateElements, clearElements } = require('./fake-migration-data-elements');

require("chai").should();
const { expect } = require("chai");

const migrate = require('../migrate');

const {
  getFailQueueModel
} = require("../models");

describe('Migration in chunks', async function () {
  let connect;
  const host = "amqp://localhost";
  const queName = 'MIGRATION_MEDIATOR_TEST'
  let migrationDataElements;

  beforeEach(async function () {
    connect = amqplib.connect;
    migrationDataElements = await generateElements();
  })

  afterEach(async function () {
    await clearElements();
    setTimeout(function () { process.exit(0) }, 2000);
  })
  it("exposes the expected api on connection", async function (done) {
    connect(host, null, (err, connection) => {
      if (err) return done(err);
      expect(connection).have.property("createChannel").that.is.a("function");
      expect(connection).have.property("createConfirmChannel").that.is.a("function");
      done();
    });
  });

  it('migrates a given chunk', async function () {
    connect(host, null, async function (err, connection) {
      if (err) return err
      connection.createChannel(async function (err, ch) {
        const spinner = ora();
        const sequelize = await require("./database")(spinner);
        const result = await migrate(
          migrationDataElements,
          sequelize,
          new Logger('xxx-aaa')
        );
        if (result) {
          const { response } = result;
          const FailQueue = await getFailQueueModel(sequelize);
          const failQueueEntries = await FailQueue.findAll();
          expect(response.status).to.equal(200);
          expect(response.data.status).to.equal("SUCCESS");
          expect(failQueueEntries.length).to.equal(0);
        }
      })
    })
  })
})
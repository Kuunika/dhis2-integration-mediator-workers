/* eslint-disable no-undef */
// const should = require('chai').should()
const email = require('../email')
const ora = require('ora')
const { Logger } = require('../utils/logger')
const mockTransport = require('nodemailer-mock-transport')
const { expect } = require('chai')
require('dotenv').config()

const { generateElement, clearElement } = require('./fake-migrations')

describe('Sending emails on migration rediness not achieved', async function () {
  let sequelize
  beforeEach(async function () {
    const spinner = ora()
    sequelize = await require('./database')(spinner)
    await generateElement()
  })

  afterEach(async function () {
    await clearElement()
    sequelize = null
    setTimeout(function () { process.exit(0) }, 2000)
  })
  it('Should send an email', async function () {
    const spinner = ora().start()
    var transport = mockTransport({
      foo: 'bar'
    })
    const data = {
      migrationId: 100,
      email: 'me@test.org',
      flag: true,
      source: 'mediator',
      channelId: 'xxx-aaa'
    }
    await email(data, spinner, new Logger('xxx-aaa'), transport, sequelize)
    await new Promise((resolve, reject) => {
      setTimeout(function () { resolve(true) }, 1000)
    })
    expect(transport.sentMail[0].data.from).to.equal('Kuunika <noreply@kuunika.org>')
  })
})

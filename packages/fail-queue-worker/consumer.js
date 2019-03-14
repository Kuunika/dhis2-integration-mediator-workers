const { connect } = require('amqplib/callback_api')
const { info, error } = require('winston')
const { red } = require('chalk')
const moment = require('moment')
const pushToFailQueue = require('./pushToFailQueue')

const label = {
  label: 'queue'
}
const migrate = require('./migration')

const setupConnection = async (err, conn) => {
  if (err) {
    await error(err.message, label)
    process.exit(1)
  }

  await info('connection to the queue was successful', label)

  const createChannel = async (err, channel) => {
    if (err) {
      await await error(err.message, label)
      process.exit(1)
    }

    const queueName =
      process.env.DFQW_QUEUE_NAME || 'DHIS2_INTEGRATION_FAIL_QUEUE'

    await channel.assertQueue(queueName, {
      durable: true
    })

    await info(`waiting for messages in ${queueName}.`, label)
    await info(`to exit press ${red('"CTRL + C"')}\n`, label)
    await console.log()

    const options = {
      noAck: false
    }

    const readMessage = async message => {
      await info('received message', label)

      try {
        const data = await JSON.parse(message.content.toString())
        await console.log(JSON.stringify(data, null, 2))
        await console.log()

        const { lastAttempt = null, attempts = 0, channelId } = data

        if (lastAttempt) {
          var then = moment(lastAttempt)
          var now = moment()
          const minutes = Number(now.diff(then, 'minutes'))

          const waitTime = Number(process.env.DFQW_QUEUE_WAIT_TIME || 30)
          const MAX_ATTEMPTS = Number(process.env.DFQW_QUEUE_ATTEMPTS || 2)

          if (waitTime === minutes) {
            data.attempts = attempts + 1
            await migrate(data)
            await channel.ack(message)
          } else {
            const { migrationId, client, email } = data
            if (Number(attempts) >= MAX_ATTEMPTS) {
              await require('./emailProducer')(migrationId, email, client, true, channelId)
              await info('message sent to email queue', label)
              await info('message processed', label)
            } else {
              await info('message pushed for retry', label)
              await info(
                `waiting for ${waitTime} to process this migration`,
                label
              )
              await pushToFailQueue(
                migrationId,
                email,
                client,
                attempts,
                lastAttempt,
                channelId
              )
            }
            channel.ack(message)
          }
        } else {
          data.attempts = attempts + 1
          const res = await migrate(data)
          if (res) {
            await info('message processed', label)
            channel.ack(message)
          } else {
            await error('there was some error in the migration process', label)
          }
        }
        await console.log()
      } catch (err) {
        error(err.message, label)
      }
    }

    await channel.consume(queueName, readMessage, options)
  }

  await conn.createChannel(createChannel)
}

module.exports = async () => {
  const host = process.env.DEW_QUEUE_HOST || 'amqp://localhost'

  connect(
    host,
    setupConnection
  )
}

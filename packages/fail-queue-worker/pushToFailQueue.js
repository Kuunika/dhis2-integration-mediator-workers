const { connect } = require('amqplib/callback_api')
const { info, error } = require('winston')

const label = { label: 'queue' }
const moment = require('moment')

module.exports = async (
  migrationId = 0,
  email = 'kuunika@gmail.com',
  client = 'not available',
  attempts = 0,
  lastAttempt = null,
  channelId
) => {
  await info('preparing to send a message to email queue', label)

  const host = process.env.DFQW_QUEUE_HOST || 'amqp://localhost'
  await connect(
    host,
    async (err, conn) => {
      if (err) {
        await error(err.message, label)
        return
      }

      await info('connection to email queue was successful', label)

      conn.createChannel(async (err, channel) => {
        if (err) {
          await error(err.message, label)
          return
        }

        const options = {
          durable: true
        }

        const queueName =
          process.env.DFQW_QUEUE_NAME || 'DHIS2_INTEGRATION_FAIL_QUEUE'
        await channel.assertQueue(queueName, options)

        await info('queue channel is created successful', label)

        const message = JSON.stringify(
          {
            migrationId,
            email,
            client,
            attempts,
            lastAttempt: lastAttempt || moment(),
            channelId
          },
          null,
          2
        )

        channel.sendToQueue(queueName, Buffer.from(message), {
          persistent: true
        })

        await info('message sent successfully to email queue', label)
        await console.log(message)
        await console.log()

        await setTimeout(() => conn.close(), 1000)
      })
    }
  )
}

const { connect } = require('amqplib/callback_api')
const { info, error } = require('winston')

const label = { label: 'email queue' }

module.exports = async (
  migrationId = 0,
  email = 'kuunika@gmail.com',
  client = 'not available',
  flag = false,
  channelId
) => {
  await info('preparing to send a message to email queue', label)

  const host = process.env.DFQW_EMAIL_QUEUE_HOST || 'amqp://localhost'
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
          process.env.DFQW_EMAIL_QUEUE_NAME || 'DHIS2_EMAIL_INTEGRATION_QUEUE'
        await channel.assertQueue(queueName, options)

        await info('email queue channel is created successful', label)

        const source = 'failqueue'
        const message = JSON.stringify(
          { migrationId, email, client, flag, source, channelId },
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

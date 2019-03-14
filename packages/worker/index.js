const emailWorker = require('email-worker');
const failQueueWorker = require('fail-queue-worker');
const migrationWorker = require('migration-worker');
require('dotenv').config();

const init = async () => {
  try {
    await migrationWorker();
    await emailWorker();
    await failQueueWorker();
  } catch (e) {
    console.log(e.message)
  }
}

init();
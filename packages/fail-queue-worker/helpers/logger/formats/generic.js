const { format } = require('winston')
const { json, combine, timestamp } = format

module.exports = combine(json(), timestamp())

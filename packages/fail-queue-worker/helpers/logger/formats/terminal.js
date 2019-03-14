const { format } = require('winston')
const { combine, colorize, timestamp, align, printf, splat } = format
const handleFormat = require('./handleFormat')

const timeStampFormat = 'YYYY-MM-DD HH:mm:ss'

module.exports = combine(
  colorize(),
  splat(),
  timestamp({ format: timeStampFormat }),
  align(),
  printf(handleFormat)
)

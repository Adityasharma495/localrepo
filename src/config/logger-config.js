const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
require('winston-daily-rotate-file');

const customFormat = printf(( { level, message, timestamp, error } ) => {
    return `${timestamp} : ${level}: ${message}`;
});

const transport = new transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true
});

const logger = createLogger({
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        customFormat
    ),
    transports: [
        transport
    ]
});

module.exports = logger;
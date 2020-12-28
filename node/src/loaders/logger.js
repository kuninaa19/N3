import winston from 'winston';
import rotate from 'winston-daily-rotate-file';

const logDir = "log_dir";

const prettyJson = winston.format.printf(info => {
    if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, 4)
    }
    return `${info.timestamp} - [${info.level}]:  ${info.message}`
});

const dailyRotateFileTransport = new (winston.transports.DailyRotateFile)({
    filename: `./${logDir}/%DATE%-info.log`,
    level: 'info',
    dataPattern: 'yy-MM-dd',
    maxFiles: 1000,
    prepend: true,
    zippedArchive: true
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        // winston.format.label({ label: '[ ]' }),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.prettyPrint(),
        winston.format.splat(),
        winston.format.colorize(),
        prettyJson,
    ),
    // defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console({}),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        dailyRotateFileTransport
    ]
});

export default logger;
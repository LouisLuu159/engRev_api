import { WinstonModule } from 'nest-winston';
const winston = require('winston');

const transports = {
  console: new winston.transports.Console({
    level: 'silly',
    prettyPrint: true,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.colorize({
        colors: {
          info: 'blue',
          debug: 'yellow',
          error: 'red',
        },
      }),
      winston.format.printf((info) => {
        return `[Nest] 5277   -  ${info.timestamp} [${info.level}] [${
          info.context ? info.context : info.stack
        }] ${info.message}`;
      }),
    ),
  }),
  combinedFile: new winston.transports.File({
    filename:
      'logs/Combined_' +
      new Date(Date.now()).toISOString().split('T')[0] +
      '.log',
    level: 'info',
    handleExceptions: true,
  }),
  errorFile: new winston.transports.File({
    filename:
      'logs/Errors_' +
      new Date(Date.now()).toISOString().split('T')[0] +
      '.log',
    level: 'error',
  }),
};

export const CustomLogger = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    transports.console,
    transports.combinedFile,
    transports.errorFile,
  ],
});

import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
const winston = require('winston');

const transports = {
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

export const CustomWinstonLogger: WinstonModuleOptions = {
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.prettyPrint(),
  ),
  transports: [transports.combinedFile, transports.errorFile],
};

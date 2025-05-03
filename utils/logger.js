import { format as _format, createLogger, transports as _transports } from 'winston';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, '../logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir);
}

// Define log formats
const formats = _format.combine(
  _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  _format.errors({ stack: true }),
  _format.splat(),
  _format.json()
);

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: formats,
  defaultMeta: { service: 'merchant-api' },
  transports: [
    // Write logs to console
    new _transports.Console({
      format: _format.combine(
        _format.colorize(),
        _format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new _transports.File({ 
      filename: join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new _transports.File({ 
      filename: join(logsDir, 'combined.log') 
    })
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new _transports.File({ 
      filename: join(logsDir, 'exceptions.log') 
    })
  ],
  rejectionHandlers: [
    new _transports.File({ 
      filename: join(logsDir, 'rejections.log') 
    })
  ]
});

export default logger;
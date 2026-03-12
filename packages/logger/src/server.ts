import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

const redactPaths = [
  'password',
  'token',
  'secret',
  'authorization',
  'user.password',
  'user.email',
  '*.password',
  '*.token',
  '*.secret',
];

let transport;

if (isProd && process.env.LOGTAIL_TOKEN) {
  try {
    transport = pino.transport({
      target: '@logtail/pino',
      options: { sourceToken: process.env.LOGTAIL_TOKEN },
    });
  } catch (e) {
    console.warn('Failed to initialize logtail transport, using default logger');
  }
} else if (!isProd) {
  try {
    transport = pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    });
  } catch (e) {
    console.warn('Failed to initialize pino-pretty transport, using default logger');
  }
}

export const logger = transport
  ? pino(
      {
        level: logLevel,
        redact: {
          paths: redactPaths,
          remove: true,
        },
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      transport
    )
  : pino({
      level: logLevel,
      redact: {
        paths: redactPaths,
        remove: true,
      },
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });

export type Logger = typeof logger;

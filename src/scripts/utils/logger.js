const isDev = typeof import.meta !== 'undefined' && import.meta.env ? Boolean(import.meta.env.DEV) : true;

const logger = {
  info(...args) {
    if (isDev) {
      console.log(...args);
    }
  },
  warning(...args) {
    if (isDev) {
      console.warn(...args);
    }
  },
  critical(...args) {
    if (isDev) {
      console.error(...args);
    }
  },
};

export default logger;

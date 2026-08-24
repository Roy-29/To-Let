export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'INFO', message, meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'WARN', message, meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, meta?: any) => {
    // Exclude sensitive data if it leaks in errors (rudimentary filter for MVP)
    const safeMeta = meta ? JSON.parse(JSON.stringify(meta)) : undefined;
    if (safeMeta && safeMeta.password) delete safeMeta.password;
    if (safeMeta && safeMeta.token) delete safeMeta.token;

    console.error(JSON.stringify({ level: 'ERROR', message, meta: safeMeta, timestamp: new Date().toISOString() }));
  }
};

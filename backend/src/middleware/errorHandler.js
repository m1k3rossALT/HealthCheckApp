/**
 * Centralised Express error handler.
 * Must be mounted LAST — after all routes.
 *
 * In production: no stack traces in the response.
 * In development: stack included for easier debugging.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  console.error(`[error] ${req.method} ${req.path} → ${status}: ${err.message}`);

  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
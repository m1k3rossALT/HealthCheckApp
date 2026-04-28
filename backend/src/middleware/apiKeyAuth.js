/**
 * Optional API key guard.
 * If API_KEY is set in env, all requests must include:
 *   x-api-key: <value>
 *
 * If API_KEY is not set, this middleware is a no-op.
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) return next();

  const provided = req.headers['x-api-key'];

  if (!provided || provided !== apiKey) {
    return res.status(401).json({ error: 'Unauthorised: invalid or missing API key' });
  }

  next();
};

module.exports = apiKeyAuth;

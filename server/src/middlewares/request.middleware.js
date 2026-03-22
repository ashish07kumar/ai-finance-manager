const morgan = require('morgan');
const crypto = require('crypto');
const logger = require('../config/logger');

function attachRequestContext(req, res, next) {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}

const httpLogger = morgan((tokens, req, res) => {
  const payload = {
    type: 'http_request',
    requestId: req.requestId,
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length') || 0,
    responseTimeMs: Number(tokens['response-time'](req, res)),
    userAgent: tokens.req(req, res, 'user-agent') || '',
    remoteAddr: tokens['remote-addr'](req, res),
  };

  logger.info(payload);
  return null;
});

module.exports = { attachRequestContext, httpLogger };

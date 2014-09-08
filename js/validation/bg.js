var Joi = require('joi');

module.exports = Joi.object().keys({
  // deviceTime is the raw, non-timezone-aware string, so won't validate as isoDate()
  deviceTime: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).required(),
  value: Joi.number().integer().required()
});
var Joi = require('joi');

module.exports = Joi.object().keys({
  // deviceTime is the raw, non-timezone-aware string, so won't validate as isoDate()
  deviceTime: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).required(),
  // duration is optional in several cases
  // where it's required is specified below in an `with` clause
  duration: Joi.number().integer().min(0),
  // extended is optional on boluses
  // required co-occurrence with extendedDelivery below in `and` clause
  extended: Joi.boolean(),
  initialDelivery: Joi.number().min(0),
  extendedDelivery: Joi.number().min(0),
  programmed: Joi.number().min(0),
  recommended: Joi.number().min(0),
  // TODO: change to isoDate() as soon as merge browser compatibility branch
  // which adds Watsoning to suspendedAt field
  suspendedAt: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  value: Joi.number().min(0).required()
}).and(['extended', 'extendedDelivery'])
  .with('extended', 'duration');
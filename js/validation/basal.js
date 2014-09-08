var Joi = require('joi');

module.exports = Joi.object().keys({
  // all basal rate segments require a deliveryType
  deliveryType: Joi.string().valid(['scheduled', 'suspend', 'temp']).required(),
  // duration is optional on old data model since we use normalTime and normalEnd to visualize
  // deviceTime is the raw, non-timezone-aware string, so won't validate as isoDate()
  deviceTime: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).required(),
  duration: Joi.number().integer().min(0),
  normalEnd: Joi.string().isoDate().required(),
  value: Joi.number().min(0).required()
});
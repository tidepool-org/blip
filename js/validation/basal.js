var Joi = require('joi');

module.exports = Joi.object().keys({
  // all basal rate segments require a deliveryType
  deliveryType: Joi.string().valid(['scheduled', 'suspend', 'temp']).when('type', {
    is: 'basal-rate-segment',
    then: Joi.required()
  }),
  duration: Joi.number().integer().min(0),
  normalEnd: Joi.string().isoDate(),
  value: Joi.number().min(0)
});
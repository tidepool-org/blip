var Joi = require('joi');

module.exports = Joi.object().keys({
  parentMessage: Joi.alternatives().try(Joi.string().required(), Joi.any().valid(null,'').required()),
  utcTime: Joi.string().isoDate().required()
});
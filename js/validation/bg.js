var Joi = require('joi');

module.exports = Joi.object().keys({
  value: Joi.number().integer().required()
});
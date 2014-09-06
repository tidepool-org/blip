var Joi = require('joi');

module.exports = Joi.object().keys({
  basalSchedules: Joi.array().includes(Joi.object().keys({
    name: Joi.string().min(1).required(),
    value: Joi.array().includes(Joi.object().keys({
      rate: Joi.number().min(0).required(),
      // milliseconds per twenty-four hours
      start: Joi.number().integer().min(0).max(86400000).required()
    }))
  })).required(),
  bgTarget: Joi.array().includes(Joi.object().keys({
    // pulling a min out of thin air a little bit, Animas pump allows min of 60
    amount: Joi.number().integer(),
    // milliseconds per twenty-four hours
    start: Joi.number().integer().min(0).max(86400000).required()
  })).required(),
  carbRatio: Joi.array().includes(Joi.object().keys({
    // some pumps allow this to be a non-integer
    amount: Joi.number().min(0).required(),
    // milliseconds per twenty-four hours
    start: Joi.number().integer().min(0).max(86400000).required()
  })).required(),
  insulinSensitivity: Joi.array().includes(Joi.object().keys({
    amount: Joi.number().integer().min(0).required(),
    // milliseconds per twenty-four hours
    start: Joi.number().integer().min(0).max(86400000).required()
  })).required()
});
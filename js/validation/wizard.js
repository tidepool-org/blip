var Joi = require('joi');

module.exports = Joi.object().keys({
  // preprocess removes wizards w/o joinKeys that match to a bolus
  // hence the requirement
  // no need to validate boluses internally since they are validated at the higher level
  bolus: Joi.object().required(),
  // not all wizard interaction involve a carb bolus
  // so this is never required
  carbs: Joi.object().keys({
    value: Joi.number().integer().min(0).required()
  }),
  // deviceTime is the raw, non-timezone-aware string, so won't validate as isoDate()
  deviceTime: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).required()
});
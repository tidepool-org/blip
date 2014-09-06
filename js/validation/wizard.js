var Joi = require('joi');

module.exports = Joi.object().keys({
  // preprocess removes wizards w/o joinKeys that match to a bolus
  // hence the requirement
  // no need to validate boluses internally since they are validated at the higher level
  bolus: Joi.object().when('type', {
    is: 'wizard',
    then: Joi.required()
  }),
  // not all wizard interaction involve a carb bolus
  // so this is never required
  carbs: Joi.object().keys({
    value: Joi.number().integer().min(0).required()
  })
});
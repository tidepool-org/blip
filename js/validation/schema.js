var Joi = require('joi');

module.exports = Joi.object().keys({
  basalSchedules: Joi.array().includes(Joi.object().keys({
    name: Joi.string().min(1).required(),
    value: Joi.array().includes(Joi.object().keys({
      rate: Joi.number().min(0).required(),
      // milliseconds per twenty-four hours
      start: Joi.number().integer().min(0).max(86400000).required()
    }))
  })).when('type', {
    is: 'settings',
    then: Joi.required()
  }),
  bgTarget: Joi.array().includes(Joi.object().keys({
    // pulling a min out of thin air a little bit, Animas pump allows min of 60
    amount: Joi.number().integer(),
    // milliseconds per twenty-four hours
    start: Joi.number().integer().min(0).max(86400000).required()
  })).when('type', {
    is: 'settings',
    then: Joi.required()
  }),
  // preprocess removes wizards w/o joinKeys that match to a bolus
  // hence the requirement
  // no need to validate boluses internally since they are validated at the higher level
  bolus: Joi.object().when('type', {
    is: 'wizard',
    then: Joi.required()
  }),
  carbRatio: Joi.array().includes(Joi.object().keys({
    // some pumps allow this to be a non-integer
    amount: Joi.number().min(0).required(),
    // milliseconds per twenty-four hours
    start: Joi.number().integer().min(0).max(86400000).required()
  })).when('type', {
    is: 'settings',
    then: Joi.required()
  }),
  // not all wizard interaction involve a carb bolus
  // so this is never required
  carbs: Joi.object().keys({
    value: Joi.number().integer().min(0).required()
  }),
  // all basal rate segments require a deliveryType
  deliveryType: Joi.string().valid(['scheduled', 'suspend', 'temp']).when('type', {
    is: 'basal-rate-segment',
    then: Joi.required()
  }),
  // deviceTime is the raw, non-timezone-aware string, so won't validate as isoDate()
  deviceTime: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  // duration is optional in several cases
  // where it's required is specified below in an `with` clause
  duration: Joi.number().integer(),
  // extended is optional on boluses
  // required co-occurrence with extendedDelivery below in `and` clause
  extended: Joi.boolean(),
  // all IDs must be alphanumeric plus - or _ but no other special characters
  id: Joi.string().regex(/^[A-Za-z0-9\-\_]+$/).required(),
  initialDelivery: Joi.number().min(0),
  insulinSensitivity: Joi.array().includes(Joi.object().keys({
    amount: Joi.number().integer().min(0).required(),
    // milliseconds per twenty-four hours
    start: Joi.number().integer().min(0).max(86400000).required()
  })).when('type', {
    is: 'settings',
    then: Joi.required()
  }),
  extendedDelivery: Joi.number().min(0),
  // some types optionally have a joinKey, with the same characters requirements as IDs
  // _ not included here because that only occurs in IDs not generated server-side
  joinKey: Joi.string().regex(/^[A-Za-z0-9\-]+$/),
  normalEnd: Joi.string().isoDate().when('type', {
    is: 'basal-rate-segment',
    then: Joi.required()
  }),
  normalTime: Joi.string().isoDate(),
  parentMessage: Joi.alternatives().try(Joi.string().when('type', {
    is: 'message',
    then: Joi.required()
  }), Joi.any().valid(null, '')),
  programmed: Joi.number().min(0),
  recommended: Joi.number().min(0),
  // TODO: change to isoDate() as soon as merge browser compatibility branch
  // which adds Watsoning to suspendedAt field
  suspendedAt: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  type: Joi.string().valid([
    'basal-rate-segment',
    'bolus',
    'cbg',
    // NB: other than allowing the type, deviceMeta doesn't get validated
    // because it doesn't get visualized
    // only deviceMetas transformed into basal-rate-segments are visualized
    'deviceMeta',
    'message',
    'settings',
    'smbg',
    'wizard']).invalid(['basal-settings-segment', 'fill']).required(),
  // only messages are currently visualized using a true timezone-aware UTC datetime string
  utcTime: Joi.string().isoDate().when('type', {
    is: 'message',
    then: Joi.required()
  }),
  // can't verify that some fields (carbs, cbg, and smbg) are integer values
  // and still require the field only with certain types
  // not a big deal since carbs types is going away and
  // cbg and smbg will soon be coming in as mmol/L
  value: Joi.number().min(0).when('type', {
    is: ['basal-rate-segment', 'bolus', 'carbs', 'cbg', 'smbg'],
    then: Joi.required()
  }),
}).and(['extended', 'extendedDelivery'])
  .with('extended', 'duration');
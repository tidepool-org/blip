var Joi = require('joi');

module.exports = Joi.object().keys({
  // basaltab.js: actualized is optional, reflecting whether scheduled segment was delivered
  actualized: Joi.boolean(),
  // basal.js: 
  deliveryType: Joi.string().valid(['scheduled', 'suspend', 'temp']).when('type', {
    is: 'basal-rate-segment',
    then: Joi.required()
  }),
  deviceTime: Joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  duration: Joi.number().integer(),
  extended: Joi.boolean(),
  fillColor: Joi.string().valid(['darkest', 'darker', 'dark',
    'light', 'lighter', 'lightest']).when('type', {
      is: 'fill',
      then: Joi.required()
    }),
  id: Joi.string().regex(/^[A-Za-z0-9\-\_]+$/).required(),
  initialDelivery: Joi.number().min(0),
  extendedDelivery: Joi.number().min(0),
  joinKey: Joi.string().regex(/^[A-Za-z0-9\-]+$/),
  messageText: Joi.string().when('type', {
    is: 'message',
    then: Joi.required()
  }),
  normalEnd: Joi.string().isoDate().when('type', {
    is: ['basal-rate-segment', 'basal-settings-segment', 'fill'],
    then: Joi.required()
  }),
  normalTime: Joi.string().isoDate(),
  parentMessage: Joi.alternatives().try(Joi.string().regex(/^[A-Za-z0-9\-\_]+$/).when('type', {
    is: 'message',
    then: Joi.required()
  }), Joi.any().valid(null)),
  programmed: Joi.number().min(0),
  recommended: Joi.number().min(0),
  schedule: Joi.string().min(1).when('type', {
    is: 'basal-settings-segment',
    then: Joi.required()
  }),
  type: Joi.string().valid([
    'basal-rate-segment',
    'basal-settings-segment',
    'bolus',
    'cbg',
    // NB: other than allowing the type, deviceMeta doesn't get validated
    // because it doesn't get visualized
    // only deviceMetas transformed into basal-rate-segments are visualized
    'deviceMeta',
    'fill',
    'message',
    'settings',
    'smbg',
    'wizard']).required(),
  utcTime: Joi.string().isoDate().when('type', {
    is: 'message',
    then: Joi.required()
  }),
  value: Joi.number().min(0).when('type', {
    is: ['basal-rate-segment', 'basal-settings-segment', 'bolus', 'carbs', 'cbg', 'smbg'],
    then: Joi.required()
  }),
}).and(['extended', 'extendedDelivery', 'initialDelivery'])
  .with('extended', 'duration');
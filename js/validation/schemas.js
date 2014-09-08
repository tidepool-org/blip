var Joi = require('joi');

module.exports = {
  'basal-rate-segment': require('./basal'),
  bolus: require('./bolus'),
  cbg: require('./bg'),
  common: require('./common'),
  deviceMeta: Joi.object(),
  message: require('./message'),
  settings: require('./settings'),
  smbg: require('./bg'),
  wizard: require('./wizard')
};
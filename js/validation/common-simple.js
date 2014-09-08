var Joi = require('joi');

var idPattern = /^[A-Za-z0-9\-\_]+$/;
var isoDatePattern = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/;

module.exports = function(e, cb){
  if (e.id == null || !idPattern.test(e.id)) {
    return cb({ message: 'No id' }, e);
  }

  if (e.joinKey != null && !idPattern.test(e.joinKey)) {
    return cb({message: 'Invalid character in joinKey'}, e);
  }

  if (e.normalTime != null && !isoDatePattern.test(e.normalTime)) {
    return cb({message: 'Invalid normalTime'}, e);
  }

  switch (e.type) {
    case 'basal-rate-segment':
    case 'bolus':
    case 'cbg':
    case 'deviceMeta':
    case 'message':
    case 'settings':
    case 'smbg':
    case 'wizard':
      break;

    default:
      return cb({message: 'Unknown type'}, e);
  }

  return cb(null, e);
};
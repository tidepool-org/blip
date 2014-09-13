var _ = require('lodash');

var validate = require('../js/validation/validate');

var data = require('../example/data/device-data.json');

console.log('\nItems to validate:', data.length, '\n');

console.time('Validation in');
var res = validate.validateAll(data);
console.timeEnd('Validation in');

console.log('\nValid items:', res.valid.length);
console.log('Invalid items:', res.invalid.length, '\n');
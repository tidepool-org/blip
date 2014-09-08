var validate = require('../js/validation/joi/validate');
var data = require('../example/data/post-preprocess.json');

var result;

console.log('');
console.time('Time');
result = validate.validateAll(data);
console.timeEnd('Time');
console.log('\nItems in data:', data.length);
console.log('\nFirst datum:\n', data[0]);
console.log('\nItems validated:', result.valid.length);
console.log('\nItems found invalid:', result.invalid.length, '\n');
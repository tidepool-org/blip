var _ = require('lodash');

var validate = require('../js/validation/validate');
var data = require('../example/data/post-preprocess.json');

console.log('');
console.time('Time');
var newData = validate.validateAll(data, onDone);

function onDone(err, data) {
  console.timeEnd('Time');
  console.log('\nItems in data:', data.length);
  console.log('\nFirst datum:\n', data[0]);
  var result = _.countBy(data, function(d) {
    if (d.errorMessage) {
      return 'invalid';
    }
    return 'valid';
  });
  console.log('\nItems validated:', result.valid);
  console.log('\nItems found invalid:', result.invalid || 0, '\n');
}
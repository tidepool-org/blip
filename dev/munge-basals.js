// Usage:
// cat device-data.json | node munge-basal.js > non-overlapping-basals.json
// for human-readable (pretty) JSON:
// cat device-data.json | node munge-basals.js | json > non-overlapping-basals.json
 
// https://github.com/dominictarr/JSONStream
var JSONStream = require('JSONStream');
// https://github.com/rvagg/through2
var through2 = require('through2');

var basal = require('../js/data/basal-util');
 
process.stdin
.pipe(JSONStream.parse('*'))
.pipe(through2({objectMode: true}, function(data, encoding, callback) {
  this.push(basal()(data));
  callback();
}))
.pipe(JSONStream.stringify(false))
.pipe(process.stdout);
 
// If we use `head` downstream it will send an error signal
process.stdout.on('error', process.exit);
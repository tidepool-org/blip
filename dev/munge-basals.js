// Usage:
// node munge-basals.js <path-to-file> | json > output.json

var BasalUtil = require('../js/data/basalutil');

var filename = process.argv[2];

var data = require(filename);

var b = new BasalUtil(data);

console.log(JSON.stringify({
    'actual': b.actual,
    'undelivered': b.undelivered
}));
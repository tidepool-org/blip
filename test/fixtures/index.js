var fixtures = [ ];

fixtures.push({'name': 'template', 'json': require('./basal-template')});
fixtures.push({'name': 'contained', 'json': require('./basal-contained')});
fixtures.push({'name': 'temp-start', 'json': require('./basal-temp-start')});
fixtures.push({'name': 'temp-end', 'json': require('./basal-temp-end')});
fixtures.push({'name': 'two-scheduled', 'json': require('./basal-temp-two-scheduled')});
fixtures.push({'name': 'many-scheduled', 'json': require('./basal-temp-many-scheduled')});
fixtures.push({'name': 'both-ends', 'json': require('./basal-temp-both-ends')});
fixtures.push({'name': 'overlapping', 'json': require('./basal-overlapping')});
fixtures.push({'name': 'current-demo', 'json': require('../../example/device-data')});
module.exports = fixtures;
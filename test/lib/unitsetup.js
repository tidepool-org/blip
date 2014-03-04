var salinity = require('salinity');
var helpers = require('./unithelpers');

// Add to global object for all tests to use
window.chai = salinity.chai;
window.sinon = salinity.sinon;
window.expect = salinity.expect;
window.helpers = helpers;
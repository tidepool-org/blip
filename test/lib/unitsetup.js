var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var helpers = require('./unithelpers');
chai.use(sinonChai);

// Add to global object for all tests to use
window.chai = chai;
window.sinon = sinon;
window.expect = expect;
window.helpers = helpers;
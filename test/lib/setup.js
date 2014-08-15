var helpers = require('./helpers');

// Sinon is not Webpack-friendly, use pre-built version
// Adds `sinon` to the `window` object
require('script!../../vendor/sinon.js');

var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
window.chai = chai;
window.expect = chai.expect;

window.helpers = helpers;

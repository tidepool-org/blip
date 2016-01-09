// because we are using node v0.12.0 we have to use zombie.js v2.x (they are now on v4.x)
// the docs for v2.5.1 are in the README at the following:
// https://github.com/assaf/zombie/tree/68980bbcd17e84ad63a43cb8ac6e2e317acf36b7

var zombie = require('zombie');
var PORT = 3000;

function World() {
  this.browser = zombie.create(); // this.browser will be available in step definitions
  this.browser.silent = true;
  this.browser.waitDuration = 10000;
  this.host = 'http://localhost:'+ PORT;

  this.setHost = function(host) {
    this.host = host;
  };

  this.visit = function (path, callback) {
    this.browser.visit(this.host + path, callback);
  };
}

module.exports = World;
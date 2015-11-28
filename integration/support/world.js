var zombie = require('zombie');
var PORT = 3000;

function World() {
  this.browser = new zombie(); // this.browser will be available in step definitions
  this.host = 'http://localhost:'+ PORT;

  this.setHost = function(host) {
    this.host = host;
  };

  this.visit = function (path, callback) {
    this.browser.visit(this.host + path, callback);
  };
}

module.exports = World;
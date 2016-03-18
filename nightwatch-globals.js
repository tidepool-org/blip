module.exports = {
  before: function(done) {
    this.app = require('./server.js');
    done();
  },

  after: function(done) {
    this.app.server.close();
    done();
  }
}

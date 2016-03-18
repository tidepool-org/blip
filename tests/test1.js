describe('Google demo test for Mocha', function() {

  describe('with Nightwatch', function() {
    var app;
    before(function(client, done) {
      app = require('../server.js');
      done();
    });

    after(function(client, done) {
      client.end(function() {
        app.server.close();
        done();
      });
    });

    afterEach(function(client, done) {
      done();
    });

    beforeEach(function(client, done) {
      done();
    });

    it('uses BDD to run the simple test', function(client) {
      client
        .url('http://localhost:3000')
        .pause(1000)
        .expect.element('.login-nav-tidepool-logo').to.be.present.before(10000);
    });

    it('can set the username', function(client) {
      client.setValue('#username', ['duderino'])
        .pause(500)
        .assert.value('#username', 'duderino');
    });
  });
});

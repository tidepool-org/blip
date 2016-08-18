/* global describe */
/* global before */
/* global after  */
/* global beforeEach */
/* global afterEach */
/* global it */

describe('blip landing page', function() {
  before(function(client, done) {
    done();
  });

  after(function(client, done) {
    client.end(function() {
      done();
    });
  });

  afterEach(function(client, done) {
    done();
  });

  beforeEach(function(client, done) {
    done();
  });

  it('should have the Tidepool logo', function(client) {
    client
      .url('http://localhost:3000/')
      .expect.element('.login-nav-tidepool-logo').to.be.present;
  });

  it('should have a username form field that can be set', function(client) {
    client.expect.element('#username').to.be.present;

    client.setValue('#username', ['duderino'])
      .pause(500)
      .assert.value('#username', 'duderino');
  });
});

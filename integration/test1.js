/* global describe */
/* global before */
/* global after  */
/* global beforeEach */
/* global afterEach */
/* global it */

describe('Blip demo test for Mocha', function() {
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

  it('uses BDD to run the simple test', function(client) {
    client
      .url('http://localhost:3000/')
      .expect.element('.login-nav-tidepool-logo').to.be.present;
  });

  it('can set the username', function(client) {
    client.expect.element('#username').to.be.present;

    client.setValue('#username', ['duderino'])
      .pause(500)
      .assert.value('#username', 'duderino');
  });
});

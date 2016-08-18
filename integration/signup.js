/* global describe */
/* global before */
/* global after  */
/* global beforeEach */
/* global afterEach */
/* global it */

describe('signup', function() {
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

  it('should show the sign up form when sign up link is clicked', function(client) {
    client
      .url('http://localhost:3000')
      .expect.element('#app > div > div > div.login > div.container-nav-outer.login-nav > div > ul.nav.nav-right > li > a')
      .to.be.present
      .and.to.be.an('a')
      .and.to.be.visible
      .and.to.have.attribute('href').equals('http://localhost:3000/signup');

    client.click('#app > div > div > div.login > div.container-nav-outer.login-nav > div > ul.nav.nav-right > li > a');

    client.expect.element('#fullName')
      .to.be.present
      .and.to.be.an('input')
      .and.to.be.visble;
  });
});

var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;

describe('Login', function() {
  var driver;

  var createNewDriver = function() {
    return new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.chrome()).
      build();
  };

  var openApp = function () {
    var deferred = webdriver.promise.defer();
    driver.get('http://localhost:3000').then(function () {
      deferred.fulfill();
    });
    return deferred.promise;
  };

  before(function() {
    driver = createNewDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  it('should have correct page title', function(done) {
    openApp()
      .then(function() {
        return driver.getTitle();
      }).then(function(title) {
        expect(title).to.equal('Blip');
        done();
      });
  });
});
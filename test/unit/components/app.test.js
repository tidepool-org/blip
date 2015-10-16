
/* global chai */
/* global sinon */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
var rewire = require('rewire');
var rewireModule = require('../../utils/rewireModule');

// Need to add this line as app.js includes config 
// which errors if window.config does not exist
window.config = {};
var api = require('../../../app/core/api');
var personUtils = require('../../../app/core/personutils');
var router = require('../../../app/router');
var mock = require('../../../mock');

describe('App', function () {
  // We must remember to require the base module when mocking dependencies,
  // otherwise dependencies mocked will be bound to the wrong scope!
  var App = rewire('../../../app/components/app/app.js');
  router.log = sinon.stub();
  api.log = sinon.stub();

  var childContext = {
    log: sinon.stub(),
    api: mock.patchApi(api),
    personUtils: personUtils,
    router: router,
    DEBUG: false,
    trackMetric: sinon.stub()
  };

  describe('render', function() {
    it('should render without problems', function () {
      console.warn = sinon.stub();
      console.error = sinon.stub();
      
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
      expect(console.error.callCount).to.equal(0);
      var app = TestUtils.findRenderedDOMComponentWithClass(elem, 'app');
      expect(app).to.be.ok;
    });

    it('authenticated state should be false on boot', function () {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem.state.authenticated).to.equal(false);
    });

    it('timezoneAware should be false and timeZoneName should be null', function() {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem.state.timePrefs.timezoneAware).to.equal(false);
      expect(elem.state.timePrefs.timezoneName).to.equal(null);
    });

    it('bgUnits should be mg/dL', function() {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem.state.bgPrefs.bgUnits).to.equal('mg/dL');
    });

    it('should render login form', function () {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      var form = TestUtils.findRenderedDOMComponentWithClass(elem, 'login-simpleform');
      expect(form).to.be.ok;
    });

    it('should render footer', function () {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
      expect(footer).to.be.ok;
    });

    it('should not render a version element when version not set in config', function () {
      App.__set__('config', {VERSION: null});

      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(0);
    });

    it('should render version when version present in config', function () {
      App.__set__('config', {VERSION: 1.4});
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(1);
    });
  });
});
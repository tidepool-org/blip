/** @jsx React.DOM */
/* global chai */
/* global sinon */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
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

  var context = {
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
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        expect(elem).to.be.ok;
        expect(console.warn.callCount).to.equal(0);
        expect(console.error.callCount).to.equal(0);
        var app = TestUtils.findRenderedDOMComponentWithClass(elem, 'app');
        expect(app).to.be.ok;
      });
    });

    it('authenticated state should be false on boot', function () {
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        expect(elem.state.authenticated).to.equal(false);
      });
    });

    it('timezoneAware should be false and timeZoneName should be null', function() {
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        expect(elem.state.timePrefs.timezoneAware).to.equal(false);
        expect(elem.state.timePrefs.timezoneName).to.equal(null);
      });
    });

    it('bgUnits should be mg/dL', function() {
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        expect(elem.state.bgPrefs.bgUnits).to.equal('mg/dL');
      });
    });

    it('should render login form', function () {
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        var form = TestUtils.findRenderedDOMComponentWithClass(elem, 'login-simpleform');
        expect(form).to.be.ok;
      });
    });

    it('should render footer', function () {
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
        expect(footer).to.be.ok;
      });
    });

    it('should not render a version element when version not set in config', function () {
      App.__set__('config', {VERSION: null});

      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
        var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(footer, 'Navbar-version');
        expect(versionElems.length).to.equal(0);
      });
    });

    it('should render version when version present in config', function () {
      App.__set__('config', {VERSION: 1.4});
      React.withContext(context, function() {
        var elem = TestUtils.renderIntoDocument(<App/>);
        var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
        var version = TestUtils.findRenderedDOMComponentWithClass(footer, 'Navbar-version');
        expect(version).to.be.ok;
      });
    });
  });

  describe('terms', function() {

    describe('overlay', function() {
      //override
      var utils = require('../../../app/core/utils');
      var stub = sinon.stub(utils, 'isChrome');
      stub.returns(true);

      it('should render when user has not accepted terms but is logged in', function() {

        React.withContext(context, function() {

          var elem = TestUtils.renderIntoDocument(<App/>);

          elem.initAppUtils(utils);
          elem.setState({ authenticated: true });

          expect(elem.state.authenticated).to.equal(true);

          var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-overlay');

          expect(termsElems.length).to.not.equal(0);

        });
      });
      it('should NOT render when user has acccepted terms and is logged in', function() {

        React.withContext(context, function() {

          var elem = TestUtils.renderIntoDocument(<App/>);

          elem.initAppUtils(utils);

          var acceptDate = new Date().toISOString();

          elem.setState({ authenticated: true, termsAccepted: acceptDate });

          expect(elem.state.authenticated).to.equal(true);
          expect(elem.state.termsAccepted).to.equal(acceptDate);

          var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-overlay');
          expect(termsElems.length).to.equal(0);

        });
      });
    });
    describe('acceptance', function() {
      it('should set the state for termsAccepted ', function() {

        var apiStub = sinon.stub(api.user, 'acceptTerms',function () { return null; });

        React.withContext(context, function() {

          var elem = TestUtils.renderIntoDocument(<App/>);
          expect(elem.state.termsAccepted).to.equal(null);
          elem.setState({ authenticated: true });
          elem.handleAcceptedTerms();
          expect(elem.state.termsAccepted).to.not.equal(null);
          apiStub.restore();
        });
      });
      it('should allow user to use blip', function() {

        var apiStub = sinon.stub(api.user, 'acceptTerms',function () { return null; });

        React.withContext(context, function() {

          var elem = TestUtils.renderIntoDocument(<App/>);
          elem.setState({ authenticated: true });
          expect(elem.state.authenticated).to.equal(true);
          expect(elem.state.termsAccepted).to.equal(null);
          elem.setState({ authenticated: true });
          elem.handleAcceptedTerms();
          expect(elem.state.termsAccepted).to.not.equal(null);
          expect(elem.state.authenticated).to.equal(true);

          //check we aren't seeing the terms
          var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-overlay');
          expect(termsElems.length).to.equal(0);

          //because its fake we are showing the login page ...
          var form = TestUtils.findRenderedDOMComponentWithClass(elem, 'login-simpleform');
          expect(form).to.be.ok;

          apiStub.restore();
        });
      });
    });
  });
});
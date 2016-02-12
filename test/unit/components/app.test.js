/* global chai */
/* global sinon */
/* global describe */
/* global it */

var React = require('react');
var _ = require('lodash');
var TestUtils = require('react-addons-test-utils');

// Need to add this line as app.js includes config
// which errors if window.config does not exist
window.config = {};

var App = require('../../../app/components/app/app.js').AppComponent;
var api = require('../../../app/core/api');
var personUtils = require('../../../app/core/personutils');
var mock = require('../../../mock');

var expect = chai.expect;

describe('App',  () => {
  // We must remember to require the base module when mocking dependencies,
  // otherwise dependencies mocked will be bound to the wrong scope!
  
  api.log = sinon.stub();

  var childContext = {
    route: {
      log: sinon.stub(),
      api: mock.patchApi(api),
      personUtils: personUtils,
      DEBUG: false,
      trackMetric: sinon.stub(),
      config: {}
    },
    location: {
      pathname: '/'
    }
  };

  describe('isPatientVisibleInNavbar', () => {
    it('should return true when page is /patients/454/data', () => {
      var context = _.assign({}, childContext, {location: { pathname: '/patients/25' }});
      var elem = TestUtils.renderIntoDocument(<App {...context} />);
      expect(elem).to.be.ok;
      expect(elem.isPatientVisibleInNavbar()).to.be.true;
    });

    it('should return false when page is /patients', () => {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem).to.be.ok;
      
      elem.setState({page: '/patients'});
      expect(elem.isPatientVisibleInNavbar()).to.be.false;
    });

    it('should return false when page is /profile', () => {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem).to.be.ok;
      
      elem.setState({page: '/profile'});
      expect(elem.isPatientVisibleInNavbar()).to.be.false;
    });

    it('should return false when page is /foo', () => {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem).to.be.ok;
      
      elem.setState({page: '/foo'});
      expect(elem.isPatientVisibleInNavbar()).to.be.false;
    });
  });

  describe('render', () => {
    it('should render without problems',  () => {
      console.error = sinon.stub();
      console.error = sinon.stub();
      
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
      expect(console.error.callCount).to.equal(0);
      var app = TestUtils.findRenderedDOMComponentWithClass(elem, 'app');
      expect(app).to.be.ok;
    });

    it('should render footer',  () => {
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
      expect(footer).to.be.ok;
    });

    it('should not render a version element when version not set in config',  () => {
      var props = _.clone(childContext);
      props.route.config = { VERSION : null };
      var elem = TestUtils.renderIntoDocument(<App {...props} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(0);
    });

    it('should render version when version present in config',  () => {
      var props = _.clone(childContext);
      props.route.config = { VERSION : 1.4 };
      var elem = TestUtils.renderIntoDocument(<App {...props} />);
      var elem = TestUtils.renderIntoDocument(<App {...childContext} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(1);
    });
  });

  describe('terms', () => {

    describe('overlay', () => {
      //override
      var utils = require('../../../app/core/utils');
      var stub = sinon.stub(utils, 'isChrome');
      stub.returns(true);

      it('should render when user has not accepted terms but is logged in', () => {
        var props = _.assign({}, childContext, { authenticated: true , fetchingUser: false, termsAccepted: null});
        var elem = TestUtils.renderIntoDocument(<App {...props}/>);

        expect(elem.props.authenticated).to.equal(true);
        expect(elem.props.fetchingUser).to.equal(false);
        expect(elem.props.termsAccepted).to.equal(null);

        var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-overlay');
        expect(termsElems.length).to.not.equal(0);
      });
      it('should NOT render when user has acccepted terms and is logged in', () => {
        var acceptDate = new Date().toISOString();
        var props = _.assign({}, childContext, { authenticated: true, termsAccepted: acceptDate, fetchingUser: false });
        var elem = TestUtils.renderIntoDocument(<App {...props}/>);
        

        expect(elem.props.authenticated).to.equal(true);
        expect(elem.props.fetchingUser).to.equal(false);
        expect(elem.props.termsAccepted).to.equal(acceptDate);

        var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-overlay');
        expect(termsElems.length).to.equal(0);
      });
    });
  });
});
/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-dom/test-utils');
var expect = chai.expect;
var BrowserRouter = require('react-router-dom').BrowserRouter;

var LoginNav = require('../../../app/components/loginnav');

describe('LoginNav', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginNav).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(LoginNav, props);
      var wrapper = React.createElement(BrowserRouter, null, elem);
      var render = TestUtils.renderIntoDocument(wrapper);
      expect(render).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});

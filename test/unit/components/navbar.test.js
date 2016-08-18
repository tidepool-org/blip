/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Navbar = require('../../../app/components/navbar');

describe('Navbar', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Navbar).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props present', function () {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Navbar, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
      expect(render).to.be.ok;
    });
  });
});
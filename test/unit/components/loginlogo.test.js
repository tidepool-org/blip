/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var LoginLogo = require('../../../app/components/loginlogo');

describe('LoginLogo', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginLogo).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(LoginLogo, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});
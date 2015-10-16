
/* global chai */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var BrowserWarningOverlay = require('../../../app/components/browserwarningoverlay');

describe('BrowserWarningOverlay', function () {

  it('should be exposed as a module and be of type function', function() {
    expect(BrowserWarningOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var elem = TestUtils.renderIntoDocument(<BrowserWarningOverlay/>);
      expect(elem).to.be.ok;
    });
  });
});
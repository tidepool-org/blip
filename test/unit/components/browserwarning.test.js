/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var BrowserWarning = require('../../../app/components/browserwarning');

describe('BrowserWarning', function () {

  it('should be exposed as a module and be of type function', function() {
    expect(BrowserWarning).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var elem = TestUtils.renderIntoDocument(<BrowserWarning/>);
      expect(elem).to.be.ok;
    });
  });
});
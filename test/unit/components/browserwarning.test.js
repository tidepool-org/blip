/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

import BrowserWarning from '../../../app/components/browserwarning';

describe('BrowserWarning', function () {
  it('should be a function', function() {
    expect(BrowserWarning).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var props = {
        trackMetric: function() {}
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      expect(elem).to.be.ok;
    });
  });
});
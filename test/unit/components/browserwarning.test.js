/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
import BrowserWarning from '../../../app/components/browserwarning';

var expect = chai.expect;

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

    it('should fire metric when mounted/rendered', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      expect(elem).to.be.ok;
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Chrome Required - Screen Displayed')).to.be.true;
    });
  });
});

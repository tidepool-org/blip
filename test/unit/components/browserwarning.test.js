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

    it('should fire metric when google play clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      var playButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'playstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Chrome Required - Screen Displayed')).to.be.true;
      TestUtils.Simulate.click(playButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked Android')).to.be.true;
    });


    it('should fire metric when apple play store clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      var appStoreButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'appstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Chrome Required - Screen Displayed')).to.be.true;
      TestUtils.Simulate.click(appStoreButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked iOS')).to.be.true;
    });
  });
});
/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-dom/test-utils');
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
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
    });

    it('should fire metric when google chrome clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      var chromeIcon = TestUtils.findRenderedDOMComponentWithClass(elem, 'browser-warning-chrome-image');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      TestUtils.Simulate.click(chromeIcon);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('Clicked Download Chrome')).to.be.true;
    });

    it('should fire metric when Chrome clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      var chromeLink = TestUtils.findRenderedDOMComponentWithClass(elem, 'chromeBrowserLink');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      TestUtils.Simulate.click(chromeLink);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('Clicked Download Chrome')).to.be.true;
    });

    it('should fire metric when Edge clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      var edgeLink = TestUtils.findRenderedDOMComponentWithClass(elem, 'edgeBrowserLink');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      TestUtils.Simulate.click(edgeLink);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('Clicked Download Edge')).to.be.true;
    });

    it('should fire metric when google play clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = TestUtils.renderIntoDocument(browserWarningElem);
      var playButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'playstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
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
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      TestUtils.Simulate.click(appStoreButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked iOS')).to.be.true;
    });
  });
});
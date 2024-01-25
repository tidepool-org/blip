/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;

import { mount } from 'enzyme';
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
      var elem = mount(browserWarningElem);
      expect(elem).to.be.ok;
    });

    it('should fire metric when mounted/rendered', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = mount(browserWarningElem);
      expect(elem).to.be.ok;
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
    });

    it('should fire metric when google chrome clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = mount(browserWarningElem);
      var chromeIcon = elem.find('.browser-warning-chrome-image');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      chromeIcon.simulate('click')
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('Clicked Download Chrome')).to.be.true;
    });

    it('should fire metric when Chrome clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = mount(browserWarningElem);
      var chromeLink = elem.find('.chromeBrowserLink');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      chromeLink.simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('Clicked Download Chrome')).to.be.true;
    });

    it('should fire metric when Edge clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = mount(browserWarningElem);
      var edgeLink = elem.find('.edgeBrowserLink');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      edgeLink.simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('Clicked Download Edge')).to.be.true;
    });

    it('should fire metric when google play clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = mount(browserWarningElem);
      var playButton = elem.find('.playstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      playButton.simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked Android')).to.be.true;
    });


    it('should fire metric when apple play store clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = mount(browserWarningElem);
      var appStoreButton = elem.find('.appstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).to.be.true;
      appStoreButton.simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked iOS')).to.be.true;
    });
  });
});

/* global describe */
/* global sinon */
/* global it */

var React = require('react');
import { render, fireEvent } from '@testing-library/react';
import BrowserWarning from '../../../app/components/browserwarning';
import utils from '../../../app/core/utils';

describe('BrowserWarning', function () {
  it('should be a function', function() {
    expect(typeof BrowserWarning).toBe('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var props = {
        trackMetric: function() {}
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = render(browserWarningElem);
      expect(elem.container.firstChild).not.toBeNull();
    });

    it('should fire metric when mounted/rendered', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = render(browserWarningElem);
      expect(elem.container.firstChild).not.toBeNull();
      expect(props.trackMetric.callCount).toBe(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).toBe(true);
    });

    it('should fire metric when google chrome clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = render(browserWarningElem);
      var chromeIcon = elem.container.querySelector('.browser-warning-chrome-image');
      expect(props.trackMetric.callCount).toBe(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).toBe(true);
      expect(chromeIcon).not.toBeNull();
      fireEvent.click(chromeIcon);
      expect(props.trackMetric.callCount).toBe(2);
      expect(props.trackMetric.calledWith('Clicked Download Chrome')).toBe(true);
    });

    it('should fire metric when Chrome clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = render(browserWarningElem);
      var chromeLink = elem.container.querySelector('.chromeBrowserLink');
      expect(props.trackMetric.callCount).toBe(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).toBe(true);
      expect(chromeLink).not.toBeNull();
      fireEvent.click(chromeLink);
      expect(props.trackMetric.callCount).toBe(2);
      expect(props.trackMetric.calledWith('Clicked Download Chrome')).toBe(true);
    });

    it('should render the mobile app link for a mobile user agent when showMobileAppLink is set', function() {
      var getMobilePlatform = jest.spyOn(utils, 'getMobilePlatform').mockReturnValue('android');
      var elem = render(React.createElement(BrowserWarning, {
        trackMetric: sinon.stub(),
        showMobileAppLink: true,
      }));
      expect(elem.container.querySelector('#mobile-app-link')).not.toBeNull();
      getMobilePlatform.mockRestore();
    });

    it('should not render the mobile app link when showMobileAppLink is not set, even on mobile', function() {
      var getMobilePlatform = jest.spyOn(utils, 'getMobilePlatform').mockReturnValue('android');
      var elem = render(React.createElement(BrowserWarning, {
        trackMetric: sinon.stub(),
      }));
      expect(elem.container.querySelector('#mobile-app-link')).toBeNull();
      getMobilePlatform.mockRestore();
    });

    it('should not render the mobile app link on a desktop user agent, even when showMobileAppLink is set', function() {
      var getMobilePlatform = jest.spyOn(utils, 'getMobilePlatform').mockReturnValue(null);
      var elem = render(React.createElement(BrowserWarning, {
        trackMetric: sinon.stub(),
        showMobileAppLink: true,
      }));
      expect(elem.container.querySelector('#mobile-app-link')).toBeNull();
      getMobilePlatform.mockRestore();
    });

    it('should fire metric when Edge clicked', function() {
      var props = {
        trackMetric: sinon.stub()
      };
      var browserWarningElem = React.createElement(BrowserWarning, props);
      var elem = render(browserWarningElem);
      var edgeLink = elem.container.querySelector('.edgeBrowserLink');
      expect(props.trackMetric.callCount).toBe(1);
      expect(props.trackMetric.calledWith('Unsupported Browser - Screen Displayed')).toBe(true);
      expect(edgeLink).not.toBeNull();
      fireEvent.click(edgeLink);
      expect(props.trackMetric.callCount).toBe(2);
      expect(props.trackMetric.calledWith('Clicked Download Edge')).toBe(true);
    });
  });
});

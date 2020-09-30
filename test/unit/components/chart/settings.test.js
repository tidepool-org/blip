/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */
/* global afterEach */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import _ from 'lodash';
import Settings from '../../../../app/components/chart/settings';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { createRenderer } from 'react-test-renderer/shallow';

const expect = chai.expect;
const renderer = createRenderer();

describe('Settings', function () {
  const bgPrefs = {
    bgClasses: {
      'very-low': {
        boundary: 60
      },
      'low': {
        boundary: 80
      },
      'target': {
        boundary: 180
      },
      'high': {
        boundary: 200
      },
      'very-high': {
        boundary: 300
      }
    },
    bgUnits: MGDL_UNITS
  };

  const baseProps = {
    chartPrefs: {
      settings: {
        animas: {
          basal1: true,
        },
      },
    },
    data: {
      bgPrefs,
      timePrefs: {
        timezoneAware: false,
        timezoneName: 'US/Pacific',
      },
    },
    printReady: false,
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    pdf: {},
  };

  afterEach(() => {
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
  });

  describe('render', function() {
    it('should render without problems', function () {
      var props = {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickRefresh: function() {},
        onClickNoDataRefresh: function() {},
        onSwitchToBasics: function() {},
        onSwitchToDaily: function() {},
        onSwitchToTrends: function() {},
        onSwitchToSettings: function() {},
        onSwitchToBgLog: function() {},
        trackMetric: function() {},
        uploadUrl: '',
        pdf: {
          url: 'blobURL',
        },
      };
      var settingsElem = React.createElement(Settings, props);
      var elem = renderer.render(settingsElem);
      var result = renderer.getRenderOutput();
      expect(result).to.be.ok;
    });

    it('should render with missing data message when no pumpSettings data supplied', function () {
      var props = {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToBgLog: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: '',
        pdf: {
          url: 'blobURL',
        },
      };
      var settingsElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(settingsElem);
      expect(elem).to.be.ok;
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message');
      expect(x).to.be.ok;
    });

    it('should have a refresh button which should call onClickRefresh when clicked', function () {
      var props = {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToBgLog: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: '',
        pdf: {
          url: 'blobURL',
        },
      };
      var settingsElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(settingsElem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'btn-refresh');

      expect(props.onClickRefresh.callCount).to.equal(0);
      TestUtils.Simulate.click(refreshButton);
      expect(props.onClickRefresh.callCount).to.equal(1);
    });

    it('should have a print button and icon and call onClickPrint when clicked', function () {
      var props = {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickPrint: sinon.spy(),
      };

      var settingsElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(settingsElem);
      var printLink = TestUtils.findRenderedDOMComponentWithClass(elem, ['patient-data-subnav-active', 'printview-print-icon']);
      var printIcon = TestUtils.findRenderedDOMComponentWithClass(elem, 'print-icon');

      expect(printLink).to.be.ok;
      expect(printIcon).to.be.ok;

      expect(props.onClickPrint.callCount).to.equal(0);
      TestUtils.Simulate.click(printLink);
      expect(props.onClickPrint.callCount).to.equal(1);
    });
  });

  describe('toggleSettingsSection', () => {
    it('should update the toggle state of a section in chartPrefs state and set touched state to `true`', () => {
      const wrapper = shallow(<Settings.WrappedComponent {...baseProps} />);
      const instance = wrapper.instance();
      expect(instance.props.chartPrefs.settings.animas.basal1).to.be.true;
      expect(instance.props.chartPrefs.settings.touched).to.be.undefined;
      instance.toggleSettingsSection('animas', 'basal1');
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(
        baseProps.updateChartPrefs,
        {
          ...baseProps.chartPrefs,
          settings: {
            animas: { basal1: false},
            touched: true,
          },
        },
        false
      );
    });
  });

  describe('handleCopySettingsClicked', () => {
    it('should track metric with source param when called', () => {
      const wrapper = shallow(<Settings.WrappedComponent {...baseProps} />);
      const instance = wrapper.instance();
      instance.handleCopySettingsClicked();
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Clicked Copy Settings', { source: 'Device Settings' });
    });
  });
});

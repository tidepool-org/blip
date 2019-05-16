/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var _ = require('lodash');
var expect = chai.expect;

const renderer = TestUtils.createRenderer();

import Settings from '../../../../app/components/chart/settings';
import { MGDL_UNITS } from '../../../../app/core/constants';

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

  describe('render', function() {
    it('should render without problems', function () {
      var props = {
        bgPrefs: {},
        chartPrefs: {},
        timePrefs: {},
        patientData: {
          grouped: { pumpSettings: [{ source: 'animas' }]}
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
        bgPrefs: {},
        chartPrefs: {},
        patientData: {
          grouped: { foo: 'bar' }
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
        bgPrefs: {},
        chartPrefs: {},
        patientData: {
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

    it('should have a disabled print button and spinner when a pdf is not ready to print', function () {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        printReady: false,
        pdf: {},
      };

      var dailyElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);

      var printLink = TestUtils.findRenderedDOMComponentWithClass(elem, ['patient-data-subnav-disabled', 'printview-print-icon']);
      var spinner = TestUtils.findRenderedDOMComponentWithClass(elem, 'print-loading-spinner');
    });

    it('should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked', function () {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        printReady: true,
        pdf: {
          url: 'blobURL',
        },
        onClickPrint: sinon.spy(),
      };

      var dailyElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      var printLink = TestUtils.findRenderedDOMComponentWithClass(elem, ['patient-data-subnav-active', 'printview-print-icon']);
      var printIcon = TestUtils.findRenderedDOMComponentWithClass(elem, 'print-icon');

      expect(props.onClickPrint.callCount).to.equal(0);
      TestUtils.Simulate.click(printLink);
      expect(props.onClickPrint.callCount).to.equal(1);
    });
  });
});

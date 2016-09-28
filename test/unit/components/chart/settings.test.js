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

import Settings from '../../../../app/components/chart/settings';

describe('Settings', function () {
  before(() => {
    Settings.__Rewire__('SettingsChart', React.createClass({
      render: function() {
        return (<div className='fake-settings-view'></div>);
      }
    }));
  });

  after(() => {
    Settings.__ResetDependency__('SettingsChart');
  });

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
        onSwitchToBasics: function() {},
        onSwitchToDaily: function() {},
        onSwitchToModal: function() {},
        onSwitchToSettings: function() {},
        onSwitchToWeekly: function() {},
        trackMetric: function() {},
        uploadUrl: ''
      };
      var settingsElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(settingsElem);
      expect(elem).to.be.ok;
    });

    it('should render with missing data message when no pumpSettings data supplied', function () {
      var props = {
        bgPrefs: {},
        chartPrefs: {},
        patientData: {
          grouped: { foo: 'bar' }
        },
        onClickRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToWeekly: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: ''
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
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToWeekly: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: ''
      };
      var settingsElem = React.createElement(Settings, props);
      var elem = TestUtils.renderIntoDocument(settingsElem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'btn-refresh');

      expect(props.onClickRefresh.callCount).to.equal(0);
      TestUtils.Simulate.click(refreshButton);
      expect(props.onClickRefresh.callCount).to.equal(1);
    });
  });
});
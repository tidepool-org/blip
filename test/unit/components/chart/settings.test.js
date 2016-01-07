/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var _ = require('lodash');
var expect = chai.expect;
var rewire = require('rewire');
var rewireModule = require('../../../utils/rewireModule');

describe('Settings', function () {
  var Settings = rewire('../../../../app/components/chart/settings');

  rewireModule(Settings, {
    SettingsChart: React.createClass({
      render: function() {
        return (<div className='fake-settings-view'></div>);
      }
    })
  });

  describe('render', function() {
    it('should console.error when missing required props', function () {
      console.error = sinon.stub();
      var settingsElem = React.createElement(Settings, {});
      var elem = TestUtils.renderIntoDocument(settingsElem);

      expect(console.error.calledWith('Warning: Failed propType: Required prop `bgPrefs` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `chartPrefs` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patientData` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onClickRefresh` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSwitchToDaily` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSwitchToSettings` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Settings`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `uploadUrl` was not specified in `Settings`.')).to.equal(true);
    });

    it('should render without problems', function () {
      var props = {
        bgPrefs: {},
        chartPrefs: {},
        patientData: {
          grouped: { pumpSettings: 'bar' }
        },
        onClickRefresh: function() {},
        onSwitchToDaily: function() {},
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
      expect(x.props.children.length).to.equal(3);
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
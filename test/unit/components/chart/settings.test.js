/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var _ = require('lodash');
var expect = chai.expect;
var Settings = require('../../../../app/components/chart/settings');

describe('Settings', function () {
  describe('render', function() {
    it('should console.warn when missing required props', function () {
      console.warn = sinon.spy();
      var settingsElem = React.createElement(Settings, {});
      var elem = TestUtils.renderIntoDocument(settingsElem);
      expect(console.warn.calledWith('Warning: Required prop `bgPrefs` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `chartPrefs` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `patientData` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onClickRefresh` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSwitchToDaily` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSwitchToSettings` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `Settings`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `uploadUrl` was not specified in `Settings`.')).to.equal(true);
    });

    it('should render without problems', function () {
      var props = {
        bgPrefs: {},
        chartPrefs: {},
        patientData: {
          grouped: { foo: 'bar' }
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

    it('should render with missing data message when no grouped data supplied', function () {
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
// var root = '../../../../'; // back to blip root directory

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var Settings = require('../../../../app/components/chart/settings');

describe('Settings', function () {
  it('should be a function', function() {
    expect(Settings).to.be.a('function');
  });

  it('is a ReactElement', function () {
    expect(TestUtils.isElement(<Settings/>)).to.equal(true);
  });

  describe('render', function() {
    it('should console.warn with missing required props', function () {
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
      expect(elem).to.be.ok
    });
  });
});
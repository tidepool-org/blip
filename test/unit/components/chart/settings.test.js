// var root = '../../../../'; // back to blip root directory

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var _ = require('lodash');
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
      expect(elem).to.be.ok
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message');
      expect(x).to.be.ok;
      expect(x.props.children.length).to.equal(3);
    });

    /**
     * I want to test the alternative now, what happens when data is present, however...
     *
     * 
     * Been wrestling with this test for a while. Hitting a brick wall trying to understand
     * why this is failing. Need to defer until when I can connect with Jana again
     *
     * Error message is:
     *
     * ✖ should render with grouped data
        PhantomJS 1.9.8 (Linux)
        TypeError: 'undefined' is not an object (evaluating 'basalUtil.scheduleTotal')

     * Something to do with tideline and loading a chart, possibly to do with the fixtures data
     * I have created for this file.
     *
     * Previously I tried settings props to:
     *
     * var props = {
        bgPrefs: {},
        chartPrefs: {},
        patientData: {
          "grouped": {
            "basal": [],
            "bolus": [],
            "cbg": [],
            "fill": [],
            "message": [],
            "settings": [],
            "smbg": [],
            "wizard": []
          }
        },
        onClickRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToWeekly: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: ''
      };
     * 
     */
    // it('should render with grouped data', function () {
    //   var props = _.extend(
    //     propsData, 
    //     {
    //       onClickRefresh: sinon.spy(),
    //       onSwitchToDaily: sinon.spy(),
    //       onSwitchToSettings: sinon.spy(),
    //       onSwitchToWeekly: sinon.spy(),
    //       trackMetric: sinon.spy(),
    //       uploadUrl: ''
    //     }
    //   );
    //   var settingsElem = React.createElement(Settings, props);
    //   var elem = TestUtils.renderIntoDocument(settingsElem);
    //   expect(elem).to.be.ok
    //   var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message');
    //   expect(x).to.be.ok;

    //   console.log(x.getDOMNode());
    // });
  });
});
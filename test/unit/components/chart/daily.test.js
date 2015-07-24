/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var _ = require('lodash');
var expect = chai.expect;
var rewire = require('rewire');
var rewireModule = require('../../../utils/rewireModule');

require('tideline/css/tideline.less');
require('../../../../app/core/less/fonts.less');
require('../../../../app/style.less');

describe('Daily', function () {
  var Daily = rewire('../../../../app/components/chart/daily');

  rewireModule(Daily, { 
    DailyChart: React.createClass({
      render: function() {
        return (<div className='fake-daily-chart'></div>);
      }
    })
  });

  describe('render', function() {
    it('should render without problems', function () {
      var props = {
        bgPrefs: {
          'bgClasses': {
            'very-low': {
              'boundary': 60
            },
            'low': {
              'boundary': 80
            },
            'target': {
              'boundary': 180
            },
            'high': {
              'boundary': 200
            },
            'very-high': {
              'boundary': 300
            }
          },
          'bgUnits': 'mg/dL'
        },
        chartPrefs: {
          'modal': {
            'activeDays': {
              'monday': true,
              'tuesday': true,
              'wednesday': true,
              'thursday': true,
              'friday': true,
              'saturday': true,
              'sunday': true
            },
            'activeDomain': '2 weeks',
            'extentSize': 14,
            'boxOverlay': true,
            'grouped': true,
            'showingLines': false
          },
          'timePrefs': {
            'timezoneAware': false,
            'timezoneName': 'US/Pacific'
          }
        },
        imageBaseUrl: 'undefined/tideline',
        initialDateTimeLocation: '2014-03-13T12:00:00.000Z',
        patientData: {
          grouped: { foo: 'bar' }
        },
        onClickRefresh: function() {},
        onCreateMessage: function() {},
        onShowMessageThread: function() {},
        onSwitchToDaily: function() {},
        onSwitchToSettings: function() {},
        onSwitchToWeekly: function() {},
        updateChartPrefs: function() {},
        updateDateTimeLocation: function() {},
      };
      var dailyElem = React.createElement(Daily, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;
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
      var dailyElem = React.createElement(Daily, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'btn-refresh');

      expect(props.onClickRefresh.callCount).to.equal(0);
      TestUtils.Simulate.click(refreshButton);
      expect(props.onClickRefresh.callCount).to.equal(1);
    });
  });
});
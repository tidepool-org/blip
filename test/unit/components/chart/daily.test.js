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

import Daily from '../../../../app/components/chart/daily';

require('tideline/css/tideline.less');
require('../../../../app/core/less/fonts.less');
require('../../../../app/style.less');

describe('Daily', function () {

  before(() => {
    Daily.__Rewire__('DailyChart', React.createClass({
      render: function() {
        return (<div className='fake-daily-chart'></div>);
      }
    }));
  });

  after(() => {
    Daily.__ResetDependency__('DailyChart');
  });

  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {
        bgPrefs: {
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
          bgUnits: 'mg/dL'
        },
        chartPrefs: {
          trends: {
            activeDays: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true
            },
            activeDomain: '2 weeks',
            extentSize: 14,
            boxOverlay: true,
            grouped: true,
            showingLines: false
          }
        },
        timePrefs: {
          timezoneAware: false,
          timezoneName: 'US/Pacific'
        },
        initialDateTimeLocation: '2014-03-13T12:00:00.000Z',
        patientData: {
          grouped: { foo: 'bar' }
        },
        onClickRefresh: function() {},
        onCreateMessage: function() {},
        onShowMessageThread: function() {},
        onSwitchToBasics: function() {},
        onSwitchToDaily: function() {},
        onSwitchToPrint: function() {},
        onSwitchToSettings: function() {},
        onSwitchToWeekly: function() {},
        updateDatetimeLocation: function() {},
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
      };
      var dailyElem = React.createElement(Daily, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should have a refresh button which should call onClickRefresh when clicked', function () {
      var props = {
        bgPrefs: {},
        chartPrefs: {},
        timePrefs: {},
        initialDateTimeLocation: 'foo',
        patientData: {
        },
        onClickRefresh: sinon.spy(),
        onCreateMessage: function() {},
        onShowMessageThread: function() {},
        onSwitchToBasics: function() {},
        onSwitchToDaily: function() {},
        onSwitchToSettings: function() {},
        onSwitchToWeekly: function() {},
        updateDatetimeLocation: function() {}
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

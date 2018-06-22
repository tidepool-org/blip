/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global afterEach */
/* global after */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var _ = require('lodash');
var expect = chai.expect;

import { shallow, mount } from 'enzyme';
import Daily from '../../../../app/components/chart/daily';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';

const { Loader } = vizComponents;

require('tideline/css/tideline.less');
require('../../../../app/core/less/fonts.less');
require('../../../../app/style.less');

describe('Daily', () => {
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
    bgPrefs,
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
    pdf: {},
    loading: false,
    onClickRefresh: () => {},
    onCreateMessage: () => {},
    onShowMessageThread: () => {},
    onSwitchToBasics: () => {},
    onSwitchToDaily: () => {},
    onClickPrint: () => {},
    onSwitchToSettings: () => {},
    onSwitchToWeekly: () => {},
    onSwitchToTrends: () => {},
    trackMetric: () => {},
    onUpdateChartDateRange: sinon.stub(),
    updateDatetimeLocation: sinon.stub(),
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

  before(() => {
    Daily.__Rewire__('DailyChart', React.createClass({
      render: () => {
        return (<div className='fake-daily-chart'></div>);
      }
    }));
  });

  after(() => {
    Daily.__ResetDependency__('DailyChart');
  });

  afterEach(() => {
    baseProps.onUpdateChartDateRange.reset();
    baseProps.updateDatetimeLocation.reset();
  });

  describe('render', () => {
    it('should render without problems', () => {
      console.error = sinon.stub();
      var dailyElem = React.createElement(Daily, baseProps);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should have a refresh button which should call onClickRefresh when clicked', () => {
      var props = {
        bgPrefs,
        chartPrefs: {},
        timePrefs: {},
        initialDateTimeLocation: 'foo',
        patientData: {},
        pdf: {},
        onClickRefresh: sinon.spy(),
        onCreateMessage: () => {},
        onShowMessageThread: () => {},
        onSwitchToBasics: () => {},
        onSwitchToDaily: () => {},
        onSwitchToSettings: () => {},
        onSwitchToWeekly: () => {},
        updateDatetimeLocation: () => {},
        trackMetric: () => {},
      };
      var dailyElem = React.createElement(Daily, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'btn-refresh');

      expect(props.onClickRefresh.callCount).to.equal(0);
      TestUtils.Simulate.click(refreshButton);
      expect(props.onClickRefresh.callCount).to.equal(1);
    });

    it('should have a disabled print button and spinner when a pdf is not ready to print', () => {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        printReady: false,
        pdf: {},
        trackMetric: () => {},
      };

      var dailyElem = React.createElement(Daily, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);

      var printLink = TestUtils.findRenderedDOMComponentWithClass(elem, ['patient-data-subnav-disabled', 'printview-print-icon']);
      var spinner = TestUtils.findRenderedDOMComponentWithClass(elem, 'print-loading-spinner');
    });

    it('should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked', () => {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        printReady: true,
        pdf: {
          url: 'blobURL',
        },
        onClickPrint: sinon.spy(),
        trackMetric: () => {},
      };

      var dailyElem = React.createElement(Daily, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      var printLink = TestUtils.findRenderedDOMComponentWithClass(elem, ['patient-data-subnav-active', 'printview-print-icon']);
      var printIcon = TestUtils.findRenderedDOMComponentWithClass(elem, 'print-icon');

      expect(props.onClickPrint.callCount).to.equal(0);
      TestUtils.Simulate.click(printLink);
      expect(props.onClickPrint.callCount).to.equal(1);
    });

    it('should show a loader when loading prop is true', () => {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        printReady: true,
        pdf: {
          url: 'blobURL',
        },
        onClickPrint: sinon.spy(),
        loading: false,
        trackMetric: () => {},
      };

      const wrapper = shallow(<Daily {...props} />);
      const loader = () => wrapper.find(Loader);

      expect(loader().length).to.equal(1);
      expect(loader().props().show).to.be.false;

      wrapper.setProps({ loading: true });
      expect(loader().props().show).to.be.true;
    });
  });

  describe('handleDatetimeLocationChange', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<Daily {...baseProps} />);
      instance = wrapper.instance();
    });

    it('should set the `datetimeLocation` state', () => {
      expect(wrapper.state().datetimeLocation).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T05:00:00.000Z',
        '2018-01-16T05:00:00.000Z',
      ]);

      expect(wrapper.state().datetimeLocation).to.equal('2018-01-16T05:00:00.000Z');
    });

    it('should set the `title` state', () => {
      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-01-15T05:00:00.000Z',
        '2018-01-16T05:00:00.000Z',
      ]);

      expect(wrapper.state().title).to.equal('Tue, Jan 16, 2018');
    });

    it('should call the `updateDatetimeLocation` prop method', () => {
      sinon.assert.callCount(baseProps.updateDatetimeLocation, 0);

      instance.handleDatetimeLocationChange([
        '2018-01-15T05:00:00.000Z',
        '2018-01-16T05:00:00.000Z',
      ]);

      sinon.assert.callCount(baseProps.updateDatetimeLocation, 1);
      sinon.assert.calledWith(baseProps.updateDatetimeLocation, '2018-01-16T05:00:00.000Z');
    });

    it('should set a debounced call of the `onUpdateChartDateRange` prop method', () => {
      sinon.spy(_, 'debounce');
      sinon.assert.callCount(_.debounce, 0);

      expect(wrapper.state().debouncedDateRangeUpdate).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T05:00:00.000Z',
        '2018-01-16T05:00:00.000Z',
      ]);

      sinon.assert.callCount(_.debounce, 1);
      sinon.assert.calledWith(_.debounce, baseProps.onUpdateChartDateRange);
      expect(wrapper.state().debouncedDateRangeUpdate).to.be.a.function;

      _.debounce.restore();
    });
  });
});

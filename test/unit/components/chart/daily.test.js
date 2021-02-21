/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global afterEach */
/* global after */

var React = require('react');
var _ = require('lodash');
var expect = chai.expect;

import { shallow, mount } from 'enzyme';
import { translate } from 'react-i18next';

import i18next from '../../../../app/core/language';
import Daily from '../../../../app/components/chart/daily';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';
import createReactClass from 'create-react-class';

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
    addingData: { inProgress: false, complete: false },
    chartPrefs: {
      daily: {},
    },
    data: {
      bgPrefs,
      timePrefs: {
        timezoneAware: false,
        timezoneName: 'US/Pacific',
      },
    },
    initialDateTimeLocation: '2014-03-13T12:00:00.000Z',
    mostRecentDatetimeLocation: '2014-03-13T12:00:00.000Z',
    loading: false,
    onClickRefresh: () => {},
    onClickPrint: sinon.stub(),
    onCreateMessage: () => {},
    onShowMessageThread: () => {},
    onSwitchToBasics: () => {},
    onSwitchToDaily: () => {},
    onSwitchToSettings: () => {},
    onSwitchToBgLog: () => {},
    onSwitchToTrends: () => {},
    trackMetric: () => {},
    onUpdateChartDateRange: sinon.stub(),
    patient: {
      profile: {
        fullName: 'Jane Doe'
      },
      permissions: {
        note: {},
        view: {}
      }
    },
    pdf: {},
    queryDataCount: 1,
    stats: [],
    t: i18next.t.bind(i18next),
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    updatingDatum: { inProgress: false, complete: false },
  };

  let wrapper;
  let instance;

  beforeEach(() => {
    wrapper = shallow(<Daily.WrappedComponent {...baseProps} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    baseProps.onClickPrint.reset();
    baseProps.onUpdateChartDateRange.reset();
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
  });

  describe('render', () => {
    before(() => {
      Daily.__Rewire__('DailyChart', translate()(createReactClass({
        rerenderChart: sinon.stub(),
        render: () => <div className='fake-daily-chart' />,
      })));
    });

    beforeEach(() => {
      wrapper = mount(<Daily {...baseProps} />);
    });

    after(() => {
      Daily.__ResetDependency__('DailyChart');
    });

    it('should have a refresh button which should call onClickRefresh when clicked', () => {
      var props = _.assign({}, baseProps, {
        onClickRefresh: sinon.spy(),
      });

      wrapper.setProps(props);

      var refreshButton = wrapper.find('.btn-refresh');

      sinon.assert.callCount(props.onClickRefresh, 0);
      refreshButton.simulate('click');
      sinon.assert.callCount(props.onClickRefresh, 1);
    });

    it('should have a print button and icon and call onClickPrint when clicked', () => {
      var printLink = wrapper.find('.printview-print-icon').hostNodes();

      sinon.assert.callCount(baseProps.onClickPrint, 0);
      printLink.simulate('click');
      sinon.assert.callCount(baseProps.onClickPrint, 1);
    });

    it('should show a loader when loading prop is true and the daily chart is rendered', () => {
      var dayDataReadyProps = _.assign({}, baseProps, {
        loading: false,
        data: {
          query: { chartType: 'daily'},
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
      });

      wrapper.setProps(dayDataReadyProps);

      const loader = () => wrapper.find(Loader);

      expect(loader().length).to.equal(1);
      expect(loader().props().show).to.be.false;

      wrapper.setProps({ loading: true });
      expect(loader().props().show).to.be.true;
    });

    it('should only render the daily chart when the daily data is ready', () => {
      var dayDataReadyProps = _.assign({}, baseProps, {
        loading: false,
        data: {
          query: { chartType: 'daily'},
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
      });

      const chart = () => wrapper.find('.fake-daily-chart');

      expect(chart().length).to.equal(0);

      wrapper.setProps(dayDataReadyProps);
      expect(chart().length).to.equal(1);
    });

    it('should render the bg toggle', () => {
      const toggle = wrapper.find('BgSourceToggle');
      expect(toggle.length).to.equal(1);
    });

    it('should render the stats', () => {
      const stats = wrapper.find('Stats');
      expect(stats.length).to.equal(1);
    });
  });

  describe('handleDatetimeLocationChange', () => {
    const endpoints = [
      {
        start: new Date('2018-01-15T00:00:00.000Z'),
        center: new Date('2018-01-15T12:00:00.000Z'),
        end: new Date('2018-01-16T00:00:00.000Z'),
      },
      '2018-01-16T05:00:00.000Z',
    ];

    it('should set the `title` state', () => {
      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange(endpoints);

      expect(wrapper.state().title).to.equal('Tue, Jan 16, 2018');
    });

    it('should set a debounced call of the `onUpdateChartDateRange` prop method', () => {
      sinon.spy(_, 'debounce');
      sinon.assert.callCount(_.debounce, 0);

      expect(wrapper.state().debouncedDateRangeUpdate).to.be.undefined;

      instance.handleDatetimeLocationChange(endpoints);

      sinon.assert.callCount(_.debounce, 1);
      sinon.assert.calledWith(_.debounce, baseProps.onUpdateChartDateRange);
      expect(wrapper.state().debouncedDateRangeUpdate).to.be.a('function');

      _.debounce.restore();
    });
  });

  describe('toggleBgDataSource', () => {
    it('should track metric when toggled', () => {
      const instance = wrapper.instance();
      instance.toggleBgDataSource(null, 'cbg');
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Daily Click to CGM');

      instance.toggleBgDataSource(null, 'smbg');
      sinon.assert.callCount(baseProps.trackMetric, 2);
      sinon.assert.calledWith(baseProps.trackMetric, 'Daily Click to BGM');
    });

    it('should call the `updateChartPrefs` handler to update the bgSource', () => {
      const instance = wrapper.instance();
      instance.toggleBgDataSource(null, 'cbg');

      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        daily: { bgSource: 'cbg' },
      });

      instance.toggleBgDataSource(null, 'smbg');

      sinon.assert.callCount(baseProps.updateChartPrefs, 2);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        daily: { bgSource: 'smbg' },
      });
    });
  });
});

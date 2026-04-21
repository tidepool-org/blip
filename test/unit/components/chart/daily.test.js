/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global afterEach */
/* global after */

var React = require('react');
var _ = require('lodash');
var expect = chai.expect;

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import i18next from '../../../../app/core/language';
import Daily from '../../../../app/components/chart/daily';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE, MGDL_UNITS, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';

const { Loader } = vizComponents;

require('tideline/css/tideline.less');
require('../../../../app/core/less/fonts.less');
require('../../../../app/style.less');

describe('Daily', () => {
  const DailyClass = Daily.WrappedComponent || Daily;

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

  const createInstance = (props = baseProps) => {
    const chartInstance = new DailyClass(props);

    chartInstance.props = props;
    chartInstance.setState = function setState(update) {
      const nextState = _.isFunction(update) ? update(this.state, this.props) : update;
      this.state = { ...this.state, ...nextState };
    };
    chartInstance.chartRef = { current: {} };
    chartInstance.headerRef = { current: {} };

    return chartInstance;
  };

  const getNodeByType = (component, type) => {
    const queue = [component.render()];

    while (queue.length) {
      const node = queue.shift();

      if (!node || !node.props) {
        continue;
      }

      if (node.type === type) {
        return node;
      }

      const children = React.Children.toArray(node.props.children);
      queue.push(...children);
    }

    return null;
  };

  let instance;

  beforeEach(() => {
    instance = createInstance(baseProps);
  });

  afterEach(() => {
    cleanup();
    baseProps.onClickPrint.reset();
    baseProps.onUpdateChartDateRange.reset();
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
  });

  describe('render', () => {
    it('should have a refresh button which should call onClickRefresh when clicked', () => {
      var props = _.assign({}, baseProps, {
        onClickRefresh: sinon.spy(),
      });

      const { container } = render(<DailyClass {...props} />);
      const refreshButton = container.querySelector('.btn-refresh');

      sinon.assert.callCount(props.onClickRefresh, 0);
      expect(refreshButton).to.not.be.null;
      fireEvent.click(refreshButton);
      sinon.assert.callCount(props.onClickRefresh, 1);
    });

    it('should have a print button and icon and call onClickPrint when clicked', () => {
      const { container } = render(<DailyClass {...baseProps} />);
      const printLink = container.querySelector('.printview-print-icon');

      sinon.assert.callCount(baseProps.onClickPrint, 0);
      expect(printLink).to.not.be.null;
      fireEvent.click(printLink);
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
          data: {
            combined: [{ type: 'cbg', normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-15T00:00:00.000Z').valueOf(), new Date('2018-01-16T00:00:00.000Z').valueOf()] } },
          },
        },
      });

      const dailyInstance = createInstance(dayDataReadyProps);
      const initialLoader = getNodeByType(dailyInstance, Loader);

      expect(initialLoader).to.exist;
      expect(initialLoader.props.show).to.be.false;

      dailyInstance.props = { ...dailyInstance.props, loading: true };
      const loadingLoader = getNodeByType(dailyInstance, Loader);
      expect(loadingLoader).to.exist;
      expect(loadingLoader.props.show).to.be.true;
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
          data: {
            combined: [{ type: 'cbg', normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-15T00:00:00.000Z').valueOf(), new Date('2018-01-16T00:00:00.000Z').valueOf()] } },
          },
        },
      });

      const { container, rerender } = render(<DailyClass {...baseProps} />);
      const chart = () => container.querySelectorAll('.patient-data-chart').length;

      expect(chart()).to.equal(0);

      rerender(<DailyClass {...dayDataReadyProps} />);
      expect(chart()).to.equal(1);
    });

    it('should render the Events pool label', () => {
      const { container, rerender } = render(<DailyClass {...baseProps} />);
      const label = () => container.querySelector('.events-label-container');
      expect(!!label()).to.equal(false);

      var dayDataReadyProps = _.assign({}, baseProps, {
        loading: false,
        data: {
          query: { chartType: 'daily'},
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
          data: {
            combined: [{ type: 'cbg', normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-15T00:00:00.000Z').valueOf(), new Date('2018-01-16T00:00:00.000Z').valueOf()] } },
          },
        },
      });

      rerender(<DailyClass {...dayDataReadyProps} />);
      expect(!!label()).to.equal(true);
      expect(label().textContent).to.equal('Events');
    });

    it('should render the Events pool label info tooltip, but only if there are alarm events in view', async () => {
      const { container, rerender } = render(<DailyClass {...baseProps} />);
      const label = () => container.querySelector('.events-label-container');
      const tooltip = () => container.querySelectorAll('.events-label-tooltip').length;

      var dayDataReadyProps = _.assign({}, baseProps, {
        loading: false,
        data: {
          query: { chartType: 'daily'},
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
          data: {
            combined: [{ type: 'cbg', normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-15T00:00:00.000Z').valueOf(), new Date('2018-01-16T00:00:00.000Z').valueOf()] } },
          },
        },
      });

      rerender(<DailyClass {...dayDataReadyProps} />);
      expect(!!label()).to.equal(true);
      expect(tooltip()).to.equal(0);

      // Set data with an alarm event in view
      rerender(<DailyClass {...{
        ...dayDataReadyProps,
        data: {
          query: { chartType: 'daily'},
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
          data: {
            combined: [{ tags: { alarm: true }, normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-15T00:00:00.000Z').valueOf(), new Date('2018-01-16T00:00:00.000Z').valueOf()] } },
          },
        },
      }} />);
      await waitFor(() => expect(tooltip()).to.equal(1));

      // Move endpoints so that alarm event is out of view
      rerender(<DailyClass {...{
        ...dayDataReadyProps,
        data: {
          query: { chartType: 'daily'},
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
          data: {
            combined: [{ tags: { alarm: true }, normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-16T00:00:00.000Z').valueOf(), new Date('2018-01-17T00:00:00.000Z').valueOf()] } },
          },
        },
      }} />);
      await waitFor(() => expect(tooltip()).to.equal(0));
    });

    it('should not render the cgm interval toggle, even if there is a current supporting device', () => {
      const { container, rerender } = render(<DailyClass {...baseProps} />);
      const toggle = () => container.querySelectorAll('.cgm-sample-interval-range-toggle').length;
      expect(toggle()).to.equal(0);

      var hasOneMinCgmSampleIntervalDeviceProps = _.assign({}, baseProps, {
        loading: false,
        data: {
          query: { chartType: 'daily' },
          data: {
            combined: [{ type: 'cbg', normalTime: new Date('2018-01-15T12:00:00.000Z').valueOf() }],
            current: { endpoints: { range: [new Date('2018-01-15T00:00:00.000Z').valueOf(), new Date('2018-01-16T00:00:00.000Z').valueOf()] } },
          },
          metaData: { devices: [{ oneMinCgmSampleInterval: true }] },
        },
        chartPrefs: {
          daily: { bgSource: 'cbg' },
        },
      });

      rerender(<DailyClass {...hasOneMinCgmSampleIntervalDeviceProps} />);
      expect(toggle()).to.equal(0);
    });

    it('should render the bg toggle', () => {
      const { container } = render(<DailyClass {...baseProps} />);
      const toggle = container.querySelector('.toggle-container');
      expect(toggle).to.exist;
    });

    it('should render the stats', () => {
      const { container } = render(<DailyClass {...baseProps} />);
      const stats = container.querySelector('.Stats');
      expect(stats).to.exist;
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
      expect(instance.state.title).to.equal('');

      instance.handleDatetimeLocationChange(endpoints);

      expect(instance.state.title).to.equal('Tue, Jan 16, 2018');
    });

    it('should set a debounced call of the `onUpdateChartDateRange` prop method', () => {
      sinon.spy(_, 'debounce');
      sinon.assert.callCount(_.debounce, 0);

      expect(instance.state.debouncedDateRangeUpdate).to.be.undefined;

      instance.handleDatetimeLocationChange(endpoints);

      sinon.assert.callCount(_.debounce, 1);
      sinon.assert.calledWith(_.debounce, baseProps.onUpdateChartDateRange);
      expect(instance.state.debouncedDateRangeUpdate).to.be.a('function');

      _.debounce.restore();
    });
  });

  describe('toggleBgDataSource', () => {
    it('should track metric when toggled', () => {
      instance.toggleBgDataSource(null, 'cbg');
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Daily Click to CGM');

      instance.toggleBgDataSource(null, 'smbg');
      sinon.assert.callCount(baseProps.trackMetric, 2);
      sinon.assert.calledWith(baseProps.trackMetric, 'Daily Click to BGM');
    });

    it('should call the `updateChartPrefs` handler to update the bgSource', () => {
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

  describe('toggleCgmSampleIntervalRange', () => {
    it('should track metric when toggled', () => {
      instance.toggleCgmSampleIntervalRange(null, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE);
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Daily Click CGM Sample Interval to 1min');

      instance.toggleCgmSampleIntervalRange(null, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);
      sinon.assert.callCount(baseProps.trackMetric, 2);
      sinon.assert.calledWith(baseProps.trackMetric, 'Daily Click CGM Sample Interval to 5min');
    });

    it('should call the `updateChartPrefs` handler to update the cgmSampleIntervalRange', () => {
      instance.toggleCgmSampleIntervalRange(null, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE);

      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        daily: { cgmSampleIntervalRange: ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE },
      });

      instance.toggleCgmSampleIntervalRange(null, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);

      sinon.assert.callCount(baseProps.updateChartPrefs, 2);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        daily: { cgmSampleIntervalRange: DEFAULT_CGM_SAMPLE_INTERVAL_RANGE },
      });
    });
  });

  describe('handleAlarmHover', () => {
    it('should set hoveredAlarm state with correct positioning', () => {
      const alarm = {
        rect: {
          top: 100,
          left: 200,
          width: 20,
          height: 30,
        },
        chartExtents: {
          left: 50,
          right: 400,
        },
        data: { type: 'alarm' },
      };

      instance.handleAlarmHover(alarm);

      expect(instance.state.hoveredAlarm).to.deep.equal({
        ...alarm,
        top: 130, // rect.top + rect.height
        left: 210, // rect.left + (rect.width / 2)
        side: 'bottom',
      });
    });

    it('should adjust leftOffset when tooltip would spill over left edge', () => {
      const alarm = {
        rect: {
          top: 100,
          left: 60, // Close to left edge
          width: 20,
          height: 30,
        },
        chartExtents: {
          left: 50,
          right: 400,
        },
        data: { type: 'alarm' },
      };

      instance.handleAlarmHover(alarm);

      const hoveredAlarm = instance.state.hoveredAlarm;
      expect(hoveredAlarm.leftOffset).to.equal(35);
    });

    it('should adjust leftOffset when tooltip would spill over right edge', () => {
      const alarm = {
        rect: {
          top: 100,
          left: 390, // Close to right edge
          width: 20,
          height: 30,
        },
        chartExtents: {
          left: 50,
          right: 400,
        },
        data: { type: 'alarm' },
      };

      instance.handleAlarmHover(alarm);

      const hoveredAlarm = instance.state.hoveredAlarm;
      expect(hoveredAlarm.leftOffset).to.equal(-35);
    });

    it('should track metric when hovering over alarm', () => {
      const alarm = {
        rect: {
          top: 100,
          left: 200,
          width: 20,
          height: 30,
        },
        chartExtents: {
          left: 50,
          right: 400,
        },
        data: { type: 'alarm' },
      };

      instance.handleAlarmHover(alarm);

      expect(baseProps.trackMetric.calledWith('hovered over daily alarm tooltip')).to.be.true;
    });
  });

  describe('handleAlarmOut', () => {
    it('should set hoveredAlarm state to false', () => {
      // First set a hoveredAlarm
      instance.setState({
        hoveredAlarm: {
          data: { type: 'alarm' },
          top: 100,
          left: 200,
        },
      });

      instance.handleAlarmOut();

      expect(instance.state.hoveredAlarm).to.be.false;
    });
  });

  describe('handleEventHover', () => {
    context('pump_shutdown event', () => {
      it('should set hoveredEvent state with correct positioning', () => {
        const event = {
          rect: {
            top: 100,
            left: 200,
            width: 20,
            height: 30,
          },
          chartExtents: {
            left: 50,
            right: 400,
          },
          data: { tags: { event: 'pump_shutdown' } },
        };

        instance.handleEventHover(event);

        expect(instance.state.hoveredEvent).to.deep.equal({
          ...event,
          top: 150, // rect.top + rect.height + 20
          left: 210, // rect.left + (rect.width / 2)
          side: 'bottom',
        });
      });

      it('should adjust leftOffset when tooltip would spill over left edge', () => {
        const event = {
          rect: {
            top: 100,
            left: 60, // Close to left edge
            width: 20,
            height: 30,
          },
          chartExtents: {
            left: 50,
            right: 400,
          },
          data: { tags: { event: 'pump_shutdown' } },
        };

        instance.handleEventHover(event);

        const hoveredEvent = instance.state.hoveredEvent;
        expect(hoveredEvent.leftOffset).to.equal(70);
      });

      it('should adjust leftOffset when tooltip would spill over right edge', () => {
        const event = {
          rect: {
            top: 100,
            left: 390, // Close to right edge
            width: 20,
            height: 30,
          },
          chartExtents: {
            left: 50,
            right: 400,
          },
          data: { tags: { event: 'pump_shutdown' } },
        };

        instance.handleEventHover(event);

        const hoveredEvent = instance.state.hoveredEvent;
        expect(hoveredEvent.leftOffset).to.equal(-70);
      });
    });

    context('standard event', () => {
      it('should set hoveredEvent state with correct positioning', () => {
        const event = {
          rect: {
            top: 100,
            left: 200,
            width: 20,
            height: 30,
          },
          chartExtents: {
            left: 50,
            right: 400,
          },
          data: { tags: { event: 'health' } },
        };

        instance.handleEventHover(event);

        expect(instance.state.hoveredEvent).to.deep.equal({
          ...event,
          top: 130, // rect.top + rect.height + 0
          left: 210, // rect.left + (rect.width / 2)
          side: 'bottom',
        });
      });

      it('should adjust leftOffset when tooltip would spill over left edge', () => {
        const event = {
          rect: {
            top: 100,
            left: 60, // Close to left edge
            width: 20,
            height: 30,
          },
          chartExtents: {
            left: 50,
            right: 400,
          },
          data: { tags: { event: 'health' } },
        };

        instance.handleEventHover(event);

        const hoveredEvent = instance.state.hoveredEvent;
        expect(hoveredEvent.leftOffset).to.equal(40);
      });

      it('should adjust leftOffset when tooltip would spill over right edge', () => {
        const event = {
          rect: {
            top: 100,
            left: 390, // Close to right edge
            width: 20,
            height: 30,
          },
          chartExtents: {
            left: 50,
            right: 400,
          },
          data: { tags: { event: 'health' } },
        };

        instance.handleEventHover(event);

        const hoveredEvent = instance.state.hoveredEvent;
        expect(hoveredEvent.leftOffset).to.equal(-40);
      });
    });

    it('should track metric when hovering over event', () => {
      const event = {
        rect: {
          top: 100,
          left: 200,
          width: 20,
          height: 30,
        },
        chartExtents: {
          left: 50,
          right: 400,
        },
        data: { tags: { event: 'pump_shutdown' } },
      };

      instance.handleEventHover(event);

      expect(baseProps.trackMetric.calledWith('hovered over daily event tooltip')).to.be.true;
    });
  });

  describe('handleEventOut', () => {
    it('should set hoveredEvent state to false', () => {
      // First set a hoveredEvent
      instance.setState({
        hoveredEvent: {
          data: { tags: { event: 'pump_shutdown' } },
          top: 100,
          left: 200,
        },
      });

      instance.handleEventOut();

      expect(instance.state.hoveredEvent).to.be.false;
    });
  });
});

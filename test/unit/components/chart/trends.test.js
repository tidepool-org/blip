/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/* global chai */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global sinon */

var expect = chai.expect;

import React from 'react';
import _ from 'lodash';
import Trends from '../../../../app/components/chart/trends';
import { shallow } from 'enzyme';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';
import i18next from '../../../../app/core/language';

const { Loader } = vizComponents;

describe('Trends', () => {
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

  let baseProps = {
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
        showingCbg: true,
        showingSmbg: false,
        activeDomain: '2 weeks',
        extentSize: 14,
        boxOverlay: true,
        grouped: true,
        showingLines: false,
        cbgFlags: {},
      },
    },
    currentPatientInViewId: '1234',
    data: {
      bgPrefs,
      timePrefs: {
        timezoneAware: false,
        timezoneName: 'US/Pacific',
      },
    },
    initialDatetimeLocation: '2019-11-27T16:00:00.000Z',
    loading: false,
    mostRecentDatetimeLocation: '2019-11-27T16:00:00.000Z',
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToBgLog: sinon.stub(),
    onSwitchToTrends: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    onUpdateChartDateRange: sinon.stub(),
    stats: [],
    t: i18next.t.bind(i18next),
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    uploadUrl: '',
  };

  let wrapper;
  let instance
  beforeEach(() => {
    wrapper = shallow(<Trends.WrappedComponent {...baseProps} />);
    instance = wrapper.instance();
    instance.refs = {
      chart: {},
    };
  })

  afterEach(() => {
    baseProps.onUpdateChartDateRange.reset();
    baseProps.updateChartPrefs.reset();
    baseProps.trackMetric.reset();
  });

  describe('render', () => {
    it('should show a loader when loading prop is true', () => {
      const loader = () => wrapper.find(Loader);

      expect(loader().length).to.equal(1);
      expect(loader().props().show).to.be.false;

      wrapper.setProps({ loading: true });
      expect(loader().props().show).to.be.true;
    });

    it('should render the clipboard copy button', () => {
      const button = wrapper.find('ClipboardButton');
      expect(button.length).to.equal(1);
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
    it('should set the `title` state', () => {
      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ]);

      expect(wrapper.state().title).to.equal('Jan 15, 2018 - Jan 28, 2018');
    });

    it('should set the `title` state correctly when ending on a DST changeover date', () => {
      const timezoneAwareProps = {
        ...baseProps,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        }
      };

      wrapper = shallow(<Trends.WrappedComponent { ...timezoneAwareProps } />);
      instance = wrapper.instance();

      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-03-05T08:00:00.000Z',
        '2018-03-12T07:00:00.000Z',
      ]);

      expect(wrapper.state().title).to.equal('Mar 5, 2018 - Mar 11, 2018');
    });

    it('should set the `title` state correctly when starting on a DST changeover date', () => {
      const timezoneAwareProps = {
        ...baseProps,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        }
      };

      wrapper = shallow(<Trends.WrappedComponent { ...timezoneAwareProps } />);
      instance = wrapper.instance();

      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-03-11T08:00:00.000Z',
        '2018-03-18T07:00:00.000Z',
      ]);

      expect(wrapper.state().title).to.equal('Mar 11, 2018 - Mar 17, 2018');
    });

    it('should set a debounced call of the `onUpdateChartDateRange` prop method', () => {
      sinon.spy(_, 'debounce');
      sinon.assert.callCount(_.debounce, 0);

      expect(wrapper.state().debouncedDateRangeUpdate).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-16T00:00:00.000Z',
      ]);

      sinon.assert.callCount(_.debounce, 1);
      sinon.assert.calledWith(_.debounce, baseProps.onUpdateChartDateRange);
      expect(wrapper.state().debouncedDateRangeUpdate).to.be.a('function');

      _.debounce.restore();
    });
  });

  describe('handleFocusCbgSlice', () => {
    it('should update the chart prefs with the focused cbg slice state', () => {
      instance.handleFocusCbgSlice('focusedData', 'focusedPosition', 'focusedKeys');
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedCbgSlice: { data: 'focusedData', position: 'focusedPosition' },
          focusedCbgSliceKeys: 'focusedKeys',
          showingCbgDateTraces: true,
        },
      }, false);
    });

    it('should update the chart prefs with the unfocused cbg slice state', () => {
      instance.handleFocusCbgSlice();
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedCbgSlice: null,
          focusedCbgSliceKeys: null,
          focusedCbgDateTrace: null,
          showingCbgDateTraces: false,
        },
      }, false);
    });
  });

  describe('handleFocusCbgDateTrace', () => {
    it('should update the chart prefs with the focused cbg date trace state', () => {
      instance.handleFocusCbgDateTrace('focusedData', 'focusedPosition');
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedCbgDateTrace: { data: 'focusedData', position: 'focusedPosition' },
        },
      }, false);
    });

    it('should update the chart prefs with the unfocused cbg date trace state', () => {
      instance.handleFocusCbgDateTrace();
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedCbgDateTrace: null,
        },
      }, false);
    });
  });

  describe('handleFocusSmbg', () => {
    it('should update the chart prefs with the focused smbg state', () => {
      instance.handleFocusSmbg('focusedDatum', 'focusedPosition', 'allSmbgsOnDate', 'allPositions', 'date');
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedSmbg: { datum: 'focusedDatum', position: 'focusedPosition', allSmbgsOnDate: 'allSmbgsOnDate', allPositions: 'allPositions', date: 'date' },
        },
      }, false);
    });

    it('should update the chart prefs with the unfocused smbg state', () => {
      instance.handleFocusSmbg();
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedSmbg: null,
        },
      }, false);
    });
  });

  describe('handleFocusSmbgRange', () => {
    it('should update the chart prefs with the focused smbg state', () => {
      instance.handleFocusSmbgRange('focusedData', 'focusedPosition');
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedSmbgRangeAvg: { data: 'focusedData', position: 'focusedPosition' },
        },
      }, false);
    });

    it('should update the chart prefs with the unfocused smbg state', () => {
      instance.handleFocusSmbgRange();
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          focusedSmbgRangeAvg: null,
        },
      }, false);
    });
  });

  describe('isAtMostRecent', () => {
    it('should return `true` if current chart domain end matches the `mostRecentDatetimeLocation` ceiling', () => {
      instance.refs = {
        chart: {
          state: {
            dateDomain: { end: '2019-11-28T00:00:00.000Z'}
          },
        },
      };
      expect(instance.isAtMostRecent()).to.be.true;
    });

    it('should return `false` if current chart domain end does not match the `mostRecentDatetimeLocation` ceiling', () => {
      instance.refs = {
        chart: {
          state: {
            dateDomain: { end: '2019-11-27T00:00:00.000Z'}
          },
        },
      };
      expect(instance.isAtMostRecent()).to.be.false;
    });
  });

  describe('markTrendsViewed', () => {
    it('should set the trends `touched` chartPrefs state to `true`', () => {
      instance.markTrendsViewed();
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          touched: true,
        },
      }, false);
    });
  });

  describe('handleCopyTrendsClicked', () => {
    it('should track metric with source param when called', () => {
      instance.handleCopyTrendsClicked();
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Clicked Copy Settings', { source: 'Trends' });
    });
  });

  describe('toggleBgDataSource', () => {
    it('should track metric when toggled', () => {
      instance.toggleBgDataSource(null, 'cbg');
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Trends Click to CGM');

      instance.toggleBgDataSource(null, 'smbg');
      sinon.assert.callCount(baseProps.trackMetric, 2);
      sinon.assert.calledWith(baseProps.trackMetric, 'Trends Click to BGM');
    });

    it('should call the `updateChartPrefs` handler to update the bgSource', () => {
      instance.toggleBgDataSource(null, 'cbg');

      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: sinon.match({ bgSource: 'cbg' }),
      });

      instance.toggleBgDataSource(null, 'smbg');

      sinon.assert.callCount(baseProps.updateChartPrefs, 2);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: sinon.match({ bgSource: 'smbg' }),
      });
    });
  });

  describe('toggleDisplayFlags', () => {
    it('should set the provided the trends `cbgFlags` chartPrefs state to the provided value', () => {
      instance.toggleDisplayFlags('cbg100', true);
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        trends: {
          ...baseProps.chartPrefs.trends,
          cbgFlags: { cbg100: true },
        },
      }, false);
    });
  });
});

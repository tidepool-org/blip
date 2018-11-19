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
/* global before */
/* global after */
/* global beforeEach */
/* global afterEach */
/* global sinon */

var expect = chai.expect;

import React from 'react';
import _ from 'lodash';
import Weekly from '../../../../app/components/chart/weekly';
import { shallow } from 'enzyme';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';
import i18next from '../../../../app/core/language';
import DataUtilStub from '../../../helpers/DataUtil';

const { Loader } = vizComponents;

describe('Weekly', () => {
  let baseProps = {
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
      bgUnits: MGDL_UNITS
    },
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'US/Pacific'
    },
    isClinicAccount: false,
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToWeekly: sinon.stub(),
    onSwitchToTrends: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    trackMetric: sinon.stub(),
    uploadUrl: '',
    chartPrefs: {
      weekly: {},
    },
    dataUtil: new DataUtilStub(),
    currentPatientInViewId: 1234,
    patientData: {
      WeeklyData: {
        data: {},
      },
      grouped: {
        smbg: [],
      },
    },
    loading: false,
    onUpdateChartDateRange: sinon.stub(),
    t: i18next.t.bind(i18next),
    updateDatetimeLocation: sinon.stub()
  };

  let wrapper;
  let instance;
  beforeEach(() => {
    wrapper = shallow(<Weekly.WrappedComponent {...baseProps} />);
    instance = wrapper.instance();
  })

  afterEach(() => {
    baseProps.onUpdateChartDateRange.reset();
    baseProps.updateDatetimeLocation.reset();
  });

  describe('render', () => {
    it('should show a loader when loading prop is true', () => {
      const loader = () => wrapper.find(Loader);

      expect(loader().length).to.equal(1);
      expect(loader().props().show).to.be.false;

      wrapper.setProps({ loading: true });
      expect(loader().props().show).to.be.true;
    });

    it('should render the stats', () => {
      const stats = wrapper.find('Stats');
      expect(stats.length).to.equal(1);
    });
  });

  describe('handleDatetimeLocationChange', () => {
    let state = () => instance.state;

    const chart = {
      getCurrentDay: sinon.stub().returns('current day'),
    };

    it('should set the `datetimeLocation` state', () => {
      expect(state().datetimeLocation).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(state().datetimeLocation).to.equal('2018-01-28T23:59:59.000Z');
    });

    it('should set the `title` state', () => {
      expect(state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(state().title).to.equal('Jan 15, 2018 - Jan 28, 2018');
    });

    it('should set the `endpoints` state correctly when timezoneAware is false', () => {
      expect(state().endpoints).to.eql([]);

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(state().endpoints).to.eql([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ]);
    });

    it('should set the `endpoints` state correctly when timezoneAware is true', () => {
      expect(state().endpoints).to.eql([]);

      wrapper.setProps(_.assign({}, baseProps, {
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        },
      }));

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(state().endpoints).to.eql([
        '2018-01-15T08:00:00.000Z',
        '2018-01-29T08:00:00.000Z',
      ]);
    });

    it('should call the `updateDatetimeLocation` prop method', () => {
      sinon.assert.callCount(baseProps.updateDatetimeLocation, 0);

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      sinon.assert.callCount(baseProps.updateDatetimeLocation, 1);
      sinon.assert.calledWith(baseProps.updateDatetimeLocation, 'current day');
    });

    it('should set a debounced call of the `onUpdateChartDateRange` prop method', () => {
      sinon.spy(_, 'debounce');
      sinon.assert.callCount(_.debounce, 0);

      expect(state().debouncedDateRangeUpdate).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-16T00:00:00.000Z',
      ], chart);

      sinon.assert.callCount(_.debounce, 1);
      sinon.assert.calledWith(_.debounce, baseProps.onUpdateChartDateRange);
      expect(state().debouncedDateRangeUpdate).to.be.a.function;

      _.debounce.restore();
    });
  });
});

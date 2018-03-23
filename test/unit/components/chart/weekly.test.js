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
    chartPrefs: {},
    currentPatientInViewId: 1234,
    patientData: {
      WeeklyData: {
        data: {},
      },
      grouped: {
        smbg: [],
      },
    },
    WeeklyState: {
      '1234': {},
    },
    loading: false,
    onUpdateChartDateRange: sinon.stub(),
    updateDatetimeLocation: sinon.stub(),
    t: i18next.t.bind(i18next)
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Weekly.WrappedComponent {...baseProps} />);
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
  });

  describe('handleDatetimeLocationChange', () => {
    let wrapper;
    let instance;

    const chart = {
      getCurrentDay: sinon.stub().returns('current day'),
    };

    beforeEach(() => {
      wrapper = shallow(<Weekly.WrappedComponent {...baseProps} />);
      instance = wrapper.instance();
    });

    it('should set the `datetimeLocation` state', () => {
      expect(wrapper.state().datetimeLocation).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(wrapper.state().datetimeLocation).to.equal('2018-01-28T23:59:59.000Z');
    });

    it('should set the `title` state', () => {
      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(wrapper.state().title).to.equal('Jan 15, 2018 - Jan 28, 2018');
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

      expect(wrapper.state().debouncedDateRangeUpdate).to.be.undefined;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-16T00:00:00.000Z',
      ], chart);

      sinon.assert.callCount(_.debounce, 1);
      sinon.assert.calledWith(_.debounce, baseProps.onUpdateChartDateRange);
      expect(wrapper.state().debouncedDateRangeUpdate).to.be.a.function;

      _.debounce.restore();
    });
  });
});

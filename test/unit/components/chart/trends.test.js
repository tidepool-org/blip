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

describe('Trends', () => {
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
        showingLines: false
      },
    },
    currentPatientInViewId: 1234,
    patientData: {
      TrendsData: {
        data: {},
      },
    },
    trendsState: {
      '1234': {},
    },
    loading: false,
    onUpdateChartDateRange: sinon.stub(),
    updateDatetimeLocation: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Trends {...baseProps} />);
  })

  afterEach(() => {
    baseProps.onUpdateChartDateRange.reset();
    baseProps.updateDatetimeLocation.reset();
  });

  describe('render', () => {
    it('should show a loader when loading prop is true', () => {
      const loader = () => wrapper.find('Loader');

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
      wrapper = shallow(<Trends {...baseProps} />);
      instance = wrapper.instance();
    });

    it('should set the `atMostRecent` state', () => {
      expect(wrapper.state().atMostRecent).to.be.true;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ], false);

      expect(wrapper.state().atMostRecent).to.equal(false);
    });

    it('should set the `title` state', () => {
      expect(wrapper.state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ]);

      expect(wrapper.state().title).to.equal('Jan 15, 2018 - Jan 28, 2018');
    });

    it('should call the `updateDatetimeLocation` prop method', () => {
      sinon.assert.callCount(baseProps.updateDatetimeLocation, 0);

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ]);

      sinon.assert.callCount(baseProps.updateDatetimeLocation, 1);
      sinon.assert.calledWith(baseProps.updateDatetimeLocation, '2018-01-29T00:00:00.000Z');
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
      expect(wrapper.state().debouncedDateRangeUpdate).to.be.a.function;

      _.debounce.restore();
    });
  });
});

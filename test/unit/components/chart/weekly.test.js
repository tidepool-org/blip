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
import { mount } from 'enzyme';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';

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
    pdf: {},
    printReady: false,
    WeeklyState: {
      '1234': {},
    },
    loading: false,
    onClickPrint: sinon.stub(),
    onUpdateChartDateRange: sinon.stub(),
    updateDatetimeLocation: sinon.stub()
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(<Weekly {...baseProps} />);
  })

  afterEach(() => {
    baseProps.onClickPrint.reset();
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

    it('should have a disabled print button and spinner when a pdf is not ready to print', () => {
      let mountedWrapper = mount(<Weekly {...baseProps} />);

      var printLink = mountedWrapper.find('.printview-print-icon');
      expect(printLink.length).to.equal(1);
      expect(printLink.hasClass('patient-data-subnav-disabled')).to.be.true;

      var spinner = mountedWrapper.find('.print-loading-spinner');
      expect(spinner.length).to.equal(1);
    });

    it('should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked', () => {
      var props = _.assign({}, baseProps, {
        pdf: {
          url: 'blobURL',
        },
      });

      let mountedWrapper = mount(<Weekly {...props} />);
      const instance = mountedWrapper.instance().getWrappedInstance();

      var printLink = mountedWrapper.find('.printview-print-icon');
      expect(printLink.length).to.equal(1);
      expect(printLink.hasClass('patient-data-subnav-disabled')).to.be.false;

      var spinner = mountedWrapper.find('.print-loading-spinner');
      expect(spinner.length).to.equal(0);

      expect(baseProps.onClickPrint.callCount).to.equal(0);
      printLink.simulate('click');
      expect(baseProps.onClickPrint.callCount).to.equal(1);
    });
  });

  describe('handleDatetimeLocationChange', () => {
    let wrapper;
    let instance;
    let state = () => instance.state;

    const chart = {
      getCurrentDay: sinon.stub().returns('current day'),
    };

    beforeEach(() => {
      wrapper = mount(<Weekly {...baseProps} />);
      instance = wrapper.instance().getWrappedInstance();
    });

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

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
import BgLog from '../../../../app/components/chart/bgLog';
import { shallow, mount } from 'enzyme';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from '@tidepool/viz';
import i18next from '../../../../app/core/language';

const { Loader } = vizComponents;

describe('BG Log', () => {
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
    isClinicianAccount: false,
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToBgLog: sinon.stub(),
    onSwitchToTrends: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    trackMetric: sinon.stub(),
    uploadUrl: '',
    chartPrefs: {
      bgLog: {},
    },
    data: {
      bgPrefs,
      timePrefs: {
        timezoneAware: false,
        timezoneName: 'US/Pacific',
      },
    },
    currentPatientInViewId: 1234,
    patientData: {
      BgLogData: {
        data: {},
      },
      grouped: {
        smbg: [],
      },
    },
    pdf: {},
    stats: [],
    printReady: false,
    queryDataCount: 1,
    loading: false,
    initialDatetimeLocation: '2019-11-27T00:00:00.000Z',
    mostRecentDatetimeLocation: '2019-11-27T00:00:00.000Z',
    onClickPrint: sinon.stub(),
    onUpdateChartDateRange: sinon.stub(),
    t: i18next.t.bind(i18next),
  };

  let wrapper;
  let instance;
  beforeEach(() => {
    wrapper = shallow(<BgLog.WrappedComponent {...baseProps} />);
    instance = wrapper.instance();
    instance.refs = {
      chart: {},
    };
  })

  afterEach(() => {
    baseProps.onClickPrint.reset();
    baseProps.onUpdateChartDateRange.reset();
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

    it('should have a print button and icon and call onClickPrint when clicked', () => {
      let mountedWrapper = mount(<BgLog {...baseProps} />);

      var printLink = mountedWrapper.find('.printview-print-icon');
      expect(printLink.length).to.equal(1);

      expect(baseProps.onClickPrint.callCount).to.equal(0);
      printLink.simulate('click');
      expect(baseProps.onClickPrint.callCount).to.equal(1);
    });
  });

  describe('handleDatetimeLocationChange', () => {
    let state = () => instance.state;

    const chart = {
      getCurrentDay: sinon.stub().returns('current day'),
    };

    it('should set the `title` state', () => {
      expect(state().title).to.equal('');

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-28T23:59:59.000Z',
      ], chart);

      expect(state().title).to.equal('Jan 15, 2018 - Jan 28, 2018');
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
      expect(state().debouncedDateRangeUpdate).to.be.a('function');

      _.debounce.restore();
    });
  });
});

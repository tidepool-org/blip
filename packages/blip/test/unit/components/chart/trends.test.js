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

import React from 'react';
import moment from 'moment-timezone';
import sinon from 'sinon';
import { expect } from 'chai';
import Trends from '../../../../app/components/chart/trends';
import { mount, shallow } from 'enzyme';
import { MS_IN_DAY } from 'tideline';
import { components as vizComponents } from 'tidepool-viz';
import { MGDL_UNITS } from '../../../../app/core/constants';
import DataUtilStub from '../../../helpers/DataUtil';

const { Loader } = vizComponents;

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
        extentSize: 14,
        showingCbg: true,
        showingSmbg: false,
        boxOverlay: true,
        grouped: true,
        showingLines: false
      },
    },
    epochLocation: moment.utc('2014-03-13T12:00:00.000Z').valueOf(),
    msRange: MS_IN_DAY*7,
    currentPatientInViewId: '1234',
    dataUtil: new DataUtilStub(),
    loading: false,
    canPrint: false,
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToTrends: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    onDatetimeLocationChange: sinon.stub().resolves(false),
    updateChartPrefs: sinon.stub(),
    trackMetric: sinon.stub(),
    patientData: {
      TrendsData: {
        data: {},
      },
    },
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'US/Pacific'
    },
    trendsState: {
      1234: {
        userid: "1234",
      },
    },
    permsOfLoggedInUser: {
      root: true,
    },
    profileDialog: function ProfileDialogStub() { return <div id="profile-dialog" />; },
    uploadUrl: '',
  };

  before(() => {
    // Avoid mounting the redux stack
    sinon.stub(Trends.prototype, 'renderChart').returns(null);
    sinon.stub(vizComponents, 'RangeSelect').value(
      function RangeSelect() { return <div id="range-select" />; }
    );
  });

  after(() => {
    sinon.restore();
  });

  /** @type {import('enzyme').ReactWrapper} */
  let wrapper = null;
  /** @type {Trends} */
  let instance = null;
  beforeEach(() => {
    // const store = initStore();
    // baseProps.store = store;
    wrapper = mount(<Trends {...baseProps} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
      instance = null;
    }
    baseProps.updateChartPrefs.reset();
    baseProps.onDatetimeLocationChange.resetHistory();
  });

  describe('render', () => {
    it('should show a loader when loading prop is true', () => {
      const loader = () => wrapper.find(Loader);

      expect(loader().length).to.equal(1);
      expect(loader().props().show).to.be.false;

      wrapper.setProps({ loading: true });
      expect(loader().props().show).to.be.true;
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
    it('should set the `atMostRecent` state', () => {
      expect(wrapper.state().atMostRecent).to.be.true;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ], false);

      expect(wrapper.state().atMostRecent).to.be.false;
    });

    it('should set the title', () => {
      const epochLocation = Date.parse('2018-01-15T00:00:00.000Z');
      const msRange = MS_IN_DAY*10;

      wrapper.setProps({ epochLocation, msRange });
      // wrapper.update();
      const title = shallow(instance.getTitle());
      expect(title.text(), 'title text').to.be.equal('Jan 10, 2018 - Jan 19, 2018');
    });

    it('should set the title correctly when ending on a DST changeover date', () => {
      const epochLocation = Date.parse('2018-03-05T08:00:00.000Z');
      const msRange = MS_IN_DAY*7;
      const timezoneAwareProps = {
        loading: true,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        }
      };

      wrapper.setProps(timezoneAwareProps);
      let title = instance.getTitle();
      expect(title).to.be.equal('Loading...');

      wrapper.setProps({ epochLocation, msRange, loading: false }).update();
      title = shallow(instance.getTitle());
      expect(title.text(), 'title contains:').to.be.equal('Mar 1, 2018 - Mar 7, 2018');
    });

    it('should set the title correctly when starting on a DST changeover date', () => {
      const epochLocation = Date.parse('2018-03-14T08:00:00.000Z');
      const msRange = MS_IN_DAY*7;
      const timePrefs = {
        timezoneAware: true,
        timezoneName: 'US/Pacific',
      };

      wrapper.setProps({ epochLocation, msRange, timePrefs });
      const title = shallow(instance.getTitle());
      expect(title.text()).to.be.equal('Mar 10, 2018 - Mar 16, 2018');// (<span>Mar 11, 2018&#xA0;-&#xA0;Mar 17, 2018</span>)).to.be.true;
    });

    it('should call the `onDatetimeLocationChange` prop method', () => {
      const endpoints = [
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ];
      const start = Date.parse(endpoints[0]);
      const msRange = Date.parse(endpoints[1]) - start;
      const center = start + msRange / 2;
      sinon.assert.callCount(baseProps.onDatetimeLocationChange, 0);

      instance.handleDatetimeLocationChange(endpoints);

      sinon.assert.callCount(baseProps.onDatetimeLocationChange, 1);
      sinon.assert.calledWith(baseProps.onDatetimeLocationChange, center, msRange);
    });
  });

  describe('toggleBgDataSource', () => {
    it('should track metric when toggled', () => {
      const instance = wrapper.instance();
      instance.toggleBgDataSource(null, 'cbg');
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Trends Click to CGM');

      instance.toggleBgDataSource(null, 'smbg');
      sinon.assert.callCount(baseProps.trackMetric, 2);
      sinon.assert.calledWith(baseProps.trackMetric, 'Trends Click to BGM');
    });

    it('should call the `updateChartPrefs` handler to update the bgSource', () => {
      const instance = wrapper.instance();
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
});

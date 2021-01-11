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
import sinon from 'sinon';
import chai from 'chai';
import Trends from '../../../../app/components/chart/trends';
import { shallow } from 'enzyme';
import { MGDL_UNITS } from '../../../../app/core/constants';
import { components as vizComponents } from 'tidepool-viz';
import i18next from '../../../../app/core/language';
import DataUtilStub from '../../../helpers/DataUtil';

const { expect } = chai;

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
    endpoints: [],
    currentPatientInViewId: '1234',
    dataUtil: new DataUtilStub(),
    loading: false,
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToBgLog: sinon.stub(),
    onSwitchToTrends: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    onUpdateChartDateRange: sinon.stub(),
    patientData: {
      TrendsData: {
        data: {},
      },
    },
    t: i18next.t.bind(i18next),
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'US/Pacific'
    },
    trackMetric: sinon.stub(),
    trendsState: {
      1234: {},
    },
    updateChartPrefs: sinon.stub(),
    updateDatetimeLocation: sinon.stub(),
    uploadUrl: '',
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Trends {...baseProps} />);
  });

  afterEach(() => {
    baseProps.onUpdateChartDateRange.reset();
    baseProps.updateChartPrefs.reset();
    baseProps.updateDatetimeLocation.reset();

    baseProps.onUpdateChartDateRange.callsArg(1);
    baseProps.updateDatetimeLocation.callsArg(1);
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
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<Trends {...baseProps} />);
      instance = wrapper.instance();
    });

    afterEach(() => {
      baseProps.updateDatetimeLocation.reset();
      baseProps.onUpdateChartDateRange.reset();
      baseProps.onUpdateChartDateRange.callsArg(1);
      baseProps.updateDatetimeLocation.callsArg(1);
    });

    it('should set the `atMostRecent` state', () => {
      expect(wrapper.state().atMostRecent).to.be.true;

      instance.handleDatetimeLocationChange([
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ], false);

      expect(wrapper.state().atMostRecent).to.be.false;
    });

    it('should set the title', (done) => {
      const endpoints = [
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ];

      wrapper.setProps({datetimeLocation: endpoints[1], endpoints}, () => {
        try {
          const title = shallow(instance.getTitle());
          expect(title.contains(<span>Jan 15, 2018&#xA0;-&#xA0;Jan 28, 2018</span>)).to.be.true;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should set the title correctly when ending on a DST changeover date', (done) => {
      const endpoints = [
        '2018-03-05T08:00:00.000Z',
        '2018-03-12T07:00:00.000Z',
      ];
      const timezoneAwareProps = {
        ...baseProps,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        }
      };

      wrapper = shallow(<Trends { ...timezoneAwareProps } />);
      instance = wrapper.instance();

      let title = instance.getTitle();
      expect(title).to.be.equal('Loading...');

      wrapper.setProps({datetimeLocation: endpoints[1], endpoints}, () => {
        try {
          const title = shallow(instance.getTitle());
          expect(title.contains(<span>Mar 5, 2018&#xA0;-&#xA0;Mar 11, 2018</span>)).to.be.true;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should set the title correctly when starting on a DST changeover date', (done) => {
      const endpoints = [
        '2018-03-11T08:00:00.000Z',
        '2018-03-18T07:00:00.000Z',
      ];
      const timezoneAwareProps = {
        ...baseProps,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        }
      };

      wrapper = shallow(<Trends { ...timezoneAwareProps } />);
      instance = wrapper.instance();

      let title = instance.getTitle();
      expect(title).to.be.equal('Loading...');

      wrapper.setProps({datetimeLocation: endpoints[1], endpoints}, () => {
        try {
          const title = shallow(instance.getTitle());
          expect(title.contains(<span>Mar 11, 2018&#xA0;-&#xA0;Mar 17, 2018</span>)).to.be.true;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should call the `updateDatetimeLocation` prop method', () => {
      const endpoints = [
        '2018-01-15T00:00:00.000Z',
        '2018-01-29T00:00:00.000Z',
      ];
      sinon.assert.callCount(baseProps.updateDatetimeLocation, 0);
      sinon.assert.callCount(baseProps.onUpdateChartDateRange, 0);

      instance.handleDatetimeLocationChange(endpoints);

      sinon.assert.callCount(baseProps.onUpdateChartDateRange, 1);
      sinon.assert.callCount(baseProps.updateDatetimeLocation, 1);
      sinon.assert.calledWith(baseProps.onUpdateChartDateRange, endpoints);
      sinon.assert.calledWith(baseProps.updateDatetimeLocation, endpoints[1]);
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

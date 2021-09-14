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
import _ from 'lodash';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import chai from 'chai';

import { MGDL_UNITS } from 'tideline';
import { utils as vizUtils } from 'tidepool-viz';

import DataUtilStub from '../../../helpers/DataUtil';
import Stats from '../../../../app/components/chart/stats';

const expect = chai.expect;

describe('Stats', () => {
  const baseProps = {
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
    bgSource: 'cbg',
    chartPrefs: {
      basics: {},
      daily: {},
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
      bgLog: {},
    },
    chartType: 'basics',
    dataUtil: new DataUtilStub(),
    endpoints: [
      '2018-01-15T00:00:00.000Z',
      '2018-01-31T00:00:00.000Z',
    ],
    loading: false,
  };

  let wrapper;
  let instance;

  beforeEach(() => {
    baseProps.dataUtil = new DataUtilStub();
  });

  describe('constructor', () => {
    beforeEach(() => {
      wrapper = shallow(<Stats {...baseProps} />);
      instance = wrapper.instance();
    });

    it('should set initial required properties', () => {
      expect(instance.bgPrefs).to.have.keys([
        'bgUnits',
        'bgBounds',
      ]);
    });

    it('should set `stats` to state', () => {
      expect(instance.state.stats).to.be.an('array');
    });

    it('should set the dataUtil endpoints', () => {
      let dataUtilEndpointsSpy = sinon.spy(baseProps.dataUtil, 'endpoints', ['set']);
      wrapper = shallow(<Stats {...baseProps} />);

      sinon.assert.callCount(dataUtilEndpointsSpy.set, 1);
      sinon.assert.calledWith(dataUtilEndpointsSpy.set, baseProps.endpoints);
    });
  });

  describe('render', () => {
    before(() => {
      sinon.spy(console, 'error');
    });

    after(() => {
      console.error.restore();
    });

    context('basics', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {...baseProps} />);
      });

      it('should render without errors when provided all required props', () => {
        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'totalInsulin',
          'carbs',
          'averageDailyDose',
          'glucoseManagementIndicator',
        ];

        _.forEach(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`), statId).to.have.length(1);
        });
        expect(wrapper.find('.Stats').children()).to.have.length(7);
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        const smbgProps = {...baseProps, bgSource: 'smbg' };
        wrapper = shallow(<Stats {...smbgProps} />);

        const expectedStats = [
          'readingsInRange',
          'averageDailyDose',
          'totalInsulin',
          'carbs',
          'averageGlucose',
        ];

        _.forEach(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`), statId).to.have.length(1);
        });
        expect(wrapper.find('.Stats').children()).to.have.length(5);
      });

      it('should render the Time in Auto stat for automated basal devices', () => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'basics',
          dataUtil: new DataUtilStub([], {
            latestPump: {
              deviceModel: '1780',
              manufacturer: 'medtronic',
            },
          }),
        })} />);

        expect(wrapper.find('.Stats').children()).to.have.length(8);
        expect(wrapper.find('#Stat--timeInAuto')).to.have.length(1);
      });
    });

    context('daily', () => {
      beforeEach(() => {
        wrapper = mount(<Stats {..._.assign({}, baseProps, {
          chartType: 'daily',
        })} />);
      });
      afterEach(() => {
        if (wrapper) {
          wrapper.unmount();
          wrapper = null;
        }
      });

      it('should render without errors when provided all required props', () => {
        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });
        wrapper.update();

        expect(wrapper.find('.Stats').children()).to.have.length(6);

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.forEach(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });
        wrapper.update();

        expect(wrapper.find('.Stats').children()).to.have.length(4);

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
        ];

        _.forEach(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });

      it('should render the Time in Auto stat for automated basal devices', () => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'daily',
          dataUtil: new DataUtilStub([], {
            latestPump: {
              deviceModel: '1780',
              manufacturer: 'medtronic',
            },
          }),
        })} />);

        expect(wrapper.find('.Stats').children()).to.have.length(7);
        expect(wrapper.find('#Stat--timeInAuto')).to.have.length(1);
      });
    });

    context('trends', () => {
      beforeEach(() => {
        wrapper = mount(<Stats {..._.assign({}, baseProps, {
          chartType: 'trends',
        })} />);
      });
      afterEach(() => {
        if (wrapper) {
          wrapper.unmount();
          wrapper = null;
        }
      });

      it('should render without errors when provided all required props', () => {
        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });
        wrapper.update();

        expect(wrapper.find('.Stats').children()).to.have.length(6);

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'glucoseManagementIndicator',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.forEach(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });
        wrapper.update();

        expect(wrapper.find('.Stats').children()).to.have.length(4);

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.forEach(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });
    });
  });

  describe('getStatsByChartType', () => {
    context('basics', () => {
      beforeEach(() => {
        wrapper = mount(<Stats {..._.assign({}, baseProps, {
          chartType: 'basics',
        })} />);
        instance = wrapper.instance();
      });
      afterEach(() => {
        if (wrapper) {
          wrapper.unmount();
          wrapper = null;
          instance = null;
        }
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'totalInsulin',
          'carbs',
          'averageDailyDose',
          'glucoseManagementIndicator',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'averageDailyDose',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should render the Time in Auto stat for automated basal devices', () => {
        wrapper.setProps({
          ...wrapper.props(),
          dataUtil: new DataUtilStub([], {
            latestPump: {
              deviceModel: '1780',
              manufacturer: 'medtronic',
            },
          }),
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = ['timeInAuto'];

        expect(_.map(stats, 'id')).to.include.members(expectedStats);
      });
    });

    context('daily', () => {
      beforeEach(() => {
        wrapper = mount(<Stats {..._.assign({}, baseProps, {
          chartType: 'daily',
        })} />);
        instance = wrapper.instance();
      });
      afterEach(() => {
        if (wrapper) {
          wrapper.unmount();
          wrapper = null;
          instance = null;
        }
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'standardDev',
          'coefficientOfVariation',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should render the Time in Auto stat for automated basal devices', () => {
        wrapper.setProps({
          ...wrapper.props(),
          dataUtil: new DataUtilStub([], {
            latestPump: {
              deviceModel: '1780',
              manufacturer: 'medtronic',
            },
          }),
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = ['timeInAuto'];

        expect(_.map(stats, 'id')).to.include.members(expectedStats);
      });
    });

    context('trends', () => {
      beforeEach(() => {
        wrapper = mount(<Stats {..._.assign({}, baseProps, {
          chartType: 'trends',
        })} />);
        instance = wrapper.instance();
      });
      afterEach(() => {
        if (wrapper) {
          wrapper.unmount();
          wrapper = null;
          instance = null;
        }
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'glucoseManagementIndicator',
          'standardDev',
          'coefficientOfVariation',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });
        wrapper.update();
        const stats = instance.getStatsByChartType();

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'standardDev',
          'coefficientOfVariation',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });
    });
  });

  describe('componentDidUpdate', () => {
    beforeEach(() => {
      wrapper = mount(<Stats {...baseProps} />);
      instance = wrapper.instance();
    });
    afterEach(() => {
      sinon.restore();
      if (wrapper) {
        wrapper.unmount();
        wrapper = null;
        instance = null;
      }
    });

    it('should update `stats` state when bgSource prop changes', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      sinon.assert.callCount(setStateSpy, 0);

      instance.componentDidUpdate({...baseProps, bgSource: 'smbg' });

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, { stats: sinon.match.array });
    });

    it('should call `updateDataUtilEndpoints` and `updateStatData` if endpoints change', () => {
      const dataUtilEndpointsSpy = sinon.spy(baseProps.dataUtil, 'endpoints', ['set']);
      const updateStatDataSpy = sinon.spy(instance, 'updateStatData');

      sinon.assert.callCount(dataUtilEndpointsSpy.set, 0);
      sinon.assert.callCount(updateStatDataSpy, 0);

      const prevProps = {...baseProps, endpoints: ['foo', 'bar'] };

      instance.componentDidUpdate(prevProps);

      sinon.assert.callCount(dataUtilEndpointsSpy.set, 1);
      sinon.assert.calledWith(dataUtilEndpointsSpy.set, baseProps.endpoints);

      sinon.assert.callCount(updateStatDataSpy, 1);
    });

    it('should call `updateStatData` if activeDays changes', () => {
      const updateStatDataSpy = sinon.spy(instance, 'updateStatData');
      sinon.assert.callCount(updateStatDataSpy, 0);

      const prevProps = {
        ...baseProps,
        chartType: 'trends',
        chartPrefs: { trends: { activeDays: { monday: false } } },
      };

      instance.componentDidUpdate(prevProps);

      sinon.assert.callCount(updateStatDataSpy, 1);
    });
  });

  describe('updatesRequired', () => {
    before(() => {
      wrapper = mount(<Stats {...baseProps} />);
      instance = wrapper.instance();
    });
    after(() => {
      if (wrapper) {
        wrapper.unmount();
        wrapper = null;
        instance = null;
      }
    });

    it('should return `false` when props are unchanged', () => {
      const result = instance.updatesRequired(baseProps);
      expect(result).to.be.false;
    });

    it('should return `true` for `stats` when bgSource prop changes', () => {
      const prevProps = {
        ...baseProps,
        chartType: 'trends',
        bgSource: 'smbg',
      };

      const result = instance.updatesRequired(prevProps);

      expect(result, JSON.stringify(result)).to.eql({
        activeDays: false,
        endpoints: false,
        stats: true,
        dataChanged: false,
      });
    });

    it('should return `true` for `endpoints` when endpoints prop changes', () => {
      const prevProps = {
        ...baseProps,
        chartType: 'trends',
        endpoints: ['foo', 'bar'],
      };

      const result = instance.updatesRequired(prevProps);

      expect(result, JSON.stringify(result)).to.eql({
        activeDays: false,
        endpoints: true,
        stats: false,
        dataChanged: false,
      });
    });

    it('should return `true` for `activeDays` when activeDays prop changes', () => {
      const prevProps = {
        ...baseProps,
        chartType: 'trends',
        chartPrefs: { trends: { activeDays: { monday: false } } },
      };

      const result = instance.updatesRequired(prevProps);

      expect(result, JSON.stringify(result)).to.eql({
        activeDays: true,
        endpoints: false,
        stats: false,
        dataChanged: false,
      });
    });

    it('should return `true` for `dataChanged` when loading prop changes', () => {
      const prevProps = {
        ...baseProps,
        loading: true,
      };

      const result = instance.updatesRequired(prevProps);

      expect(result, JSON.stringify(result)).to.eql({
        activeDays: false,
        endpoints: false,
        stats: false,
        dataChanged: true,
      });
    });
  });

  describe('updateStatData', () => {
    before(() => {
      const { getStatAnnotations, getStatData, getStatTitle } = vizUtils.stat;
      sinon.stub(vizUtils.stat, 'getStatAnnotations').callsFake(getStatAnnotations);
      sinon.stub(vizUtils.stat, 'getStatData').callsFake(getStatData);
      sinon.stub(vizUtils.stat, 'getStatTitle').callsFake(getStatTitle);
    });

    beforeEach(() => {
      wrapper = mount(<Stats {...baseProps} />);
      wrapper.update();
      instance = wrapper.instance();
    });

    afterEach(() => {
      vizUtils.stat.getStatAnnotations.resetHistory();
      vizUtils.stat.getStatData.resetHistory();
      vizUtils.stat.getStatTitle.resetHistory();
      wrapper.unmount();
      wrapper = null;
      instance = null;
    });

    after(() => {
      sinon.restore();
    });

    it('should update stat data, annotations, and title for each stat', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      sinon.assert.callCount(setStateSpy, 0);

      expect(instance.state.stats.length).to.equal(7);

      instance.updateStatData();

      sinon.assert.callCount(vizUtils.stat.getStatAnnotations, 7);
      sinon.assert.callCount(vizUtils.stat.getStatData, 7);
      sinon.assert.callCount(vizUtils.stat.getStatTitle, 7);

      _.forEach(instance.state.stats, stat => {
        sinon.assert.calledWith(vizUtils.stat.getStatAnnotations, sinon.match.object, stat.id);
        sinon.assert.calledWith(vizUtils.stat.getStatData, sinon.match.object, stat.id);
        sinon.assert.calledWith(vizUtils.stat.getStatTitle, stat.id);
      });

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, { stats: sinon.match.array });
    });
  });
});

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
/* global context */
/* global sinon */
/* global it */
/* global before */
/* global after */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { shallow } from 'enzyme';
import { MGDL_UNITS } from '../../../../app/core/constants';
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
        showingCbg: true,
        showingSmbg: false,
        activeDomain: '2 weeks',
        extentSize: 14,
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
  };

  let wrapper;
  let instance;
  beforeEach(() => {
    wrapper = shallow(<Stats {...baseProps} />);
    instance = wrapper.instance();
  });

  describe('constructor', () => {
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
      dataUtilEndpointsSpy.restore();
    });
  });

  describe('render', () => {
    context('basics', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'basics',
        })} />);
      });

      it('should render without errors when provided all required props', () => {
        console.error = sinon.stub();

        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });

        expect(wrapper.find('.Stats').children()).to.have.length(7);

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'totalInsulin',
          'carbs',
          'averageDailyDose',
          'glucoseManagementIndicator',
        ];

        _.each(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });

        expect(wrapper.find('.Stats').children()).to.have.length(5);

        const expectedStats = [
          'readingsInRange',
          'averageDailyDose',
          'totalInsulin',
          'carbs',
          'averageGlucose',
        ];

        _.each(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
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
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'daily',
        })} />);
      });

      it('should render without errors when provided all required props', () => {
        console.error = sinon.stub();

        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });

        expect(wrapper.find('.Stats').children()).to.have.length(6);

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.each(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });

        expect(wrapper.find('.Stats').children()).to.have.length(4);

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
        ];

        _.each(expectedStats, statId => {
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

    context('bgLog', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'bgLog',
        })} />);
      });

      it('should render without errors when provided all required props', () => {
        console.error = sinon.stub();

        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats', () => {
        expect(wrapper.find('.Stats').children()).to.have.length(4);

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.each(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });
    });

    context('trends', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'trends',
        })} />);
      });

      it('should render without errors when provided all required props', () => {
        console.error = sinon.stub();

        expect(wrapper.find('.Stats')).to.have.length(1);
        expect(console.error.callCount).to.equal(0);
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'cbg',
        });

        expect(wrapper.find('.Stats').children()).to.have.length(6);

        const expectedStats = [
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'glucoseManagementIndicator',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.each(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        wrapper.setProps({
          ...wrapper.props(),
          bgSource: 'smbg',
        });

        expect(wrapper.find('.Stats').children()).to.have.length(4);

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'standardDev',
          'coefficientOfVariation',
        ];

        _.each(expectedStats, statId => {
          expect(wrapper.find(`#Stat--${statId}`)).to.have.length(1);
        });
      });
    });
  });

  describe('getStatsByChartType', () => {
    context('basics', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'basics',
        })} />);
        instance = wrapper.instance();
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        const stats = instance.getStatsByChartType({
          ...instance.props,
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

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should show all expected stats when bgSource prop is `smbg`', () => {
        const stats = instance.getStatsByChartType({
          ...instance.props,
          bgSource: 'smbg',
        });

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
        const stats = instance.getStatsByChartType({
          ...instance.props,
          dataUtil: new DataUtilStub([], {
            latestPump: {
              deviceModel: '1780',
              manufacturer: 'medtronic',
            },
          }),
        });

        const expectedStats = ['timeInAuto'];

        expect(_.map(stats, 'id')).to.include.members(expectedStats);
      });

      it('should set `props.onAverageDailyDoseInputChange` to `onInputChange` for the `averageDailyDose` widget when provided', () => {
        const stats = instance.getStatsByChartType({
          ...instance.props,
          onAverageDailyDoseInputChange: () => 'change!',
        });

        const averageDailyDoseStat = _.find(stats, { id: 'averageDailyDose' });
        expect(averageDailyDoseStat.onInputChange()).to.equal('change!');
      });
    });

    context('daily', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'daily',
        })} />);
        instance = wrapper.instance();
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        const stats = instance.getStatsByChartType({
          ...instance.props,
          bgSource: 'cbg',
        });

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
        const stats = instance.getStatsByChartType({
          ...instance.props,
          bgSource: 'smbg',
        });

        const expectedStats = [
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
        ];

        expect(_.map(stats, 'id')).to.have.ordered.members(expectedStats);
      });

      it('should render the Time in Auto stat for automated basal devices', () => {
        const stats = instance.getStatsByChartType({
          ...instance.props,
          dataUtil: new DataUtilStub([], {
            latestPump: {
              deviceModel: '1780',
              manufacturer: 'medtronic',
            },
          }),
        });

        const expectedStats = ['timeInAuto'];

        expect(_.map(stats, 'id')).to.include.members(expectedStats);
      });
    });

    context('bgLog', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'bgLog',
        })} />);
        instance = wrapper.instance();
      });

      it('should show all expected stats', () => {
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

    context('trends', () => {
      beforeEach(() => {
        wrapper = shallow(<Stats {..._.assign({}, baseProps, {
          chartType: 'trends',
        })} />);
        instance = wrapper.instance();
      });

      it('should show all expected stats when bgSource prop is `cbg`', () => {
        const stats = instance.getStatsByChartType({
          ...instance.props,
          bgSource: 'cbg',
        });

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
        const stats = instance.getStatsByChartType({
          ...instance.props,
          bgSource: 'smbg',
        });

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

  describe('componentWillReceiveProps', () => {
    it('should update `stats` state when bgSource prop changes', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      sinon.assert.callCount(setStateSpy, 0);

      instance.componentWillReceiveProps(_.assign({}, baseProps, {
        bgSource: 'smbg',
      }));

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, { stats: sinon.match.array });
    });

    it('should call `updateDataUtilEndpoints` and `updateStatData` if endpoints change', () => {
      const dataUtilEndpointsSpy = sinon.spy(baseProps.dataUtil, 'endpoints', ['set']);
      const updateStatDataSpy = sinon.spy(instance, 'updateStatData');

      sinon.assert.callCount(dataUtilEndpointsSpy.set, 0);
      sinon.assert.callCount(updateStatDataSpy, 0);

      const nextProps = _.assign({}, baseProps, {
        endpoints: ['foo', 'bar'],
      });

      instance.componentWillReceiveProps(nextProps);

      sinon.assert.callCount(dataUtilEndpointsSpy.set, 1);
      sinon.assert.calledWith(dataUtilEndpointsSpy.set, ['foo', 'bar']);
      dataUtilEndpointsSpy.restore();

      sinon.assert.callCount(updateStatDataSpy, 1);
      sinon.assert.calledWith(updateStatDataSpy, nextProps);
    });

    it('should call `updateStatData` if activeDays changes', () => {
      const updateStatDataSpy = sinon.spy(instance, 'updateStatData');
      sinon.assert.callCount(updateStatDataSpy, 0);

      const nextProps = _.assign({}, baseProps, {
        chartType: 'trends',
        chartPrefs: { trends: { activeDays: { monday: false } } },
      });

      instance.componentWillReceiveProps(nextProps);

      sinon.assert.callCount(updateStatDataSpy, 1);
      sinon.assert.calledWith(updateStatDataSpy, nextProps);
    });
  });

  describe('shouldComponentUpdate', () => {
    it('should return result of `updatesRequired`', () => {
      const updatesRequiredSpy = sinon.spy(instance, 'updatesRequired');
      sinon.assert.callCount(updatesRequiredSpy, 0);

      const nextProps = _.assign({}, baseProps, {
        bgSource: 'smbg',
      });

      const result = instance.shouldComponentUpdate(nextProps);

      sinon.assert.callCount(updatesRequiredSpy, 1);
      sinon.assert.calledWith(updatesRequiredSpy, nextProps);
      expect(result).to.eql(instance.updatesRequired(nextProps));
    });
  });

  describe('updatesRequired', () => {
    it('should return `false` when props are unchanged', () => {
      const result = instance.shouldComponentUpdate(baseProps);
      expect(result).to.be.false;
    });

    it('should return `true` for `stats` when bgSource prop changes', () => {
      const nextProps = _.assign({}, baseProps, {
        chartType: 'trends',
        bgSource: 'smbg',
      });

      const result = instance.shouldComponentUpdate(nextProps);

      expect(result).to.eql({
        activeDays: false,
        endpoints: false,
        stats: true,
      });
    });

    it('should return `true` for `endpoints` when endpoints prop changes', () => {
      const nextProps = _.assign({}, baseProps, {
        chartType: 'trends',
        endpoints: ['foo', 'bar'],
      });

      const result = instance.shouldComponentUpdate(nextProps);

      expect(result).to.eql({
        activeDays: false,
        endpoints: true,
        stats: false,
      });
    });

    it('should return `true` for `activeDays` when activeDays prop changes', () => {
      const nextProps = _.assign({}, baseProps, {
        chartType: 'trends',
        chartPrefs: { trends: { activeDays: { monday: false } } },
      });

      const result = instance.shouldComponentUpdate(nextProps);

      expect(result).to.eql({
        activeDays: true,
        endpoints: false,
        stats: false,
      });
    });
  });

  describe('updateStatData', () => {
    const getStatAnnotations = sinon.stub();
    const getStatData = sinon.stub();
    const getStatTitle = sinon.stub();

    before(() => {
      Stats.__Rewire__('getStatAnnotations', getStatAnnotations);
      Stats.__Rewire__('getStatData', getStatData);
      Stats.__Rewire__('getStatTitle', getStatTitle);
    });

    beforeEach(() => {
      wrapper = shallow(<Stats {...baseProps} />);
      instance = wrapper.instance();
    });

    after(() => {
      Stats.__ResetDependency__('getStatAnnotations');
      Stats.__ResetDependency__('getStatData');
      Stats.__ResetDependency__('getStatTitle');
    });

    it('should update stat data, annotations, and title for each stat', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      sinon.assert.callCount(setStateSpy, 0);

      expect(instance.state.stats.length).to.equal(7);

      instance.updateStatData(baseProps);

      sinon.assert.callCount(getStatAnnotations, 7);
      sinon.assert.callCount(getStatData, 7);
      sinon.assert.callCount(getStatTitle, 7);

      _.each(instance.state.stats, stat => {
        sinon.assert.calledWith(getStatAnnotations, sinon.match.object, stat.id);
        sinon.assert.calledWith(getStatData, sinon.match.object, stat.id);
        sinon.assert.calledWith(getStatTitle, stat.id);
      });

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, { stats: sinon.match.array });
    });
  });
});

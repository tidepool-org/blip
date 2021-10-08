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
import sinon from 'sinon';
import chai from 'chai';
import { mount } from 'enzyme';
import { MGDL_UNITS } from 'tideline';

import DataUtilStub from '../../../helpers/DataUtil';
import Basics from '../../../../app/components/chart/basics';

describe('Basics', () => {
  const { expect } = chai;

  const bgPrefs = {
    bgClasses: {
      'very-low': {
        boundary: 60,
      },
      low: {
        boundary: 80,
      },
      target: {
        boundary: 180,
      },
      high: {
        boundary: 200,
      },
      'very-high': {
        boundary: 300,
      },
    },
    bgUnits: MGDL_UNITS,
  };

  const baseProps = {
    bgPrefs,
    bgSource: 'cbg',
    chartPrefs: { basics: {} },
    dataUtil: new DataUtilStub([], {
      bgPrefs: {
        bgUnits: MGDL_UNITS,
        bgClasses: {},
      },
      timePrefs: {
        timezoneAware: true,
        timezoneName: 'UTC',
      },
    }),
    onClickPrint: sinon.stub(),
    tidelineData: {
      grouped: {},
      basicsData: {
        nData: 0,
        data: {},
        days: [],
      },
    },
    loading: false,
    canPrint: false,
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'US/Pacific',
    },
    permsOfLoggedInUser: {},
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    profileDialog: sinon.stub().returns(null),
  };

  /** @type {import('enzyme').ReactWrapper} */
  let wrapper = null;

  beforeEach(() => {
    wrapper = mount(<Basics {...baseProps} />);
    wrapper.update();
  });

  afterEach(() => {
    baseProps.onClickPrint.reset();
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
    if (wrapper !== null) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  describe('render', () => {
    it('should render the basics chart if any data is uploaded', () => {
      const date1 = new Date(Date.now() - 60*60*1000);
      const date2 = new Date();
      const smbgs = [
        { type: 'smbg', normalTime: date1.toISOString(), epoch: date1.valueOf() },
        { type: 'smbg', normalTime: date2.toISOString(), epoch: date2.valueOf() }
      ];
      const dataProps = {
        patient: { userid: "1234" },
        tidelineData: {
          grouped: {
            smbg: smbgs,
            cbg: [],
          },
          data: smbgs,
          basicsData: {
            nData: 1,
            dateRange: [date1.toISOString(), date2.toISOString()],
            data: {
              smbg: {
                data: smbgs,
              },
              cbg: [],
            },
            days: [
              {
                type: 'mostRecent',
              },
            ],
          },
        },
      };
      _.defaults(dataProps, baseProps);
      wrapper.unmount();
      wrapper = null; // In case the next mount() failed...
      wrapper = mount(<Basics {...dataProps} />);
      wrapper.update();
      const noDataMessage = wrapper.find('.patient-data-message').hostNodes();
      const chart = wrapper.find('#tidelineContainer');
      expect(noDataMessage.length, JSON.stringify(dataProps, null, 2)).to.equal(0);
      expect(chart.length, '#tidelineContainer').to.equal(1);
    });

    it('should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked', () => {
      var props = _.assign({}, baseProps, {
        canPrint: true,
      });

      wrapper.setProps(props);
      wrapper.update();

      var printLink = wrapper.find('.printview-print-icon');
      expect(printLink.length).to.equal(1);
      expect(printLink.hasClass('patient-data-subnav-disabled')).to.be.false;

      expect(props.onClickPrint.callCount).to.equal(0);
      printLink.simulate('click');
      expect(props.onClickPrint.callCount).to.equal(1);
    });

    it('should render the bg toggle', () => {
      var props = _.assign({}, baseProps, {
        tidelineData: {
          grouped: {},
          basicsData: {
            data: {},
            dateRange: ['2018-01-15T05:00:00.000Z', '2018-01-30T03:46:52.000Z'],
          },
        },
      });
      wrapper.setProps(props);
      wrapper.update();
      const toggle = wrapper.find('BgSourceToggle');
      expect(toggle.length).to.equal(1);
    });

    it('should render the stats', () => {
      const props = _.assign({}, baseProps, {
        tidelineData: {
          grouped: {},
          basicsData: {
            data: {},
            dateRange: ['2018-01-15T05:00:00.000Z', '2018-01-30T03:46:52.000Z'],
          },
        },
      });
      wrapper.setProps(props);
      wrapper.update();
      const stats = wrapper.find('Stats');
      expect(stats.length).to.equal(1);
    });
  });

  describe('getInitialState', () => {
    it('should set the initial state', () => {
      expect(wrapper.state('atMostRecent')).to.be.true;
      expect(wrapper.state('inTransition')).to.be.false;
      expect(wrapper.state('title')).to.be.a('string');
      expect(_.isEmpty(wrapper.state('endpoints'))).to.be.true;
    });
  });

  describe('componentDidMount', () => {
    it('should set the endpoint after mount', () => {
      const props = _.assign({}, baseProps, {
        tidelineData: {
          grouped: {},
          basicsData: {
            data: {},
            dateRange: ['2018-01-15T05:00:00.000Z', '2018-01-30T03:46:52.000Z'],
          },
        },
      });
      wrapper.unmount();
      wrapper = null;
      wrapper = mount(<Basics {...props} />);
      wrapper.update();
      const state = wrapper.state();
      expect(_.isEmpty(state.endpoints)).to.be.false;
    });
  });

  describe('toggleBgDataSource', () => {
    it('should call the `updateChartPrefs` handler to update the bgSource', () => {
      const instance = wrapper.instance();
      instance.toggleBgDataSource(null, 'cbg');

      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        basics: { bgSource: 'cbg' },
      });

      instance.toggleBgDataSource(null, 'smbg');

      sinon.assert.callCount(baseProps.updateChartPrefs, 2);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        basics: { bgSource: 'smbg' },
      });
    });
  });
});

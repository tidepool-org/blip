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
import { mount, shallow } from 'enzyme';

import DataUtilStub from '../../../helpers/DataUtil';
import Basics from '../../../../app/components/chart/basics';
import { MGDL_UNITS } from '../../../../app/core/constants';
import i18next from '../../../../app/core/language';

describe('Basics', () => {
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
    bgPrefs,
    bgSource: 'cbg',
    chartPrefs: { basics: {} },
    dataUtil: new DataUtilStub(),
    onClickPrint: sinon.stub(),
    onUpdateChartDateRange: sinon.stub(),
    patientData: {
      basicsData: {
        data: {},
      },
    },
    pdf: {},
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'US/Pacific',
    },
    t: i18next.t.bind(i18next),
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Basics.WrappedComponent {...baseProps} />);
  })

  afterEach(() => {
    baseProps.onClickPrint.reset();
    baseProps.onUpdateChartDateRange.reset();
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
  });

  describe('render', () => {
    it('should render the missing data text if no data has been uploaded', () => {
      wrapper = mount(<Basics {...baseProps} />);
      const noDataMessage = wrapper.find('.patient-data-message').hostNodes();
      const chart = wrapper.hostNodes('BasicsChart');
      expect(noDataMessage.length).to.equal(1);
      expect(chart.length).to.equal(0);
      expect(noDataMessage.text()).to.include('upload some device data');
    });

    it('should render the basics chart if any data is uploaded', () => {
      wrapper.setProps({
        patientData: {
          basicsData: _.assign({}, baseProps.patientData.basicsData, {
            data: {
              smbg: {
                data: [
                  { type: 'smbg' }
                ],
              },
            },
            days: [{
              type: 'mostRecent',
            }],
          }),
        }
      });
      const noDataMessage = wrapper.find('.patient-data-message').hostNodes();
      const chart = wrapper.hostNodes('BasicsChart');
      expect(noDataMessage.length).to.equal(0);
      expect(chart.length).to.equal(1);
    });

    it('should have a disabled print button and spinner when a pdf is not ready to print', () => {
      let mountedWrapper = mount(<Basics {...baseProps} />);

      var printLink = mountedWrapper.find('.printview-print-icon').hostNodes();
      expect(printLink.length).to.equal(1);
      expect(printLink.hasClass('patient-data-subnav-disabled')).to.be.true;

      var spinner = mountedWrapper.find('.print-loading-spinner').hostNodes();
      expect(spinner.length).to.equal(1);
    });

    it('should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked', () => {
      var props = _.assign({}, baseProps, {
        pdf: {
          url: 'blobURL',
        },
      });

      let mountedWrapper = mount(<Basics {...props} />);

      var printLink = mountedWrapper.find('.printview-print-icon');
      expect(printLink.length).to.equal(1);
      expect(printLink.hasClass('patient-data-subnav-disabled')).to.be.false;

      var spinner = mountedWrapper.find('.print-loading-spinner');
      expect(spinner.length).to.equal(0);

      expect(props.onClickPrint.callCount).to.equal(0);
      printLink.simulate('click');
      expect(props.onClickPrint.callCount).to.equal(1);
    });

    it('should render the bg toggle', () => {
      var props = _.assign({}, baseProps, {
        patientData: {
          basicsData: {
            data: {},
            dateRange: [
              '2018-01-15T05:00:00.000Z',
              '2018-01-30T03:46:52.000Z',
            ],
          },
        },
      });
      wrapper = shallow(<Basics.WrappedComponent {...props} />);
      const toggle = wrapper.find('BgSourceToggle');
      expect(toggle.length).to.equal(1);
    });

    it('should render the stats', () => {
      var props = _.assign({}, baseProps, {
        patientData: {
          basicsData: {
            data: {},
            dateRange: [
              '2018-01-15T05:00:00.000Z',
              '2018-01-30T03:46:52.000Z',
            ],
          },
        },
      });
      wrapper = shallow(<Basics.WrappedComponent {...props} />);
      const stats = wrapper.find('Stats');
      expect(stats.length).to.equal(1);
    });
  });

  describe('getInitialState', () => {
    it('should set the initial state', () => {
      wrapper = shallow(<Basics.WrappedComponent {...baseProps} />);
      expect(wrapper.state('atMostRecent')).to.be.true;
      expect(wrapper.state('inTransition')).to.be.false;
      expect(wrapper.state('title')).to.be.a('string');
    });
  });

  describe('componentWillMount', () => {
    it('should not call the `onUpdateChartDateRange` method when dateRange is not set', () => {
      sinon.assert.notCalled(baseProps.onUpdateChartDateRange);
    });

    it('should call the `onUpdateChartDateRange` method with the end set to the start of the next day when dateRange is set', () => {
      var props = _.assign({}, baseProps, {
        patientData: {
          basicsData: {
            data: {},
            dateRange: [
              '2018-01-15T00:00:00.000Z',
              '2018-01-30T12:46:52.000Z',
            ],
          },
        },
      });

      let mountedWrapper = mount(<Basics {...props} />);
      sinon.assert.calledOnce(baseProps.onUpdateChartDateRange);
      sinon.assert.calledWith(baseProps.onUpdateChartDateRange, [
        '2018-01-15T00:00:00.000Z',
        '2018-01-31T00:00:00.000Z',
      ]);
    });

    it('should call the `onUpdateChartDateRange` method with an endpoint accounting for timezone offset when present', () => {
      var props = _.assign({}, baseProps, {
        patientData: {
          basicsData: {
            data: {},
            dateRange: [
              '2018-01-15T08:00:00.000Z',
              '2018-01-30T12:46:52.000Z',
            ],
          },
        },
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        },
      });

      let mountedWrapper = mount(<Basics {...props} />);
      sinon.assert.calledOnce(baseProps.onUpdateChartDateRange);
      sinon.assert.calledWith(baseProps.onUpdateChartDateRange, [
        '2018-01-15T08:00:00.000Z',
        '2018-01-31T08:00:00.000Z',
      ]);
    });

    it('should call the `onUpdateChartDateRange` method with an endpoint accounting for DST offset when applicable', () => {
      var props = _.assign({}, baseProps, {
        patientData: {
          basicsData: {
            data: {},
            dateRange: [
              '2018-03-05T08:00:00.000Z',
              '2018-03-12T12:46:52.000Z', // DST changeover was March 11
            ],
          },
        },
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        },
      });

      let mountedWrapper = mount(<Basics {...props} />);
      sinon.assert.calledOnce(baseProps.onUpdateChartDateRange);
      sinon.assert.calledWith(baseProps.onUpdateChartDateRange, [
        '2018-03-05T08:00:00.000Z',
        '2018-03-13T07:00:00.000Z', // 7 hour offset on post-DST date
      ]);
    });
  });

  describe('toggleBgDataSource', () => {
    it('should track metric when toggled', () => {
      const instance = wrapper.instance();
      instance.toggleBgDataSource(null, 'cbg');
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Basics Click to CGM');

      instance.toggleBgDataSource(null, 'smbg');
      sinon.assert.callCount(baseProps.trackMetric, 2);
      sinon.assert.calledWith(baseProps.trackMetric, 'Basics Click to BGM');
    });

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

  describe('handleAverageDailyDoseInputChange', () => {
    it('should call the `updateChartPrefs` handler to update the input and input suffix values', () => {
      const instance = wrapper.instance();
      instance.handleAverageDailyDoseInputChange('input!', 'suffix!');

      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        basics: { averageDailyDose: {
          inputValue: 'input!',
          suffixValue: 'suffix!',
        } },
      });
    });
  });
});

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

describe.only('Basics', () => {
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
      timezoneAware: true,
      timezoneName: 'US/Eastern',
    },
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

    it('should not render the bg toggle when dateRange is not set', () => {
      const toggle = wrapper.find('BgSourceToggle');
      expect(toggle.length).to.equal(0);
    });

    it('should render the bg toggle when dateRange is set', () => {
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

    it('should not render the stats when dateRange is not set', () => {
      const stats = wrapper.find('Stats');
      expect(stats.length).to.equal(0);
    });

    it('should render the stats when dateRange is set', () => {
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
    it('should set the endpoints when dateRange available', () => {
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
      expect(wrapper.state('endpoints')).to.eql([
        '2018-01-15T05:00:00.000Z',
        '2018-01-31T05:00:00.000Z',
      ]);
    });

    it('should set the endpoints to empty array when dateRange unavailable', () => {
      wrapper = shallow(<Basics.WrappedComponent {...baseProps} />);
      expect(wrapper.state('endpoints')).to.eql([]);
    });
  });

  describe('componentWillMount', () => {
    it('should not call the `onUpdateChartDateRange` method when dateRange is not set', () => {
      sinon.assert.notCalled(baseProps.onUpdateChartDateRange);
    });

    it('should call the `onUpdateChartDateRange` method when dateRange is set', () => {
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

      let mountedWrapper = mount(<Basics {...props} />);
      sinon.assert.calledOnce(baseProps.onUpdateChartDateRange);
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
});

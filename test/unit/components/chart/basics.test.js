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
    aggregations: {},
    chartPrefs: { basics: {} },
    data: {
      bgPrefs,
      timePrefs: {
        timezoneAware: false,
        timezoneName: 'US/Pacific',
      }
    },
    initialDatetimeLocation: '2019-11-27T00:00:00.000Z',
    loading: false,
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onClickPrint: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    onSwitchToBgLog: sinon.stub(),
    onUpdateChartDateRange: sinon.stub(),
    patient: React.PropTypes.object,
    pdf: {},
    stats: [],
    permsOfLoggedInUser: { root: {} },
    trackMetric: sinon.stub(),
    updateBasicsSettings: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    uploadUrl: 'http://uploadUrl',
    t: i18next.t.bind(i18next),
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
        ...baseProps,
        data: {
          data: {
            aggregationsByDate: {
              basals: {
                byDate: {
                  '2019-11-27': [
                    { type: 'smbg' },
                  ],
                },
              },
            },
          },
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

    it('should render the clipboard copy button', () => {
      wrapper = shallow(<Basics.WrappedComponent {...baseProps} />);
      const button = wrapper.find('ClipboardButton');
      expect(button.length).to.equal(1);
    });

    it('should render the bg toggle', () => {
      wrapper = shallow(<Basics.WrappedComponent {...baseProps} />);
      const toggle = wrapper.find('BgSourceToggle');
      expect(toggle.length).to.equal(1);
    });

    it('should render the stats', () => {
      wrapper = shallow(<Basics.WrappedComponent {...baseProps} />);
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

  describe('handleCopyBasicsClicked', () => {
    it('should track metric with source param when called', () => {
      const instance = wrapper.instance();
      instance.handleCopyBasicsClicked();
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Clicked Copy Settings', { source: 'Basics' });
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

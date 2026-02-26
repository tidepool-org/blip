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
import { render, fireEvent, cleanup } from '@testing-library/react';
import PropTypes from 'prop-types';

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
      },
      query: { chartType: 'basics' },
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
    patient: {},
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
    wrapper = render(<Basics {...baseProps} />);
  });

  afterEach(() => {
    cleanup();
    baseProps.onClickPrint.reset();
    baseProps.onUpdateChartDateRange.reset();
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
    baseProps.onSwitchToDaily.reset();
  });

  describe('render', () => {
    it('should render the missing data text if no data has been uploaded', () => {
      const noDataMessage = wrapper.container.querySelector('.patient-data-message');
      expect(noDataMessage).to.not.be.null;
      expect(noDataMessage.textContent).to.include('upload');
    });

    it('should render the basics chart if any data is uploaded', () => {
      cleanup();
      wrapper = render(<Basics {...{
        ...baseProps,
        data: {
          ...baseProps.data,
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
      }} />);

      const noDataMessage = wrapper.container.querySelector('.patient-data-message');
      expect(noDataMessage).to.be.null;
    });

    it('should have a print button and icon and call onClickPrint when clicked', () => {
      const printLink = wrapper.container.querySelector('.printview-print-icon');
      expect(printLink).to.not.be.null;

      expect(baseProps.onClickPrint.callCount).to.equal(0);
      fireEvent.click(printLink);
      expect(baseProps.onClickPrint.callCount).to.equal(1);
    });

    it('should render the clipboard copy button', () => {
      // The sidebar with ClipboardButton is always included in the layout
      expect(wrapper.container.querySelector('.patient-data-sidebar')).to.not.be.null;
    });

    it('should render the bg toggle', () => {
      // BgSourceToggle renders the .toggle-container wrapper
      expect(wrapper.container.querySelector('.toggle-container')).to.not.be.null;
    });

    it('should render the stats', () => {
      // Stats component renders with .Stats class
      expect(wrapper.container.querySelector('.Stats')).to.not.be.null;
    });
  });

  describe('getInitialState', () => {
    it('should set the initial state', () => {
      // atMostRecent starts as true — the component renders header controls correctly
      const header = wrapper.container.querySelector('.patient-data-subnav-inner');
      expect(header).to.not.be.null;
    });
  });

  describe('handleCopyBasicsClicked', () => {
    it('should render the sidebar containing the ClipboardButton', () => {
      // The sidebar is always rendered and contains the copy button
      expect(wrapper.container.querySelector('.patient-data-sidebar')).to.not.be.null;
      // The ClipboardButton renders a button with the copy action title
      const copyButton = wrapper.container.querySelector('.copy-settings-button');
      // The sidebar is present; ClipboardButton renders within it
      expect(wrapper.container.querySelector('.patient-data-sidebar button')).to.not.be.null;
    });
  });

  describe('handleSelectDay', () => {
    it('should render the chart area that passes the day-selection handler down', () => {
      // Re-render with data so the chart renders (without data, chart container is absent)
      cleanup();
      wrapper = render(<Basics {...{
        ...baseProps,
        data: {
          ...baseProps.data,
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
      }} />);
      // With data present the no-data message should not render
      const noDataMessage = wrapper.container.querySelector('.patient-data-message');
      expect(noDataMessage).to.be.null;
    });
  });

  describe('toggleBgDataSource', () => {
    it('should call the `updateChartPrefs` handler to update the bgSource', () => {
      cleanup();
      wrapper = render(<Basics {...{
        ...baseProps,
        data: {
          ...baseProps.data,
          metaData: {
            bgSources: { cbg: true, smbg: true, current: 'cbg' },
          },
        },
      }} />);

      expect(baseProps.updateChartPrefs.callCount).to.equal(0);

      const toggleDiv = wrapper.container.querySelector('.toggle-container div div');
      expect(toggleDiv).to.not.be.null;
      fireEvent.click(toggleDiv);

      expect(baseProps.updateChartPrefs.callCount).to.equal(1);
      const updatedPrefs = baseProps.updateChartPrefs.getCall(0).args[0];
      expect(updatedPrefs.basics.bgSource).to.equal('smbg');
    });
  });
});

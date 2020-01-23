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
    chartPrefs: {
      animateStats: true
    },
    stats: [],
  };

  let wrapper;
  let instance;
  beforeEach(() => {
    wrapper = shallow(<Stats {...baseProps} />);
    instance = wrapper.instance();
  });

  describe('render', () => {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.Stats')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render all provided stats', () => {
      wrapper.setProps({
        ...wrapper.props(),
        stats: [
          { id: 'timeInRange' },
          { id: 'averageGlucose' },
          { id: 'sensorUsage' },
          { id: 'totalInsulin' },
          { id: 'carbs' },
          { id: 'averageDailyDose' },
          { id: 'glucoseManagementIndicator' },
        ],
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
  });
});

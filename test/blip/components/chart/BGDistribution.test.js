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

/* jshint esversion:6 */

/* global describe */
/* global context */
/* global it */
/* global expect */
/* global beforeEach */
/* global chai */

var expect = chai.expect;
var { DEFAULT_BG_BOUNDS } = require('../../../../js/data/util/constants');

const React = require('react');
const _ = require('lodash');
const { mount } = require('enzyme');
const BGDistribution = require('../../../../plugins/blip/basics/components/chart/BGDistribution');

describe('BGDistribution', () => {
  const data = {
    bgDistribution: {
      cbg: {
        'very-low': 1,
        'low': 1,
        'target': 6,
        'high': 1,
        'very-high': 1,
      },
      smbg: {
        'very-low': 1,
        'low': 1,
        'target': 6,
        'high': 1,
        'very-high': 1,
      },
    },
  };

  var props = {
    bgClasses: {
      'very-low': {
        boundary: DEFAULT_BG_BOUNDS.veryLow,
      },
      'low': {
        boundary: DEFAULT_BG_BOUNDS.targetLower,
      },
      'target': {
        boundary: DEFAULT_BG_BOUNDS.targetUpper,
      },
      'high': {
        boundary: DEFAULT_BG_BOUNDS.veryHigh,
      },
      'very-high': {
        boundary: 600,
      },
    },
    bgUnits: 'mg/dL',
    data,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(<BGDistribution {...props} />);
  });

  describe('componentWillMount', () => {
    context('CBG and SMBG data available', () => {
      it('should set the showingCbg state to true', () => {
        expect(wrapper.state('showingCbg')).to.be.true;
      });

      it('should set the bothAvailable state to true', () => {
        expect(wrapper.state('bothAvailable')).to.be.true;
      });
    });

    context('only CBG data available', () => {
      let cbgOnlyData =  _.cloneDeep(data);
      delete cbgOnlyData.bgDistribution.smbg;

      beforeEach(() => {
        wrapper
          .unmount()
          .setProps({
            data: cbgOnlyData,
          })
          .mount();
      });

      it('should set the showingCbg state to true', () => {
        expect(wrapper.state('showingCbg')).to.be.true;
      });

      it('should set the bothAvailable state to false', () => {
        expect(wrapper.state('bothAvailable')).to.be.false;
      });
    });

    context('only SMBG data available', () => {
      let smbgOnlyData =  _.cloneDeep(data);
      delete smbgOnlyData.bgDistribution.cbg;

      beforeEach(() => {
        wrapper
          .unmount()
          .setProps({
            data: smbgOnlyData,
          })
          .mount();
      });

      it('should set the showingCbg state to false', () => {
        expect(wrapper.state('showingCbg')).to.be.false;
      });

      it('should set the bothAvailable state to false', () => {
        expect(wrapper.state('bothAvailable')).to.be.false;
      });
    });
  });
});

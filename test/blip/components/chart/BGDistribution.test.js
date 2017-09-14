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

const React = require('react');
const _ = require('lodash');
const { shallow } = require('enzyme');
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
        boundary: 60,
      },
      'low': {
        boundary: 80,
      },
      'target': {
        boundary: 180,
      },
      'high': {
        boundary: 200,
      },
      'very-high': {
        boundary: 300,
      },
    },
    bgUnits: 'mg/dL',
    data,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<BGDistribution {...props} />);
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
      beforeEach(() => {
        wrapper.setProps({
          data: _.assign({}, data, {
            smbg: {
              'very-low': 0,
              'low': 0,
              'target': 0,
              'high': 0,
              'very-high': 0,
            },
          }),
        });
      });

      it('should set the showingCbg state to true', () => {
        expect(wrapper.state('showingCbg')).to.be.true;
      });

      it('should set the bothAvailable state to false', () => {
        expect(wrapper.state('bothAvailable')).to.be.true;
      });
    });

    context('only SMBG data available', () => {
      beforeEach(() => {
        wrapper.setProps({
          data: _.assign({}, data, {
            cbg: {
              'very-low': 0,
              'low': 0,
              'target': 0,
              'high': 0,
              'very-high': 0,
            },
          }),
        });
      });

      it('should set the showingCbg state to false', () => {
        expect(wrapper.state('showingCbg')).to.be.true;
      });

      it('should set the bothAvailable state to false', () => {
        expect(wrapper.state('bothAvailable')).to.be.true;
      });
    });
  });
});

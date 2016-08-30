/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

/* eslint-env node, mocha */

import _ from 'lodash';
import React from 'react';

import { mount } from 'enzyme';

import { toMmolL } from '../../../helpers/bgConversion';
import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import SVGContainer from '../../../helpers/SVGContainer';

import FocusedCBGSlice from '../../../../src/components/trends/cbg/FocusedCBGSlice';

describe('FocusedCBGSlice', () => {
  let wrapper;

  const props = {
    bgUnits: 'mg/dL',
    focusedSlice: {
      slice: {
        firstQuartile: 100,
        median: 140.5,
        thirdQuartile: 180,
        msX: 2700000,
      },
    },
    focusedSliceKeys: ['firstQuartile', 'thirdQuartile'],
    xScale,
    yScale,
  };

  before(() => {
    wrapper = mount(
      <SVGContainer
        component={FocusedCBGSlice}
        dimensions={{ width: trendsWidth, height: trendsHeight }}
        innerProps={props}
      />
    );
  });

  describe('when no slice is focused', () => {
    let noFocusWrapper;
    before(() => {
      noFocusWrapper = mount(
        <SVGContainer
          component={FocusedCBGSlice}
          dimensions={{ width: trendsWidth, height: trendsHeight }}
          innerProps={_.omit(props, ['focusedSlice', 'focusedSliceKeys'])}
        />
      );
    });

    it('should render nothing', () => {
      expect(noFocusWrapper.find('#focusedCbgSliceLabels').length).to.equal(0);
    });
  });

  describe('when no focus keys are provided', () => {
    let noFocusKeysWrapper;
    before(() => {
      noFocusKeysWrapper = mount(
        <SVGContainer
          component={FocusedCBGSlice}
          dimensions={{ width: trendsWidth, height: trendsHeight }}
          innerProps={Object.assign({}, props, { focusedSliceKeys: null })}
        />
      );
    });

    it('should render nothing', () => {
      expect(noFocusKeysWrapper.find('#focusedCbgSliceLabels').length).to.equal(0);
    });
  });

  describe('when a slice is focused', () => {
    it('should create a focusedCbgSliceLabels <g> and three <text>s', () => {
      expect(wrapper.find('#focusedCbgSliceLabels').length).to.equal(1);
      expect(wrapper.find('#focusedCbgSliceLabels text').length).to.equal(3);
    });
  });

  describe('when the median is focused', () => {
    let medianFocusWrapper;
    before(() => {
      medianFocusWrapper = mount(
        <SVGContainer
          component={FocusedCBGSlice}
          dimensions={{ width: trendsWidth, height: trendsHeight }}
          innerProps={Object.assign({}, props, { focusedSliceKeys: ['median'] })}
        />
      );
    });

    it('should render a focusedCbgSliceLabels <g> and one <text>', () => {
      expect(medianFocusWrapper.find('#focusedCbgSliceLabels').length).to.equal(1);
      expect(medianFocusWrapper.find('#focusedCbgSliceLabels text').length).to.equal(1);
    });
  });

  describe('BG value display in mg/dL vs. mmol/L', () => {
    it('[mg/dL] should display all values as integers', () => {
      const texts = wrapper.find('#focusedCbgSliceLabels');
      for (let i = 0; i < texts.length; ++i) {
        expect(texts.childAt(i).text().search(/\./)).to.equal(-1);
      }
    });

    it('[mmol/L] should display all values with one decimal point precision', () => {
      const mmolProps = {
        bgUnits: 'mmol/L',
        focusedSlice: {
          slice: {
            firstQuartile: toMmolL(100),
            median: toMmolL(140.5),
            thirdQuartile: toMmolL(180),
            msX: 2700000,
          },
        },
      };
      const mmolLWrapper = mount(
        <SVGContainer
          component={FocusedCBGSlice}
          dimensions={{ width: trendsWidth, height: trendsHeight }}
          innerProps={Object.assign({}, props, mmolProps)}
        />
      );
      const texts = mmolLWrapper.find('#focusedCbgSliceLabels');
      for (let i = 0; i < texts.length; ++i) {
        expect(texts.childAt(i).text().search(/\./)).to.not.equal(-1);
      }
    });
  });
});

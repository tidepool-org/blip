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

import React from 'react';

import { shallow } from 'enzyme';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';

import FocusedCBGSliceHTMLLabels
  from '../../../../src/components/trends/cbg/FocusedCBGSliceHTMLLabels';
import styles
  from '../../../../src/components/trends/cbg/FocusedCBGSliceHTMLLabels.css';

// TODO: test the different classes added if tooltipLeft is true??
// TODO: test BG display based on units?
// TODO: test absolute positioning?

describe('FocusedCBGSliceHTMLLabels', () => {
  const focusedSlice = {
    slice: {
      firstQuartile: 25,
      id: 'a1b2c3',
      max: 421,
      median: 100,
      min: 28,
      msFrom: 0,
      msTo: 1800000,
      msX: 900000,
      ninetiethQuantile: 382,
      tenthQuantile: 67,
      thirdQuartile: 270,
    },
    position: {
      left: 10,
      tooltipLeft: false,
      topOptions: {
        firstQuartile: 25,
        max: 421,
        median: 100,
        min: 28,
        ninetiethQuantile: 382,
        tenthQuantile: 67,
        thirdQuartile: 270,
      },
    },
  };

  describe('when no focused slice', () => {
    it('should render nothing', () => {
      const minimalProps = {
        bgUnits: 'mmol/L',
      };
      const wrapper = shallow(
        <FocusedCBGSliceHTMLLabels {...minimalProps} />
      );
      expect(wrapper.html()).to.be.null;
    });
  });

  describe('when median is focused', () => {
    let wrapper;

    before(() => {
      wrapper = shallow(
        <FocusedCBGSliceHTMLLabels
          bgUnits={'mg/dL'}
          focusedKeys={['median']}
          focusedSlice={focusedSlice}
        />
      );
    });

    it('should render a median value label', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.medianValue))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(1);
    });

    it('should render a single explainer', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.medianExplainer))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(1);
    });
  });

  describe('when extremes are focused', () => {
    let wrapper;

    before(() => {
      wrapper = shallow(
        <FocusedCBGSliceHTMLLabels
          bgUnits={'mg/dL'}
          focusedKeys={['min', 'max']}
          focusedSlice={focusedSlice}
        />
      );
    });

    it('should render a median value label', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.medianUnfocused))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.plainNumber))).to.have.length(1);
    });

    it('should render value labels for min & max + outer quantiles', () => {
      // min & max labels
      expect(wrapper.find(formatClassesAsSelector(styles.bottomNumber))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.topNumber))).to.have.length(1);

      // tenthQuantile & ninetiethQuantile labels
      expect(wrapper.find(formatClassesAsSelector(styles.bottomNumberInside))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.topNumberInside))).to.have.length(1);

      // all the actual numbers
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(4);
    });

    it('should render two explainers', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.minExplainer))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.maxExplainer))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(2);
    });
  });

  describe('when outer quantiles are focused', () => {
    let wrapper;

    before(() => {
      wrapper = shallow(
        <FocusedCBGSliceHTMLLabels
          bgUnits={'mg/dL'}
          focusedKeys={['tenthQuantile', 'ninetiethQuantile']}
          focusedSlice={focusedSlice}
        />
      );
    });

    it('should render a median value label', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.medianUnfocused))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.plainNumber))).to.have.length(1);
    });

    it('should render value labels for tenthQuantile and ninetiethQuantile', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.bottomNumber))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.topNumber))).to.have.length(1);

      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(2);
    });

    it('should render a single explainer', () => {
      expect(wrapper.find(
        formatClassesAsSelector(styles.ninetiethQuantileExplainer)
      )).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(1);
    });
  });

  describe('when quartiles are focused', () => {
    let wrapper;

    before(() => {
      wrapper = shallow(
        <FocusedCBGSliceHTMLLabels
          bgUnits={'mg/dL'}
          focusedKeys={['firstQuartile', 'thirdQuartile']}
          focusedSlice={focusedSlice}
        />
      );
    });

    it('should render a median value label', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.medianUnfocused))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.plainNumber))).to.have.length(1);
    });

    it('should render value labels for firstQuartile and thirdQuartile', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.bottomNumber))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.topNumber))).to.have.length(1);

      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(2);
    });

    it('should render a single explainer', () => {
      expect(wrapper.find(
        formatClassesAsSelector(styles.thirdQuartileExplainer)
      )).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(1);
    });
  });
});

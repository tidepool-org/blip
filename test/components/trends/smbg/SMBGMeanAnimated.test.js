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

import _ from 'lodash';
import React from 'react';
import { TransitionMotion } from 'react-motion';

import { shallow } from 'enzyme';

import * as scales from '../../../helpers/scales';
const {
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';

import { THREE_HRS } from '../../../../src/utils/datetime';
import { SMBGMeanAnimated } from '../../../../src/components/trends/smbg/SMBGMeanAnimated';

describe('SMBGMeanAnimated', () => {
  let wrapper;
  const focus = sinon.spy();
  const unfocus = sinon.spy();
  const datum = {
    id: '5400000',
    max: 521,
    mean: 140,
    min: 22,
    msX: 5400000,
  };
  const props = {
    bgBounds,
    datum,
    defaultY: 100,
    focus,
    tooltipLeftThreshold: THREE_HRS * 6,
    unfocus,
    xScale,
    yScale,
  };

  before(() => {
    wrapper = shallow(<SMBGMeanAnimated {...props} />);
  });

  describe('when a datum (overlay data) is provided', () => {
    it('should create an array of 1 `styles` to render on the TransitionMotion', () => {
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(1);
    });

    it('should create `styles` for a <rect> vertically centered on the mean', () => {
      const { datum: { mean }, meanHeight } = wrapper.instance().props;
      const { style } = wrapper.find(TransitionMotion).prop('styles')[0];
      expect(style.y.val)
        .to.equal(yScale(mean) - meanHeight / 2);
    });
  });

  describe('when datum with `undefined` statistics (i.e., gap in data)', () => {
    let noDatumWrapper;
    before(() => {
      const noDatumProps = _.assign({}, props, {
        datum: {
          id: '5400000',
          max: undefined,
          mean: undefined,
          min: undefined,
          msX: 5400000,
        },
      });

      noDatumWrapper = shallow(<SMBGMeanAnimated {...noDatumProps} />);
    });

    it('should create an array of 0 `styles` to render on the TransitionMotion', () => {
      expect(noDatumWrapper.find(TransitionMotion).length).to.equal(1);
      const styles = noDatumWrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(0);
    });
  });
});

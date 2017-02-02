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
import { CBGSliceAnimated } from '../../../../src/components/trends/cbg/CBGSliceAnimated';

describe('CBGSliceAnimated', () => {
  let wrapper;
  const focusSlice = sinon.spy();
  const unfocusSlice = sinon.spy();
  const datum = {
    id: '2700000',
    min: 22,
    tenthQuantile: 60,
    firstQuartile: 100,
    median: 140,
    thirdQuartile: 180,
    ninetiethQuantile: 245,
    max: 521,
    msX: 2700000,
    msFrom: 1800000,
    msTo: 3600000,
  };
  const props = {
    bgBounds,
    datum,
    defaultY: 100,
    displayFlags: {
      cbg100Enabled: true,
      cbg80Enabled: true,
      cbg50Enabled: true,
      cbgMedianEnabled: true,
    },
    focusSlice,
    isFocused: false,
    tooltipLeftThreshold: 6 * THREE_HRS,
    unfocusSlice,
    xScale,
    yScale,
  };

  describe('when full datum and all `displayFlags` enabled', () => {
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...props} />);
    });

    it('should create an array of 5 `styles` to render on the TransitionMotion', () => {
      const TM = wrapper.find(TransitionMotion);
      expect(TM.prop('styles').length).to.equal(5);
    });

    describe('animation', () => {
      it('should render a TransitionMotion component', () => {
        expect(wrapper.find(TransitionMotion).length).to.equal(1);
      });

      it('should define `defaultStyles` on the TransitionMotion component', () => {
        expect(wrapper.find(TransitionMotion).prop('defaultStyles')).to.exist;
      });

      it('should define a `willEnter` instance method', () => {
        expect(CBGSliceAnimated.prototype.willEnter).to.exist;
      });

      it('should define a `willLeave` instance method', () => {
        expect(CBGSliceAnimated.prototype.willLeave).to.exist;
      });
    });
  });

  describe('when only `cbg100Enabled`', () => {
    const cbg100EnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: true,
        cbg80Enabled: false,
        cbg50Enabled: false,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...cbg100EnabledProps} />);
    });

    it('should create an array of 2 `styles` to render on the TransitionMotion', () => {
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(2);
      expect(styles[0].key).to.equal('top10');
      expect(styles[1].key).to.equal('bottom10');
    });
  });

  describe('when only `cbg80Enabled`', () => {
    const cbg80EnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: true,
        cbg50Enabled: false,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...cbg80EnabledProps} />);
    });

    it('should create an array of 2 `styles` to render on the TransitionMotion', () => {
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(2);
      expect(styles[0].key).to.equal('upper15');
      expect(styles[1].key).to.equal('lower15');
    });
  });

  describe('when only `cbg50Enabled`', () => {
    const cbg50EnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: false,
        cbg50Enabled: true,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...cbg50EnabledProps} />);
    });

    it('should create an array of 1 `styles` to render on the TransitionMotion', () => {
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(1);
      expect(styles[0].key).to.equal('innerQuartiles');
    });
  });

  describe('when only `cbgMedianEnabled`', () => {
    const cbgMedianEnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: false,
        cbg50Enabled: false,
        cbgMedianEnabled: true,
      },
    });
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...cbgMedianEnabledProps} />);
    });

    it('should create an array of 0 `styles` to render on the TransitionMotion', () => {
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(0);
    });
  });

  describe('when full datum and no `displayFlags` enabled', () => {
    const cbgMedianEnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: false,
        cbg50Enabled: false,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...cbgMedianEnabledProps} />);
    });

    it('should create an array of 0 `styles` to render on the TransitionMotion', () => {
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(0);
    });
  });

  describe('when datum with `undefined` statistics (i.e., gap in data)', () => {
    const gapInDataProps = _.assign({}, props, {
      datum: {
        id: '2700000',
        min: undefined,
        tenthQuantile: undefined,
        firstQuartile: undefined,
        median: undefined,
        thirdQuartile: undefined,
        ninetiethQuantile: undefined,
        max: undefined,
        msX: 2700000,
        msFrom: 1800000,
        msTo: 3600000,
      },
    });
    before(() => {
      wrapper = shallow(<CBGSliceAnimated {...gapInDataProps} />);
    });

    it('should create an array of 0 `styles` to render on the TransitionMotion', () => {
      expect(wrapper.find(TransitionMotion).length).to.equal(1);
      const styles = wrapper.find(TransitionMotion).prop('styles');
      expect(styles.length).to.equal(0);
    });
  });
});

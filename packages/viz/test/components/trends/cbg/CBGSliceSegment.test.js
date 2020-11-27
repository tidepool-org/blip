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

import React from 'react';
import { shallow } from 'enzyme';

import {
  CBGSliceSegment, mapDispatchToProps, mapStateToProps,
} from '../../../../src/components/trends/cbg/CBGSliceSegment';

describe('CBGSliceSegment', () => {
  let wrapper;
  const props = {
    classes: 'foo bar baz',
    datum: {
      id: 'foo',
      msX: 0,
    },
    focusSlice: sinon.spy(),
    interpolated: {
      key: 'innerQuratiles',
      style: {

      },
    },
    positionData: {
      left: 0,
      tooltipLeft: false,
      yPositions: {
        firstQuartile: 40,
        max: 100,
        median: 50,
        min: 5,
        ninetiethQuantile: 90,
        tenthQuantile: 10,
        thirdQuartile: 60,
        topMargin: 2,
      },
    },
    segment: {
      height: 12,
      heightKeys: ['firstQuartile', 'thirdQuartile'],
      y: 60,
    },
    unfocusSlice: sinon.spy(),
    userId: 'a1b2c3',
    width: 20,
    x: 5,
  };

  before(() => {
    wrapper = shallow(<CBGSliceSegment {...props} />);
  });

  it('should render a single <rect>', () => {
    expect(wrapper.find('rect').length).to.equal(1);
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusSlice.resetHistory();
      props.unfocusSlice.resetHistory();
    });

    describe('onMouseOver', () => {
      it('should fire the `focusSlice` function', () => {
        const rect = wrapper.find('rect');
        expect(props.focusSlice.callCount).to.equal(0);
        rect.simulate('mouseover');
        expect(props.focusSlice.callCount).to.equal(1);
        expect(props.focusSlice.args[0][0]).to.equal(props.userId);
        expect(props.focusSlice.args[0][1]).to.deep.equal(props.datum);
        expect(props.focusSlice.args[0][2]).to.deep.equal(props.positionData);
        expect(props.focusSlice.args[0][3]).to.deep.equal(props.segment.heightKeys);
      });
    });

    describe('onMouseOut', () => {
      describe('mouse event related target is *not* a cbg circle', () => {
        it('should fire the `unfocusSlice` function', () => {
          const rect = wrapper.find('rect');
          expect(props.unfocusSlice.callCount).to.equal(0);
          rect.simulate('mouseout', {});
          expect(props.unfocusSlice.callCount).to.equal(1);
          expect(props.unfocusSlice.args[0][0]).to.equal(props.userId);
        });
      });

      describe('mouse event related target *is* a cbg circle', () => {
        it('should NOT fire the `unfocusSlice` function', () => {
          const rect = wrapper.find('rect');
          expect(props.unfocusSlice.callCount).to.equal(0);
          rect.simulate('mouseout', {
            relatedTarget: { id: 'cbgCircle-foo-25' },
          });
          expect(props.unfocusSlice.callCount).to.equal(0);
        });
      });
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      blip: { currentPatientInViewId: 'a1b2c3' },
    };

    it('should map blip.currentPatientInViewId to `userId`', () => {
      expect(mapStateToProps(state).userId).to.equal(state.blip.currentPatientInViewId);
    });
  });

  describe('mapDispatchToProps', () => {
    it('should return an object with a `focusSlice` key', () => {
      expect(mapDispatchToProps(sinon.stub())).to.have.property('focusSlice');
    });

    it('should return an object with a `unfocusSlice` key', () => {
      expect(mapDispatchToProps(sinon.stub())).to.have.property('unfocusSlice');
    });
  });
});

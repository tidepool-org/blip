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
  SMBGMean, mapDispatchToProps, mapStateToProps,
} from '../../../../src/components/trends/smbg/SMBGMean';

describe('SMBGMean', () => {
  let wrapper;
  const props = {
    classes: 'foo bar baz',
    datum: {
      id: '5400000',
      max: 521,
      mean: 140,
      min: 22,
      msX: 5400000,
    },
    focusRange: sinon.spy(),
    interpolated: {
      key: '5400000',
      style: {
        height: 120,
        opacity: 0.5,
        width: 15,
        x: 10,
        y: 25,
      },
    },
    positionData: {
      left: 8,
      tooltipLeft: false,
      yPositions: {
        max: 150,
        mean: 80,
        min: 25,
      },
    },
    unfocusRange: sinon.spy(),
    userId: 'a1b2c3',
  };

  before(() => {
    wrapper = shallow(<SMBGMean {...props} />);
  });

  it('should render a single <rect>', () => {
    expect(wrapper.find('rect').length).to.equal(1);
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusRange.resetHistory();
      props.unfocusRange.resetHistory();
    });

    describe('onMouseOver', () => {
      it('should fire the `focusRange` function', () => {
        const rect = wrapper.find('rect');
        expect(props.focusRange.callCount).to.equal(0);
        rect.simulate('mouseover');
        expect(props.focusRange.callCount).to.equal(1);
        expect(props.focusRange.args[0][0]).to.equal(props.userId);
        expect(props.focusRange.args[0][1]).to.deep.equal(props.datum);
        expect(props.focusRange.args[0][2]).to.deep.equal(props.positionData);
      });
    });

    describe('onMouseOut', () => {
      it('should fire the `unfocusRange` function', () => {
        const rect = wrapper.find('rect');
        expect(props.unfocusRange.callCount).to.equal(0);
        rect.simulate('mouseout');
        expect(props.unfocusRange.callCount).to.equal(1);
        expect(props.unfocusRange.args[0][0]).to.equal(props.userId);
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
    it('should return an object with a `focusRange` key', () => {
      expect(mapDispatchToProps(sinon.stub())).to.have.property('focusRange');
    });

    it('should return an object with a `unfocusRange` key', () => {
      expect(mapDispatchToProps(sinon.stub())).to.have.property('unfocusRange');
    });
  });
});

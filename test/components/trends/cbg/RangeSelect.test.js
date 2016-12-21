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

import { mount } from 'enzyme';
import LabeledCheckbox from '../../../../src/components/common/controls/LabeledCheckbox';
import { RangeSelect, mapDispatchToProps }
  from '../../../../src/components/trends/cbg/RangeSelect';

describe('RangeSelect', () => {
  describe('RangeSelect (w/o redux connect()ion)', () => {
    const props = {
      currentPatientInViewId: 'a1b2c3',
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: true,
        cbg50Enabled: true,
        cbgMedianEnabled: true,
      },
      turnOnCbgRange: sinon.spy(),
      turnOffCbgRange: sinon.spy(),
    };

    const wrapper = mount(
      <RangeSelect {...props} />
    );

    describe('it should render four LabeledCheckboxes', () => {
      expect(wrapper.find(LabeledCheckbox).length).to.equal(4);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(4);
    });

    describe('clicking on the first checkbox should turn on 100%', () => {
      wrapper.find('input[type="checkbox"]').at(0).simulate('change');
      expect(props.turnOnCbgRange.callCount).to.equal(1);
      expect(props.turnOnCbgRange.calledWith('100')).to.be.true;
    });

    describe('clicking on the second checkbox should turn off 80%', () => {
      wrapper.find('input[type="checkbox"]').at(1).simulate('change');
      expect(props.turnOffCbgRange.callCount).to.equal(1);
      expect(props.turnOffCbgRange.calledWith('80')).to.be.true;
    });
  });

  describe('mapDispatchToProps', () => {
    const ownProps = { currentPatientInViewId: 'a1b2c3' };

    it('should return an object with a `turnOnCbgRange` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('turnOnCbgRange');
    });

    it('should return an object with a `turnOffCbgRange` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('turnOffCbgRange');
    });
  });
});

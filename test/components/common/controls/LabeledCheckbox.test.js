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

describe('LabeledCheckbox', () => {
  let checkedWrapper;
  let uncheckedWrapper;
  const onFn = sinon.spy();
  const offFn = sinon.spy();
  before(() => {
    const checkedProps = {
      checked: true,
      onFn,
      offFn,
      label: 'Checked Label',
      name: 'checked',
    };
    const uncheckedProps = {
      checked: false,
      onFn,
      offFn,
      label: 'Unchecked Label',
      name: 'unchecked',
    };
    checkedWrapper = mount(<LabeledCheckbox {...checkedProps} />);
    uncheckedWrapper = mount(<LabeledCheckbox {...uncheckedProps} />);
  });

  describe('Checked', () => {
    it('should render a checked checkbox', () => {
      expect(checkedWrapper.find('input[type="checkbox"]').length).to.equal(1);
      expect(checkedWrapper.find('input[type="checkbox"]').prop('checked')).to.be.true;
    });
    it('should render the label', () => {
      expect(checkedWrapper.find('label').text()).to.have.string('Checked Label');
    });
    it('should trigger offFn when changed', () => {
      expect(offFn.callCount).to.equal(0);
      checkedWrapper.find('input[type="checkbox"]').simulate('change');
      expect(offFn.callCount).to.equal(1);
    });
  });

  describe('Unchecked', () => {
    it('should render an unchecked checkbox', () => {
      expect(uncheckedWrapper.find('input[type="checkbox"]').length).to.equal(1);
      expect(uncheckedWrapper.find('input[type="checkbox"]').prop('checked')).to.be.false;
    });
    it('should render the label', () => {
      expect(uncheckedWrapper.find('label').text()).to.have.string('Unchecked Label');
    });
    it('should trigger onFn when changed', () => {
      expect(onFn.callCount).to.equal(0);
      uncheckedWrapper.find('input[type="checkbox"]').simulate('change');
      expect(onFn.callCount).to.equal(1);
    });
  });
});

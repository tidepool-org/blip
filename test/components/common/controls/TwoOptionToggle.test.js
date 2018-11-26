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

import { formatClassesAsSelector } from '../../../helpers/cssmodules';

import TwoOptionToggle, { Toggle }
  from '../../../../src/components/common/controls/TwoOptionToggle';
import styles from '../../../../src/components/common/controls/TwoOptionToggle.css';

describe('TwoOptionToggle', () => {
  let wrapper;
  const toggleFn = sinon.spy();
  before(() => {
    const props = {
      left: {
        label: 'foo',
        state: true,
      },
      right: {
        label: 'bar',
        state: false,
      },
      toggleFn,
    };
    wrapper = mount(<TwoOptionToggle {...props} />);
  });

  it('should render a Toggle', () => {
    expect(wrapper.find(Toggle)).to.have.length(1);
  });

  it('should render two labels', () => {
    expect(wrapper.find(formatClassesAsSelector(styles.label))).to.have.length(2);
  });

  it('should fire the passed-in `toggleFn` on click of Toggle', () => {
    expect(toggleFn.callCount).to.equal(0);
    wrapper.find(formatClassesAsSelector(styles.toggle)).simulate('click');
    expect(toggleFn.calledOnce).to.be.true;
  });

  it('should set the active class when not disabled', () => {
    const activeOption = wrapper.find(formatClassesAsSelector(styles.active));
    expect(activeOption).to.have.length(1);
    expect(activeOption.text()).to.equal('foo');
  });

  it('should not set the active class when disabled', () => {
    const activeOption = () => wrapper.find(formatClassesAsSelector(styles.active));

    expect(activeOption()).to.have.length(1);
    expect(activeOption().text()).to.equal('foo');

    wrapper.setProps({
      disabled: true,
      left: {
        label: 'foo',
        state: true,
      },
      right: {
        label: 'bar',
        state: false,
      },
    });

    expect(activeOption()).to.have.length(0);
  });

  it('should not fire the passed-in `toggleFn` if Toggle is disabled', () => {
    const freshToggleFn = sinon.spy();
    wrapper.setProps({
      disabled: true,
      left: {
        label: 'foo',
        state: true,
      },
      right: {
        label: 'bar',
        state: false,
      },
      toggleFn: freshToggleFn,
    });
    expect(freshToggleFn.callCount).to.equal(0);
    wrapper.find(formatClassesAsSelector(styles.toggle)).simulate('click');
    expect(freshToggleFn.callCount).to.equal(0);
  });
});

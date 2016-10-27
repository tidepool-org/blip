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

import Tooltip from '../../../../src/components/trends/common/Tooltip';
import styles from '../../../../src/components/trends/common/Tooltip.css';

describe('Tooltip', () => {
  const position = { top: 50, left: 50 };
  const title = 'Title';
  const content = 'Content';

  it('should render without issue when all properties provided', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
      />
    );
    expect(wrapper.find(formatClassesAsSelector(styles.title))).to.have.length(1);
    // title composes content, so there'll be two matches
    expect(wrapper.find(formatClassesAsSelector(styles.content))).to.have.length(2);
    expect(wrapper.find(formatClassesAsSelector(styles.tail))).to.have.length(2);
  });
  it('should render without a tail when tail is false', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        tail={false}
      />
    );
    expect(wrapper.find(formatClassesAsSelector(styles.title))).to.have.length(1);
    // title composes content, so there'll be two matches
    expect(wrapper.find(formatClassesAsSelector(styles.content))).to.have.length(2);
    expect(wrapper.find(formatClassesAsSelector(styles.tail))).to.have.length(0);
  });
});

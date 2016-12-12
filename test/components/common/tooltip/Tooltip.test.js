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

import Tooltip from '../../../../src/components/common/tooltips/Tooltip';
import styles from '../../../../src/components/common/tooltips/Tooltip.css';

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

  it('should have offset {top: -5, left: -5} when tail on left', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        side={'left'}
      />
    );
    const tailElem = wrapper.node.tailElem;
    const tailgetBoundingClientRect = sinon.stub(tailElem, 'getBoundingClientRect');
    tailgetBoundingClientRect.returns({ top: 50, left: 50, height: 10, width: 10 });
    const tooltipElem = wrapper.node.element;
    const tooltipgetBoundingClientRect = sinon.stub(tooltipElem, 'getBoundingClientRect');
    tooltipgetBoundingClientRect.returns({ top: 50, left: 50, height: 100, width: 100 });
    wrapper.instance().calculateOffset();
    expect(wrapper.state()).to.deep.equal({ offset: { top: -5, left: -5 } });
  });

  it('should have offset {top: -5, left: -105} when tail on right', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        side={'right'}
      />
    );
    const tailElem = wrapper.node.tailElem;
    const tailgetBoundingClientRect = sinon.stub(tailElem, 'getBoundingClientRect');
    tailgetBoundingClientRect.returns({ top: 50, left: 150, height: 10, width: 10 });
    const tooltipElem = wrapper.node.element;
    const tooltipgetBoundingClientRect = sinon.stub(tooltipElem, 'getBoundingClientRect');
    tooltipgetBoundingClientRect.returns({ top: 50, left: 50, height: 100, width: 100 });
    wrapper.instance().calculateOffset();
    expect(wrapper.state()).to.deep.equal({ offset: { top: -5, left: -105 } });
  });

  it('should have offset {top: -50, left: -100} when no tail, on left', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        tail={false}
        side={'left'}
      />
    );
    const tooltipElem = wrapper.node.element;
    const tooltipgetBoundingClientRect = sinon.stub(tooltipElem, 'getBoundingClientRect');
    tooltipgetBoundingClientRect.returns({ top: 50, left: 50, height: 100, width: 100 });
    wrapper.instance().calculateOffset();
    expect(wrapper.state()).to.deep.equal({ offset: { top: -50, left: -100 } });
  });

  it('should have offset {top: -50, left: 0} when no tail, on right', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        tail={false}
        side={'right'}
      />
    );
    const tooltipElem = wrapper.node.element;
    const tooltipgetBoundingClientRect = sinon.stub(tooltipElem, 'getBoundingClientRect');
    tooltipgetBoundingClientRect.returns({ top: 50, left: 50, height: 100, width: 100 });
    wrapper.instance().calculateOffset();
    expect(wrapper.state()).to.deep.equal({ offset: { top: -50, left: 0 } });
  });

  it('should have offset {top: -100, left: -50} when no tail, on top', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        tail={false}
        side={'top'}
      />
    );
    const tooltipElem = wrapper.node.element;
    const tooltipgetBoundingClientRect = sinon.stub(tooltipElem, 'getBoundingClientRect');
    tooltipgetBoundingClientRect.returns({ top: 50, left: 50, height: 100, width: 100 });
    wrapper.instance().calculateOffset();
    expect(wrapper.state()).to.deep.equal({ offset: { top: -100, left: -50 } });
  });

  it('should have offset {top: 0, left: -50} when no tail, on bottom', () => {
    const wrapper = mount(
      <Tooltip
        position={position}
        title={title}
        content={content}
        tail={false}
        side={'bottom'}
      />
    );
    const tooltipElem = wrapper.node.element;
    const tooltipgetBoundingClientRect = sinon.stub(tooltipElem, 'getBoundingClientRect');
    tooltipgetBoundingClientRect.returns({ top: 0, left: 50, height: 100, width: 100 });
    wrapper.instance().calculateOffset();
    expect(wrapper.state()).to.deep.equal({ offset: { top: 0, left: -50 } });
  });
});

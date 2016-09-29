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

import NoData from '../../../../src/components/trends/common/NoData';

describe('NoData', () => {
  const xPos = 10;
  const yPos = 50;

  it('should render without issue when all properties provided', () => {
    const wrapper = shallow(
      <NoData
        xPos={xPos}
        yPos={yPos}
      />
    );
    expect(wrapper.find('text')).to.have.length(1);
  });
  it('should render given with x and y position', () => {
    const wrapper = shallow(
      <NoData
        xPos={xPos}
        yPos={yPos}
      />
    );
    expect(wrapper.find('text[x=10]')).to.have.length(1);
    expect(wrapper.find('text[y=50]')).to.have.length(1);
  });
  it('should not render when yPos not provided', () => {
    const wrapper = shallow(
      <NoData
        xPos={xPos}
      />
    );
    expect(wrapper.find('text')).to.have.length(0);
  });
  it('should not render when xPos not provided', () => {
    const wrapper = shallow(
      <NoData
        yPos={yPos}
      />
    );
    expect(wrapper.find('text')).to.have.length(0);
  });
  it('should render with the provided data type in the message', () => {
    const wrapper = shallow(
      <NoData
        dataType='TEST'
        xPos={xPos}
        yPos={yPos}
      />
    );
    expect(wrapper.find('text').text()).to.equal('There is no TEST data for this time period :(');
  });
  it('should render with default CBG message when no type provided', () => {
    const wrapper = shallow(
      <NoData
        xPos={xPos}
        yPos={yPos}
      />
    );
    expect(wrapper.find('text').text()).to.equal('There is no CBG data for this time period :(');
  });
});

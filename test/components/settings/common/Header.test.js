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

import Header from '../../../../src/components/settings/common/Header';

describe('Header', () => {
  it('should expand to show serial number on click of device name', () => {
    const wrapper = shallow(
      <Header
        deviceDisplayName="Testing"
        deviceMeta={{ name: 'SN123', uploaded: 'Jul 12th 2016' }}
        printView={false}
      />
    );
    expect(wrapper.state().serialNumberExpanded).to.be.false;
    wrapper.find('ul').at(0).simulate('click');
    expect(wrapper.state().serialNumberExpanded).to.be.true;
    wrapper.find('ul').at(0).simulate('click');
    expect(wrapper.state().serialNumberExpanded).to.be.false;
  });
});

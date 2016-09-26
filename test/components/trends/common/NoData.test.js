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
  const messageProp = 'Nothing to see here :(';
  const marginsProp = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const dimensionsProp = {
    width: 100,
    height: 50,
  };

  it('should render without issue when all properties provided', () => {
    console.error = sinon.stub();
    shallow(
      <NoData
        message={messageProp}
        margins={marginsProp}
        dimensions={dimensionsProp}
      />
    );
    expect(console.error.callCount).to.equal(0);
  });
  it('should render with one issue when no message provided', () => {
    console.error = sinon.stub();
    shallow(
      <NoData
        margins={marginsProp}
        dimensions={dimensionsProp}
      />
    );
    expect(console.error.callCount).to.equal(1);
  });
  it('should render with one issue when no margins provided', () => {
    console.error = sinon.stub();
    shallow(
      <NoData
        message={messageProp}
        dimensions={dimensionsProp}
      />
    );
    expect(console.error.callCount).to.equal(1);
  });
  it('should render with one issue when no dimensions provided', () => {
    console.error = sinon.stub();
    shallow(
      <NoData
        message={messageProp}
        margins={marginsProp}
      />
    );
    expect(console.error.callCount).to.equal(1);
  });
  it('should render with the provided message', () => {
    const wrapper = shallow(
      <NoData
        message="other message"
        margins={marginsProp}
        dimensions={dimensionsProp}
      />
    );
    expect(wrapper.find('text').text()).to.equal('other message');
  });
});

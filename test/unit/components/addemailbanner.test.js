/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2019, Tidepool Project
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
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';

import AddEmailBanner from '../../../app/components/addemailbanner';
import { URL_DEXCOM_CONNECT_INFO } from '../../../app/core/constants';

const expect = chai.expect;

describe('AddEmailBanner', () => {
  const props = {
    patient: { userid: 1234 },
    trackMetric: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <AddEmailBanner
        {...props}
      />
    );
  });

  afterEach(() => {
    props.trackMetric.reset();
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.addEmailBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render an add email button', () => {
    const expectedText = 'ADD EMAIL'
    const emailButton = wrapper.find('button');

    expect(emailButton).to.have.length(1);
    expect(emailButton.text()).contains(expectedText);
  });

  it('should track when the add email button is clicked', () => {
    const emailButton = wrapper.find('button');
    emailButton.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'Clicked Banner Add Email');
  });
});

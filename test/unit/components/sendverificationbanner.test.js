/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';

import SendVerificationBanner from '../../../app/components/sendverificationbanner';

const expect = chai.expect;

describe('SendVerificationBanner', () => {
  const props = {
    patient: { userid: 1234, username: 'test@example.com' },
    trackMetric: sinon.stub(),
    resendVerification: sinon.stub(),
    resendEmailVerificationProgress: false,
    resentEmailVerification: false,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <SendVerificationBanner
        {...props}
      />
    );
  });

  afterEach(() => {
    props.trackMetric.reset();
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.sendVerificationBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render a resend verification button', () => {
    const expectedText = 'RESEND VERIFICATION EMAIL'
    const verificationButton = wrapper.find('button');

    expect(verificationButton).to.have.length(1);
    expect(verificationButton.text()).contains(expectedText);
  });

  it('should track when the add email button is clicked', () => {
    const verificationButton = wrapper.find('button');
    verificationButton.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'Clicked Banner Resend Verification');
  });

  it('should call resendVerification when the resend verification button is clicked', () => {
    const verificationButton = wrapper.find('button');
    verificationButton.simulate('click');

    sinon.assert.calledWith(props.resendVerification, props.patient.username);
  });
});

/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
import { browserHistory } from 'react-router'
import { shallow, mount } from 'enzyme';

import DonateBanner from '../../../app/components/donatebanner';
import { TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL, URL_BIG_DATA_DONATION_INFO } from '../../../app/core/constants';

const expect = chai.expect;

describe('DonateBanner', () => {
  const props = {
    onClose: sinon.stub(),
    onConfirm: sinon.stub(),
    patient: { userid: 1234 },
    processingDonation: false,
    trackMetric: sinon.stub(),
    userIsDonor: false,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <DonateBanner
        {...props}
      />
    );
  });

  afterEach(() => {
    props.onClose.reset();
    props.onConfirm.reset();
    props.trackMetric.reset();
  });

  it('should be a function', () => {
    expect(DonateBanner).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.donateBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render a link to the data donation page on the website', () => {
    const expectedText = 'Learn More'
    const messageLink = wrapper.find('.message-link');

    expect(messageLink).to.have.length(1);
    expect(messageLink.find({ href: URL_BIG_DATA_DONATION_INFO })).to.have.length(1);
    expect(messageLink.text()).contains(expectedText);
  });

  it('should render a close link to dismiss the banner', () => {
    const closeLink = wrapper.find('a.close');
    expect(closeLink).to.have.length(1);
  });

  it('should call the dismiss handler with the patient userid when the close link is clicked', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.onClose);
    sinon.assert.calledWith(props.onClose, props.patient.userid);
  });

  it('should track the appropriate metric when the close link is clicked for the signup banner', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'web - dismiss big data sign up banner');
  });

  it('should track the appropriate metric when the close link is clicked for the share proceeds banner', () => {
    wrapper.setProps({ userIsDonor: true });
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'web - dismiss big data share proceeds banner');
  });

  describe('render', function () {
    context('User is not yet a donor', () => {
      it('should render a donate message', () => {
        const expectedText = 'Donate your data.'
        const messageText = wrapper.find('.message-text');

        expect(messageText).to.have.length(1);
        expect(messageText.text()).contains(expectedText);
      });

      it('should render a donate button', () => {
        const expectedText = 'Donate my anonymized data'
        const button = wrapper.find('button');

        expect(button).to.have.length(1);
        expect(button.text()).contains(expectedText);
      });

      it('should call the submit handler when the donate button is clicked', () => {
        const button = wrapper.find('button');
        button.simulate('click');
        sinon.assert.calledOnce(props.onConfirm);
        sinon.assert.calledWith(props.onConfirm, [TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL]);
      });

      it('should track the metrics when the donate button is clicked', () => {
        const button = wrapper.find('button');
        button.simulate('click');
        sinon.assert.calledOnce(props.trackMetric);
        sinon.assert.calledWith(props.trackMetric, 'web - big data sign up', { source: 'none', location: 'banner' });
      });

      it('should not call the submit handler when the donate button is clicked while the submission is processing', () => {
        wrapper.setProps({ processingDonation: true });

        const button = wrapper.find('button');
        button.simulate('click');

        sinon.assert.notCalled(props.onConfirm);
      });
    });

    context('User is already a donor, but hasn\'t shared proceeds with a nonprofit', () => {
      beforeEach(() => {
        wrapper.setProps({ userIsDonor: true });
      });

      it('should render a share proceeds message', () => {
        const expectedText = 'Donate proceeds'
        const messageText = wrapper.find('.message-text');

        expect(messageText).to.have.length(1);
        expect(messageText.text()).contains(expectedText);
      });

      it('should render a share proceeds button', () => {
        const expectedText = 'Choose a diabetes nonprofit'
        const button = wrapper.find('button');

        expect(button).to.have.length(1);
        expect(button.text()).contains(expectedText);
      });

      it('should redirect to the settings page when the share proceeds button is clicked', () => {
        sinon.spy(browserHistory, 'push');

        const button = wrapper.find('button');
        button.simulate('click');

        sinon.assert.calledOnce(browserHistory.push);
        sinon.assert.calledWith(browserHistory.push, `/patients/${props.patient.userid}/profile`);
      });

      it('should not call the submit handler when the donate button is clicked', () => {
        const button = wrapper.find('button');
        button.simulate('click');

        sinon.assert.notCalled(props.onConfirm);
      });

      it('should not track metrics when the donate button is clicked', () => {
        const button = wrapper.find('button');
        button.simulate('click');

        sinon.assert.notCalled(props.trackMetric);
      });
    });
  });
});

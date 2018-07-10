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

import DexcomBanner from '../../../app/components/dexcombanner';
import { URL_DEXCOM_CONNECT_INFO } from '../../../app/core/constants';

const expect = chai.expect;

describe('DexcomBanner', () => {
  const props = {
    onClick: sinon.stub(),
    onClose: sinon.stub(),
    patient: { userid: 1234 },
    trackMetric: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <DexcomBanner
        {...props}
      />
    );
  });

  afterEach(() => {
    props.onClose.reset();
    props.onClick.reset();
    props.trackMetric.reset();
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.dexcomBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render a link to the dexcom connect info on the website', () => {
    const expectedText = 'Learn More'
    const messageLink = wrapper.find('.message-link');

    expect(messageLink).to.have.length(1);
    expect(messageLink.find({ href: URL_DEXCOM_CONNECT_INFO })).to.have.length(1);
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

  it('should track the appropriate metric when the close link is clicked for the banner', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'dismiss Dexcom OAuth banner');
  });

  it('should track the appropriate metric when the learn more link is clicked', () => {
    const moreLink = wrapper.find('a.message-link');
    moreLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked learn more Dexcom OAuth banner');
  });

  it('should call the submit handler when the dexcom button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.onClick);
  });

  it('should track the metrics when the dexcom button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked get started on Dexcom banner');
  });

  describe('render', function () {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.dexcomBanner')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render a dexcom message', () => {
      const expectedText = 'Using Dexcom G5 Mobile on Android? See your data in Tidepool.'
      const messageText = wrapper.find('.message-text');

      expect(messageText).to.have.length(1);
      expect(messageText.text()).contains(expectedText);
    });

    it('should render a link to the dexcom connect info on the website', () => {
      const expectedText = 'Learn More'
      const messageLink = wrapper.find('.message-link');

      expect(messageLink).to.have.length(1);
      expect(messageLink.find({ href: URL_DEXCOM_CONNECT_INFO })).to.have.length(1);
      expect(messageLink.text()).contains(expectedText);
    });

    it('should render a get started button', () => {
      const expectedText = 'Get Started'
      const button = wrapper.find('button');

      expect(button).to.have.length(1);
      expect(button.text()).contains(expectedText);
    });

    it('should render a close link to dismiss the banner', () => {
      const closeLink = wrapper.find('a.close');
      expect(closeLink).to.have.length(1);
    });
  });
});

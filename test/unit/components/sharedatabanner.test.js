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
import { shallow, mount } from 'enzyme';

import ShareDataBanner from '../../../app/components/sharedatabanner';
import { URL_SHARE_DATA_INFO } from '../../../app/core/constants';

const expect = chai.expect;

describe('ShareDataBanner', () => {
  const props = {
    onClick: sinon.stub(),
    onClose: sinon.stub(),
    patient: { userid: 1234 },
    trackMetric: sinon.stub(),
    history: {
      push: sinon.stub(),
    },
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <ShareDataBanner
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

    expect(wrapper.find('.shareDataBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render a link to a share data help article on tidepool website', () => {
    const expectedText = 'Learn More'
    const messageLink = wrapper.find('.message-link');

    expect(messageLink).to.have.length(1);
    expect(messageLink.find({ href: URL_SHARE_DATA_INFO })).to.have.length(1);
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
    sinon.assert.calledWith(props.trackMetric, 'dismiss Share Data banner');
  });

  it('should track the appropriate metric when the learn more link is clicked', () => {
    const moreLink = wrapper.find('a.message-link');
    moreLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked learn more Share Data banner');
  });

  it('should call the submit handler when the share data button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.onClick);
  });

  it('should track the metrics when the share data button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked get started on Share Data banner');
  });

  describe('render', function () {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.shareDataBanner')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render a share data message', () => {
      const expectedText = 'New Tidepool Account? Share Your Data with your healthcare team.'
      const messageText = wrapper.find('.message-text');

      expect(messageText).to.have.length(1);
      expect(messageText.text()).contains(expectedText);
    });

    it('should render a link to share data article on tidepool website', () => {
      const expectedText = 'Learn More'
      const messageLink = wrapper.find('.message-link');

      expect(messageLink).to.have.length(1);
      expect(messageLink.find({ href: URL_SHARE_DATA_INFO })).to.have.length(1);
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

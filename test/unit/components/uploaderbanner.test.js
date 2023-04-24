/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';

import { UploaderBanner } from '../../../app/components/uploaderbanner';

const expect = chai.expect;

describe('UploaderBanner', () => {
  const props = {
    onClose: sinon.stub(),
    onClick: sinon.stub(),
    user: { userid: 1234 },
    trackMetric: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <UploaderBanner
        {...props}
      />
    );
  });

  afterEach(() => {
    props.onClose.reset();
    props.onClick.reset();
    props.trackMetric.reset();
  });

  it('should be a function', () => {
    expect(UploaderBanner).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.uploaderBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render a link to the install guide page on the website', () => {
    const expectedText = 'See the Install Guide'
    const messageLink = wrapper.find('.message-link');
    expect(messageLink).to.have.length(1);
    expect(messageLink.text()).contains(expectedText);
  });

  it('should call the submit handler when the message link is clicked', () => {
    const messageLink = wrapper.find('.message-link');
    messageLink.simulate('click');
    sinon.assert.calledOnce(props.onClick);
    sinon.assert.calledWith(props.onClick, props.user.userid);
  });

  it('should track the metrics when the message link is clicked', () => {
    const messageLink = wrapper.find('.message-link');
    messageLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked learn more on Uploader Install banner');
  });

  it('should render a close link to dismiss the banner', () => {
    const closeLink = wrapper.find('a.close');
    expect(closeLink).to.have.length(1);
  });

  it('should call the dismiss handler with the patient userid when the close link is clicked', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.onClose);
    sinon.assert.calledWith(props.onClose, props.user.userid);
  });

  it('should track the appropriate metric when the close link is clicked for the uploader banner', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'dismiss Uploader Install banner');
  });

  it('should render a message', () => {
    const expectedText = 'If you\'ll be uploading your devices at home, download the latest version of Tidepool Uploader.'
    const messageText = wrapper.find('.message-text');

    expect(messageText).to.have.length(1);
    expect(messageText.text()).contains(expectedText);
  });

  it('should render a download button', () => {
    const expectedText = 'Download Latest'
    const button = wrapper.find('button');

    expect(button).to.have.length(1);
    expect(button.text()).contains(expectedText);
  });

  it('should call the submit handler when the download button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.onClick);
    sinon.assert.calledWith(props.onClick, props.user.userid);
  });

  it('should track the metrics when the download button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked get started on Uploader Install banner');
  });
});

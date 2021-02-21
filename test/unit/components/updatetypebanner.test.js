/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';

import { UpdateTypeBanner } from '../../../app/components/updatetypebanner';

const expect = chai.expect;

describe('UpdateTypeBanner', () => {
  const props = {
    onClick: sinon.stub(),
    onClose: sinon.stub(),
    patient: { userid: 1234 },
    trackMetric: sinon.stub(),
    push: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <UpdateTypeBanner
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

    expect(wrapper.find('.updateTypeBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
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
    sinon.assert.calledWith(props.trackMetric, 'dismiss Update Type banner');
  });

  it('should track the appropriate metric when the learn more link is clicked', () => {
    const moreLink = wrapper.find('a.message-link');
    moreLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked learn more Update Type banner');
  });

  it('should call the submit handler when the update type button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.onClick);
  });

  it('should track the metrics when the update type button is clicked', () => {
    const button = wrapper.find('button');
    button.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'clicked get started on Update Type banner');
  });

  describe('render', function () {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.updateTypeBanner')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render a update type message', () => {
      const expectedText = 'Complete your profile'
      const messageText = wrapper.find('.message-text');

      expect(messageText).to.have.length(1);
      expect(messageText.text()).contains(expectedText);
    });

    it('should render a update my profile button', () => {
      const expectedText = 'Update My Profile'
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

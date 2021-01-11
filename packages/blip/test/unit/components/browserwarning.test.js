
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import BrowserWarning from '../../../app/components/browserwarning';

describe('BrowserWarning', function () {
  it('should be a function', function() {
    expect(BrowserWarning).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const props = {
        trackMetric: sinon.stub()
      };
      const wrapper = mount(<BrowserWarning {...props} />);
      expect(wrapper.exists('.browser-warning')).to.be.true;
      wrapper.unmount();
    });

    it('should fire metric when mounted/rendered', function() {
      const props = {
        trackMetric: sinon.stub()
      };
      const wrapper = mount(<BrowserWarning {...props} />);
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Chrome Required - Screen Displayed')).to.be.true;
      wrapper.unmount();
    });

    it('should fire metric when google play clicked', function() {
      const props = {
        trackMetric: sinon.stub()
      };
      const wrapper = mount(<BrowserWarning {...props} />);
      const playButton = wrapper.find('.playstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Chrome Required - Screen Displayed')).to.be.true;
      playButton.at(0).simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked Android')).to.be.true;
    });


    it('should fire metric when apple play store clicked', function() {
      const props = {
        trackMetric: sinon.stub()
      };
      const wrapper = mount(<BrowserWarning {...props} />);
      const appStoreButton = wrapper.find('.appstore-badge');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('Chrome Required - Screen Displayed')).to.be.true;
      appStoreButton.at(0).simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('No Data - Clicked iOS')).to.be.true;
    });
  });
});

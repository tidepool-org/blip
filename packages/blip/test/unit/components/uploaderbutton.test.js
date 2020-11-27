/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount, shallow } from 'enzyme';

import UploaderButton from '../../../app/components/uploaderbutton';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../../app/core/constants';

const expect = chai.expect;

describe('UploaderButton', function () {
  const props = {
    buttonText: 'Get the Tidepool Uploader',
    onClick: sinon.spy()
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <UploaderButton
        {...props}
      />
    );
  });

  it('should be a function', function() {
    expect(UploaderButton).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      expect(wrapper.find(UploaderButton)).to.have.length(1);
    });

    it('should have a pair of download links', function () {
      expect(wrapper.find('a.btn-uploader')).to.have.length(2);
    });

    it('should have disabled download buttons if no URLs have been set', () => {
      wrapper.instance().getWrappedInstance().setState({
        latestWinRelease: null,
        latestMacRelease: null,
      });
      expect(wrapper.find('a.disabled')).to.have.length(2);
    });

    it('should have active buttons if URLs have been set', () => {
      wrapper.instance().getWrappedInstance().setState({
        latestMacRelease: 'test',
        latestWinRelease: 'test',
      });
      wrapper.update();
      expect(wrapper.find('a')).to.have.length(2);
      expect(wrapper.find('a.disabled')).to.have.length(0);
    });

    it('should display download link if error retrieving github releases', () => {
      wrapper.instance().getWrappedInstance().setState({
        error: 'some error',
      });
      wrapper.update();
      expect(wrapper.find({ href: URL_UPLOADER_DOWNLOAD_PAGE }).filter('a')).to.have.length(1);
      expect(wrapper.find('.btn-uploader').someWhere(n => (n.text().search(props.buttonText) !== -1))).to.be.true;
    });

    it('should respond to an onClick event', () => {
      wrapper.instance().getWrappedInstance().setState({
        error: 'some error',
      });
      wrapper.update();
      var callCount = props.onClick.callCount;
      wrapper.find('a').simulate('click');
      expect(props.onClick.callCount).to.equal(callCount + 1);
    });
  });
});

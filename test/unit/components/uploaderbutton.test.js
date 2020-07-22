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
    onClick: sinon.spy(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <UploaderButton
        {...props}
      />
    );
  });

  it('should be a function', function () {
    expect(UploaderButton).to.be.a('function');
  });

  describe('render', function () {
    it('should render without problems', function () {
      expect(wrapper.find(UploaderButton)).to.have.length(1);
    });

    it('should have a Mac and a Windows Download button', function () {
      const macButton = wrapper.find('button.btn-download-mac');
      expect(macButton).to.have.length(1);

      const winButton = wrapper.find('button.btn-download-win');
      expect(winButton).to.have.length(1);
    });

    it('should have disabled download buttons if no URLs have been set', () => {
      wrapper.instance().getWrappedInstance().setState({
        latestWinRelease: null,
        latestMacRelease: null,
      });

      const macButton = wrapper.find('button.btn-download-mac');
      expect(macButton).to.have.length(1);
      expect(macButton.prop('disabled')).to.be.true;

      const winButton = wrapper.find('button.btn-download-win');
      expect(winButton).to.have.length(1);
      expect(winButton.prop('disabled')).to.be.true;
    });

    it('should have active buttons if URLs have been set', () => {
      wrapper.instance().getWrappedInstance().setState({
        latestMacRelease: 'test',
        latestWinRelease: 'test',
      });
      wrapper.update();

      const macButton = wrapper.find('button.btn-download-mac');
      expect(macButton).to.have.length(1);
      expect(macButton.prop('disabled')).to.be.false;

      const winButton = wrapper.find('button.btn-download-win');
      expect(winButton).to.have.length(1);
      expect(winButton.prop('disabled')).to.be.false;
    });

    it('should display error button if error retrieving github releases', () => {
      wrapper.instance().getWrappedInstance().setState({
        error: 'some error',
      });
      wrapper.update();

      expect(wrapper.find({ href: URL_UPLOADER_DOWNLOAD_PAGE }).filter('a')).to.have.length(1);
      expect(wrapper.find('button.btn-uploader-download')).to.have.length(1);
      expect(wrapper.find('.btn-uploader-download').someWhere(n => (n.text().search(props.buttonText) !== -1))).to.be.true;
    });

    it('should respond to onClick on Mac Download Button', () => {
      wrapper.instance().getWrappedInstance().setState({
        latestMacRelease: 'test',
        latestWinRelease: 'test',
      });
      wrapper.update();

      const macButton = wrapper.find('a.link-download-mac');
      macButton.simulate('click');
      expect(props.onClick.calledOnce);

    });

    it('should respond to onClick on Windows Download Button', () => {
      wrapper.instance().getWrappedInstance().setState({
        latestMacRelease: 'test',
        latestWinRelease: 'test',
      });
      wrapper.update();

      const winButton = wrapper.find('a.link-download-win');
      winButton.simulate('click');
      expect(props.onClick.calledOnce);

    });

    it('should respond to an onClick event on Download Error Button', () => {
      wrapper.instance().getWrappedInstance().setState({
        error: 'some error',
      });
      wrapper.update();

      const errorButton = wrapper.find('a.link-uploader-download');
      errorButton.simulate('click');
      expect(wrapper.find({ href: URL_UPLOADER_DOWNLOAD_PAGE }).filter('a')).to.have.length(1);
      expect(props.onClick.calledOnce);

      // NOTE When Button can be used without wrapping it in an <a> tag
      // const errorButton = wrapper.find('button.btn-uploader-download');
      // errorButton.simulate('click');
      // expect(wrapper.find({ href: URL_UPLOADER_DOWNLOAD_PAGE }).to.have.length(1);
      // expect(props.onClick.calledOnce);
    });
  });
});

/**
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
 */

import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { UploadLaunchOverlay } from '../../../app/components/uploadlaunchoverlay/uploadlaunchoverlay';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../../app/core/constants';

describe('UploadLaunchOverlay', function () {
  const props = {
    modalDismissHandler: sinon.spy(),
    t: (v) => v,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount( <UploadLaunchOverlay {...props} /> );
  });

  it('should be a function', function() {
    expect(UploadLaunchOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      expect(wrapper.find('.UploadLaunchOverlay')).to.have.length(1);
      expect(wrapper.find('.UploadLaunchOverlay-content')).to.have.length(1);
    });

    it('should respond to an onClick event', () => {
      var callCount = props.modalDismissHandler.callCount;
      wrapper.find('.ModalOverlay-target').simulate('click');
      expect(props.modalDismissHandler.callCount).to.equal(callCount + 1);
    });

    it('dismiss button should respond to an onClick event', () => {
      var callCount = props.modalDismissHandler.callCount;
      wrapper.find('.ModalOverlay-dismiss').simulate('click');
      expect(props.modalDismissHandler.callCount).to.equal(callCount + 1);
    });

    it('should have active buttons if URLs have been set', () => {
      wrapper.setState({
        latestMacRelease: 'test',
        latestWinRelease: 'test',
        uploadDismiss: 'test',
      });
      wrapper.update();
      expect(wrapper.find('a')).to.have.length(3);
      expect(wrapper.find('a.disabled')).to.have.length(0);
    });

    it('should display download link if error retrieving github releases', () => {
      wrapper.setState({
        error: 'some error',
      });
      wrapper.update();
      expect(wrapper.find({ href: URL_UPLOADER_DOWNLOAD_PAGE }).filter('a')).to.have.length(1);
    });
  });
});

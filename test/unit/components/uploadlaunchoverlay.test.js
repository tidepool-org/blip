/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';

import UploadLaunchOverlay from '../../../app/components/uploadlaunchoverlay';
import ModalOverlay from '../../../app/components/modaloverlay';

const expect = chai.expect;

describe('UploadLaunchOverlay', function () {
  const props = {
    modalDismissHandler: sinon.spy(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount( <UploadLaunchOverlay {...props} /> );
  });

  // it('should be a function', function() {
  //   expect(UploadLaunchOverlay).to.be.a('function');
  // });

  // describe('render', function() {
  //   it('should render without problems', function () {
  //     expect(wrapper.find(UploadLaunchOverlay)).to.have.length(1);
  //     expect(wrapper.find(ModalOverlay)).to.have.length(1);
  //   });

  //   it('should respond to an onClick event', () => {
  //     var callCount = props.modalDismissHandler.callCount;
  //     wrapper.find('.ModalOverlay-target').simulate('click');
  //     expect(props.modalDismissHandler.callCount).to.equal(callCount + 1);
  //   });

  //   it('dismiss button should respond to an onClick event', () => {
  //     var callCount = props.modalDismissHandler.callCount;
  //     wrapper.find('.ModalOverlay-dismiss').simulate('click');
  //     expect(props.modalDismissHandler.callCount).to.equal(callCount + 1);
  //   });
  // });
});

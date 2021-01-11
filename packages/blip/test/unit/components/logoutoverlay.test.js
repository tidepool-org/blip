
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';

import LogoutOverlay from '../../../app/components/logoutoverlay';

describe('LogoutOverlay', function () {
  before(() => {
    sinon.stub(console, 'error');
  });
  after(() => {
    sinon.restore();
  });

  it('should be exposed as a module and be of type function', function() {
    expect(LogoutOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const wrapper = mount(<LogoutOverlay />);
      expect(console.error.callCount).to.equal(0);
      wrapper.unmount();
    });
  });

  describe('Initial State', function() {
    it('should have fadeOut initially equal to false', function() {
      console.error.resetHistory();
      const wrapper = mount(<LogoutOverlay />);
      expect(wrapper.state().fadeOut).to.be.false;
      expect(console.error.callCount).to.equal(0);
      wrapper.unmount();
    });
  });
});

import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';
import chai from 'chai';
import { shallow } from 'enzyme';

import '../../../app/core/language';
import Navbar from '../../../app/components/navbar';

describe('Navbar', () => {
  const { expect } = chai;
  let wrapper;
  const props = { trackMetric: sinon.spy() };

  before(() => {
    sinon.spy(console, 'error');
    wrapper = shallow(<Navbar {...props} />);
  });

  after(() => {
    console.error.restore();
  });

  it('should be exposed as a module and be of type function', function() {
    expect(Navbar).to.be.a('function');
  });

  describe('render', () => {
    it('should render without problems when required props present', () => {
      // @ts-ignore
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('interactions', () => {
    it('should fire trackMetric when the logo is clicked', () => {
      const logo = wrapper.find('.Navbar-logo');
      expect(props.trackMetric.callCount).to.equal(0);
      logo.simulate('click');
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.firstCall.args[0]).to.equal('Clicked Navbar Logo');
    });
  });
});

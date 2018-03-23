/* global after, before, chai, describe, it, sinon */

import React from 'react';
import { shallow } from 'enzyme';

import '../../../app/core/language';
import Navbar from '../../../app/components/navbar';

const expect = chai.expect;

describe('Navbar', ()  => {
  let wrapper;
  const props = { trackMetric: sinon.spy() };
  before(() => {
    console.error = sinon.spy();
    // we have to rewire IndexLink because React Router throws an error
    // when rendering a IndexLink or Link out of the routing context :(
    Navbar.__Rewire__('IndexLink', (props) => {
      return (
        <div>
          {props.children}
        </div>
      );
    });
    // The HOC makes it difficult to access / set properties of the pure component,
    // in this case the trackMetric property of PureNavbar. So we test
    // on the pure component instead.
    wrapper = shallow(<Navbar.WrappedComponent {...props} />);
  });

  after(() => {
    Navbar.__ResetDependency__('IndexLink');
  });

  it('should be exposed as a module and be of type function', function() {
    expect(Navbar).to.be.a('function');
  });

  describe('render', () => {
    it('should render without problems when required props present', () => {
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

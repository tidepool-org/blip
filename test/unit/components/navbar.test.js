/* global after, before, chai, describe, it, sinon, beforeEach, context */

import React from 'react';
import { shallow } from 'enzyme';

import '../../../app/core/language';
import Navbar from '../../../app/components/navbar';

const expect = chai.expect;

describe('Navbar', ()  => {
  let wrapper;
  let consoleErrorSpy;

  const props = {
    trackMetric: sinon.spy(),
    t: sinon.stub().callsFake((string) => string),
  };

  before(() => {
    consoleErrorSpy = sinon.spy(console, 'error');
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
    wrapper = shallow(<Navbar {...props} />).dive();
  });

  after(() => {
    Navbar.__ResetDependency__('IndexLink');
  });

  it('should be exposed as a module and be of type function', function() {
    expect(Navbar).to.be.a('function');
  });

  describe('render', () => {
    it('should render without problems when required props present', () => {
      expect(consoleErrorSpy.callCount).to.equal(0);
    });
  });

  it('should render a patient list link when viewing the TIDE dashboard view as a clinic clinician', () => {
    const clinicClinicianProps = {
      ...props,
      clinicFlowActive: true,
      user: {
        isClinicMember: true,
      },
      selectedClinicId: 'clinic123',
    };

    wrapper = shallow(<Navbar {...clinicClinicianProps} currentPage="/dashboard/tide" />).dive();
    expect(wrapper.find('Link[to="/clinic-workspace/patients"]')).to.have.lengthOf(1);
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

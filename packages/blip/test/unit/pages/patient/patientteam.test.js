/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';
import i18next from '../../../../app/core/language';

import { PatientTeam, MemberInviteForm } from '../../../../app/pages/patient/patientteam';

const expect = chai.expect;
const t = i18next.t.bind(i18next);

describe('PatientTeam', function () {
  const props = {
    acknowledgeNotification: sinon.stub(),
    cancellingInvite: false,
    changingMemberPermissions: false,
    invitingMemberInfo: {inProgress: false, notification: null},
    onCancelInvite: sinon.stub(),
    onChangeMemberPermissions: sinon.stub(),
    onInviteMember: sinon.stub(),
    onRemoveMember: sinon.stub(),
    patient: {},
    pendingSentInvites: [],
    removingMember: false,
    trackMetric: sinon.stub(),
    user: {},
    t
  };

  let wrapper;
  beforeEach(() => {
    props.trackMetric.reset();
    wrapper = mount(
      <PatientTeam.WrappedComponent
        {...props}
      />
    );
  });
  describe('state', function() {
    it('should return an object with four items', function() {
      expect(Object.keys(wrapper.state()).length).to.equal(4);
    });
    it('should return showModalOverlay as false', function() {
      expect(wrapper.state().showModalOverlay).to.equal(false);
    });
    it('should return dialog as empty string', function() {
      expect(wrapper.state().dialog).to.equal('');
    });
    it('should return invite as false', function() {
      expect(wrapper.state().invite).to.equal(false);
    });
    it('should return editing as false', function() {
      expect(wrapper.state().editing).to.equal(false);
    });
  });
  describe('metric', function() {
    it('should be tracked when allowUpload is updated to true for existing member', function() {
      expect(props.trackMetric.callCount).to.equal(0);
      const handlePermissionChangeFunc =  wrapper.instance().handlePermissionChange({ userid: 123 , profile: { fullName: 'testing 123' }});
      handlePermissionChangeFunc(true);
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('upload permission turned on')).to.be.true;
    });
    it('should be tracked when allowUpload is updated to false for existing member', function() {
      expect(props.trackMetric.callCount).to.equal(0);
      const handlePermissionChangeFunc =  wrapper.instance().handlePermissionChange({ userid: 999 , profile: { fullName: 'testing 999' }});
      handlePermissionChangeFunc(false);
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('upload permission turned off')).to.be.true;
    });
  });
});

describe('MemberInviteForm', function () {
  const props = {
    onSubmit: sinon.stub(),
    onCancel: sinon.stub(),
    working: false,
    trackMetric: sinon.stub(),
    t
  };

  let wrapper;
  beforeEach(() => {
    props.trackMetric.reset();
    wrapper = mount(
      <MemberInviteForm.WrappedComponent
        {...props}
      />
    );
  });
  describe('state', function() {
    it('should return allowUpload as true', function() {
      expect(wrapper.state().allowUpload).to.equal(true);
    });
  });
  describe('metric', function() {
    it('should be tracked when allowUpload is true', function() {
      const emailInput = wrapper.find('input#email');
      emailInput.instance().value = 'test@tidepool.org';
      expect(props.trackMetric.callCount).to.equal(0);
      wrapper.find('button.PatientInfo-button--primary').simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('invitation with upload on')).to.be.true;
      expect(props.trackMetric.calledWith('Clicked Invite')).to.be.true;
    });
    it('should be tracked when allowUpload is false', function() {
      const emailInput = wrapper.find('input#email');
      emailInput.instance().value = 'test@tidepool.org';
      wrapper.setState({ allowUpload: false });
      expect(wrapper.state().allowUpload).to.equal(false);
      expect(props.trackMetric.callCount).to.equal(0);
      wrapper.find('button.PatientInfo-button--primary').simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('invitation with upload off')).to.be.true;
      expect(props.trackMetric.calledWith('Clicked Invite')).to.be.true;
    });
  });

  describe('render', () => {
    it('should not render data donation accounts', () => {
      wrapper.setProps({
        pendingSentInvites: [
          { email: 'user@gmail.com' },
          { email: 'bigdata@tidepool.org' },
          { email: 'bigdata+NSF@tidepool.org' },
        ],
      });

      expect(wrapper.find('.PatientTeam-member')).to.have.length(1);
    });
  });
});

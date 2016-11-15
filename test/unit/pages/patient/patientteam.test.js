/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { shallow, mount } from 'enzyme';

import { PatientTeam, MemberInviteForm } from '../../../../app/pages/patient/patientteam';

const expect = chai.expect;

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
    user: {}
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(
      <PatientTeam
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
});

describe('MemberInviteForm', function () {
  const props = {
    onSubmit: sinon.stub(),
    onCancel: sinon.stub(),
    working: false,
    trackMetric: sinon.stub()
  };

  let wrapper;
  beforeEach(() => {
    props.trackMetric.reset();
    wrapper = mount(
      <MemberInviteForm
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
      wrapper.ref('email').get(0).value = 'test@tidepool.org';
      expect(props.trackMetric.callCount).to.equal(0);
      wrapper.find('button.PatientInfo-button--primary').simulate('click')
      //one metric for `Allow Uploading turned on`
      //one metric for `Clicked Invite`
      expect(props.trackMetric.callCount).to.equal(2);
    });
    it('should be tracked when allowUpload is false', function() {
      wrapper.ref('email').get(0).value = 'test@tidepool.org';
      wrapper.setState({ allowUpload: false });
      expect(wrapper.state().allowUpload).to.equal(false);
      expect(props.trackMetric.callCount).to.equal(0);
      wrapper.find('button.PatientInfo-button--primary').simulate('click')
      //one metric for `Allow Uploading turned off`
      //one metric for `Clicked Invite`
      expect(props.trackMetric.callCount).to.equal(2);
    });
  });
});
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';

import { Patient } from '../../../../app/pages/patient/patient';
import { PatientTeam } from '../../../../app/pages/patient/patientteam';

describe('Patient', function () {
  describe('render', function() {
    it('should render without problems when required props are present', function() {
      sinon.spy(console, 'error');
      var props = {
        acknowledgeNotification: sinon.stub(),
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
        trackMetric: sinon.stub(),
        dataSources: [],
        fetchDataSources: sinon.stub(),
        connectDataSource: sinon.stub(),
        disconnectDataSource: sinon.stub(),
        t: (v) => v,
      };
      shallow(<Patient {...props} />);
      expect(console.error.callCount).to.equal(0);
      console.error.restore();
    });
  });

  describe('Initial State', function() {
    it('should return an object', function() {
      const props = {
        t: (v) => v,
      };
      const wrapper = mount(<Patient {...props} />);
      const initialState = wrapper.state();

      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
      wrapper.unmount();
    });
  });

  describe('renderPatientTeam', function() {
    it('should not render when user and patient ids are different', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        cancellingInvite: false,
        changingMemberPermissions: false,
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
        invitingMemberInfo: {inProgress: false, notification: null},
        onCancelInvite: sinon.stub(),
        onChangeMemberPermissions: sinon.stub(),
        onInviteMember: sinon.stub(),
        onRemoveMember: sinon.stub(),
        onUpdatePatient: sinon.stub(),
        patient: {userid: 'bar', team: []},
        pendingSentInvites: [],
        removingMember: false,
        shareOnly: true,
        trackMetric: sinon.stub(),
        user: {userid: 'foo'},
        t: (v) => v,
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var getShareSection = function() {
        TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');
      };

      expect(getShareSection).to.throw(Error);
    });

    it('should not render when shareOnly is false', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        cancellingInvite: false,
        changingMemberPermissions: false,
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
        invitingMemberInfo: {inProgress: false, notification: null},
        onCancelInvite: sinon.stub(),
        onChangeMemberPermissions: sinon.stub(),
        onInviteMember: sinon.stub(),
        onRemoveMember: sinon.stub(),
        onUpdatePatient: sinon.stub(),
        patient: {userid: 'foo', team: []},
        pendingSentInvites: [],
        removingMember: false,
        shareOnly: false,
        trackMetric: sinon.stub(),
        user: {userid: 'foo'},
        t: (v) => v,
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var getShareSection = function() {
        TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');
      };

      expect(getShareSection).to.throw(Error);
    });

    it('should render when shareOnly is true', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        cancellingInvite: false,
        changingMemberPermissions: false,
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
        invitingMemberInfo: {inProgress: false, notification: null},
        onCancelInvite: sinon.stub(),
        onChangeMemberPermissions: sinon.stub(),
        onInviteMember: sinon.stub(),
        onRemoveMember: sinon.stub(),
        onUpdatePatient: sinon.stub(),
        patient: {userid: 'foo', team: []},
        pendingSentInvites: [],
        removingMember: false,
        shareOnly: true,
        trackMetric: sinon.stub(),
        user: {userid: 'foo'},
        t: (v) => v,
      };
      const wrapper = shallow(<Patient {...props} />);
      expect(wrapper.exists('.PatientPage-teamSection')).to.be.true;
    });

    it('should transfer all props to patient-team', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        cancellingInvite: false,
        changingMemberPermissions: false,
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
        invitingMemberInfo: {inProgress: false, notification: null},
        onCancelInvite: sinon.stub(),
        onChangeMemberPermissions: sinon.stub(),
        onInviteMember: sinon.stub(),
        onRemoveMember: sinon.stub(),
        onUpdatePatient: sinon.stub(),
        patient: {userid: 'foo', team: ['coffee', 'mug']},
        pendingSentInvites: [
          {key: 'foo'},
          {key: 'bar'},
          {key: 'baz'}
        ],
        removingMember: false,
        shareOnly: true,
        trackMetric: sinon.stub(),
        user: {userid: 'foo'},
        t: (v) => v,
      };
      const wrapper = shallow(<Patient {...props} />);
      const team = wrapper.find(PatientTeam);

      expect(team.props().onCancelInvite).to.be.ok;
      expect(team.props().onChangeMemberPermissions).to.be.ok;
      expect(team.props().onInviteMember).to.be.ok;
      expect(team.props().onRemoveMember).to.be.ok;
      expect(team.props().patient.userid).to.equal('foo');
      expect(team.props().patient.team.length).to.equal(2);
      expect(team.props().pendingSentInvites.length).to.equal(3);
      expect(team.props().user.userid).to.equal('foo');
      expect(team.props().trackMetric).to.be.ok;
    });
  });
});

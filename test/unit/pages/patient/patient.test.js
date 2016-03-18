/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
var expect = chai.expect;

import Patient from '../../../../app/pages/patient/patient';
import PatientTeam from '../../../../app/pages/patient/patientteam';

describe('Patient', function () {
  describe('render', function() {
    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        user: {},
        shareOnly: false,
        fetchingUser: false,
        patient: {},
        fetchingPatient: false,
        onUpdatePatient: sinon.stub(),
        pendingSentInvites: [],
        onChangeMemberPermissions: sinon.stub(),
        changingMemberPermissions: {},
        onRemoveMember: sinon.stub(),
        removingMember: {},
        onInviteMember: sinon.stub(),
        invitingMember: {},
        onCancelInvite: sinon.stub(),
        cancellingInvite: {},
        trackMetric: sinon.stub()
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should warn when no props are set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patient/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(16); //Account for PatientInfo errors on render too
      expect(console.error.calledWith('Warning: Failed propType: Required prop `user` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingUser` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patient` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingPatient` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onUpdatePatient` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `pendingSentInvites` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onChangeMemberPermissions` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `changingMemberPermissions` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onRemoveMember` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `removingMember` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onInviteMember` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `invitingMember` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onCancelInvite` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `cancellingInvite` was not specified in `Patient`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Patient`.')).to.equal(true);
    });
  });

  describe('getInitialState', function() {
    it('should return an object when showModalOverlay is false', function() {
      console.error = sinon.stub();
      var props = {
        user: {},
        shareOnly: false,
        fetchingUser: false,
        patient: {},
        fetchingPatient: false,
        onUpdatePatient: sinon.stub(),
        pendingSentInvites: [],
        onChangeMemberPermissions: sinon.stub(),
        changingMemberPermissions: {},
        onRemoveMember: sinon.stub(),
        removingMember: {},
        onInviteMember: sinon.stub(),
        invitingMember: {},
        onCancelInvite: sinon.stub(),
        cancellingInvite: {},
        trackMetric: sinon.stub()
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var initialState = elem.getInitialState();

      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('renderPatientTeam', function() {
    it('should not render when user and patient ids are different', function() {
      console.error = sinon.stub();
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'bar',
          team: []
        },
        shareOnly: true,
        fetchingUser: false,
        fetchingPatient: false,
        onUpdatePatient: sinon.stub(),
        pendingSentInvites: [],
        onChangeMemberPermissions: sinon.stub(),
        changingMemberPermissions: {},
        onRemoveMember: sinon.stub(),
        removingMember: {},
        onInviteMember: sinon.stub(),
        invitingMember: {},
        onCancelInvite: sinon.stub(),
        cancellingInvite: {},
        trackMetric: sinon.stub()
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var getShareSection = function() {
        TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');
      };

      expect(getShareSection).to.throw(Error);
      expect(console.error.callCount).to.equal(0);
    });

    it('should not render when shareOnly is false', function() {
      console.error = sinon.stub();
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'foo',
          team: []
        },
        shareOnly: false,
        fetchingUser: false,
        fetchingPatient: false,
        onUpdatePatient: sinon.stub(),
        pendingSentInvites: [],
        onChangeMemberPermissions: sinon.stub(),
        changingMemberPermissions: {},
        onRemoveMember: sinon.stub(),
        removingMember: {},
        onInviteMember: sinon.stub(),
        invitingMember: {},
        onCancelInvite: sinon.stub(),
        cancellingInvite: {},
        trackMetric: sinon.stub()
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var getShareSection = function() {
        TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');
      };

      expect(getShareSection).to.throw(Error);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render when shareOnly is true', function() {
      console.error = sinon.stub();
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'foo',
          team: []
        },
        shareOnly: true,
        fetchingUser: false,
        fetchingPatient: false,
        onUpdatePatient: sinon.stub(),
        pendingSentInvites: [],
        onChangeMemberPermissions: sinon.stub(),
        changingMemberPermissions: {},
        onRemoveMember: sinon.stub(),
        removingMember: {},
        onInviteMember: sinon.stub(),
        invitingMember: {},
        onCancelInvite: sinon.stub(),
        cancellingInvite: {},
        trackMetric: sinon.stub()
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var share = TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');

      expect(share).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should transfer all props to patient-team', function() {
      console.error = sinon.stub();
      var props = {
        patient: {
          userid: 'foo',
          team: ['coffee', 'mug']
        },
        pendingSentInvites: [
          { key: 'foo' },
          { key: 'bar' },
          { key: 'baz' }
        ],
        shareOnly: true,
        user: {
          userid: 'foo'
        },
        fetchingUser: false,
        fetchingPatient: false,
        onUpdatePatient: sinon.stub(),
        onChangeMemberPermissions: sinon.stub(),
        changingMemberPermissions: {},
        onRemoveMember: sinon.stub(),
        removingMember: {},
        onInviteMember: sinon.stub(),
        invitingMember: {},
        onCancelInvite: sinon.stub(),
        cancellingInvite: {},
        trackMetric: sinon.stub()
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var team = TestUtils.findRenderedComponentWithType(elem, PatientTeam);

      expect(team.props.onCancelInvite).to.be.ok;
      expect(team.props.onChangeMemberPermissions).to.be.ok;
      expect(team.props.onInviteMember).to.be.ok;
      expect(team.props.onRemoveMember).to.be.ok;
      expect(team.props.patient.userid).to.equal('foo');
      expect(team.props.patient.team.length).to.equal(2);
      expect(team.props.pendingSentInvites.length).to.equal(3);
      expect(team.props.user.userid).to.equal('foo');
      expect(team.props.trackMetric).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});
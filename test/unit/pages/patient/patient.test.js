/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from 'react';
import TestUtils from 'react-addons-test-utils';

var expect = chai.expect;

import Patient from '../../../../app/pages/patient/patient';
import { PatientTeam } from '../../../../app/pages/patient/patientteam';

describe('Patient', function () {
  before(() => {
    Patient.__Rewire__('PatientInfo', React.createClass({
      render: function() {
        return (<div className='fake-patient-info-view'></div>);
      }
    }));
  });

  after(() => {
    Patient.__ResetDependency__('PatientInfo');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function() {
      console.error = sinon.stub();
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
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return an object', function() {
      var props = {};
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem).getWrappedInstance();
      var initialState = elem.getInitialState();

      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
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
        user: {userid: 'foo'}
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
        user: {userid: 'foo'}
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
        user: {userid: 'foo'}
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var share = TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');

      expect(share).to.be.ok;
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
        user: {userid: 'foo'}
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
    });
  });
});

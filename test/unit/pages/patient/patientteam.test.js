/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var PatientTeam = require('../../../../app/pages/patient/patientteam');

describe('PatientTeam', function () {
  describe('render', function() {
    it('should render without problems when required props are present', function() {
      console.error = sinon.stub();
      var props = {
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
      var patientElem = React.createElement(PatientTeam, props);
      var elem = TestUtils.renderIntoDocument(patientElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should warn when no props are set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PatientTeam/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(13);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `acknowledgeNotification` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `cancellingInvite` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `changingMemberPermissions` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `invitingMemberInfo` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onCancelInvite` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onChangeMemberPermissions` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onInviteMember` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onRemoveMember` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patient` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `pendingSentInvites` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `removingMember` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientTeam`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `user` was not specified in `PatientTeam`.')).to.equal(true);
    });
  });

  describe('getInitialState', function() {
    it('should return an object', function() {
      var props = {};
      var patientElem = React.createElement(PatientTeam, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var initialState = elem.getInitialState();

      expect(Object.keys(initialState).length).to.equal(4);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
      expect(initialState.invite).to.equal(false);
      expect(initialState.editing).to.equal(false);
    });
  });
});
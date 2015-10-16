/* global chai */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Patient = require('../../../../app/pages/patient/patient');
var PatientTeam = require('../../../../app/pages/patient/patientteam');

describe('Patient', function () {
  describe('getInitialState', function() {
    it('should return an object when showModalOverlay is false', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var initialState = elem.getInitialState();

      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patient/>);

      expect(elem).to.be.ok;
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Patient`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('renderPatientTeam', function() {
    it('should not render when user and patient ids are different', function() {
      console.warn = sinon.stub();
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'bar',
          team: []
        },
        shareOnly: true,
        trackMetric: function() {}
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var getShareSection = function() {
        TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');
      };

      expect(getShareSection).to.throw(Error);
      expect(console.warn.callCount).to.equal(0);
    });

    it('should not render when shareOnly is false', function() {
      console.warn = sinon.stub();
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'foo',
          team: []
        },
        shareOnly: false,
        trackMetric: function() {}
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var getShareSection = function() {
        TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');
      };

      expect(getShareSection).to.throw(Error);
      expect(console.warn.callCount).to.equal(0);
    });

    it('should render when shareOnly is true', function() {
      console.warn = sinon.stub();
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'foo',
          team: []
        },
        shareOnly: true,
        trackMetric: function() {}
      };
      var patientElem = React.createElement(Patient, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var share = TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientPage-teamSection');

      expect(share).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });

    it('should transfer all props to patient-team', function() {
      console.warn = sinon.stub();
      var props = {
        onCancelInvite: function() {},
        onChangeMemberPermissions: function() {},
        onInviteMember: function() {},
        onRemoveMember: function() {},
        patient: {
          userid: 'foo',
          team: ['coffee', 'mug']
        },
        pendingInvites: [
          { key: 'foo' },
          { key: 'bar' },
          { key: 'baz' }
        ],
        shareOnly: true,
        trackMetric: function() {},
        user: {
          userid: 'foo'
        }
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
      expect(team.props.pendingInvites.length).to.equal(3);
      expect(team.props.user.userid).to.equal('foo');
      expect(team.props.trackMetric).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});
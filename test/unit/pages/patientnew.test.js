/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import rewire from 'rewire';
import rewireModule from '../../utils/rewireModule';

import { PatientNew } from '../../../app/pages/patientnew';
import { mapStateToProps } from '../../../app/pages/patientnew';

var assert = chai.assert;
var expect = chai.expect;

/**
 * Need to set window.config for config module
 */
window.config = {};

describe('PatientNew', function () {
  

  it('should be exposed as a module and be of type function', function() {
    expect(PatientNew).to.be.a('function');
  });

  describe('render', function() {
    it('should not warn when required props are set', function() {
      console.error = sinon.spy();
      var props = {
        fetchingUser: false,
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should warn when required props are not present', function() {
      console.error = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientNew/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(4);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingUser` was not specified in `PatientNew`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `PatientNew`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientNew`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `working` was not specified in `PatientNew`.')).to.equal(true);
    });
  });

  describe('getInitialState', function() {
    it('should be in this expected format', function() {
      console.error = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientNew/>);
      var initialState = elem.getInitialState();
      expect(initialState.working).to.equal(false);
      expect(initialState.formValues.isOtherPerson).to.equal(false);
      expect(initialState.formValues.fullName).to.equal('');
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('isFormDisabled', function() {
    it('should be true when fetching user is true and user is falsey', function() {
      var props = {
        fetchingUser: true
      };
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);

      expect(elem.isFormDisabled()).to.equal(true);
    });

    it('should be false when fetching user is true and user is not falsey', function() {
      var props = {
        fetchingUser: true,
        user: {}
      };
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);

      expect(elem.isFormDisabled()).to.equal(false);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      allUsersMap: {
        a1b2c3: {
          userid: 'a1b2c3'
        }
      },
      loggedInUserId: 'a1b2c3',
      working: {
        settingUpDataStorage: {inProgress: true, notification: 'Hi :)'},
        fetchingUser: {inProgress: false}
      }
    };
    const result = mapStateToProps({blip: state});
    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map allUsersMap.a1b2c3 to user', () => {
      expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
    });

    it('should map working.fetchingUser.inProgress to fetchingUser', () => {
      expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
    });

    it('should map working.settingUpDataStorage.inProgress to working', () => {
      expect(result.working).to.equal(state.working.settingUpDataStorage.inProgress);
    });

    it('should map working.settingUpDataStorage.notification to notification', () => {
      expect(result.notification).to.deep.equal(state.working.settingUpDataStorage.notification);
    });
  });
});

/* global beforeEach */
/* global chai */
/* global describe */
/* global sinon */
/* global it */

import _ from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import mutationTracker from 'object-invariant-test-helper';
import { mount } from 'enzyme';

import { PatientNew } from '../../../app/pages/patientnew';
import { mapStateToProps } from '../../../app/pages/patientnew';

var assert = chai.assert;
var expect = chai.expect;

describe('PatientNew', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(PatientNew).to.be.a('function');
  });

  var props = {
    fetchingUser: false,
    onUpdateDataDonationAccounts: sinon.stub(),
    onSubmit: sinon.stub(),
    trackMetric: sinon.stub(),
    working: false
  };

  describe('render', function() {
    it('should not warn when required props are set', function() {
      console.error = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
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
    });
  });

  describe('handleSubmit', function(){
    let wrapper = mount(
      <PatientNew {...props}/>
    );

    let formValues = {
      birthday: {
        day: '1',
        month: '0',
        year: '1990'
      },
      diagnosisDate: {
        day: '2',
        month: '1',
        year: '1995'
      },
      fullName: 'John Doh',
      isOtherPerson: false
    };

    beforeEach(function() {
      props.onSubmit.reset();
      props.onUpdateDataDonationAccounts.reset();
      props.trackMetric.reset();
    });

    it('should call onSubmit with valid form values', function(){
      wrapper.instance().handleSubmit(formValues);
      expect(props.onSubmit.callCount).to.equal(1);
      expect(props.onUpdateDataDonationAccounts.callCount).to.equal(0);
      expect(props.trackMetric.callCount).to.equal(0);
    });

    it('should call onSubmit and onUpdateDataDonationAccounts with data donation values', function(){
      wrapper.instance().handleSubmit(_.assign({}, formValues, { dataDonate: true, dataDonateDestination: '' }));
      expect(props.onSubmit.callCount).to.equal(1);
      expect(props.onUpdateDataDonationAccounts.callCount).to.equal(1);
      expect(props.onUpdateDataDonationAccounts.calledWith(['bigdata@tidepool.org'])).to.be.true;
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.getCall(0).args).to.eql(['web - big data sign up', { source: 'none', location: 'sign-up' }]);
    });

    it('should call onSubmit and onUpdateDataDonationAccounts with specific values', function(){
      wrapper.instance().handleSubmit(_.assign({}, formValues, { dataDonate: true, dataDonateDestination: 'JDRF,ZZZ' }));
      expect(props.onSubmit.callCount).to.equal(1);
      expect(props.onUpdateDataDonationAccounts.callCount).to.equal(1);
      expect(props.onUpdateDataDonationAccounts.calledWith(['bigdata@tidepool.org', 'bigdata+JDRF@tidepool.org', 'bigdata+ZZZ@tidepool.org'])).to.be.true;
      expect(props.trackMetric.callCount).to.equal(3);
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
        settingUpDataStorage: {inProgress: true},
        fetchingUser: {inProgress: false}
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

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
  });
});

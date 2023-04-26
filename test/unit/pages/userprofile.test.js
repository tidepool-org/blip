/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { mount } from 'enzyme';
import i18next from '../../../app/core/language';

import { UserProfile, UserProfileClass } from '../../../app/pages/userprofile';
import { mapStateToProps } from '../../../app/pages/userprofile';
import { ToastProvider } from '../../../app/providers/ToastProvider';

var assert = chai.assert;
var expect = chai.expect;
const t = i18next.t.bind(i18next);

describe('UserProfile', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(UserProfile).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        fetchingUser: false,
        history: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        login: sinon.stub(),
        user: {profile: {}},
        t,
      };
      let wrapper = mount(<ToastProvider><UserProfileClass {...props}/></ToastProvider>)
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('initial state', function() {
    it('should return expected initial state', function() {
      var props = {
        user: {
          profile: {
            fullName: 'Gordon Dent'
          },
          username: 'foo@bar.com'
        },
        t,
      };
      let wrapper = mount(<UserProfileClass {...props}/>);
      let state = wrapper.state();

      expect(state.formValues.username).to.equal('foo@bar.com');
      expect(state.formValues.fullName).to.equal('Gordon Dent');

      expect(wrapper.find('input[name="username"]').props()['disabled']).to.be.false;
      expect(wrapper.find('input[name="password"]').props()['disabled']).to.be.false;
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should have username and password disabled for brokered accounts', function() {
      var props = {
        user: {
          roles: ['brokered'],
          profile: {
            fullName: 'Gordon Dent'
          },
          username: 'foo@bar.com'
        },
        t,
      };
      let wrapper = mount(<UserProfileClass {...props}/>);
      let state = wrapper.state();

      expect(state.formValues.username).to.equal('foo@bar.com');
      expect(state.formValues.fullName).to.equal('Gordon Dent');
      expect(wrapper.find('input[name="username"]').props()['disabled']).to.be.true;
      expect(wrapper.find('input[name="password"]').props()['disabled']).to.be.true;
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should take a step back through history on clicking back button', function() {
      var props = {
        history: {
          goBack: sinon.stub()
        },
        trackMetric: sinon.stub(),
        user: { profile: {} },
        t
      };

      let wrapper = mount(<ToastProvider><UserProfileClass {...props} /></ToastProvider>);
      let backButton = wrapper.find('.js-back');

      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.history.goBack.callCount).to.equal(0);
      backButton.simulate('click');
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.history.goBack.callCount).to.equal(1);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      allUsersMap: {
        a1b2c3: {userid: 'a1b2c3'}
      },
      loggedInUserId: 'a1b2c3',
      working: {
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
  });
});

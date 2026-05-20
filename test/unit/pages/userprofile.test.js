/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { fireEvent, render } from '@testing-library/react';
import i18next from '../../../app/core/language';

import { UserProfile, UserProfileClass, mapStateToProps } from '../../../app/pages/userprofile';
import { ToastProvider } from '../../../app/providers/ToastProvider';

var assert = chai.assert;
var expect = chai.expect;
const t = i18next.t.bind(i18next);

const buildProps = (overrides = {}) => ({
  fetchingUser: false,
  updatingUser: {
    inProgress: false,
    completed: false,
    notification: null,
  },
  history: { location: { state: {} }, goBack: sinon.stub() },
  onSubmit: sinon.stub(),
  trackMetric: sinon.stub(),
  login: sinon.stub(),
  push: sinon.stub(),
  user: { profile: {} },
  t,
  ...overrides,
});

const createInstance = (props = {}) => {
  const instance = new UserProfileClass(buildProps(props));
  instance.context = { set: sinon.stub(), clear: sinon.stub() };
  instance.setState = function setState(update) {
    this.state = {
      ...this.state,
      ...(typeof update === 'function' ? update(this.state, this.props) : update),
    };
  };
  return instance;
};

describe('UserProfile', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(UserProfile).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      const consoleError = sinon.stub(console, 'error');
      try {
        const props = buildProps({ history: {} });
        render(<ToastProvider><UserProfileClass {...props} /></ToastProvider>);
        expect(consoleError.callCount).to.equal(0);
      } finally {
        consoleError.restore();
      }
    });

    it('should render without problems when user is logging out', function () {
      const consoleError = sinon.stub(console, 'error');
      try {
        const props = buildProps();
        const result = render(<ToastProvider><UserProfileClass {...props} /></ToastProvider>);
        result.rerender(<ToastProvider><UserProfileClass {...buildProps({ user: null })} /></ToastProvider>);
        expect(consoleError.callCount).to.equal(0);
      } finally {
        consoleError.restore();
      }
    });
  });

  describe('initial state', function() {
    it('should return expected initial state', function() {
      const props = {
        user: {
          profile: {
            fullName: 'Gordon Dent'
          },
          username: 'foo@bar.com'
        },
        t,
        updatingUser: {
          inProgress: false,
          completed: false,
          notification: null,
        },
      };
      const instance = createInstance(props);
      const state = instance.state;
      const inputs = instance.formInputs();
      const usernameInput = inputs.find(input => input.name === 'username');
      const passwordInput = inputs.find(input => input.name === 'password');

      expect(state.formValues.username).to.equal('foo@bar.com');
      expect(state.formValues.fullName).to.equal('Gordon Dent');

      expect(usernameInput.disabled).to.be.false;
      expect(passwordInput.disabled).to.be.false;
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should have username and password disabled for brokered accounts', function() {
      const props = {
        user: {
          roles: ['brokered'],
          profile: {
            fullName: 'Gordon Dent'
          },
          username: 'foo@bar.com'
        },
        t,
        updatingUser: {
          inProgress: false,
          completed: false,
          notification: null,
        },
      };
      const instance = createInstance(props);
      const state = instance.state;
      const inputs = instance.formInputs();
      const usernameInput = inputs.find(input => input.name === 'username');
      const passwordInput = inputs.find(input => input.name === 'password');

      expect(state.formValues.username).to.equal('foo@bar.com');
      expect(state.formValues.fullName).to.equal('Gordon Dent');
      expect(usernameInput.disabled).to.be.true;
      expect(passwordInput.disabled).to.be.true;
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should take a step back through history on clicking back button', function() {
      const props = buildProps();
      const { container } = render(<ToastProvider><UserProfileClass {...props} /></ToastProvider>);
      const backButton = container.querySelector('.js-back');

      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.history.goBack.callCount).to.equal(0);
      fireEvent.click(backButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.history.goBack.callCount).to.equal(1);
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should login when fullName is filled out', () => {
      const props = buildProps({ user: { profile: {} } });
      const instance = createInstance(props);
      instance.UNSAFE_componentWillReceiveProps({ ...props, user: { profile: { fullName: 'new fullname' } } });
      expect(props.login.callCount).to.equal(1);
    });

    it('should not login when fullName is filled out if coming from upload-launch', () => {
      const props = buildProps({
        history: { location: { state: { referrer: 'upload-launch' } } },
        user: { profile: {} },
      });
      const instance = createInstance(props);
      instance.UNSAFE_componentWillReceiveProps({ ...props, user: { profile: { fullName: 'new fullname' } } });
      expect(props.login.callCount).to.equal(0);
    });

    it('should call push when profile updated and coming from upload-launch', () => {
      const props = buildProps({
        history: { location: { state: { referrer: 'upload-launch' } } },
        updatingUser: {
          inProgress: true,
          completed: false,
          notification: null,
        },
      });
      const instance = createInstance(props);
      expect(props.push.callCount).to.equal(0);
      instance.UNSAFE_componentWillReceiveProps({
        ...props,
        updatingUser: { inProgress: false, completed: true },
      });
      expect(props.push.callCount).to.equal(1);
      expect(
        props.push.calledWithMatch({
          pathname: '/upload-redirect',
          state: { referrer: 'profile' },
        })
      ).to.be.true;
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      allUsersMap: {
        a1b2c3: {userid: 'a1b2c3'}
      },
      loggedInUserId: 'a1b2c3',
      working: {
        fetchingUser: {inProgress: false},
        updatingUser: {
          inProgress: false,
          completed: false,
          notification: null,
        },
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

    it('should map working.updatingUser to updatingUser', () => {
      expect(result.updatingUser).to.deep.equal(state.working.updatingUser);
    });
  });
});

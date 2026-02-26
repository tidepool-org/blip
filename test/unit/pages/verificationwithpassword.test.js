/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { render } from '@testing-library/react';

var assert = chai.assert;
var expect = chai.expect;
import * as errorMessages from '../../../app/redux/constants/errorMessages';

import { VerificationWithPassword, mapStateToProps } from '../../../app/pages/verificationwithpassword/verificationwithpassword';

const VerificationWithPasswordClass = VerificationWithPassword.WrappedComponent || VerificationWithPassword;

const buildProps = (overrides = {}) => ({
  acknowledgeNotification: sinon.stub(),
  api: {},
  signupEmail: 'g@a.com',
  signupKey: 'bar',
  onSubmit: sinon.stub(),
  trackMetric: sinon.stub(),
  working: false,
  t: str => str,
  ...overrides,
});

const createInstance = (overrides = {}) => {
  const props = buildProps(overrides);
  const instance = new VerificationWithPasswordClass(props);
  instance.props = props;
  instance.setState = (nextState, callback) => {
    const resolved = typeof nextState === 'function'
      ? nextState(instance.state, instance.props)
      : nextState;
    instance.state = { ...instance.state, ...resolved };
    if (typeof callback === 'function') callback();
  };

  return { instance, props };
};

describe('VerificationWithPassword', () => {
  it('should be a function', () => {
    assert.isFunction(VerificationWithPassword);
  });

  describe('render', function() {
    it('should render without warnings when all required props provided', function () {
      console.error = sinon.stub();
      const props = buildProps();
      render(React.createElement(VerificationWithPasswordClass, props));
      expect(console.error.callCount).to.equal(0);
    });

    it('should fire metric when mounted/rendered', function() {
      const props = buildProps();
      render(React.createElement(VerificationWithPasswordClass, props));
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.calledWith('VCA Home Verification - Screen Displayed')).to.be.true;
    });
  });

  describe('componentWillReceiveProps', function() {
    it('should fire a metric for birthday mismatch', () => {
      console.error = sinon.stub();
      const { instance, props } = createInstance();
      instance.componentDidMount();
      instance.UNSAFE_componentWillReceiveProps({notification:{message: errorMessages.ERR_BIRTHDAY_MISMATCH}});
      expect(console.error.callCount).to.equal(0);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.trackMetric.calledWith('VCA Home Verification - Screen Displayed')).to.be.true;
      expect(props.trackMetric.calledWith('VCA Home Verification - Birthday Mismatch')).to.be.true;
    });
  });

  describe('initial state', () => {
    it('should return an Object that matches expectedInitialState', () => {
      console.error = sinon.stub();

      let expectedInitialState = {
        loading: false,
        formValues: {},
        validationErrors: {},
        notification: null
      };

      const { instance } = createInstance();
      instance.UNSAFE_componentWillMount();
      expect(console.error.callCount).to.equal(0);
      expect(instance.state).to.eql(expectedInitialState);
    });
  });


  describe('handleInputChange', () => {
    it('should update formValues in state with changed value', () => {
      console.error = sinon.stub();

      let expectedInitialState = {
        loading: false,
        formValues: {},
        validationErrors: {},
        notification: null
      };

      const { instance } = createInstance();
      instance.UNSAFE_componentWillMount();

      expect(instance.state).to.eql(expectedInitialState);

      instance.handleInputChange({name: 'password', value: 'foo'});

      expect(instance.state.formValues.password).to.equal('foo');
    });
  });

  describe('resetFormStateBeforeSubmit', () => {
    it('should update state with supplied formValues and empty validation errors and notification', () => {      console.error = sinon.stub();

      let expectedInitialState = {
        loading: true,
        formValues: {
          username: 'bill@ted.com'
        },
        validationErrors: {},
        notification: null
      };

      const { instance } = createInstance({ inviteEmail: 'bill@ted.com' });
      instance.UNSAFE_componentWillMount();

      let intermediateState = {
        validationErrors: {
          username: 'This is not valid'
        }
      };
      instance.setState(intermediateState);

      expect(instance.state.validationErrors).to.eql(intermediateState.validationErrors);

      instance.resetFormStateBeforeSubmit({});

      expect(instance.state).to.eql({
        loading: false,
        formValues: {},
        validationErrors: {},
        notification: null
      });
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      blip: {
        working: {
          verifyingCustodial: {
            notification: null,
            inProgress: false
          }
        }
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps(state);

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should return object with notification and working populated', () => {
      expect(result.notification).to.equal(state.blip.working.verifyingCustodial.notification);
      expect(result.working).to.equal(state.blip.working.verifyingCustodial.inProgress);
    });
  });

  describe('isFormDisabled', () => {
    it('should return true if fetching user', () => {
      const { instance } = createInstance({ fetchingUser: true });
      expect(instance.isFormDisabled()).to.be.true;
    });

    it('should return undefined otherwise', () => {
      const { instance } = createInstance();
      expect(instance.isFormDisabled()).to.be.undefined;
    });

  });
});

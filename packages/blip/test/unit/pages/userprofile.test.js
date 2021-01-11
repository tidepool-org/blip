import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import TestUtils from 'react-dom/test-utils';
import mutationTracker from 'object-invariant-test-helper';
import sinon from 'sinon';
import chai from 'chai';
import { shallow } from 'enzyme';

import config from '../../../app/config';
import { UserProfile, mapStateToProps } from '../../../app/pages/userprofile';

const { assert, expect } = chai;

describe('UserProfile', function () {
  const props = {
    fetchingUser: false,
    router: {
      goBack: sinon.stub()
    },
    onSubmit: sinon.stub(),
    trackMetric: sinon.stub(),
    user: {
      username: 'foo@bar.com',
      userid: 'abcd',
      profile: {
        fullName: 'Gordon Dent',
        firstName: 'Gordon',
        lastName: 'Dent'
      },
    },
  };

  const patientProps = {...props,
    ...{
      user:{
        profile:{
          patient:{
            fullName: 'Gordon Dent'
          }
        }
      }
    }
  };

  before(() => {
    sinon.spy(console, 'error');
  });
  after(() => {
    sinon.restore();
  });

  afterEach(() => {
    props.router.goBack.reset();
    props.onSubmit.reset();
    props.trackMetric.reset();
  });

  it('should be exposed as a module and be of type function', () => {
    expect(UserProfile).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', () => {
      const elem = <UserProfile {...props} />;
      TestUtils.renderIntoDocument(elem);
      // @ts-ignore
      const message = _.get(console.error.getCall(0), 'args', undefined);
      expect(console.error.callCount, 'console.error').to.equal(0, message);
    });
  });

  describe('getInitialState', function() {
    it('should return expected initial state', () => {
      const elem = shallow(<UserProfile {...props} />);
      const state = elem.state();

      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should take a step back through router on clicking back button', () => {
      var elem = <UserProfile {...props} />;
      var render = TestUtils.renderIntoDocument(elem);
      var backButton = TestUtils.findRenderedDOMComponentWithClass(render, 'js-back');

      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.router.goBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.router.goBack.callCount).to.equal(1);
    });
  });

  describe('config injection', function() {
    let container;
    const getInputs = () => {
      return {
        firstNameInput: container.querySelector('#firstName'),
        lastNameInput : container.querySelector('#lastName'),
        emailInput: container.querySelector('#username'),
        passwordInput: container.querySelector('#password'),
        passwordConfirmInput: container.querySelector('#passwordConfirm')
      };
    };

    beforeEach(() => {
      config.ALLOW_PATIENT_CHANGE_EMAIL=true;
      config.ALLOW_PATIENT_CHANGE_PASSWORD=true;
      config.ALLOW_PATIENT_CHANGE_NAME=true;
      container = document.createElement('div');
      document.body.appendChild(container);
    });
    afterEach(() => {
      document.body.removeChild(container);
      container = null;
    });
    it('should display all fields enabled when everything is allowed for a patient', function() {
      TestUtils.act(() => {
        ReactDOM.render(<UserProfile {...patientProps} />, container);
      });
      const inputs = getInputs();
      expect(inputs.firstNameInput.disabled).to.equal(false);
      expect(inputs.lastNameInput.disabled).to.equal(false);
      expect(inputs.emailInput.disabled).to.equal(false);
      expect(inputs.passwordInput.disabled).to.equal(false);
      expect(inputs.passwordConfirmInput.disabled).to.equal(false);
    });
    it('should display name fields disabled when config is disallowed for a patient', function() {
      config.ALLOW_PATIENT_CHANGE_NAME=false;
      TestUtils.act(() => {
        ReactDOM.render(<UserProfile {...patientProps} />, container);
      });
      const inputs = getInputs();
      expect(inputs.firstNameInput.disabled).to.equal(true);
      expect(inputs.lastNameInput.disabled).to.equal(true);
      expect(inputs.emailInput.disabled).to.equal(false);
      expect(inputs.passwordInput.disabled).to.equal(false);
      expect(inputs.passwordConfirmInput.disabled).to.equal(false);
    });
    it('should not display email field when config is disallowed for a patient', function() {
      config.ALLOW_PATIENT_CHANGE_EMAIL=false;
      TestUtils.act(() => {
        ReactDOM.render(<UserProfile {...patientProps} />, container);
      });
      const inputs = getInputs();
      expect(inputs.firstNameInput.disabled).to.equal(false);
      expect(inputs.lastNameInput.disabled).to.equal(false);
      expect(inputs.emailInput).to.equal(null);
      expect(inputs.passwordInput.disabled).to.equal(false);
      expect(inputs.passwordConfirmInput.disabled).to.equal(false);
    });
    it('should not display password fields when config is disallowed for a patient', function() {
      config.ALLOW_PATIENT_CHANGE_PASSWORD=false;
      TestUtils.act(() => {
        ReactDOM.render(<UserProfile {...patientProps} />, container);
      });
      const inputs = getInputs();
      expect(inputs.firstNameInput.disabled).to.equal(false);
      expect(inputs.lastNameInput.disabled).to.equal(false);
      expect(inputs.emailInput.disabled).to.equal(false);
      expect(inputs.passwordInput).to.equal(null);
      expect(inputs.passwordConfirmInput).to.equal(null);
    });
    it('should display all fields enabled when everything is disallowed for a non patient', function() {
      config.ALLOW_PATIENT_CHANGE_EMAIL=false;
      config.ALLOW_PATIENT_CHANGE_PASSWORD=false;
      config.ALLOW_PATIENT_CHANGE_NAME=false;
      TestUtils.act(() => {
        ReactDOM.render(<UserProfile {...props} />, container);
      });
      const inputs = getInputs();
      expect(inputs.firstNameInput.disabled).to.equal(false);
      expect(inputs.lastNameInput.disabled).to.equal(false);
      expect(inputs.emailInput.disabled).to.equal(false);
      expect(inputs.passwordInput.disabled).to.equal(false);
      expect(inputs.passwordConfirmInput.disabled).to.equal(false);
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

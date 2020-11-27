import React from 'react';
import _ from 'lodash';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { mount } from 'enzyme';
import mutationTracker from 'object-invariant-test-helper';

import {
  mapStateToProps,
  ConfirmPasswordResetPage as ConfirmPasswordReset
} from '../../../../app/pages/passwordreset/confirm';

describe('ConfirmPasswordReset', function () {
  /** @type {import('enzyme').ReactWrapper<ConfirmPasswordReset>} */
  let wrapper = null;

  before(() => {
    try {
      sinon.spy(console, 'error');
    } catch (e) {
      console.error = sinon.stub();
    }
  });

  after(() => {
    if (_.isFunction(_.get(console, 'error.restore'))) {
      // @ts-ignore
      console.error.restore();
    }
  });

  beforeEach(() => {
    // @ts-ignore
    console.error.resetHistory();
  });

  afterEach(() => {
    if (wrapper !== null) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  it('should be exposed as a module and be of type function', function() {
    expect(ConfirmPasswordReset).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      const props = {
        acknowledgeNotification: sinon.stub(),
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<ConfirmPasswordReset {...props} />);
      // @ts-ignore
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      const props = {
        acknowledgeNotification: sinon.stub(),
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<ConfirmPasswordReset {...props} />);
      const formInputs = wrapper.instance().formInputs();
      expect(formInputs.length).to.equal(3);
      expect(formInputs[0].name).to.equal('email');
      expect(formInputs[0].label).to.equal('Email');
      expect(formInputs[0].type).to.equal('email');

      expect(formInputs[1].name).to.equal('password');
      expect(formInputs[1].label).to.equal('New password');
      expect(formInputs[1].type).to.equal('password');
      expect(formInputs[1].placeholder).to.be.undefined;

      expect(formInputs[2].name).to.equal('passwordConfirm');
      expect(formInputs[2].label).to.equal('Confirm new password');
      expect(formInputs[2].type).to.equal('password');
      expect(formInputs[2].placeholder).to.be.undefined;
    });
  });

  describe('initial state', function() {
    it('should be in this expected format', function() {
      const props = {
        acknowledgeNotification: sinon.stub(),
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<ConfirmPasswordReset {...props} />);
      const initialState = wrapper.instance().state;
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    it('should be in this expected format', function() {
      const props = {
        acknowledgeNotification: sinon.stub(),
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<ConfirmPasswordReset {...props} />);
      const vals = {
        email: 'foo@bar.com',
        password: 'woowoo'
      };
      const formValues = wrapper.instance().prepareFormValuesForSubmit(vals);
      expect(formValues.key).to.equal('some-key');
      expect(formValues.email).to.equal('foo@bar.com');
      expect(formValues.password).to.equal('woowoo');
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      passwordResetConfirmed: false,
      working: {
        confirmingPasswordReset: {inProgress: true, notification: null}
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

    it('should map working.confirmingPasswordReset.notification to notification', () => {
      expect(result.notification).to.equal(state.working.confirmingPasswordReset.notification);
    });

    it('should map working.confirmingPasswordReset.inProgress to working', () => {
      expect(result.working).to.equal(state.working.confirmingPasswordReset.inProgress);
    });

    it('should map passwordResetConfirmed to success', () => {
      expect(result.success).to.equal(state.passwordResetConfirmed);
    });
  });
});

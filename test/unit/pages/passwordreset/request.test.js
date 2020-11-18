import React from 'react';
import _ from 'lodash';
import mutationTracker from 'object-invariant-test-helper';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { mount } from 'enzyme';

import { mapStateToProps, RequestPasswordResetPage as RequestPasswordReset } from '../../../../app/pages/passwordreset/request';

describe('RequestPasswordReset', function () {
  /** @type {import('enzyme').ReactWrapper<RequestPasswordReset>} */
  let wrapper = null;

  afterEach(() => {
    if (wrapper !== null) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  it('should be exposed as a module and be of type function', function() {
    expect(RequestPasswordReset).to.be.a('function');
  });

  describe('render', function() {
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

    it('should render without problems when required props are set', function () {
      const props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<RequestPasswordReset {...props} />);
      // @ts-ignore
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      const props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<RequestPasswordReset {...props} />);
      const formInputs = wrapper.instance().formInputs();
      expect(formInputs.length).to.equal(1);
      expect(formInputs[0].name).to.equal('email');
      expect(formInputs[0].label).to.equal('Email');
      expect(formInputs[0].type).to.equal('email');
    });
  });

  describe('Initial State', function() {
    it('should be in this expected format', function() {
      const props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      wrapper = mount(<RequestPasswordReset {...props} />);
      const initialState = wrapper.instance().state;
      expect(initialState.success).to.equal(false);
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        requestingPasswordReset: {inProgress: true, notification: {type: 'alert', message: 'Hi!'}}
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

    it('should map working.requestingPasswordReset.notification to notification', () => {
      expect(result.notification).to.equal(state.working.requestingPasswordReset.notification);
    });

    it('should map working.requestingPasswordReset.inProgress to working', () => {
      expect(result.working).to.equal(state.working.requestingPasswordReset.inProgress);
    });

    describe('when some state is `null`', () => {
    const state = {
      working: {
        requestingPasswordReset: {inProgress: true, notification: null}
      }
    };
      const result = mapStateToProps({blip: state});

      it('should map working.requestingPasswordReset.notification to notification', () => {
        expect(result.notification).to.be.null;
      });
    });
  });
});

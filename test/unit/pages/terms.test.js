/* global chai */

import _ from 'lodash';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import mutationTracker from 'object-invariant-test-helper';
import sinon from 'sinon';
import { mount } from 'enzyme';
/** @typedef { import('enzyme').ReactWrapper } ReactWrapper */

import { Terms, mapStateToProps } from '../../../app/pages/terms';
import config from '../../../app/config';

const { assert, expect } = chai;

describe('Terms', () => {
  const props = {
    termsWasAccepted: false,
    onSubmit: sinon.stub(),
    onRefuse: sinon.stub(),
    trackMetric: sinon.stub(),
  };

  beforeEach(() => {
    props.onSubmit.resetHistory();
    props.onRefuse.resetHistory();
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    before(() => {
      try {
        // FIXME should not protect this call
        sinon.spy(console, 'error');
      } catch (e) {
        console.error = sinon.stub();
      }
    });
    after(() => {
      // @ts-ignore
      if (_.isFunction(_.get(console, 'error.restore'))) {
        // @ts-ignore
        console.error.restore();
      }
    });

    it('should not console.error when required props are set', () => {
      const termsElem = <Terms {...props} />;
      const elem = TestUtils.renderIntoDocument(termsElem);

      expect(elem).to.be.ok;
      // @ts-ignore
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('by default', () => {
    let elem = null;

    before(() => {
      const termsElem = <Terms {...props} />;
      /** @type {Component<Terms>} */
      elem = TestUtils.renderIntoDocument(termsElem);
    });

    it('is not agreed', () => {
      expect(elem.state.agreed).to.equal(false);
    });

    it('should not allow to click on the accept button', () => {
      const btns = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'btn-primary');
      expect(btns).to.be.an('array').of.length(1);
      expect(btns[0].getAttribute('disabled')).to.be.not.null;
    });

    it('should be able to click to the refuse button', () => {
      const btns = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'btn-secondary');
      expect(btns).to.be.an('array').of.length(1);
      expect(btns[0].getAttribute('disabled')).to.be.null;
    });

    it('the first time accept terms should be specific', () => {
      const pTitle = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-title');
      expect(pTitle).to.be.an('array').of.length(1);
      expect(pTitle[0].getAttribute('id')).to.be.equal('terms-title-first-time');
    });

    it('the next time accept terms should be specific', () => {
      props.termsWasAccepted = true;
      const termsElem = <Terms {...props} />;
      /** @type {Component<Terms>} */
      const elem = TestUtils.renderIntoDocument(termsElem);
      const pTitle = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-title');
      expect(pTitle).to.be.an('array').of.length(1);
      expect(pTitle[0].getAttribute('id')).to.be.equal('terms-title-updated');
    });
  });

  describe('check to accept terms', () => {
    /** @type {ReactWrapper} */
    let wrapper = null;
    before(() => {
      wrapper = mount(<Terms {...props} />);
    });

    it('should be able to refuse', () => {
      const btn = wrapper.find('.btn-secondary');
      btn.simulate('click');
      expect(props.trackMetric.callCount).to.be.equals(1);
      expect(props.onSubmit.callCount).to.be.equals(0);
      expect(props.onRefuse.callCount).to.be.equals(1);
    });

    it('should be possible', () => {
      const checks = wrapper.find('.js-terms-checkbox');
      checks.simulate('change');
      expect(wrapper.instance().state.agreed, 'agreed').to.equal(true);
    });

    it('should allow to accept the terms', () => {
      const btn = wrapper.find('.btn-primary');
      expect(btn.getDOMNode().getAttribute('disabled')).to.be.null;
    });

    it('should be able to submit', () => {
      const btn = wrapper.find('.btn-primary');
      btn.simulate('click');
      expect(props.trackMetric.callCount).to.be.equals(1);
      expect(props.onSubmit.callCount).to.be.equals(1);
      expect(props.onRefuse.callCount).to.be.equals(0);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      allUsersMap: {
        a1b2c3: {
          termsAccepted: '2017-01-01T00:00:00.000Z',
        },
      },
      isLoggedIn: true,
      loggedInUserId: 'a1b2c3',
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    before(() => {
      config.LATEST_TERMS = '2015-01-00T00:00:00+10:00';
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('result.termsWasAccepted should be true if valid date in allUsersMap.a1b2c3.termsAccepted, and LATEST_TERMS is null', () => {
      config.LATEST_TERMS = null;
      expect(result.termsWasAccepted).to.be.true;
    });

    it('result.termsWasAccepted should be true if valid date in allUsersMap.a1b2c3.termsAccepted, and is later than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2016-12-26T00:00:00.000Z';
      expect(result.termsWasAccepted).to.be.true;
    });

    it('result.termsWasAccepted should be false if valid date in allUsersMap.a1b2c3.termsAccepted, and is earlier than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2017-01-02T00:00:00.000Z';
      expect(result.termsWasAccepted).to.be.true;
    });
  });
});

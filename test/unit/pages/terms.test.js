/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { render, fireEvent } from '@testing-library/react';

var assert = chai.assert;
var expect = chai.expect;

import { Terms, mapStateToProps } from '../../../app/pages/terms';
import config from '../../../app/config';

const TermsClass = Terms.WrappedComponent || Terms;

const buildProps = (overrides = {}) => ({
  authenticated: false,
  acceptedLatestTerms: true,
  termsAccepted: true,
  onSubmit: sinon.stub(),
  trackMetric: sinon.stub(),
  t: str => str,
  ...overrides,
});

const createInstance = (overrides = {}) => {
  const props = { ...TermsClass.defaultProps, ...buildProps(overrides) };
  const instance = new TermsClass(props);
  instance.props = props;
  instance.setState = (nextState) => {
    const resolved = typeof nextState === 'function'
      ? nextState(instance.state, instance.props)
      : nextState;
    instance.state = { ...instance.state, ...resolved };
  };

  return { instance, props };
};

describe('Terms', () => {

  describe('render', () => {
    it('should not console.error when required props are set', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        var props = buildProps();
        var elem = render(React.createElement(TermsClass, props));

        expect(elem.container.firstChild).to.not.be.null;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });

  describe('by default', function(){
    let originalLatestTerms;
    var instance;

    beforeEach(() => {
      originalLatestTerms = config.LATEST_TERMS;
      config.LATEST_TERMS = '2015-01-01T00:00:00+10:00';
      instance = createInstance().instance;
    });

    afterEach(() => {
      config.LATEST_TERMS = originalLatestTerms;
    });

    it('is not agreed', () => {
      expect(instance.state.agreed).to.equal(false);
    });
    it('is not agreedOnBehalf', () => {
      expect(instance.state.agreedOnBehalf).to.equal(false);
    });
    it('age is over 18', () => {
      expect(instance.state.ageSelected).to.equal(instance.props.ages.OF_AGE.value);
    });
    it('should NOT render terms form when user has acccepted latest terms and is logged in', () => {
      var props = buildProps({ authenticated: true, termsAccepted: true, acceptedLatestTerms: true, fetchingUser: false });
      const { container } = render(React.createElement(TermsClass, props));

      var termsElems = container.querySelectorAll('.terms-form');
      expect(termsElems.length).to.equal(0);
    });
    it('should NOT render age confirmation nor terms acceptance form when user is not logged in', () => {
      const { container } = render(<TermsClass {...buildProps({ authenticated: false, acceptedLatestTerms: false, termsAccepted: false })} />);

      var termsElems = container.querySelectorAll('.terms-form');
      expect(termsElems.length).to.equal(0);
    });
    it('should render terms form when user has acccepted terms previously, but not the latest terms and is logged in', () => {
      var props = buildProps({ authenticated: true, termsAccepted: true, acceptedLatestTerms: false, fetchingUser: false });
      const { container } = render(React.createElement(TermsClass, props));

      var termsElems = container.querySelectorAll('.terms-form');
      expect(termsElems.length).to.equal(1);
    });
    it('should render updated terms notice when user has acccepted terms previously, but not the latest terms and is logged in', () => {
      var props = buildProps({ authenticated: true, termsAccepted: true, acceptedLatestTerms: false, fetchingUser: false });
      const { container } = render(React.createElement(TermsClass, props));

      var termsElems = container.querySelectorAll('.terms-title');
      expect(termsElems.length).to.equal(1);
    });
  });

  describe('age confirmation', () => {
    var container;

    beforeEach(() => {
      var props = buildProps({
        authenticated: true,
        acceptedLatestTerms: false,
        termsAccepted: true,
        trackMetric: sinon.stub(),
      });
      ({ container } = render(React.createElement(TermsClass, props)));
    });

    describe('flow for 18 and over login', () => {
      it('has correct behaviour', () => {
        var overEighteen = container.querySelectorAll('input')[0];
        expect(overEighteen.value).to.equal(TermsClass.defaultProps.ages.OF_AGE.value);
        // continue
        fireEvent.click(container.querySelector('button'));

        var button = container.querySelector('button');
        expect(button.textContent).to.equal('Continue');
        // Continue button should be disabled
        expect(button.disabled).to.equal(true);

        // check state: agreed checkbox is not yet checked
        expect(container.querySelector('#agreed').checked).to.equal(false);

        var inputs = container.querySelectorAll('input');

        // The inputs are the radio buttons, followed by any checkboxes
        expect(inputs.length).to.equal(4);
        var agreed = inputs[3];

        fireEvent.click(agreed);

        // check state: agreed is now checked
        expect(agreed.checked).to.equal(true);

        // now we should be able to click the Continue button
        expect(container.querySelector('button').disabled).to.equal(false);
      });
    });

    describe('flow for between 13 and 17 years old', () => {
      it('has correct behaviour', () => {
        // select between 13 and 17
        var thirteenToSeventeenOpt = container.querySelectorAll('input')[1];
        fireEvent.click(thirteenToSeventeenOpt);
        // select Continue
        fireEvent.click(container.querySelector('button'));

        var button = container.querySelector('button');
        expect(button.textContent).to.equal('Continue');
        // Continue button should be disabled
        expect(button.disabled).to.equal(true);

        // check state: neither agreed nor agreedOnBehalf is checked
        expect(container.querySelector('#agreed').checked).to.equal(false);
        expect(container.querySelector('#agreedOnBehalf').checked).to.equal(false);

        var inputs = container.querySelectorAll('input');
        // The inputs are the radio buttons, followed by any checkboxes
        expect(inputs.length).to.equal(5);
        var agreed = inputs[3];
        var agreedOnBehalf = inputs[4];

        fireEvent.click(agreedOnBehalf);
        fireEvent.click(agreed);

        // check state: both agreed and agreedOnBehalf are now checked
        expect(container.querySelector('#agreed').checked).to.equal(true);
        expect(container.querySelector('#agreedOnBehalf').checked).to.equal(true);

        // now we should be able to click the button
        expect(container.querySelector('button').disabled).to.equal(false);
      });

      it('will not allow confirmation if both checkboxes are not selected', () => {
        // select between 13 and 17
        var thirteenToSeventeenOpt = container.querySelectorAll('input')[1];
        fireEvent.click(thirteenToSeventeenOpt);
        // select Continue
        fireEvent.click(container.querySelector('button'));

        // check state: neither agreed nor agreedOnBehalf is checked
        expect(container.querySelector('#agreed').checked).to.equal(false);
        expect(container.querySelector('#agreedOnBehalf').checked).to.equal(false);

        var inputs = container.querySelectorAll('input');

        expect(inputs.length).to.equal(5);

        var agreed = inputs[3];
        var agreedOnBehalf = inputs[4];
        // only check one
        fireEvent.click(agreedOnBehalf);

        // check state: only agreedOnBehalf is checked
        expect(container.querySelector('#agreed').checked).to.equal(false);
        expect(container.querySelector('#agreedOnBehalf').checked).to.equal(true);

        // now we should NOT be able to click the button
        var button = container.querySelector('button');
        expect(button.textContent).to.equal('Continue');
        expect(button.disabled).to.equal(true);

        // now switch to test the other way also
        fireEvent.click(agreedOnBehalf);
        fireEvent.click(agreed);

        // check state: only agreed is checked
        expect(container.querySelector('#agreed').checked).to.equal(true);
        expect(container.querySelector('#agreedOnBehalf').checked).to.equal(false);

        // now we should STILL NOT be able to click the button
        expect(container.querySelector('button').textContent).to.equal('Continue');
        expect(container.querySelector('button').disabled).to.equal(true);
      });
    });

    describe('flow for under 12 login flow', () => {
      it('display sorry message', () => {
        // I am 12 years old or younger.
        var underTwelveOpt = container.querySelectorAll('input')[2];

        fireEvent.click(underTwelveOpt);
        expect(underTwelveOpt.value).to.equal(TermsClass.defaultProps.ages.NOT_OF_AGE.value);

        // select Continue
        fireEvent.click(container.querySelector('button'));

        // check state: no agreed checkbox rendered for under-12
        expect(container.querySelector('#agreed')).to.be.null;

        // sorry message shown
        var sorryMsg = container.querySelector('.terms-sorry-message');
        expect(sorryMsg).to.not.equal(null);
      });
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

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should not mutate the state', () => {
      mapStateToProps({blip: state});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('result.termsAccepted should be true if valid date in allUsersMap.a1b2c3.termsAccepted, and LATEST_TERMS is null', () => {
      config.LATEST_TERMS = null;
      const result = mapStateToProps({blip: state});
      expect(result.termsAccepted).to.be.true;
    });

    it('result.termsAccepted should be true if valid date in allUsersMap.a1b2c3.termsAccepted, and is later than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2016-12-26T00:00:00.000Z';
      const result = mapStateToProps({blip: state});
      expect(result.termsAccepted).to.be.true;
    });

    it('result.termsAccepted should be false if valid date in allUsersMap.a1b2c3.termsAccepted, and is earlier than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2017-01-02T00:00:00.000Z';
      const result = mapStateToProps({blip: state});
      expect(result.termsAccepted).to.be.true;
    });

    it('result.acceptedLatestTerms should be false if termsAccepted date is earlier than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2017-01-02T00:00:00.000Z';
      const result = mapStateToProps({blip: state});
      expect(result.acceptedLatestTerms).to.be.false;
    });

    it('should map isLoggedIn to authenticated', () => {
      const result = mapStateToProps({blip: state});
      expect(result.authenticated).to.equal(state.isLoggedIn);
    });
  });
});

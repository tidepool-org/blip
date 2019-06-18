/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import mutationTracker from 'object-invariant-test-helper';

var assert = chai.assert;
var expect = chai.expect;

import { Terms, mapStateToProps } from '../../../app/pages/terms';
import config from '../../../app/config';

describe('Terms', () => {

  describe('render', () => {
    it('should not console.error when required props are set', () => {
      console.error = sinon.stub();
      var props = {
        authenticated: false,
        acceptedLatestTerms: true,
        termsAccepted: true,
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('by default', function(){
    config.LATEST_TERMS = '2015-01-00T00:00:00+10:00';
    var elem;

    beforeEach(() => {
      var props = {};
      var termsElem = React.createElement(Terms, props);
      elem = TestUtils.renderIntoDocument(termsElem).getWrappedInstance();
    });

    it('is not agreed', () => {
      expect(elem.state.agreed).to.equal(false);
    });
    it('is not agreedOnBehalf', () => {
      expect(elem.state.agreedOnBehalf).to.equal(false);
    });
    it('age is over 18', () => {
      expect(elem.state.ageSelected).to.equal(elem.props.ages.OF_AGE.value);
    });
    it('should NOT render terms form when user has acccepted latest terms and is logged in', () => {
      var props = { authenticated: true, termsAccepted: true, acceptedLatestTerms: true, fetchingUser: false }
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-form');
      expect(termsElems.length).to.equal(0);
    });
    it('should NOT render age confirmation nor terms acceptance form when user is not logged in', () => {
      var props = {};
      var elem = TestUtils.renderIntoDocument(<Terms />);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-form');
      expect(termsElems.length).to.equal(0);
    });
    it('should render terms form when user has acccepted terms previously, but not the latest terms and is logged in', () => {
      var props = { authenticated: true, termsAccepted: true, acceptedLatestTerms: false, fetchingUser: false }
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-form');
      expect(termsElems.length).to.equal(1);
    });
    it('should render updated terms notice when user has acccepted terms previously, but not the latest terms and is logged in', () => {
      var props = { authenticated: true, termsAccepted: true, acceptedLatestTerms: false, fetchingUser: false }
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-title');
      expect(termsElems.length).to.equal(1);
    });
  });

  describe('age confirmation', () => {
    var termsElem;

    beforeEach(() => {
      var props = {
        authenticated: true,
        trackMetric: sinon.stub()
      };
      termsElem = React.createElement(Terms, props);
      termsElem = TestUtils.renderIntoDocument(termsElem).getWrappedInstance();
    });

    describe('flow for 18 and over login', () => {
      it('has correct behaviour', () => {
        var overEighteen = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[0];
        expect(overEighteen.value).to.equal(termsElem.props.ages.OF_AGE.value);
        // continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[0].textContent).to.equal('Continue');
        // Continue button should be disabled
        expect(buttons[0].disabled).to.equal(true);

        // check state
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.OF_AGE.value);
        expect(termsElem.state.agreed).to.equal(false);

        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input');

        // The inputs are the radio buttons, followed by any checkboxes
        expect(inputs.length).to.equal(4);
        var agreed = inputs[3];

        TestUtils.Simulate.change(agreed);

        expect(termsElem.state.agreed).to.equal(true);

        // now we should be able to click the Continue button
        expect(buttons[0].disabled).to.equal(false);
      });
    });

    describe('flow for between 13 and 17 years old', () => {
      it('has correct behaviour', () => {
        // select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        // select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[0].textContent).to.equal('Continue');
        // Continue button should be disabled
        expect(buttons[0].disabled).to.equal(true);

        // check state
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.WITH_CONSENT.value);
        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input');

        // The inputs are the radio buttons, followed by any checkboxes
        expect(inputs.length).to.equal(5);
        var agreed = inputs[3];
        var agreedOnBehalf = inputs[4];

        TestUtils.Simulate.change(agreedOnBehalf);
        TestUtils.Simulate.change(agreed);

        expect(termsElem.state.agreed).to.equal(true);
        expect(termsElem.state.agreedOnBehalf).to.equal(true);

        // now we should be able to click the button
        expect(buttons[0].disabled).to.equal(false);
      });

      it('will not allow confirmation if both checkboxes are not selected', () => {
        // select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        // select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);
        // age confirmation is now true
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.WITH_CONSENT.value);
        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input');

        expect(inputs.length).to.equal(5);

        var agreed = inputs[3];
        var agreedOnBehalf = inputs[4];
        // only check one
        TestUtils.Simulate.change(agreedOnBehalf);

        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(true);

        // now we should NOT be able to click the button
        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[0].textContent).to.equal('Continue');
        expect(buttons[0].disabled).to.equal(true);

        // now switch to test the other way also
        TestUtils.Simulate.change(agreedOnBehalf);
        TestUtils.Simulate.change(agreed);
        expect(termsElem.state.agreed).to.equal(true);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        // now we should STILL NOT be able to click the button
        expect(buttons[0].textContent).to.equal('Continue');
        expect(buttons[0].disabled).to.equal(true);
      });
    });

    describe('flow for under 12 login flow', () => {
      it('display sorry message', () => {
        // I am 12 years old or younger.
        var underTwelveOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[2];

        TestUtils.Simulate.change(underTwelveOpt);
        expect(underTwelveOpt.value).to.equal(termsElem.props.ages.NOT_OF_AGE.value);

        // select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        // state check
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.NOT_OF_AGE.value);
        expect(termsElem.state.agreed).to.equal(false);

        // sorry message shown
        var sorryMsg = TestUtils.findRenderedDOMComponentWithClass(termsElem, 'terms-sorry-message');
        expect(sorryMsg).not.to.equal(null);
        // still not accepted
        expect(termsElem.state.agreed).to.equal(false);
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
    const result = mapStateToProps({blip: state});

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('result.termsAccepted should be true if valid date in allUsersMap.a1b2c3.termsAccepted, and LATEST_TERMS is null', () => {
      config.LATEST_TERMS = null;
      expect(result.termsAccepted).to.be.true;
    });

    it('result.termsAccepted should be true if valid date in allUsersMap.a1b2c3.termsAccepted, and is later than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2016-12-26T00:00:00.000Z';
      expect(result.termsAccepted).to.be.true;
    });

    it('result.termsAccepted should be false if valid date in allUsersMap.a1b2c3.termsAccepted, and is earlier than LATEST_TERMS', () => {
      config.LATEST_TERMS = '2017-01-02T00:00:00.000Z';
      expect(result.termsAccepted).to.be.true;
    });

    it('should map isLoggedIn to authenticated', () => {
      expect(result.authenticated).to.equal(state.isLoggedIn);
    });
  });
});

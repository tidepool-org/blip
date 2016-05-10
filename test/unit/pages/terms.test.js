/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
var expect = chai.expect;

import { Terms } from '../../../app/pages/terms';

describe('Terms', () => {

  describe('render', () => {
    it('should not console.error when required props are set', () => {
      console.error = sinon.stub();
      var props = {
        authenticated: false,
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
    it('should console.error when required props are not set', () => {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Terms/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(3);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `authenticated` was not specified in `Terms`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `Terms`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Terms`.')).to.equal(true);
    });
  });

  describe('by default', function(){
    var elem;

    beforeEach(() => {
      var props = {};
      var termsElem = React.createElement(Terms, props);
      elem = TestUtils.renderIntoDocument(termsElem);
    });

    it('is not agreed', () => {
      expect(elem.state.agreed).to.equal(false);
    });
    it('is not agreedOnBehalf', () => {
      expect(elem.state.agreedOnBehalf).to.equal(false);
    });
    it('age is not confirmed', () => {
      expect(elem.state.ageConfirmed).to.equal(false);
    });
    it('age is over 18', () => {
      expect(elem.state.ageSelected).to.equal(elem.props.ages.OF_AGE.value);
    });
    it('should render age confirmation but not the terms form when user has not accepted terms but is logged in', () => {
      var props = { authenticated: true , fetchingUser: false, termsAccepted: ''};
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-age-form');
      expect(termsElems.length).to.not.equal(0);
      termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-form');
      expect(termsElems.length).to.equal(0);
    });
    it('should NOT render age confirmation nor terms form when user has acccepted terms and is logged in', () => {
      var acceptDate = new Date().toISOString();
      var props = { authenticated: true, termsAccepted: acceptDate, fetchingUser: false }
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-age-form');
      expect(termsElems.length).to.equal(0);
      termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-form');
      expect(termsElems.length).to.equal(0);
    });
    it('should NOT render age confirmation nor terms acceptance form when user is not logged in', () => {
      var props = {};
      var elem = TestUtils.renderIntoDocument(<Terms />);

      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-age-form');
      expect(termsElems.length).to.equal(0);
      var termsElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'terms-form');
      expect(termsElems.length).to.equal(0);
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
      termsElem = TestUtils.renderIntoDocument(termsElem);
    });

    it('is true once button pressed ', () => {
      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
      expect(ageBtn).not.to.not.equal(null);

      TestUtils.Simulate.click(ageBtn);
      expect(termsElem.state.ageConfirmed).to.equal(true);
    });

    it('shows iframes once button pressed ', () => {
      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
      TestUtils.Simulate.click(ageBtn);

      var termsIframe = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe-terms');
      expect(termsIframe).not.to.equal(null);
      expect(termsIframe.length).to.equal(1);

      var privacyIframe = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe-privacy');
      expect(privacyIframe).not.to.equal(null);
      expect(privacyIframe.length).to.equal(1);
    });

    describe('flow for 18 and over login', () => {
      it('shows TOU and PP', () => {
        var overEighteen = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[0];
        expect(overEighteen.props.value).to.equal(termsElem.props.ages.OF_AGE.value);
        // continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        // check state
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.OF_AGE.value);

        // iframes shown with TOU and PP
        var termsIframe = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe-terms');
        expect(termsIframe).not.to.equal(null);
        expect(termsIframe.length).to.equal(1);

        var privacyIframe = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe-privacy');
        expect(privacyIframe).not.to.equal(null);
        expect(privacyIframe.length).to.equal(1);

        var termsDetails = termsIframe[0];
        expect(termsDetails.props.src).to.equal('https://tidepool.org/terms-of-use-summary');
        var privacyDetails = privacyIframe[0];
        expect(privacyDetails.props.src).to.equal('https://tidepool.org/privacy-policy-summary');

        expect(termsElem.state.agreed).to.equal(false);
      });
    });

    describe('flow for between 13 and 17 years old', () => {
      it('shows TOU and PP and asks for parental consent also', () => {
        // select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        // select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        // check state
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.WITH_CONSENT.value);
        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        var checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input');


        expect(checkboxes.length).to.equal(2);
        var agreed = checkboxes[0];
        var agreedOnBehalf = checkboxes[1];

        TestUtils.Simulate.change(agreedOnBehalf);
        TestUtils.Simulate.change(agreed);

        expect(termsElem.state.agreed).to.equal(true);
        expect(termsElem.state.agreedOnBehalf).to.equal(true);

        // now we should be able to click the button
        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[1].props.children).to.equal('Continue');
        expect(buttons[1].props.disabled).to.equal(false);
        expect(buttons[0].props.children).to.equal('Back');
      });

      it('will not allow TOU and PP confirmation if both checkboxes are not selected', () => {
        // select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        // select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);
        // age confirmation is now true
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.WITH_CONSENT.value);
        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        var checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input');

        expect(checkboxes.length).to.equal(2);

        var agreed = checkboxes[0];
        var agreedOnBehalf = checkboxes[1];
        // only check one
        TestUtils.Simulate.change(agreedOnBehalf);

        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(true);

        // now we should NOT be able to click the button
        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[1].props.children).to.equal('Continue');
        expect(buttons[1].props.disabled).to.equal(true);
        expect(buttons[0].props.children).to.equal('Back');

        // now switch to test the other way also
        TestUtils.Simulate.change(agreedOnBehalf);
        TestUtils.Simulate.change(agreed);
        expect(termsElem.state.agreed).to.equal(true);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        // now we should STILL NOT be able to click the button
        expect(buttons[1].props.children).to.equal('Continue');
        expect(buttons[1].props.disabled).to.equal(true);
        expect(buttons[0].props.children).to.equal('Back');
      });
    });

    describe('flow for under 12 login flow', () => {
      it('display sorry message', () => {
        // I am 12 years old or younger.
        var underTwelveOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[2];

        TestUtils.Simulate.change(underTwelveOpt);
        expect(underTwelveOpt.props.value).to.equal(termsElem.props.ages.NOT_OF_AGE.value);

        // select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        // state check
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.NOT_OF_AGE.value);
        expect(termsElem.state.agreed).to.equal(false);

        // no TOU and PP shown
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe');
        expect(iframes).to.be.empty;
        // sorry message shown
        var sorryMsg = TestUtils.findRenderedDOMComponentWithClass(termsElem, 'terms-sorry-message');
        expect(sorryMsg).not.to.equal(null);
        // still not accepted
        expect(termsElem.state.agreed).to.equal(false);
      });
    });
  });
});

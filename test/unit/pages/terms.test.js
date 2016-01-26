/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
var api = require('../../../app/core/api');
var mock = require('../../../mock');

var Terms = require('../../../app/pages/terms');

describe('Terms', function () {

  describe('render', function() {
    it('should console.error when trackMetric not set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Terms/>);

      expect(elem).to.be.ok;
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Terms`.')).to.equal(true);
    });

    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {},
        onSubmit: function() {},
      };
      var termsElem = React.createElement(Terms, props);
      var elem = TestUtils.renderIntoDocument(termsElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

  });

  describe('by default', function(){

    var elem;

    beforeEach(function() {
      var props = {
        trackMetric: function() {},
        onSubmit: function() {}
      };
      var termsElem = React.createElement(Terms, props);
      elem = TestUtils.renderIntoDocument(termsElem);
    });

    it('is not agreed', function() {
      expect(elem.state.agreed).to.equal(false);
    });
    it('is not agreedOnBehalf', function() {
      expect(elem.state.agreedOnBehalf).to.equal(false);
    });
    it('age is not confirmed', function() {
      expect(elem.state.ageConfirmed).to.equal(false);
    });
    it('age is over 18', function() {
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
  describe('age confirmation', function() {

    var termsElem;

    beforeEach(function() {
      var props = {
        trackMetric: function() {},
        onSubmit: function() {},
        authenticated: true,
        termsAccepted: '',
        fetchingUser: false
      };
      termsElem = React.createElement(Terms, props);
      termsElem = TestUtils.renderIntoDocument(termsElem);
    });

    it('is true once button pressed ', function() {
      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
      expect(ageBtn).not.to.not.equal(null);

      TestUtils.Simulate.click(ageBtn);
      expect(termsElem.state.ageConfirmed).to.equal(true);
    });
    it('shows iframes once button pressed ', function() {

      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
      TestUtils.Simulate.click(ageBtn);

      var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe');
      expect(iframes).not.to.equal(null);
      expect(iframes.length).to.equal(2);
    });

    describe('flow for 18 and over login', function() {
      it('shows TOU and PP', function() {
        var overEighteen = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[0];
        expect(overEighteen.props.value).to.equal(termsElem.props.ages.OF_AGE.value);
        //continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        //Check state
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.OF_AGE.value);

        //iframes shown with TOU and PP
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe');
        expect(iframes).not.to.equal(null);
        expect(iframes.length).to.equal(2);

        var termsDetails = iframes[0];
        expect(termsDetails.props.src).to.equal('https://tidepool.org/terms-of-use/');
        var privacyDetails = iframes[1];
        expect(privacyDetails.props.src).to.equal('https://tidepool.org/privacy-policy/');

        expect(termsElem.state.agreed).to.equal(false);
      });
    });
    describe('flow for between 13 and 17 years old', function() {
      it('shows TOU and PP and asks for parental consent also', function() {

        //Select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        //Select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        //Check state
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

        //now we should be able to click the button
        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[1].props.children).to.equal('Continue');
        expect(buttons[1].props.disabled).to.equal(false);
        expect(buttons[0].props.children).to.equal('Back');
      });
      it('will not allow TOU and PP confirmation if both checkboxes are not selected', function() {
        //Select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        //Select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);
        //age confirmation is now true
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.WITH_CONSENT.value);
        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        var checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input');

        expect(checkboxes.length).to.equal(2);

        var agreed = checkboxes[0];
        var agreedOnBehalf = checkboxes[1];
        //only check one
        TestUtils.Simulate.change(agreedOnBehalf);

        expect(termsElem.state.agreed).to.equal(false);
        expect(termsElem.state.agreedOnBehalf).to.equal(true);

        //now we should NOT be able to click the button
        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(termsElem, 'button');
        expect(buttons[1].props.children).to.equal('Continue');
        expect(buttons[1].props.disabled).to.equal(true);
        expect(buttons[0].props.children).to.equal('Back');

        //now switch to test the other way also
        TestUtils.Simulate.change(agreedOnBehalf);
        TestUtils.Simulate.change(agreed);
        expect(termsElem.state.agreed).to.equal(true);
        expect(termsElem.state.agreedOnBehalf).to.equal(false);

        //now we should STILL NOT be able to click the button
        expect(buttons[1].props.children).to.equal('Continue');
        expect(buttons[1].props.disabled).to.equal(true);
        expect(buttons[0].props.children).to.equal('Back');

      });
    });
    describe('flow for under 12 login flow', function() {
      it('display sorry message', function() {
        // I am 12 years old or younger.
        var underTwelveOpt = TestUtils.scryRenderedDOMComponentsWithTag(termsElem,'input')[2];

        TestUtils.Simulate.change(underTwelveOpt);
        expect(underTwelveOpt.props.value).to.equal(termsElem.props.ages.NOT_OF_AGE.value);

        //Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        TestUtils.Simulate.click(ageBtn);

        //State check
        expect(termsElem.state.ageConfirmed).to.equal(true);
        expect(termsElem.state.ageSelected).to.equal(termsElem.props.ages.NOT_OF_AGE.value);
        expect(termsElem.state.agreed).to.equal(false);

        //No TOU and PP shown
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-iframe');
        expect(iframes).to.be.empty;
        //Sorry Message shown
        var sorryMsg = TestUtils.findRenderedDOMComponentWithClass(termsElem, 'terms-sorry-message');
        expect(sorryMsg).not.to.equal(null);
        //still not accepted
        expect(termsElem.state.agreed).to.equal(false);
      });
    });
  });
});

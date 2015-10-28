/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var TermsOverlay = require('../../../app/components/termsoverlay');

describe('TermsOverlay', function () {
  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<TermsOverlay/>);

      expect(elem).to.be.ok;
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `TermsOverlay`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var termsOverlayElem = React.createElement(TermsOverlay, props);
      var elem = TestUtils.renderIntoDocument(termsOverlayElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('by default', function(){

    var elem;

    beforeEach(function() {
      var props = {
        trackMetric: function() {}
      };
      var termsOverlayElem = React.createElement(TermsOverlay, props);
      elem = TestUtils.renderIntoDocument(termsOverlayElem);
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
    it('shows age confirmation form', function() {
      var age = TestUtils.findRenderedDOMComponentWithClass(elem, 'terms-overlay-age-form');
      expect(age).not.to.equal(null);
    });
  });
  describe('age confirmation', function() {

    var termsElem;

    beforeEach(function() {
      var props = {
        trackMetric: function() {}
      };
      var termsOverlayElem = React.createElement(TermsOverlay, props);
      termsElem = TestUtils.renderIntoDocument(termsOverlayElem);
    });

    it('is true once button pressed ', function() {
      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
      expect(ageBtn).not.to.not.equal(null);

      React.addons.TestUtils.Simulate.click(ageBtn);
      expect(termsElem.state.ageConfirmed).to.equal(true);
    });
    it('shows iframes once button pressed ', function() {

      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
      TestUtils.Simulate.click(ageBtn);

      var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-overlay-iframe');
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
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-overlay-iframe');
        expect(iframes).not.to.equal(null);
        expect(iframes.length).to.equal(2);
        var termsDetails = iframes[0];
        expect(termsDetails.props.src).to.equal('http://developer.tidepool.io/terms-of-use');
        var privacyDetails = iframes[1];
        expect(privacyDetails.props.src).to.equal('http://developer.tidepool.io/privacy-policy');

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
        var continueButton = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        expect(continueButton.props.children).to.equal('Continue');
        expect(continueButton.props.disabled).to.equal(false);
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
        var continueButton = TestUtils.findRenderedDOMComponentWithTag(termsElem, 'button');
        expect(continueButton.props.children).to.equal('Continue');
        expect(continueButton.props.disabled).to.equal(true);

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
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(termsElem, 'terms-overlay-iframe');
        expect(iframes).to.be.empty;
        //Sorry Message shown
        var sorryMsg = TestUtils.findRenderedDOMComponentWithClass(termsElem, 'terms-overlay-sorry-message');
        expect(sorryMsg).not.to.equal(null);
        //still not accepted
        expect(termsElem.state.agreed).to.equal(false);
      });
    });
  });
});
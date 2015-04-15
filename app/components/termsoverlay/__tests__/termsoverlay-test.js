/**
 * Copyright (c) 2015, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

/*global describe, it, jest, expect */

jest.dontMock('../termsoverlay');

var React = require('react/addons');
var TermsOverlay = require('../termsoverlay').TermsOverlay;
var AGES = require('../termsoverlay').AGES;
var MESSAGES = require('../termsoverlay').MESSAGES;
var metricsCallMock = jest.genMockFunction();

var TestUtils = React.addons.TestUtils;

describe('termsoverlay', function() {
  it('is not agreed by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay trackMetric={metricsCallMock}/>
    );
    expect(terms.state.agreed).toEqual(false);
  });
  it('is not agreedOnBehalf by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay trackMetric={metricsCallMock}/>
    );
    expect(terms.state.agreedOnBehalf).toEqual(false);
  });
  it('isAgreementChecked is not checked by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay trackMetric={metricsCallMock} />
    );
    expect(terms.state.isAgreementChecked).toEqual(false);
  });
  it('age is not confirmed by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay trackMetric={metricsCallMock} />
    );
    expect(terms.state.ageConfirmed).toEqual(false);
  });
  it('age is over 18 by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay trackMetric={metricsCallMock} />
    );
    expect(terms.state.ageSelected).toEqual(AGES.OF_AGE.value);
  });
  it('shows age confirmation form by defaut', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay trackMetric={metricsCallMock} />
    );

    var age = TestUtils.findRenderedDOMComponentWithClass(terms, 'terms-overlay-age-form');
    expect(age).not.toBeNull();
  });
  describe('age confirmation', function() {
    it('is true once button pressed ', function() {
      var terms = TestUtils.renderIntoDocument(
        <TermsOverlay trackMetric={metricsCallMock} />
      );

      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
      expect(ageBtn).not.toBeNull();

      React.addons.TestUtils.Simulate.click(ageBtn);
      expect(terms.state.ageConfirmed).toEqual(true);
    });
    it('shows iframes once button pressed ', function() {
      var terms = TestUtils.renderIntoDocument(
        <TermsOverlay trackMetric={metricsCallMock} />
      );

      var ageBtn = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
      React.addons.TestUtils.Simulate.click(ageBtn);

      var iframes = TestUtils.scryRenderedDOMComponentsWithClass(terms, 'terms-overlay-iframe');
      expect(iframes).not.toBeNull();
      expect(iframes.length).toEqual(2);
    });
    describe('flow for 18 and over login', function() {
      it('shows TOU and PP', function() {
        var terms = TestUtils.renderIntoDocument(
          <TermsOverlay trackMetric={metricsCallMock} />
        );
        var overEighteen = TestUtils.scryRenderedDOMComponentsWithTag(terms,'input')[0];
        expect(overEighteen.props.value).toEqual(AGES.OF_AGE.value);
        //continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
        React.addons.TestUtils.Simulate.click(ageBtn);
        //age confirmation is now true
        expect(terms.state.ageConfirmed).toEqual(true);
        //iframes shown with TOU and PP
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(terms, 'terms-overlay-iframe');
        expect(iframes).not.toBeNull();
        expect(iframes.length).toEqual(2);
        var termsDetails = iframes[0];
        expect(termsDetails.props.src).toEqual('http://developer.tidepool.io/terms-of-use');
        var privacyDetails = iframes[1];
        expect(privacyDetails.props.src).toEqual('http://developer.tidepool.io/privacy-policy');

        expect(terms.state.isAgreementChecked).toEqual(false);
        expect(terms.state.agreed).toEqual(false);
      });
    });
    describe('flow for between 13 and 17 years old', function() {
      it('shows TOU and PP and asks for parental consent also', function() {
        var terms = TestUtils.renderIntoDocument(
          <TermsOverlay trackMetric={metricsCallMock} />
        );

        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(terms,'input')[1];
        expect(thirteenToSeventeenOpt.props.value).toEqual(AGES.WITH_CONSENT.value);
        TestUtils.Simulate.click(thirteenToSeventeenOpt);
        //Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
        TestUtils.Simulate.click(ageBtn);
        //age confirmation is now true
        expect(terms.state.ageConfirmed).toEqual(true);
        //but not yet accepted
        expect(terms.state.isAgreementChecked).toEqual(false);
        expect(terms.state.agreed).toEqual(false);
        //TOU and PP shown
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(terms, 'terms-overlay-iframe');
        expect(iframes).not.toBeNull();
        expect(iframes.length).toEqual(2);
        var termsDetails = iframes[0];
        expect(termsDetails.props.src).toEqual('http://developer.tidepool.io/terms-of-use');
        var privacyDetails = iframes[1];
        expect(privacyDetails.props.src).toEqual('http://developer.tidepool.io/privacy-policy');
        //show the two checkboxes
        var checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(terms,'input');
        expect(checkboxes.length).toEqual(2);
        expect(checkboxes[0].props.type).toEqual('checkbox');
        expect(checkboxes[0].props.checked).toEqual(false);
        expect(checkboxes[1].props.type).toEqual('checkbox');
        expect(checkboxes[1].props.checked).toEqual(false);
        //click both
        TestUtils.Simulate.click(checkboxes[0]);
        TestUtils.Simulate.click(checkboxes[1]);
        //click button
        var continueButton = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
        TestUtils.Simulate.click(continueButton);
        //now we have accepted
        expect(terms.state.isAgreementChecked).toEqual(true);
        expect(terms.state.agreed).toEqual(true);

      });
      it('allows confirmation once both checkboxes selected', function() {
        var terms = TestUtils.renderIntoDocument(
          <TermsOverlay trackMetric={metricsCallMock} />
        );
        //Select between 13 and 17
        var thirteenToSeventeenOpt = TestUtils.scryRenderedDOMComponentsWithTag(terms,'input')[1];
        TestUtils.Simulate.change(thirteenToSeventeenOpt);
        //Select Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
        TestUtils.Simulate.click(ageBtn);
        //age confirmation is now true
        expect(terms.state.ageConfirmed).toEqual(true);
        //Check both confirmation boxes
        expect(terms.state.isAgreementChecked).toEqual(false);
        expect(terms.state.agreed).toEqual(false);
      });
    });
    describe('flow for under 12 login flow', function() {
      it('display sorry message', function() {
        var terms = TestUtils.renderIntoDocument(
          <TermsOverlay trackMetric={metricsCallMock} />
        );

        // I am 12 years old or younger.
        var underTwelveOpt = TestUtils.scryRenderedDOMComponentsWithTag(terms,'input')[2];
        TestUtils.Simulate.change(underTwelveOpt);
        expect(underTwelveOpt.props.value).toEqual(AGES.NOT_OF_AGE.value);
        //Continue
        var ageBtn = TestUtils.findRenderedDOMComponentWithTag(terms, 'button');
        TestUtils.Simulate.click(ageBtn);
        //age confirmation is now true
        expect(terms.state.ageConfirmed).toEqual(true);
        //not yet accepted
        expect(terms.state.isAgreementChecked).toEqual(false);
        expect(terms.state.agreed).toEqual(false);
        //No TOU and PP shown
        var iframes = TestUtils.scryRenderedDOMComponentsWithClass(terms, 'terms-overlay-iframe');
        expect(iframes).toEqual([]);
        //Sorry Message shown
        var sorryMsg = TestUtils.findRenderedDOMComponentWithClass(terms, 'terms-overlay-sorry-message');
        expect(sorryMsg).not.toBeNull();
        //still not accepted
        expect(terms.state.isAgreementChecked).toEqual(false);
        expect(terms.state.agreed).toEqual(false);
      });
    });
  });
});
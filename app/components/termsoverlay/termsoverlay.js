/** @jsx React.DOM */
/**
 * Copyright (c) 2014, Tidepool Project
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

var React = require('react');
var _ = require('lodash');

var AGES = {
  OF_AGE : {value: '>=18', label: 'I am 18 years old or older.'},
  WITH_CONSENT : {value: '13-17', label: 'I am between 13 and 17 years old. You\'ll need to have a parent or guardian agree to the terms on the next screen.' },
  NOT_OF_AGE : {value: '<=12', label: 'I am 12 years old or younger.'}
};

var MESSAGES = {
  ACCEPT_OF_AGE : "I am 18 or older and I accept the terms of the Tidepool Applications Terms of Use and Privacy Policy",
  ACCEPT_ON_BEHALF: "I to my child aged 13 through 17 using Tidepool Applications and agree that they are also bound to the terms of the Tidepool Applications Terms of Use and Privacy Policy",
  SORRY_NOT_OF_AGE : "We are really sorry, but you need to be 13 or older in order to create an account and use Tidepool's Applications."
};


var TermsOverlay = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      agreed: false,
      agreedOnBehalf: false,
      isAgreementChecked: false,
      ageConfirmed: false,
      ageSelected: AGES.OF_AGE.value //default
    };
  },
  onChange: function() {
    this.setState({isAgreementChecked: !this.state.isAgreementChecked});
  },
  /*
   * Age consent
   */
  renderAgeConsentStep:function(){

    return (
      <form ref='ageConfirmation' className="terms-overlay-age-form">
        <label>
          <input type="radio" key={AGES.OF_AGE.value} value={AGES.OF_AGE.value} onChange={this.handleAgeChange} defaultChecked={true} />
          {AGES.OF_AGE.label}
        </label>
        <label>
          <input type="radio" key={AGES.WITH_CONSENT.value} value={AGES.WITH_CONSENT.value} onChange={this.handleAgeChange}/>
          {AGES.WITH_CONSENT.label}
        </label>
        <label>
          <input type="radio" key={AGES.NOT_OF_AGE.value} value={AGES.NOT_OF_AGE.value} onChange={this.handleAgeChange}/>
          {AGES.NOT_OF_AGE.label}
        </label>
        <button
          className="btn btn-primary js-terms-submit"
          onClick={this.handleAgeSubmit}>Continue</button>
      </form>
    );
  },
  /*
   * Terms & privacy acceptance
   */
  renderTermsAndPrivacyStep:function(){
    var terms = this.websiteTerms();
    var privacy = this.websitePrivacy();
    var continueBtnDisabled = !this.state.agreed;
    var agreeConfirmation = this.renderAgreeCheckboxes();

    return (
      /* jshint ignore:start */
      <div className="terms-overlay js-terms">
        <div className="terms-overlay-content terms-overlay-box">
          <div className="terms-overlay-title">TERMS OF USE</div>
          {terms}
          <div className="privacy-overlay-title">PRIVACY POLICY</div>
          {privacy}
          <form className="terms-overlay-form">
            <button
              className="btn btn-primary js-terms-submit"
              onClick={this.handleTermsAndPrivacySubmit}
              disabled={continueBtnDisabled}>Continue</button>
          </form>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },
  renderSorryMessage:function(){

    var parentConsent;

    if(this.state.ageSelected === AGES.WITH_CONSENT.value){
      parentConsent = (
        <label htmlFor="agreedOnBehalf">
          <input
            id="agreedOnBehalf"
            type="checkbox"
            className="js-terms-checkbox"
            checked={this.state.agreedOnBehalf}
            onChange={this.handleAgreementChange} />
          <span>{MESSAGES.ACCEPT_ON_BEHALF}</span>
        </label>
      );
    }


    return (
      <div className="terms-overlay-accept-checkbox">
        <label htmlFor="agreed">
          <input
            id="agreed"
            type="checkbox"
            className="js-terms-checkbox"
            checked={this.state.agreed}
            onChange={this.handleAgreementChange} />
          <span>{MESSAGES.ACCEPT_OF_AGE}</span>
        </label>
        {parentConsent}
      </div>
    );
  },
  renderSorryMessage:function(){
    return (
      <div className="terms-overlay">
        <p className="terms-overlay-sorry-message">{MESSAGES.SORRY_NOT_OF_AGE}</p>
      </div>
    );
  },
  render: function() {
    if(this.state.ageConfirmed && this.state.ageSelected !== AGES.NOT_OF_AGE.value){
      console.log('do terms');
      return this.renderTermsAndPrivacyStep();
    }else if( this.state.ageConfirmed && this.state.ageSelected === AGES.NOT_OF_AGE.value){
      console.log('sorry');
      return this.renderSorryMessage();
    }
    console.log('do consent');
    return this.renderAgeConsentStep();
  },
  websiteTerms: function() {
    return React.DOM.iframe({
      className         : "terms-overlay-iframe",
      src               : "http://developer.tidepool.io/terms-of-use",
      scrolling         : "yes",
      frameBorder       : "0",
      allowTransparency : "true"
    });
  },
  websitePrivacy: function() {
    return React.DOM.iframe({
      className         : "terms-overlay-iframe",
      src               : "http://developer.tidepool.io/privacy-policy",
      scrolling         : "yes",
      frameBorder       : "0",
      allowTransparency : "true"
    });
  },
  handleAgeSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({ageConfirmed: true });
    this.props.trackMetric('Confirmed age');
  },
  handleAgeChange:function(e){
    this.setState({ ageSelected: e.target.value});
    console.log('change age ',e.target.value);
  },
  handleAgreementChange: function(e) {
    var checked = false;
    //if(this.state.ageSelected === AGES.WITH_CONSENT){

    //} else { 

    //}
    checked = e.target.checked;
    this.setState({agreed: checked});
  },
  handleTermsAndPrivacySubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.props.trackMetric('Agreed To Terms Of Use');

    var submit = this.props.onSubmit;
    if (submit) {
      submit();
    }
  }
});

module.exports = {
  TermsOverlay: TermsOverlay,
  AGES: AGES,
  MESSAGES: MESSAGES
};
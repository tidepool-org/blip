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
  OVER_EIGHTEEN : {value: '>=18', label: 'I am 18 years old or older.'},
  THIRTEEN_TO_SEVENTEEN : {value: '13-17', label: 'I am between 13 and 17 years old. You\'ll need to have a parent or guardian agree to the terms on the next screen.' },
  TWELVE_OR_UNDER : {value: '<=12', label: 'I am 12 years old or younger.'}
};


var TermsOverlay = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      agreed: false,
      isChecked: false,
      ageConfirmed: false,
      ageSelected: AGES.OVER_EIGHTEEN.value //default
    };
  },
  onChange: function() {
    this.setState({isChecked: !this.state.isChecked});
  },
  /*
   * Age consent
   */
  renderAgeConsentStep:function(){

    return (
      <form ref='ageConfirmation' className="terms-overlay-age-form">
        <label>
          <input type="radio" key={AGES.OVER_EIGHTEEN.value} value={AGES.OVER_EIGHTEEN.value} onChange={this.handleAgeChange} defaultChecked={true} />
          {AGES.OVER_EIGHTEEN.label}
        </label>
        <label>
          <input type="radio" key={AGES.THIRTEEN_TO_SEVENTEEN.value} value={AGES.THIRTEEN_TO_SEVENTEEN.value} onChange={this.handleAgeChange}/>
          {AGES.THIRTEEN_TO_SEVENTEEN.label}
        </label>
        <label>
          <input type="radio" key={AGES.TWELVE_OR_UNDER.value} value={AGES.TWELVE_OR_UNDER.value} onChange={this.handleAgeChange}/>
          {AGES.TWELVE_OR_UNDER.label}
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

    return (
      /* jshint ignore:start */
      <div className="terms-overlay js-terms">
        <div className="terms-overlay-content terms-overlay-box">
          <div className="terms-overlay-title">TERMS OF USE</div>
          {terms}
          <div className="privacy-overlay-title">PRIVACY POLICY</div>
          {privacy}
          <form className="terms-overlay-form">
            <div className="terms-overlay-accept-checkbox">
              <label htmlFor="agreed">
                <input
                  id="agreed"
                  type="checkbox"
                  className="js-terms-checkbox"
                  checked={this.state.agreed}
                  onChange={this.handleChange} />
                <span> I agree to these terms</span>
              </label>
            </div>
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
  /*
   * Message
   */
  renderSorryMessage:function(){
    return (
      <div className="terms-overlay">
        <p className="terms-overlay-sorry-message">{'We are really sorry, but you need to be 13 or older in order to create an account and use Tidepool\'s Applications.'}</p>
      </div>
    );
  },
  render: function() {
    if(this.state.ageConfirmed && this.state.ageSelected !== AGES.TWELVE_OR_UNDER.value){
      console.log('do terms');
      return this.renderTermsAndPrivacyStep();
    }else if( this.state.ageConfirmed && this.state.ageSelected === AGES.TWELVE_OR_UNDER.value){
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
  handleChange: function(e) {
    var checked = e.target.checked;
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
  AGES: AGES
};
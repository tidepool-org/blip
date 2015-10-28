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

var TermsOverlay = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired,
    ages: React.PropTypes.object,
    messages: React.PropTypes.object
  },
  getDefaultProps: function(){
    return {
      ages: {
        OF_AGE : { value: '>=18', label: ' I am 18 years old or older.'},
        WITH_CONSENT : { value: '13-17', label: ' I am between 13 and 17 years old. You\'ll need to have a parent or guardian agree to the terms on the next screen.' },
        NOT_OF_AGE : { value: '<=12', label: ' I am 12 years old or younger.'}
      },
      messages: {
        ACCEPT_OF_AGE : 'I am 18 or older and I accept the terms of the Tidepool Applications Terms of Use and Privacy Policy',
        ACCEPT_ON_BEHALF: 'I agree that my child aged 13 through 17 can use Tidepool Applications and agree that they are also bound to the terms of the Tidepool Applications Terms of Use and Privacy Policy',
        SORRY_NOT_OF_AGE : 'We are really sorry, but you need to be 13 or older in order to create an account and use Tidepool\'s Applications.'
      }
    };
  },
  getInitialState: function() {
    return {
      agreed: false,
      agreedOnBehalf: false,
      ageConfirmed: false,
      ageSelected: this.props.ages.OF_AGE.value //default
    };
  },
  renderAgeConsentStep:function(){
    return (
      <div className='terms-overlay js-terms'>
        <div className='terms-overlay-content terms-overlay-age-box'>
          <form ref='ageConfirmation' className='terms-overlay-age-form'>
            <div className='terms-overlay-age-radio'>
              <label>
                <input type='radio' name='age'
                  key={this.props.ages.OF_AGE.value}
                  value={this.props.ages.OF_AGE.value}
                  onChange={this.handleAgeChange}
                  defaultChecked={true} />
                {this.props.ages.OF_AGE.label}
              </label>
              <label>
                <input type='radio' name='age'
                  key={this.props.ages.WITH_CONSENT.value}
                  value={this.props.ages.WITH_CONSENT.value}
                  onChange={this.handleAgeChange} />
                {this.props.ages.WITH_CONSENT.label}
              </label>
              <label>
                <input type='radio' name='age'
                  key={this.props.ages.NOT_OF_AGE.value}
                  value={this.props.ages.NOT_OF_AGE.value}
                  onChange={this.handleAgeChange} />
                {this.props.ages.NOT_OF_AGE.label}
              </label>
            </div>
            <button
              className='btn btn-primary js-terms-submit'
              onClick={this.handleAgeSubmit}>Continue</button>
          </form>
        </div>
      </div>
    );
  },
  getTermsAndPrivacyButtonState:function(){
    var isDisabled = !this.state.agreed;

    if (this.state.ageSelected === this.props.ages.WITH_CONSENT.value) {
      if (this.state.agreed && this.state.agreedOnBehalf){
        isDisabled = false;
      } else {
        isDisabled = true;
      }
    }
    return isDisabled;
  },
  renderTermsAndPrivacyStep:function(){
    var terms = this.websiteTerms();
    var privacy = this.websitePrivacy();
    var continueBtnDisabled = this.getTermsAndPrivacyButtonState();
    var agreeConfirmation = this.renderAgreeCheckboxes();


    return (
      <div className='terms-overlay js-terms'>
        <div className='terms-overlay-content terms-overlay-box'>
          <div className='terms-overlay-title'>TERMS OF USE</div>
          {terms}
          <div className='privacy-overlay-title'>PRIVACY POLICY</div>
          {privacy}
          <form className='terms-overlay-form'>
            {agreeConfirmation}
            <button
              className='btn btn-primary js-terms-submit'
              onClick={this.handleTermsAndPrivacySubmit}
              disabled={continueBtnDisabled}>Continue</button>
          </form>
        </div>
      </div>
    );

  },
  renderAgreeCheckboxes:function(){

    var onBehalf;
    if (this.state.ageSelected === this.props.ages.WITH_CONSENT.value) {
      onBehalf = (
        <label htmlFor='agreedOnBehalf'>
          <input
            id='agreedOnBehalf'
            type='checkbox'
            className='js-terms-checkbox'
            checked={this.state.agreedOnBehalf}
            onChange={this.handleOnBehalfAgreementChange} />
          {this.props.messages.ACCEPT_ON_BEHALF}
        </label>
      );
    }
  },
  renderSorryMessage:function(){
    return (
      <div className='terms-overlay js-terms'>
        <div className='terms-overlay-content terms-overlay-box'>
          <p className='terms-overlay-sorry-message'>{this.props.messages.SORRY_NOT_OF_AGE}</p>
        </div>
      </div>
    );
  },
  render: function() {
    if(this.state.ageConfirmed && this.state.ageSelected !== this.props.ages.NOT_OF_AGE.value){
      return this.renderTermsAndPrivacyStep();
    }else if( this.state.ageConfirmed && this.state.ageSelected === this.props.ages.NOT_OF_AGE.value){
      return this.renderSorryMessage();
    }
    return this.renderAgeConsentStep();
  },
  websiteTerms: function() {
    return React.DOM.iframe({
      className         : 'terms-overlay-iframe',
      src               : 'http://developer.tidepool.io/terms-of-use',
      scrolling         : 'yes',
      frameBorder       : '0',
      allowTransparency : 'true'
    });
  },
  websitePrivacy: function() {
    return React.DOM.iframe({
      className         : 'terms-overlay-iframe',
      src               : 'http://developer.tidepool.io/privacy-policy',
      scrolling         : 'yes',
      frameBorder       : '0',
      allowTransparency : 'true'
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
  },
  handleAgreementChange: function() {
    this.setState({agreed: !this.state.agreed});
  },
  handleOnBehalfAgreementChange: function() {
    this.setState({agreedOnBehalf: !this.state.agreedOnBehalf});
  },
  handleTermsAndPrivacySubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.props.trackMetric('Agreed To Terms Of Use');

    var submit = this.props.onSubmit;
    if (submit) {
      submit(this.state.ageSelected);
    }
  }
});

module.exports = TermsOverlay;
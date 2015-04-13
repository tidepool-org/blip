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

var AGES = [
  {value: '>=18', isDefault: true, label: 'I am 18 years old or older.'},
  {value: '13-17', isDefault: false, label: 'I am between 13 and 17 years old. You\'ll need to have a parent or guardian agree to the terms on the next screen.' },
  {value: '<=12', isDefault: false, label: 'I am 12 years old or younger.'}
];

var TermsOverlay = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      agreed: false,
      isChecked: false,
      ageConfirmed: false
    };
  },
  onChange: function() {
    this.setState({isChecked: !this.state.isChecked});
  },
  /*
   * Age consent
   */
  renderStepOne:function(ages){

    var opts=[];

    for (var i = ages.length - 1; i >= 0; i--) {
      opts.push(<input type="radio" key={ages[i].value} value={ages[i].value}>{ages[i].label}</input>);
    };

    return (
      <form ref='ageConfirmation' className="terms-overlay-age-form">
        {opts}
        <button
          className="btn btn-primary js-terms-submit"
          onClick={this.handleAgeSubmit}>Continue</button>
      </form>
    );
  },
  /*
   * Terms & privacy acceptance
   */
  renderStepTwo:function(){
    var checkbox = this.renderCheckbox();
    var submitButton = this.renderSubmitButton();
    var terms = this.websiteTerms();
    var privacy = this.websitePrivacy();

    return (
      /* jshint ignore:start */
      <div className="terms-overlay js-terms">
        <div className="terms-overlay-content terms-overlay-box">
          <div className="terms-overlay-title">TERMS OF USE</div>
          {terms}
          <div className="privacy-overlay-title">PRIVACY POLICY</div>
          {privacy}
          <form className="terms-overlay-form">
            {checkbox}
            {submitButton}
          </form>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },
  render: function() {
    if(this.state.ageConfirmed){
      return this.renderStepTwo();
    }
    return this.renderStepOne(AGES);
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
  renderSubmitButton: function() {
    var disabled = !this.state.agreed;
    /* jshint ignore:start */
    return (
      <button
        className="btn btn-primary js-terms-submit"
        onClick={this.handleSubmit}
        disabled={disabled}>Continue</button>
    );
    /* jshint ignore:end */
  },
  handleAgeSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.trackMetric('Confirmed age');
    this.setState({ageConfirmed: true});
  },

  renderCheckbox: function() {
    /* jshint ignore:start */
    return (
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
    );
    /* jshint ignore:end */
  },

  handleChange: function(e) {
    var checked = e.target.checked;
    this.setState({agreed: checked});
  },

  handleSubmit: function(e) {
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

module.exports = TermsOverlay;

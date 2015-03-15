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
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      agreed: false
    };
  },

  render: function() {
    var checkbox = this.renderCheckbox();
    var submitButton = this.renderSubmitButton();
    var terms = this.websiteTerms();

    return (
      /* jshint ignore:start */
      <div className="terms-overlay js-terms">
        <div className="terms-overlay-content terms-overlay-box">
          <div className="terms-overlay-title">TERMS OF USE</div>
          {terms}
          <form className="terms-overlay-form">
            {checkbox}
            {submitButton}
          </form>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  websiteTerms: function() {
    return React.DOM.iframe({
      className         : "terms-overlay-iframe",
      src               : "http://tidepool.org/products/blip",
      scrolling         : "no",
      frameborder       : "0",
      allowTransparency : "true"
    });
  },

  terms: function() {
    return (
      /* jshint ignore:start */
      <div className="terms-overlay-text">
        <p>This is pre-released software for test purposes only. It is not intended for general use or for medical decision making outside of currently approved pilot studies. Please send all questions, comments or other feedback on this software to <a href="mailto:support@tidepool.org">support@tidepool.org</a>.</p>
        <p>If you are not a participant in an approved pilot study, then you must read and agree to the terms of the <a target="_blank" href="http://developer.tidepool.io/files/tidepool-vcla.pdf">Tidepool Volunteer/Contributor License Agreement</a>.</p>
        <p><strong>Do not make therapy changes without first consulting your physician.</strong></p>
      </div>
      /* jshint ignore:end */
    );
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

  renderCheckbox: function() {
    /* jshint ignore:start */
    return (
      <div className="terms-overlay-form-checkbox">
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

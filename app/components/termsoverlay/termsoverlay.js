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

var React = window.React;

var TermsOverlay = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      agreed: false
    };
  },

  render: function() {
    var checkbox = this.renderCheckbox();
    var submitButton = this.renderSubmitButton();

    return (
      /* jshint ignore:start */
      <div className="terms-overlay js-terms">
        <div className="terms-overlay-content terms-overlay-box">
          <div className="terms-overlay-title">TERMS OF USE</div>
          <div className="terms-overlay-text">
            <p><strong>Blip</strong> is a work in progress.
            Use this application for information purposes only.</p>
            <p><strong>Do not make any therapy changes without consulting your
            doctor first.</strong></p>
          </div>
          <form className="terms-overlay-form">
            {checkbox}
            {submitButton}
          </form>
        </div>
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
        <label for="agreed">
          <input
            id="agreed"
            type="checkbox"
            className="js-terms-checkbox"
            checked={this.state.agreed}
            onChange={this.handleChange} />
          <span> I have read and agree to the Terms of Use</span>
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

    var submit = this.props.onSubmit;
    if (submit) {
      submit();
    }
  }
});

module.exports = TermsOverlay;

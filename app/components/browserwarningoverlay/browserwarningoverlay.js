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

var BrowserWarningOverlay = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      agreed: false
    };
  },

  render: function() {
    var submitButton = this.renderSubmitButton();

    return (
      /* jshint ignore:start */
      <div className="browser-warning-overlay js-terms">
        <div className="browser-warning-overlay-content browser-warning-overlay-box">
          <div className="browser-warning-overlay-title">WARNING</div>
          <div className="browser-warning-overlay-text">
            <p>Only tested on Chrome.</p>
            <p>Works on Safari and Firefox, but there are drawing issues - dont make therapy changes.</p>
            <p>Known not to work in IE.</p>
          </div>
          <form className="browser-warning-overlay-form">
            {submitButton}
          </form>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  renderSubmitButton: function() {
    /* jshint ignore:start */
    return (
      <button
        className="btn btn-primary js-terms-submit"
        onClick={this.handleSubmit}
        >I understand, Continue.</button>
    );
    /* jshint ignore:end */
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

module.exports = BrowserWarningOverlay;

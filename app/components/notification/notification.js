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

var TidepoolNotification = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    onClose: React.PropTypes.func
  },

  render: function() {
    var type = this.props.type || 'alert';
    var className = 'notification notification-' + type;

    var closeLink = this.renderCloseLink();
    if (closeLink) {
      className = className + ' notification-closable';
    }

    return (
      
      <div className={className}>
        <div className="notification-inner">
          {closeLink}
          <div className="notification-body">
            {this.props.children}
          </div>
        </div>
      </div>
      
    );
  },

  renderCloseLink: function() {
    if (!this.props.onClose) {
      return null;
    }

    return (
      
      <a
        className="notification-close"
        href=""
        onClick={this.handleClose}
        ref='close'>Close</a>
      
    );
  },

  handleClose: function(e) {
    if (e) {
      e.preventDefault();
    }

    var close = this.props.onClose;
    if (close) {
      close();
    }
  }
});

module.exports = TidepoolNotification;

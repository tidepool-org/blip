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
var cx = require('react/lib/cx');

var api = require('../../core/api');

var PatientCard = React.createClass({
  propTypes: {
    invitation: React.PropTypes.object,
    patientsComponent: React.PropTypes.component,
    onAcceptInvitation: React.PropTypes.func,
    onDismissInvitation: React.PropTypes.func
  },
  handleAccept: function() {
    this.props.onAcceptInvitation(this.props.invitation);
  },
  handleDismiss: function() {
    this.props.onDismissInvitation(this.props.invitation);
  },
  render: function() {
    var message = 'You have been invited to see ' + this.props.invitation.creatorId + '\'s data!';
    /* jshint ignore:start */
    return (
      <li className='invitation'>
        <div className='invitation-message'>{message}</div>
        <div className='invitation-action'>
          <button
            className='invitation-action-submit btn btn-primary js-form-submit'
            onClick={this.handleAccept}
            disabled={this.state ? this.state.enable : false}
            ref="submitButton">{'Join the Team!'}</button>
          <button
            className="invitation-action-ignore btn js-form-submit"
            onClick={this.handleDismiss}
            disabled={this.state ? this.state.enable : false}
            ref="ignoreButton">{'Ignore'}</button>
        </div>
      </li>
    );
    /* jshint ignore:end */
  }
});

module.exports = PatientCard;

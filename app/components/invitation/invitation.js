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
    patientsComponent: React.PropTypes.component
  },
  handleAccept: function() {
    var invitation = this.props.invitation;
    var self = this;

    self.setState({enable: false});
    api.invitation.accept(invitation.from.userid, function(err) {
      if(err) {
        self.setState({enable: true});
        return;
      }

      self.setState({dismiss: true});
      self.props.patientsComponent.setState();
    });
  },
  handleDismiss: function() {
    var invitation = this.props.invitation;
    var self = this;

    self.setState({enable: false});
    api.invitation.dismiss(invitation.from.userid, function(err) {
      if(err) {
        self.setState({enable: true});
        return;
      }
      self.setState({dismiss: true});
    });
  },
  render: function() {
    var invitation = this.props.invitation;

    if(this.state && this.state.dismiss) {
      /* jshint ignore:start */
      return (<span />);
      /* jshint ignore:end */
    }

    var message = 'You have been invited to see ' + invitation.from.profile.fullName + '\'s data!';
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

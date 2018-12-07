
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
import React from 'react';
import _ from 'lodash';
import { translate } from 'react-i18next';
var utils = require('../../core/utils');
var cx = require('classnames');

var personUtils = require('../../core/personutils');

var Invitation = translate()(React.createClass({
  propTypes: {
    invitation: React.PropTypes.object.isRequired,
    onAcceptInvitation: React.PropTypes.func.isRequired,
    onDismissInvitation: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
  },
  handleAccept: function() {
    this.props.trackMetric('Clicked Join the Team');
    this.props.onAcceptInvitation(this.props.invitation);
  },
  handleDismiss: function() {
    this.props.trackMetric('Clicked Ignore');
    this.props.onDismissInvitation(this.props.invitation);
  },
  render: function() {
    const { t } = this.props;
    var name = t('Not set');
    if (utils.getIn(this.props, ['invitation', 'creator'])) {
      name = personUtils.patientFullName(this.props.invitation.creator);
    }

    if (utils.getIn(this.props, ['invitation', 'accepting'])) {
      return (
        <li className='invitation'>
          <div className='invitation-message'>{t('Joining {{name}}\'s team...', {name})}</div>
        </li>
      );

    }

    if (utils.getIn(this.props, ['trackMetric'])) {
      this.props.trackMetric('Invite Displayed');
    }


    return (
      <li className='invitation'>
        <div className='invitation-message'>{t('You have been invited to see {{name}}\'s data!', {name})}</div>
        <div className='invitation-action'>
          <button
            className="invitation-action-ignore btn js-form-submit"
            onClick={this.handleDismiss}
            disabled={this.state ? this.state.enable : false}
            ref="ignoreButton">{t('Ignore')}</button>
          <button
            className='invitation-action-submit btn btn-primary js-form-submit'
            onClick={this.handleAccept}
            disabled={this.state ? this.state.enable : false}
            ref="submitButton">{t('Join the team!')}</button>
        </div>
      </li>
    );

  }
}));

module.exports = Invitation;

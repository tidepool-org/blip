
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
import PropTypes from 'prop-types';
import _ from 'lodash';
import i18next from 'i18next';

import personUtils from '../../core/personutils';

class Invitation extends React.Component {
  static propTypes = {
    invitation: PropTypes.object.isRequired,
    onAcceptInvitation: PropTypes.func.isRequired,
    onDismissInvitation: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.handleAccept = this.handleAccept.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleAccept() {
    const { trackMetric,  onAcceptInvitation, invitation } = this.props;
    trackMetric('Invitation accepted');
    onAcceptInvitation(invitation);
  }

  handleDismiss() {
    const { trackMetric, onDismissInvitation, invitation } = this.props;
    trackMetric('Invitation dismissed');
    onDismissInvitation(invitation);
  }

  render() {
    const { invitation } = this.props;
    const t = i18next.t.bind(i18next);

    const creator = _.get(invitation, 'creator', null);
    const name = creator === null ? t('Not set') : personUtils.patientFullName(invitation.creator);

    if (_.get(invitation, 'accepting')) {
      return (
        <li className='invitation'>
          <div className='invitation-message'>{t('Joining {{name}}\'s team...', {name})}</div>
        </li>
      );
    }

    return (
      <li className='invitation'>
        <div className='invitation-message'>{t('You have been invited to see {{name}}\'s data!', {name})}</div>
        <div className='invitation-action'>
          <button
            className="invitation-action-ignore btn btn-secondary"
            onClick={this.handleDismiss}
            disabled={this.state ? this.state.enable : false}
            ref="ignoreButton">{t('Ignore')}</button>
          <button
            className='invitation-action-submit btn btn-primary'
            onClick={this.handleAccept}
            disabled={this.state ? this.state.enable : false}
            ref="submitButton">{t('Join the team!')}</button>
        </div>
      </li>
    );

  }
}

export default Invitation;

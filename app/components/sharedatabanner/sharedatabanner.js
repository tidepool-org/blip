/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';

import { URL_SHARE_DATA_INFO } from '../../core/constants';


const ShareDataBanner = (props) => {
  const {
    onClick,
    onClose,
    patient,
    trackMetric,
    t
  } = props;

  const getMessageText = () => {
    return t('New Tidepool Account? Share Your Data with your healthcare team.');
  };

  const getButtonText = () => {
    return t('Get Started');
  };

  const handleDismiss = () => {
    onClose(patient.userid);

    if (trackMetric) {
      trackMetric('dismiss Share Data banner');
    }
  };

  const handleClickLearnMore = () => {
    if (trackMetric) {
      trackMetric('clicked learn more Share Data banner');
    }
  };

  const handleSubmit = () => {
    onClick(patient.userid);

    browserHistory.push(`/patients/${patient.userid}/share`);

    if (trackMetric) {
      trackMetric('clicked get started on Share Data banner');
    }
  }

  const renderLink = () => {
    const link = {
      href: URL_SHARE_DATA_INFO,
      text: t('Learn More'),
      target: '_blank',
    };

    return (
      <a
        className="message-link" href={link.href} target={link.target} onClick={handleClickLearnMore}>
        {link.text}
      </a>
    );
  };

  return (
    <div className='shareDataBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="shareDataBanner-message">
          <div className="message-text" children={getMessageText()} />
          {renderLink()}
        </div>

        <div className="shareDataBanner-action">
          <button onClick={handleSubmit}>{getButtonText()}</button>
        </div>

        <div className="shareDataBanner-close">
          <a href="#" className="close" onClick={handleDismiss}>&times;</a>
        </div>
      </div>
    </div>
  );
};

ShareDataBanner.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  trackMetric: React.PropTypes.func.isRequired,
  patient: React.PropTypes.object.isRequired,
};

export default translate()(ShareDataBanner);

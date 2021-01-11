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

import PropTypes from 'prop-types';

import React from 'react';
import { browserHistory } from 'react-router';

import i18n from '../../core/language';
import { URL_DEXCOM_CONNECT_INFO } from '../../core/constants';

const DexcomBanner = (props) => {
  const {
    onClick,
    onClose,
    patient,
    trackMetric,
  } = props;

  const t = i18n.t.bind(i18n);

  const getMessageText = () => {
    return t('Using Dexcom G5 Mobile on Android? See your data in Tidepool.');
  };

  const getButtonText = () => {
    return t('Get Started');
  };

  const handleDismiss = () => {
    onClose(patient.userid);

    if (trackMetric) {
      trackMetric('dismiss Dexcom OAuth banner');
    }
  };

  const handleClickLearnMore = () => {
    if (trackMetric) {
      trackMetric('clicked learn more Dexcom OAuth banner');
    }
  };

  const handleSubmit = () => {
    onClick(patient.userid);

    browserHistory.push(`/patients/${patient.userid}/profile?dexcomConnect=banner`);

    if (trackMetric) {
      trackMetric('clicked get started on Dexcom banner');
    }
  };

  const renderLink = () => {
    const link = {
      href: URL_DEXCOM_CONNECT_INFO,
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
    <div className='dexcomBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="dexcomBanner-message">
          <div className="message-text" children={getMessageText()} />
          {renderLink()}
        </div>

        <div className="dexcomBanner-action">
          <button onClick={handleSubmit}>{getButtonText()}</button>
        </div>

        <div className="dexcomBanner-close">
          <a href="#" className="close" onClick={handleDismiss}>&times;</a>
        </div>
      </div>
    </div>
  );
};

DexcomBanner.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
};

export default DexcomBanner;

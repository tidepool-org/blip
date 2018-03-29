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

import { TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL, URL_BIG_DATA_DONATION_INFO } from '../../core/constants';

const DonateBanner = (props) => {
  const {
    onClose,
    onConfirm,
    patient,
    processingDonation,
    trackMetric,
    userIsDonor,
    t
  } = props;

  const getMessageText = () => {
    if (userIsDonor) {
      return t('Thanks for contributing! Donate proceeds to a diabetes nonprofit.');
    } else {
      return t('Donate your data. Contribute to research.');
    }
  };

  const renderLink = () => {
    const link = {
      href: URL_BIG_DATA_DONATION_INFO,
      text: t('Learn More'),
      target: '_blank',
    };

    return (
      <a
        className="message-link" href={link.href} target={link.target}>
        {link.text}
      </a>
    );
  };

  const getButtonText = () => {
    if (processingDonation) {
      return t('Donating anonymized data...');
    }

    if (userIsDonor) {
      return t('Choose a diabetes nonprofit');
    } else {
      return t('Donate my anonymized data');
    }
  };

  const handleDismiss = () => {
    onClose(patient.userid);

    if (trackMetric) {
      if (userIsDonor) {
        trackMetric('web - dismiss big data share proceeds banner');
      } else {
        trackMetric('web - dismiss big data sign up banner');
      }
    }
  };

  const handleSubmit = () => {
    if (userIsDonor) {
      // If user is donor, we redirect to settings page
      // so they can choose a nonprofit to share proceeds with
      browserHistory.push(`/patients/${patient.userid}/profile`);
      return;
    }

    if (processingDonation) {
      return;
    }

    onConfirm([ TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL ]);

    if (trackMetric) {
      const source = 'none';
      const location = 'banner';
      trackMetric('web - big data sign up', { source, location });
    }
  }

  return (
    <div className='donateBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="donateBanner-message">
          <div className="message-text" children={getMessageText()} />
          {renderLink()}
        </div>

        <div className="donateBanner-action">
          <button disabled={processingDonation} onClick={handleSubmit}>{getButtonText()}</button>
        </div>

        <div className="donateBanner-close">
          <a href="#" className="close" onClick={handleDismiss}>&times;</a>
        </div>
      </div>
    </div>
  );
};

DonateBanner.propTypes = {
  onClose: React.PropTypes.func.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
  processingDonation: React.PropTypes.bool.isRequired,
  trackMetric: React.PropTypes.func.isRequired,
  patient: React.PropTypes.object.isRequired,
  userIsDonor: React.PropTypes.bool.isRequired,
};

export default translate()(DonateBanner);

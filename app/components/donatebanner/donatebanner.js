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
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';

import { TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL, URL_BIG_DATA_DONATION_INFO } from '../../core/constants';

export const DonateBanner = translate()((props) => {
  const {
    onClose,
    onConfirm,
    patient,
    processingDonation,
    trackMetric,
    userIsDonor,
    t,
    push,
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
        className="message-link" href={link.href} target={link.target} rel="noreferrer noopener">
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
      push(`/patients/${patient.userid}/profile`);
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
});

DonateBanner.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  processingDonation: PropTypes.bool.isRequired,
  trackMetric: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  userIsDonor: PropTypes.bool.isRequired,
};

export default connect(null, { push })(DonateBanner);

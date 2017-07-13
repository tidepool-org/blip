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

const DonateBanner = (props) => {
  const {
    onConfirm,
    onClose,
    trackMetric,
    userIsDonor,
  } = props;

  const getMessageText = () => {
    if (userIsDonor) {
      return 'Thanks for contributing! Donate proceeds to a diabetes nonprofit.';
    } else {
      return 'Donate your data. Contribute to tesearch.';
    }
  };

  const renderLink = () => {
    const link = {
      href: 'https://tidepool.org/announcing-the-tidepool-big-data-donation-project/',
      text: 'Learn More',
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
    if (userIsDonor) {
      return 'Choose a diabetes nonprofit';
    } else {
      return 'Donate my anonymized data';
    }
  };

  const onSubmit = () => {

  }

  return (
    <div className='donate-banner container-box-outer'>
      <div className="container-box-inner">
        <div className="donate-banner-message">
          {getMessageText()}
          {renderLink()}
        </div>

        <div className="donate-banner-action">
          <button onClick={onConfirm}>{getButtonText()}</button>
        </div>

        <div className="donate-banner-close">
          <a href="#" className="close" onClick={onClose}>&times;</a>
        </div>
      </div>
    </div>
  );
};

DonateBanner.propTypes = {
  onConfirm: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  trackMetric: React.PropTypes.func.isRequired,
  userIsDonor: React.PropTypes.bool.isRequired,
};

export default DonateBanner;

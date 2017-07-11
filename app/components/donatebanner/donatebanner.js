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
    message,
    link,
    confirmButtonText,
    onConfirm,
    onClose,
    trackMetric,
  } = props;

  const renderLink = () => {
    if (link) {
      return (
        <a className="message-link" href={link.href} target={link.target}>
          {link.text}
        </a>
      );
    }

    return null;
  };

  return (
    <div className='donate-banner container-box-outer'>
      <div className="container-box-inner">
        <div className="donate-banner-message">
          {message}
          {renderLink()}
        </div>

        <div className="donate-banner-action">
          <button onClick={onConfirm}>{confirmButtonText}</button>
        </div>

        <div className="donate-banner-close">
          <a href="#" className="close" onClick={onClose}>&times;</a>
        </div>
      </div>
    </div>
  );
};

DonateBanner.propTypes = {
  trackMetric: React.PropTypes.func.isRequired,
  message: React.PropTypes.string.isRequired,
  link: React.PropTypes.shape({
    href: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
    target: React.PropTypes.string.isRequired,
  }),
  confirmButtonText: React.PropTypes.string.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
};

export default DonateBanner;

import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';

import { URL_DEXCOM_CONNECT_INFO } from '../../core/constants';


const UpdateTypeBanner = (props) => {
  const {
    onClick,
    onClose,
    patient,
    trackMetric,
    t
  } = props;

  const getMessageText = () => {
    return t('Complete your profile');
  };

  const getButtonText = () => {
    return t('Update My Profile');
  };

  const handleDismiss = () => {
    onClose(patient.userid);

    if (trackMetric) {
      trackMetric('dismiss Update Type banner');
    }
  };

  const handleClickLearnMore = () => {
    if (trackMetric) {
      trackMetric('clicked learn more Update Type banner');
    }
  };

  const handleSubmit = () => {
    onClick(patient.userid);

    browserHistory.push(`/patients/${patient.userid}/profile`);

    if (trackMetric) {
      trackMetric('clicked get started on Update Type banner');
    }
  }

  const renderLink = () => {
    const link = {
      href: URL_DEXCOM_CONNECT_INFO,
      text: t('Add your birthday, diagnosis date, and type'),
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
    <div className='updateTypeBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="updateTypeBanner-message">
          <div className="message-text" children={getMessageText()} />
          {renderLink()}
        </div>

        <div className="updateTypeBanner-action">
          <button onClick={handleSubmit}>{getButtonText()}</button>
        </div>

        <div className="updateTypeBanner-close">
          <a href="#" className="close" onClick={handleDismiss}>&times;</a>
        </div>
      </div>
    </div>
  );
};

UpdateTypeBanner.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
};

export default translate()(UpdateTypeBanner);

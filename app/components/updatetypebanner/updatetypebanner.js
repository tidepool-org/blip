import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';

export const UpdateTypeBanner = translate()((props) => {
  const {
    onClick,
    onClose,
    patient,
    trackMetric,
    t,
    push,
  } = props;

  const getMessageText = () => {
    return t('Complete your profile');
  };

  const getButtonText = () => {
    return t('Update My Profile');
  };

  const getLearnMoreText = () => {
    return t('Add your birthday, diagnosis date, and type');
  };

  const handleDismiss = () => {
    onClose(patient.userid);

    if (trackMetric) {
      trackMetric('dismiss Update Type banner');
    }
  };

  const handleClickLearnMore = () => {
    onClick(patient.userid);

    push(`/patients/${patient.userid}/profile`);

    if (trackMetric) {
      trackMetric('clicked learn more Update Type banner');
    }
  };

  const handleSubmit = () => {
    onClick(patient.userid);

    push(`/patients/${patient.userid}/profile`);

    if (trackMetric) {
      trackMetric('clicked get started on Update Type banner');
    }
  }

  return (
    <div className='updateTypeBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="updateTypeBanner-message">
          <div className="message-text" children={getMessageText()} />
          <a className="message-link" onClick={handleClickLearnMore}>{getLearnMoreText()}</a>
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
});

UpdateTypeBanner.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
};

export default connect(null, { push })(UpdateTypeBanner);

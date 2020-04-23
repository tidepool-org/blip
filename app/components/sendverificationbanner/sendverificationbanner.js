import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'react-i18next';

import personUtils from '../../core/personutils';

const SendVerificationBanner = (props) => {
  const {
    patient,
    trackMetric,
    resendVerification,
    t,
    resendEmailVerificationInProgress: working,
    resentEmailVerification: resent,
  } = props;

  const handleSubmit = () => {
    if (working || resent) {
      return;
    }
    resendVerification(patient.username);

    if (trackMetric) {
      const source = 'none';
      const location = 'banner';
      trackMetric('Clicked Banner Resend Verification', { source, location });
    }
  };

  let buttonMessage = 'RESEND VERIFICATION EMAIL';
  if (working) {
    buttonMessage = 'RESENDING VERIFICATION EMAIL';
  }
  if (resent) {
    buttonMessage = 'RESENT VERIFICATION EMAIL';
  }

  return (
    <div className="sendVerificationBanner">
      <div className="container-box-inner">
        <div className="sendVerificationBanner-message">
          <div className="message-text">
            {`${personUtils.patientFullName(patient)} ${t('has not verified their email')}.`}
          </div>
        </div>
        <div className="sendVerificationBanner-action">
          <button onClick={handleSubmit} disabled={working || resent}>
            {t(buttonMessage)}
          </button>
        </div>
      </div>
    </div>
  );
};

SendVerificationBanner.propTypes = {
  trackMetric: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  resendVerification: PropTypes.func.isRequired,
  resendEmailVerificationInProgress: PropTypes.bool.isRequired,
  resentEmailVerification: PropTypes.bool.isRequired,
};

export default translate()(SendVerificationBanner);

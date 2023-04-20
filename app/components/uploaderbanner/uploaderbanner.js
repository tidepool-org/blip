import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';

export const UploaderBanner = translate()((props) => {
  const {
    onClick,
    onClose,
    user,
    trackMetric,
    t,
  } = props;

  const handleDismiss = () => {
    onClose(user.userid);

    if (trackMetric) {
      trackMetric('dismiss Uploader Version Warning banner');
    }
  };

  const handleClickInstallGuide = () => {
    onClick(user.userid);

    window.open('https://support.tidepool.org/hc/en-us/articles/360029368552-Installing-Tidepool-Uploader');

    if (trackMetric) {
      trackMetric('clicked learn more Uploader Install banner');
    }
  };

  const handleSubmit = () => {
    onClick(user.userid);

    window.open('https://www.tidepool.org/download');

    if (trackMetric) {
      trackMetric('clicked get started on Uploader Install banner');
    }
  }

  return (
    <div className='uploaderBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="uploaderBanner-message">
          <div className="message-text">
            {t('If you\'ll be uploading your devices at home, download the latest version of Tidepool Uploader.')}
          </div>
          <a
            onClick={handleClickInstallGuide}
            className="message-link"
            >{t('See the Install Guide')}
          </a>
        </div>
        <div className="uploaderBanner-action">
          <button
            onClick={handleSubmit}
            >{t('Download Latest')}</button>
        </div>
        <div className="uploaderBanner-close">
          <a href="#" className="close" onClick={handleDismiss}>&times;</a>
        </div>
      </div>
    </div>
  );
});

UploaderBanner.propTypes = {
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default connect(null, { push })(UploaderBanner);

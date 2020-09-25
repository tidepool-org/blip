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

  const handleClickUpdateGuide = () => {
    onClick(user.userid);

    window.open('https://support.tidepool.org/hc/en-us/articles/360047528891-Updating-Tidepool-Uploader');

    if (trackMetric) {
      trackMetric('clicked learn more Uploader Version Warning banner');
    }
  };

  const handleSubmit = () => {
    onClick(user.userid);

    window.open('https://www.tidepool.org/download');

    if (trackMetric) {
      trackMetric('clicked get started on Uploader Version Warning banner');
    }
  }

  return (
    <div className='uploaderBanner container-box-outer'>
      <div className="container-box-inner">
        <div className="uploaderBanner-message">
          <div className="message-text">
            {t('Alert: Starting 9/15/2020 the minimum supported version of the Uploader will be V2.31.0.')}
          </div>
          <a
            onClick={handleClickUpdateGuide}
            className="message-link"
            >{t('See the Update Guide')}
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

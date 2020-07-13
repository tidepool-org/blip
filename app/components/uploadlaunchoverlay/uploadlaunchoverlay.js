import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import cx from 'classnames';
import ModalOverlay from '../modaloverlay';
import utils from '../../core/utils';
import logoSrc from '../uploaderbutton/images/T-logo-dark-512x512.png';

const UploadLaunchOverlay = translate()(class UploadLaunchOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestWinRelease: null,
      latestMacRelease: null,
    };
  }

  static propTypes = {
    modalDismissHandler: PropTypes.func.isRequired,
  };

  UNSAFE_componentWillMount = () => {
    this.setState(utils.getUploaderDownloadURL());
  }

  render = () => {
    const { t } = this.props;
    const winReleaseClasses = cx({
      btn: true,
      'btn-primary': true,
    });
    const macReleaseClasses = cx({
      btn: true,
      'btn-primary': true,
    });

    const dialog = (
      <div className='UploadLaunchOverlay'>
        <div className='ModalOverlay-content' key={'div1'}>
          <div className='UploadLaunchOverlay-content'>
            <div className='UploadLaunchOverlay-icon'>
              <img src={logoSrc} />
            </div>
            <div>
              <a className=' ModalOverlay-dismiss' onClick={this.props.modalDismissHandler}>&times;</a>
              <Trans i18nKey="html.uploadlaunchoverlay-launching">
                <div className='UploadLaunchOverlay-title'>Launching Uploader</div>
                <div className='UploadLaunchOverlay-text'>If you don't yet have the Tidepool Uploader, please install the appropriate version below</div>
              </Trans>
            </div>
          </div>
        </div>
        <div className='ModalOverlay-controls' key={'div2'}>
          <a className={winReleaseClasses} href={`${this.state.latestWinRelease}`} disabled={!this.state.latestWinRelease}>{t('Download for PC')}</a>
          <a className={macReleaseClasses} href={`${this.state.latestMacRelease}`} disabled={!this.state.latestMacRelease}>{t('Download for Mac')}</a>
        </div>
      </div>
    );

    return (
      <ModalOverlay
        show={true}
        dialog={dialog}
        overlayClickHandler={this.props.modalDismissHandler}
      />
    );
  };

});

module.exports = UploadLaunchOverlay;

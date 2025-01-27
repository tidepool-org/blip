import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { Flex } from 'theme-ui';
import cx from 'classnames';
import { Octokit } from '@octokit/rest';
import ModalOverlay from '../modaloverlay';
import utils from '../../core/utils';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import logoSrc from '../uploaderbutton/images/T-logo-dark-512x512.png';
import UploaderButton from '../uploaderbutton'

const octokit = new Octokit();

const UploadLaunchOverlay = withTranslation()(class UploadLaunchOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestWinRelease: null,
      latestMacRelease: null,
      error: null,
    };
  }

  static propTypes = {
    modalDismissHandler: PropTypes.func.isRequired,
  };

  UNSAFE_componentWillMount = () => {
    octokit.repos.listReleases({
      owner: 'tidepool-org',
      repo: 'uploader'
    }).then(({ data }) => {
      this.setState(utils.getUploaderDownloadURL(data));
    }).catch((error) => {
      this.setState({ error: true });
    });
  }

  renderErrorText = () => {
    return (
      <Trans i18nKey="html.uploadlaunchoverlay-error">Error fetching release information, please go to our
        <a href={URL_UPLOADER_DOWNLOAD_PAGE}> downloads page</a>.
      </Trans>
    )
  }

  render = () => {
    const { t } = this.props;
    const winReleaseClasses = cx({
      btn: true,
      'btn-primary': true,
      disabled: !this.state.latestWinRelease,
    });
    const macReleaseClasses = cx({
      btn: true,
      'btn-primary': true,
      disabled: !this.state.latestMacRelease,
    });
    let content;

    if(this.state.error) {
      content = this.renderErrorText();
    } else {
      content = [
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
        </div>,
        <Flex mt={2} sx={{ justifyContent: 'center' }}>
          <UploaderButton
            buttonText={t('Get the Tidepool Uploader')}
          />
        </Flex>,
      ]
    }

    const dialog = (
      <div className='UploadLaunchOverlay'>
        {content}
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
